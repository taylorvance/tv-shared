import { describe, expect, it } from 'vitest';
import {
  createBooleanCodec,
  createNumberCodec,
  createStringUnionCodec,
} from './codecs.js';

describe('codecs', () => {
  it('parses and serializes booleans', () => {
    const codec = createBooleanCodec();

    expect(codec.parse('true')).toBe(true);
    expect(codec.parse('false')).toBe(false);
    expect(codec.serialize(true)).toBe('true');
    expect(() => codec.parse('yes')).toThrow('Stored value is not a boolean literal.');
  });

  it('rejects non-finite numbers', () => {
    const codec = createNumberCodec();

    expect(codec.parse('42')).toBe(42);
    expect(codec.serialize(9)).toBe('9');
    expect(() => codec.parse('Infinity')).toThrow('Stored value is not a finite number.');
  });

  it('supports constrained string unions', () => {
    const codec = createStringUnionCodec(['light', 'dark', 'system']);

    expect(codec.parse('dark')).toBe('dark');
    expect(codec.serialize('system')).toBe('system');
    expect(() => codec.parse('sepia')).toThrow(
      'Stored value is not one of the allowed string literals.',
    );
  });
});
