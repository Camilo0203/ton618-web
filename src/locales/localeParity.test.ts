import { describe, expect, it } from 'vitest';
import { en } from './en';
import { es } from './es';

function collectLeafKeys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [prefix];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    collectLeafKeys(child, prefix ? `${prefix}.${key}` : key)
  );
}

describe('public locale coverage', () => {
  it('keeps English and Spanish translation keys in parity', () => {
    const englishKeys = new Set(collectLeafKeys(en.translation));
    const spanishKeys = new Set(collectLeafKeys(es.translation));

    expect([...englishKeys].filter((key) => !spanishKeys.has(key))).toEqual([]);
    expect([...spanishKeys].filter((key) => !englishKeys.has(key))).toEqual([]);
  });
});
