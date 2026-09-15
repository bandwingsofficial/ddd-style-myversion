/**
 * Extract video duration (seconds) from an in-memory file buffer.
 * Supports MP4 (mvhd) and WebM (Duration element) for server-side validation.
 */
export function extractVideoDurationSeconds(
  buffer: Buffer,
  mimeType?: string,
): number | null {
  const type = mimeType?.toLowerCase() ?? '';

  if (type.includes('mp4') || looksLikeMp4(buffer)) {
    return extractMp4DurationSeconds(buffer);
  }

  if (type.includes('webm') || looksLikeWebm(buffer)) {
    return extractWebmDurationSeconds(buffer);
  }

  return extractMp4DurationSeconds(buffer) ?? extractWebmDurationSeconds(buffer);
}

function looksLikeMp4(buffer: Buffer): boolean {
  return buffer.length >= 8 && buffer.toString('ascii', 4, 8) === 'ftyp';
}

function looksLikeWebm(buffer: Buffer): boolean {
  return buffer.length >= 4 && buffer[0] === 0x1a && buffer[1] === 0x45;
}

function extractMp4DurationSeconds(buffer: Buffer): number | null {
  let offset = 0;

  while (offset + 8 <= buffer.length) {
    const size = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);

    if (size < 8) {
      break;
    }

    if (type === 'moov' || type === 'trak' || type === 'mdia') {
      const inner = extractMp4DurationSeconds(buffer.subarray(offset + 8, offset + size));
      if (inner != null) {
        return inner;
      }
    }

    if (type === 'mvhd') {
      const version = buffer[offset + 8];
      const base = offset + 8;

      if (version === 0 && base + 20 <= buffer.length) {
        const timescale = buffer.readUInt32BE(base + 12);
        const duration = buffer.readUInt32BE(base + 16);
        if (timescale > 0) {
          return duration / timescale;
        }
      }

      if (version === 1 && base + 32 <= buffer.length) {
        const timescale = buffer.readUInt32BE(base + 20);
        const durationHigh = buffer.readUInt32BE(base + 24);
        const durationLow = buffer.readUInt32BE(base + 28);
        const duration = durationHigh * 2 ** 32 + durationLow;
        if (timescale > 0) {
          return duration / timescale;
        }
      }
    }

    offset += size;
  }

  return null;
}

function extractWebmDurationSeconds(buffer: Buffer): number | null {
  const durationMatch = buffer.indexOf(Buffer.from([0x44, 0x89])); // Duration element id
  if (durationMatch < 0) {
    return null;
  }

  // Walk EBML elements looking for Duration (0x4489)
  let offset = 0;
  while (offset + 4 < buffer.length) {
    const { id, dataOffset, dataLength, nextOffset } = readEbmlElement(
      buffer,
      offset,
    );
    if (id === 0x4489 && dataLength > 0 && dataOffset + dataLength <= buffer.length) {
      const slice = buffer.subarray(dataOffset, dataOffset + dataLength);
      if (slice.length === 4) {
        const raw = slice.readFloatBE(0);
        if (Number.isFinite(raw) && raw > 0) {
          return raw / 1000;
        }
      }
      if (slice.length === 8) {
        const raw = slice.readDoubleBE(0);
        if (Number.isFinite(raw) && raw > 0) {
          return raw / 1000;
        }
      }
    }
    if (nextOffset <= offset) {
      break;
    }
    offset = nextOffset;
  }

  return null;
}

function readEbmlElement(buffer: Buffer, offset: number) {
  let cursor = offset;
  let id = 0;
  let idLength = 0;

  while (cursor < buffer.length) {
    id = (id << 8) | buffer[cursor];
    idLength += 1;
    cursor += 1;
    if (buffer[cursor - 1]! & 0x80) {
      break;
    }
    if (idLength >= 4) {
      break;
    }
  }

  let dataLength = 0;
  let lengthSize = 0;
  if (cursor < buffer.length) {
    let mask = 0x80;
    let lengthByte = buffer[cursor]!;
    lengthSize = 1;
    while (mask > 0 && !(lengthByte & mask)) {
      mask >>= 1;
      lengthSize += 1;
    }
    dataLength = lengthByte & (0xff >> lengthSize);
    cursor += 1;
    for (let i = 1; i < lengthSize; i++) {
      if (cursor >= buffer.length) break;
      dataLength = (dataLength << 8) | buffer[cursor]!;
      cursor += 1;
    }
  }

  return {
    id,
    dataOffset: cursor,
    dataLength,
    nextOffset: cursor + dataLength,
  };
}
