export interface ValueCodec<T> {
  equals?: (left: T, right: T) => boolean;
  parse: (raw: string) => T;
  serialize: (value: T) => string;
}

const defaultEquals = <T,>(left: T, right: T) => Object.is(left, right);

export const valueCodecEquals = <T,>(
  codec: ValueCodec<T>,
  left: T,
  right: T,
) => (codec.equals ?? defaultEquals)(left, right);

export const createStringCodec = (): ValueCodec<string> => ({
  parse: (raw) => raw,
  serialize: (value) => value,
});

export const createJsonCodec = <T,>(): ValueCodec<T> => ({
  parse: (raw) => JSON.parse(raw) as T,
  serialize: (value) => JSON.stringify(value),
});

export const createNumberCodec = (): ValueCodec<number> => ({
  parse: (raw) => {
    const value = Number(raw);

    if(!Number.isFinite(value)) {
      throw new Error('Stored value is not a finite number.');
    }

    return value;
  },
  serialize: (value) => `${value}`,
});

export const createBooleanCodec = (): ValueCodec<boolean> => ({
  parse: (raw) => {
    if(raw === 'true') {
      return true;
    }

    if(raw === 'false') {
      return false;
    }

    throw new Error('Stored value is not a boolean literal.');
  },
  serialize: (value) => `${value}`,
});

export const createStringUnionCodec = <const T extends readonly [string, ...string[]]>(
  values: T,
): ValueCodec<T[number]> => ({
  parse: (raw) => {
    if(values.includes(raw as T[number])) {
      return raw as T[number];
    }

    throw new Error('Stored value is not one of the allowed string literals.');
  },
  serialize: (value) => value,
});
