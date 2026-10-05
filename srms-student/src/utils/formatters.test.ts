import { describe, expect, it } from 'vitest';
import { formatCurrency, formatPercent } from './formatters';

describe('formatters', () => {
  it('formats rupee values correctly', () => {
    expect(formatCurrency(4500)).toBe('₹4,500');
  });

  it('formats percentages without decimals', () => {
    expect(formatPercent(92.5)).toBe('92.5%');
  });
});
