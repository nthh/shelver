import { type Bucket, type Storage } from '@google-cloud/storage';
import InMemoryDocument from './inMemory';
import { BaseConfig, JSONObject } from '../types';

export type GCSConfig = BaseConfig & {
  provider: 'gcs';
  /**
   * @see https://github.com/googleapis/nodejs-storage
   * storage is a @google-cloud/storage.Storage instance
   */
  storage: Storage;
  projectId?: string;
};

export default class GCPDocument<
  T extends JSONObject
> extends InMemoryDocument<T> {
  bucket: Bucket;
  path: string;

  constructor(config: GCSConfig, path: string, data?: T) {
    super(data ?? ({} as T));
    const storage = config.storage;
    this.bucket = storage.bucket(config.name);
    this.path = path;
  }

  override async get(): Promise<T> {
    const file = await this.bucket.file(this.path).download();

    return JSON.parse(file[0].toString('utf8'));
  }

  override async set(data: T): Promise<void> {
    await this.bucket.file(this.path).save(JSON.stringify(data), {
      // https://github.com/googleapis/nodejs-storage/issues/807#issuecomment-590070540
      // As files should be small, we can disable resumable uploads
      resumable: false
    });
  }

  override async delete(): Promise<void> {
    this.bucket.file(this.path).delete();
  }
}