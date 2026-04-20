import { createJsonCodec, type ValueCodec } from './codecs.js';
import { writeClipboardText } from './share.js';
import type { StorageKeyPart } from './storage.js';

const SNAPSHOT_FORMAT = 'tv-shared.snapshot.v1';

export interface SnapshotEnvelope {
  capturedAt: string;
  format: typeof SNAPSHOT_FORMAT;
  kind?: string;
  payload: string;
  version?: StorageKeyPart;
}

export interface SnapshotOptions<T> {
  capturedAt?: Date | string;
  codec?: ValueCodec<T>;
  kind?: string;
  version?: StorageKeyPart;
}

export interface ParsedSnapshot<T> {
  capturedAt: string;
  kind?: string;
  value: T;
  version?: StorageKeyPart;
}

const resolveCapturedAt = (value?: Date | string) => {
  if(value instanceof Date) {
    return value.toISOString();
  }

  return value ?? new Date().toISOString();
};

export const createSnapshotEnvelope = <T,>(
  value: T,
  options: SnapshotOptions<T> = {},
): SnapshotEnvelope => {
  const codec = options.codec ?? createJsonCodec<T>();

  return {
    capturedAt: resolveCapturedAt(options.capturedAt),
    format: SNAPSHOT_FORMAT,
    ...(options.kind === undefined ? {} : { kind: options.kind }),
    payload: codec.serialize(value),
    ...(options.version === undefined ? {} : { version: options.version }),
  };
};

export const serializeSnapshot = <T,>(
  value: T,
  options: SnapshotOptions<T> = {},
) => JSON.stringify(createSnapshotEnvelope(value, options), null, 2);

export const parseSnapshot = <T,>(
  rawValue: string,
  options: Omit<SnapshotOptions<T>, 'capturedAt'> = {},
): ParsedSnapshot<T> => {
  const codec = options.codec ?? createJsonCodec<T>();
  const parsedValue = JSON.parse(rawValue) as Partial<SnapshotEnvelope>;

  if(parsedValue.format !== SNAPSHOT_FORMAT) {
    throw new Error('Snapshot format is not supported.');
  }

  if(typeof parsedValue.capturedAt !== 'string' || parsedValue.capturedAt.length === 0) {
    throw new Error('Snapshot is missing a capturedAt timestamp.');
  }

  if(typeof parsedValue.payload !== 'string') {
    throw new Error('Snapshot is missing a payload.');
  }

  if(options.kind !== undefined && parsedValue.kind !== options.kind) {
    throw new Error(`Snapshot kind mismatch. Expected "${options.kind}".`);
  }

  if(options.version !== undefined && parsedValue.version !== options.version) {
    throw new Error(`Snapshot version mismatch. Expected "${options.version}".`);
  }

  return {
    capturedAt: parsedValue.capturedAt,
    ...(parsedValue.kind === undefined ? {} : { kind: parsedValue.kind }),
    value: codec.parse(parsedValue.payload),
    ...(parsedValue.version === undefined ? {} : { version: parsedValue.version }),
  };
};

export const copySnapshotToClipboard = async <T,>(
  value: T,
  options: SnapshotOptions<T> & {
    navigator?: {
      clipboard?: {
        writeText: (text: string) => Promise<void>;
      };
    } | null;
  } = {},
) => writeClipboardText(
  serializeSnapshot(value, options),
  options.navigator === undefined
    ? {}
    : { navigator: options.navigator },
);
