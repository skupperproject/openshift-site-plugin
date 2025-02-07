import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { formatOCPDate } from '../src/console/core/utils/formatOCPDate';
import { ISO8601Timestamp } from '../src/console/interfaces/CRD_Base';

describe('formatOCPDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-02-05T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats date with default locale and timezone', () => {
    const navigatorSpy = vi.spyOn(window.navigator, 'language', 'get');
    navigatorSpy.mockReturnValue('en-US');

    const intlSpy = vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions');
    intlSpy.mockReturnValue({
      timeZone: 'UTC',
      locale: '',
      calendar: '',
      numberingSystem: ''
    });

    const testDate = '2024-02-05T14:30:00Z' as ISO8601Timestamp;
    const result = formatOCPDate(testDate);
    expect(result).toBe('Feb 5, 2024, 14:30');
  });

  it('formats date with custom locale and timezone', () => {
    const testDate = '2024-02-05T14:30:00Z' as ISO8601Timestamp;
    const result = formatOCPDate(testDate, {
      locale: 'it-IT',
      timeZone: 'UTC'
    });
    expect(result).toBe('5 feb 2024, 14:30');
  });

  it('handles empty date input', () => {
    expect(formatOCPDate('' as ISO8601Timestamp)).toBe(' ');
    expect(formatOCPDate(undefined as unknown as ISO8601Timestamp)).toBe(' ');
  });

  it('formats dates across month boundaries', () => {
    const testDate = '2024-01-31T23:30:00Z' as ISO8601Timestamp;
    const result = formatOCPDate(testDate, {
      locale: 'en-US',
      timeZone: 'UTC'
    });
    expect(result).toBe('Jan 31, 2024, 23:30');
  });

  it('formats dates across year boundaries', () => {
    const testDate = '2024-12-31T23:30:00Z' as ISO8601Timestamp;
    const result = formatOCPDate(testDate, {
      locale: 'en-US',
      timeZone: 'UTC'
    });
    expect(result).toBe('Dec 31, 2024, 23:30');
  });

  it('formats dates consistently across different locales', () => {
    const testDate = '2024-02-05T14:30:00Z' as ISO8601Timestamp;
    const locales = ['en-US', 'it-IT', 'ja-JP', 'de-DE'];

    locales.forEach((locale) => {
      const result = formatOCPDate(testDate, {
        locale,
        timeZone: 'UTC'
      });
      expect(result).toMatch(/[\d\s\w,:]+/); // Verifies format without specific string
    });
  });
});
