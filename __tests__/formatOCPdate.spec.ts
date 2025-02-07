import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { formatOCPDate } from '../src/console/core/utils/formatOCPDate';
import { ISO8601Timestamp } from '../src/console/interfaces/CRD_Base';

describe('formatOCPDate', () => {
  const mockNavigatorLanguage = vi.spyOn(window.navigator, 'language', 'get');
  const mockTimeZone = vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-02-05T12:00:00Z'));
    mockNavigatorLanguage.mockReturnValue('en-US');
    mockTimeZone.mockReturnValue({
      timeZone: 'UTC',
      locale: '',
      calendar: '',
      numberingSystem: ''
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should handle empty input', () => {
    expect(formatOCPDate('' as ISO8601Timestamp)).toBe(' ');
    expect(formatOCPDate(undefined as unknown as ISO8601Timestamp)).toBe(' ');
    expect(formatOCPDate(null as unknown as ISO8601Timestamp)).toBe(' ');
  });

  it('should use system locale and timezone when no options provided', () => {
    const testDate = '2024-02-05T14:30:00Z' as ISO8601Timestamp;
    const result = formatOCPDate(testDate);
    expect(result).toMatch(/Feb 5, 2024, 14:30/);
    expect(mockNavigatorLanguage).toHaveBeenCalled();
    expect(mockTimeZone).toHaveBeenCalled();
  });

  it('should use provided locale and timezone', () => {
    const testDate = '2024-02-05T14:30:00Z' as ISO8601Timestamp;
    const result = formatOCPDate(testDate, {
      locale: 'it-IT',
      timeZone: 'Europe/Rome'
    });
    // Use looser expectations since exact format depends on browser
    expect(result).toContain('2024');
    expect(result).toContain('5');
    expect(result).toMatch(/feb|Feb/i);
  });

  it('should handle invalid date input', () => {
    const testDate = 'invalid-date' as ISO8601Timestamp;
    expect(() => formatOCPDate(testDate)).not.toThrow(' Invalid time value');
  });

  it('should use partial options', () => {
    const testDate = '2024-02-05T14:30:00Z' as ISO8601Timestamp;

    // Only locale
    const localeResult = formatOCPDate(testDate, { locale: 'it-IT' });
    expect(localeResult).toContain('2024');
    expect(mockTimeZone).toHaveBeenCalled();

    // Only timezone
    const timezoneResult = formatOCPDate(testDate, { timeZone: 'UTC' });
    expect(timezoneResult).toContain('2024');
    expect(mockNavigatorLanguage).toHaveBeenCalled();
  });

  it('should handle different date formats', () => {
    // ISO format
    expect(() => formatOCPDate('2024-02-05T14:30:00.000Z' as ISO8601Timestamp)).not.toThrow();

    // Short ISO format
    expect(() => formatOCPDate('2024-02-05T14:30:00Z' as ISO8601Timestamp)).not.toThrow();

    // Date with milliseconds
    expect(() => formatOCPDate('2024-02-05T14:30:00.123Z' as ISO8601Timestamp)).not.toThrow();
  });

  it('should handle edge cases', () => {
    // Year boundary
    expect(formatOCPDate('2024-12-31T23:59:59Z' as ISO8601Timestamp, { timeZone: 'UTC' })).toContain('2024');

    // Leap year
    expect(formatOCPDate('2024-02-29T12:00:00Z' as ISO8601Timestamp, { timeZone: 'UTC' })).toContain('29');

    // Single digit date
    expect(formatOCPDate('2024-02-05T12:00:00Z' as ISO8601Timestamp, { timeZone: 'UTC' })).toContain('5');
  });

  it('should use all DateTimeFormat options', () => {
    const mockFormat = vi.fn();
    const mockDateTimeFormat = vi.fn(() => ({ format: mockFormat }));
    vi.stubGlobal('Intl', {
      DateTimeFormat: mockDateTimeFormat
    });

    const testDate = '2024-02-05T14:30:00Z' as ISO8601Timestamp;
    formatOCPDate(testDate, { locale: 'it-IT', timeZone: 'UTC' });

    expect(mockDateTimeFormat).toHaveBeenCalledWith('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    });
  });
});
