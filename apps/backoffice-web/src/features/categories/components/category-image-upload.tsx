'use client';

import { useCallback, useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';

import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_TYPES,
} from '../utils/category-validation';

const ACCEPT = [
  ...ALLOWED_IMAGE_EXTENSIONS,
  ...ALLOWED_IMAGE_TYPES,
].join(',');

interface CategoryImageUploadProps {
  previewUrl: string;
  error?: string;
  disabled?: boolean;
  uploading?: boolean;
  uploadProgress?: number;
  showRemove?: boolean;
  onFileSelect: (file: File | null) => void;
  onRemove?: () => void;
}

export default function CategoryImageUpload({
  previewUrl,
  error,
  disabled = false,
  uploading = false,
  uploadProgress = 0,
  showRemove = false,
  onFileSelect,
  onRemove,
}: CategoryImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const openFilePicker = useCallback(() => {
    if (disabled || uploading) {
      return;
    }

    fileInputRef.current?.click();
  }, [disabled, uploading]);

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file || disabled || uploading) {
        return;
      }

      onFileSelect(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [disabled, onFileSelect, uploading],
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (disabled || uploading) {
      return;
    }

    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (disabled || uploading) {
      return;
    }

    const file = event.dataTransfer.files?.[0] ?? null;
    handleFile(file);
  };

  const borderClass = error
    ? 'border-destructive'
    : isDragging
      ? 'border-primary bg-primary/5'
      : 'border-dashed border-border';

  return (
    <div className="space-y-1.5">
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept={ACCEPT}
        disabled={disabled || uploading}
        onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
      />

      <div
        role="button"
        tabIndex={disabled || uploading ? -1 : 0}
        aria-label="Upload cover image"
        onClick={openFilePicker}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openFilePicker();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          'relative h-[170px] overflow-hidden rounded-xl border bg-muted/20 transition-colors',
          borderClass,
          disabled || uploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-muted/30',
        ].join(' ')}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Cover preview"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/50 to-transparent p-3">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  openFilePicker();
                }}
                disabled={disabled || uploading}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-background/95 px-3 text-xs font-semibold shadow transition-colors hover:bg-background disabled:opacity-50"
              >
                <Upload size={12} />
                Replace
              </button>
              {showRemove && onRemove && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemove();
                  }}
                  disabled={disabled || uploading}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-background/95 px-3 text-xs font-semibold text-destructive shadow transition-colors hover:bg-background disabled:opacity-50"
                >
                  <Trash2 size={12} />
                  Remove
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-muted-foreground">
            <ImagePlus size={28} strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-foreground">
                Click to upload or drag and drop
              </p>
              <p className="mt-0.5 text-xs">
                JPG, JPEG, PNG, WEBP, or SVG up to 10MB
              </p>
            </div>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-[1px]">
            <Loader2 size={22} className="animate-spin text-primary" />
            <div className="w-40 overflow-hidden rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full bg-primary transition-all duration-200"
                style={{ width: `${Math.max(uploadProgress, 8)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Uploading… {uploadProgress > 0 ? `${uploadProgress}%` : ''}
            </span>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
