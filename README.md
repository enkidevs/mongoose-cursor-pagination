# mongoose-cursor-pagination
[![Build Status](https://travis-ci.org/enkidevs/mongoose-cursor-pagination.svg?branch=master)](https://travis-ci.org/enkidevs/mongoose-cursor-pagination.svg?branch=master)
[![npm version](https://img.shields.io/npm/v/mongoose-cursor-pagination.svg?style=flat-square)](https://www.npmjs.com/package/mongoose-cursor-pagination)
[![Dependency Status](https://david-dm.org/enkidevs/mongoose-cursor-pagination.svg)](https://david-dm.org/enkidevs/mongoose-cursor-pagination)
[![devDependency Status](https://david-dm.org/enkidevs/mongoose-cursor-pagination/dev-status.svg)](https://david-dm.org/enkidevs/mongoose-cursor-pagination#info=devDependencies)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/enkidevs/mongoose-cursor-pagination/issues)
[![HitCount](http://hits.dwyl.io/enkidevs/mongoose-cursor-pagination.svg)](http://hits.dwyl.io/enkidevs/mongoose-cursor-pagination)

> Mongoose cursor-based pagination

## Installation

```bash
npm install mongoose-cursor-pagination --save
```

## Usage

The plugin utilises cursor-based pagination via the `startingAfter` and `endingBefore` parameters.
Both take an existing value (see below) and return objects in reverse chronological order.
The `endingBefore` parameter returns objects listed before the named object.
The `startingAfter` parameter returns objects listed after the named object.
If both parameters are provided, only `endingBefore` is used.
Moreover, an optional `limit` parameter can be passed to limit the amount of objects returned.

Add the plugin to a schema:

```javascript
import mongoose from 'mongoose'
import paginationPlugin from 'mongoose-cursor-pagination'

const AccountSchema = new mongoose.Schema({
  username: { type: Number, unique: true, index: true }
})

AccountSchema.plugin(paginationPlugin)

mongoose.model('Account', AccountSchema)
```

and then use the model paginate method using a promise:

```javascript
mongoose.model('Account').paginate({}, {
  sort: { '_id': 1 },
  startingAfter: '59b1f7fd41cfc303859ea1c9',
  limit: 20
})
  .then(results => { /* ... */ })
  .catch(error => { /* ... */ })
```

or using a callback:

```javascript
mongoose.model('Account').paginate({}, {
  sort: { '_id': 1 }
}, (error, results) => {
  /* ... */
})
```

A possible value for `results` is:

```javascript
{
  items: [ /* ... */ ],
  hasMore: true
}
```

where `items` is an array containing the elements, and `hasMore` is `true` if there are more elements available after this set. Or `false` otherwise.

The default plugin values can be overwritten, here we show the default values:

```javascript
AccountSchema.plugin(paginationPlugin, {
  key: '_id',
  limit: 20,
  maxLimit: 100,
  minLimit: 1
})
```

The `key` specified is assumed to be unique and should have an index associated.
Moreover, when paginating the `key` should be sorted ascending order and the values of `startingAfter` and `endingBefore` should contained values for that `key`.

## Tests

```bash
npm install
npm test
```

## License

[MIT](LICENSE)
