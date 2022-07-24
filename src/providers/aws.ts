import InMemoryDocument from './inMemory';
import { type S3 } from 'aws-sdk';
import { BaseConfig, JSONObject } from '../types';

export type S3Config = BaseConfig & {
  provider: 's3';
  /**
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html
   * s3 is an instance of the AWS S3 class
   */
  s3: S3;
};

export default class S3Document<
  T extends JSONObject
> extends InMemoryDocument<T> {
  s3: S3;
  path: string;
  bucketName: string;

  constructor(config: S3Config, path: string, data?: T) {
    super(data ?? ({} as T));
    this.s3 = config.s3;
    this.bucketName = config.name;
    this.path = path;
  }

  override async get(): Promise<T> {
    const params = {
      Bucket: this.bucketName,
      Key: this.path,
    };

    return new Promise((resolve, reject) => {
      this.s3.getObject(params, (err, data) => {
        if (err) return reject(err);

        const obj = data?.Body?.toString('utf8');

        if (obj == null) return reject(new Error('No data'));

        resolve(JSON.parse(obj));
      });
    });
  }

  override async set(data: T): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: this.path,
      Body: JSON.stringify(data),
    };

    return new Promise((resolve, reject) => {
      this.s3.putObject(params, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  override async delete(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.s3.deleteObject(
        {
          Bucket: this.bucketName,
          Key: this.path,
        },
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }
}
