import { promisify } from 'util';
import fs from "fs";
import path from "path";
import InMemoryDocument from './inMemory';
import { BaseConfig, JSONObject } from '../types';

export type LocalConfig = BaseConfig & {
  provider: 'local';
  /**
   * The path to the directory where the documents are stored.
   * @default './.shelver'
   */
  baseDir?: string;
};

export default class LocalDocument<
  T extends JSONObject
> extends InMemoryDocument<T> {
  filePath: string;

  constructor(config: LocalConfig, path: string, data?: T) {
    super(data ?? ({} as T));
    this.filePath = `${config.baseDir ?? './.shelver'}/${config.name}/${path}`;
  }

  override async get(): Promise<T> {
    const file = await promisify(fs.readFile)(this.filePath);

    return JSON.parse(file.toString('utf8'));
  }

  override async set(data: T): Promise<void> {
    return promisify(fs.writeFile)(this.filePath, JSON.stringify(data)).catch(
      async (err) => {
        if (err.code === 'ENOENT') {
          await promisify(fs.mkdir)(path.dirname(this.filePath), {
            recursive: true,
          });
          return promisify(fs.writeFile)(this.filePath, JSON.stringify(data));
        }
        throw err;
      }
    );
  }

  override async delete(): Promise<void> {
    await promisify(fs.rm)(this.filePath);
    let dirPath = path.dirname(this.filePath);

    // Remove empty directories
    while (dirPath !== '.' && dirPath !== '/') {
      if ((await promisify(fs.readdir)(dirPath)).length > 0) break;

      await promisify(fs.rmdir)(dirPath);
      dirPath = path.dirname(dirPath);
    }
  }
}
