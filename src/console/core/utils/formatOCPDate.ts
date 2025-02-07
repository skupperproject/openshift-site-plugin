import { ISO8601Timestamp } from '@interfaces/CRD_Base';

interface FormatOptions {
  locale?: string;
  timeZone?: string;
}

export function formatOCPDate(date: ISO8601Timestamp, options: FormatOptions = {}): string {
  if (!date) {
    return ' ';
  }

  const { locale = navigator.language, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone } = options;

  const baseTime = new Date(date);

  const dateTimeFormat = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
    timeZone
  });

  return dateTimeFormat.format(baseTime);
}
