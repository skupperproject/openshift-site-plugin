import { ISO8601Timestamp } from '@interfaces/CRD_Base';

export function formatOCPDate(date: ISO8601Timestamp): string {
  if (!date) {
    return ' ';
  }

  const baseTime = new Date(date);

  // Format date as 'DD MMM YYYY' and time as 'HH:mm'
  const formattedDate = `${baseTime.getDate()} ${baseTime.toLocaleString('it-IT', { month: 'short' })} ${baseTime.getFullYear()}`;
  const formattedTime = `${baseTime.getHours()}:${baseTime.getMinutes().toString().padStart(2, '0')}`;

  return `${formattedDate}, ${formattedTime}`;
}
