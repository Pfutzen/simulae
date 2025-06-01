
import { describe, it, expect } from 'vitest';
import {
  calculatePercentage,
  calculateValue,
  calculateTotalPercentage,
  normalizePercentages,
  calculateRemainingPercentage
} from '@/lib/financial/percentageCalculations';

describe('Percentage Calculations', () => {
  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(50000, 500000)).toBe(10);
      expect(calculatePercentage(0, 500000)).toBe(0);
      expect(calculatePercentage(500000, 500000)).toBe(100);
    });

    it('should handle zero total', () => {
      expect(calculatePercentage(50000, 0)).toBe(0);
    });
  });

  describe('calculateValue', () => {
    it('should calculate value correctly', () => {
      expect(calculateValue(10, 500000)).toBe(50000);
      expect(calculateValue(0, 500000)).toBe(0);
      expect(calculateValue(100, 500000)).toBe(500000);
    });
  });

  describe('calculateTotalPercentage', () => {
    it('should sum percentages correctly', () => {
      expect(calculateTotalPercentage([10, 20, 30, 40])).toBe(100);
      expect(calculateTotalPercentage([15, 25, 35])).toBe(75);
      expect(calculateTotalPercentage([])).toBe(0);
    });
  });

  describe('normalizePercentages', () => {
    it('should normalize percentages to target sum', () => {
      const result = normalizePercentages([10, 20, 30], 100);
      expect(result[0]).toBeCloseTo(16.67, 1);
      expect(result[1]).toBeCloseTo(33.33, 1);
      expect(result[2]).toBeCloseTo(50, 1);
    });

    it('should handle zero total', () => {
      const result = normalizePercentages([0, 0, 0], 100);
      expect(result).toEqual([0, 0, 0]);
    });
  });

  describe('calculateRemainingPercentage', () => {
    it('should calculate remaining percentage', () => {
      expect(calculateRemainingPercentage([10, 20, 30])).toBe(40);
      expect(calculateRemainingPercentage([25, 35, 40])).toBe(0);
      expect(calculateRemainingPercentage([50, 60])).toBe(0); // Over 100%
    });
  });
});
