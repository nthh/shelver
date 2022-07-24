import { BaseConfig, JSONObject } from './types';

export type InMemoryConfig = BaseConfig & {
  provider: 'in-memory';
// allow in-memory provider to easily be swapped out
} & Record<string, any>;

export default class InMemoryDocument<T extends JSONObject> {
  _data: T;

  constructor(data: T) {
    this._data = data;
  }

  async get(): Promise<T> {
    return Promise.resolve(this._data);
  }

  async set(data: T): Promise<void> {
    this._data = data;
  }

  _get() {
    return this._data;
  }

  _set(data: T) {
    this._data = data;
    return { commit: this._commit };
  }

  _update(data: Partial<T>) {
    this._data = { ...this._data, ...data };
    return { commit: this._commit };
  }

  _clear() {
    this._data = {} as T;
    return { commit: this._commit };
  }

  async _load(): Promise<void> {
    this._data = await this.get();
  }

  _commit = (): Promise<void> => this.set(this._data);

  async update(data: Partial<T>): Promise<void> {
    const currentData = await this.get();
    this.set({ ...currentData, ...data });
  }

  async delete(): Promise<void> {
    this._data = {} as T;
  }
}
