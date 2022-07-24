import InMemoryDocument from './inMemory';
import { BaseConfig, JSONObject } from '../types';
import type sqlite3 from 'sqlite3';

export type SqliteConfig = BaseConfig & {
  provider: 'sqlite';
  /**
   * db is a sqlite3.Database instance
   * Expects a table with the given name and columns:
   * - path: TEXT PRIMARY KEY
   * - data: TEXT
   */
  db: sqlite3.Database;
};

export default class SqliteDocument<
  T extends JSONObject
> extends InMemoryDocument<T> {
  db: sqlite3.Database;
  tableName: string;
  path: string;

  constructor(config: SqliteConfig, path: string, data?: T) {
    super(data ?? ({} as T));
    this.db = config.db;
    this.path = path;
    this.tableName = config.name;
  }

  override async get(): Promise<T> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT data from ${this.tableName} WHERE path = $path`,
        {
          $path: this.path,
        },
        (err, row) => {
          if (err) return reject(err);

          resolve(JSON.parse(row.data));
        }
      );
    });
  }

  override async set(data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO ${this.tableName} (path, data) VALUES ($path, $data)`,
        {
          $path: this.path,
          $data: JSON.stringify(data),
        },
        (err) => {
          if (err) return reject(err);

          resolve();
        }
      );
    });
  }

  override async delete(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `DELETE FROM ${this.tableName} WHERE path = $path`,
        {
          $tableName: this.tableName,
          $path: this.path,
        },
        (err) => {
          if (err) return reject(err);

          resolve();
        }
      );
    });
  }
}
