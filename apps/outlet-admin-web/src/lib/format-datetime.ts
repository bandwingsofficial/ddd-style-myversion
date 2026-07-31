const IST_TIME_ZONE = 'Asia/Kolkata';

export function formatDateTimeIST(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {},
) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIME_ZONE,
    ...options,
  }).format(new Date(value));
}

export function formatDateIST(value: string | Date) {
  return formatDateTimeIST(value, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTimeIST(value: string | Date) {
  return formatDateTimeIST(value, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
