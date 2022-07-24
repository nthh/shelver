import S3Document, { S3Config } from './providers/aws';
import GCPDocument, { GCSConfig } from './providers/google';
import InMemoryDocument, { InMemoryConfig } from './providers/inMemory';
import LocalDocument, { LocalConfig } from './providers/local';
import SqliteDocument, { SqliteConfig } from './providers/sqlite';

import { JSONObject } from './types';


const documentClasses = {
  s3: S3Document,
  gcs: GCPDocument,
  local: LocalDocument,
  sqlite: SqliteDocument,
  ['in-memory']: InMemoryDocument,
};

type Config =
  | GCSConfig
  | S3Config
  | LocalConfig
  | SqliteConfig
  | InMemoryConfig;

type Document<T extends JSONObject> = InMemoryDocument<T>;

const shelver = (config: Config) => ({
  document: <T extends JSONObject>(path: string, _data?: T): Document<T> =>
    new documentClasses[config.provider]<T>(
      config as any,
      `${path}.json`,
      _data
    ),
});

export = shelver;
