# shelver

[![npm version](https://img.shields.io/npm/v/shelver.svg)](https://www.npmjs.org/package/shelver)

shelver is a lightweight (no dependencies) API for storing JSON documents with storage providers. Includes a consistent API, easy support for local development, and an optional manipulable cache before persisting to the provider. The inspiration was from using buckets on S3/Google Cloud Storage as a simple database, but it can be used for a variety of applications.

### Installation

```bash
npm install shelver
# or
yarn add shelver
```

### Usage

#### Basic

```javascript
const Storage = require('@google-cloud/storage').Storage;
const shelver = require('shelver');

const isDev = process.env.NODE_ENV === 'development';

const shelf = shelver({
  provider: isDev ? 'local' : 'gcs',
  storage: new Storage(),
  name: 'my-bucket',
});

const doc = shelf.document('path/to/file');

const start = async () => {
  // Sets the entire document (given value becomes newly persisted document)
  await doc.set({
    someKey: 1,
  });

  // merges into the document from given keys
  await doc.update({
    field1: 'someValue',
  });

  const data = await doc.get();
  // { someKey: 1, field1: 'someValue' }
  console.log(data);

  await doc.delete();
};
start();
```

#### With cache

```typescript
import { S3 } from 'aws-sdk';
import shelver from 'shelver';

type Task = {
  idsToProcess: number[];
  lastTaskId?: number;
  errorCode?: string;
};

const doc = shelver({
  provider: 's3',
  s3: new S3(),
  name: 'my-s3-bucket',
}).document<Task>('tasks-to-process');

// Underscore functions represent working with the cache
// Mirror the normal methods synchronously (_get/_update/_set and _clear to make the object empty), along with async _load and _commit

// Load data from S3 bucket into memory
doc._load().then(() => {
  const { idsToProcess } = doc._data;
  idsToProcess.forEach((runId) => {
    // keep track of something
    doc._update({
      lastTaskId: runId,
    });

    // log error and commit to S3 bucket
    if (somethingWentWrong) doc._update({ errorCode: '1' }).commit();
  });

  if (successful) doc.set({ idsToProcess: [] });
});
```

#### Types for the document can be given or inferred

```typescript
type SomeType = {
  key1: number;
  key2: {
    subKey1: string;
  };
};

const docWithType = stock.document<SomeType>('some-name');
// the following provides types and also stores the intial value into memory
const docWithInferredType = stock.document('some-name', {
  key1: 1,
  key2: {
    subKey1: 'value',
  },
});
// Persist to the storage provider
docWithInferredType._commit();
// not allowed
docWithInferredType.update({ key1: 'notNumber' });
```

### Providers

| Provider  | Description                                                    |
| --------- | -------------------------------------------------------------- |
| gcs       | Google Cloud Storage                                           |
| s3        | AWS S3                                                         |
| local     | Persisted to filesystem, defaults to .shelver in run directory |
| sqlite    | SQLite, expects the table given to already exist               |
| in-memory | In memory storage                                              |

## Contributing

All contributions are welcome. Feel free to add a provider, suggest changes, or report a bug.

## License

MIT License
