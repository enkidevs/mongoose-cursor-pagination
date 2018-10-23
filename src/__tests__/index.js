/* eslint-env mocha */
import should from 'should'
import mongoose from 'mongoose'
import paginationPlugin from '../index'

describe('mongoose-cursor-pagination', function () {
  before(function () {
    mongoose.Promise = Promise
    return mongoose.connect('mongodb://127.0.0.1/test', {
      useMongoClient: true
    })
  })

  before(function () {
    const UserSchema = new mongoose.Schema({
      name: { type: String },
      value: { type: Number, unique: true, index: true }
    })
    UserSchema.plugin(paginationPlugin, {
      limit: 5
    })
    mongoose.model('User', UserSchema)
  })

  before(function () {
    return mongoose.model('User').insertMany(Array(1000)
      .fill()
      .map((_, i) => ({
        name: `User ${i}`,
        value: i
      })))
  })

  after(function () {
    return mongoose.model('User').remove()
  })

  it('pagination with no options', function () {
    return mongoose.model('User').paginate({}, {
      key: 'value'
    })
      .then(results => {
        should.equal(results.items.length, 5)
      })
  })

  it('pagination by key and ascendingly', function () {
    return mongoose.model('User').paginate({}, {
      key: 'value',
      sort: { value: 1 }
    })
      .then(results => {
        should.equal(results.items.length, 5)
        should.equal(results.hasMore, true)
        should.equal(results.items[0].value, 0)
        should.equal(results.items[4].value, 4)
      })
  })

  it('pagination by key, ascendingly and startingAfter', function () {
    return mongoose.model('User').paginate({}, {
      key: 'value',
      sort: { value: 1 },
      startingAfter: 4
    })
      .then(results => {
        should.equal(results.items.length, 5)
        should.equal(results.hasMore, true)
        should.equal(results.items[0].value, 5)
        should.equal(results.items[4].value, 9)
      })
  })

  it('pagination when it reaches the end', function () {
    return mongoose.model('User').paginate({}, {
      key: 'value',
      sort: { value: 1 },
      startingAfter: 998
    })
      .then(results => {
        should.equal(results.items.length, 1)
        should.equal(results.hasMore, false)
        should.equal(results.items[0].value, 999)
      })
  })

  it('pagination by key and descendingly', function () {
    return mongoose.model('User').paginate({}, {
      key: 'value',
      sort: { value: -1 }
    })
      .then(results => {
        should.equal(results.items.length, 5)
        should.equal(results.hasMore, true)
        should.equal(results.items[0].value, 999)
        should.equal(results.items[4].value, 995)
      })
  })

  it('pagination by key, ascendingly and endingBefore', function () {
    return mongoose.model('User').paginate({}, {
      key: 'value',
      sort: { value: -1 },
      endingBefore: 995
    })
      .then(results => {
        should.equal(results.items.length, 5)
        should.equal(results.hasMore, true)
        should.equal(results.items[0].value, 994)
        should.equal(results.items[4].value, 990)
      })
  })

  it('does not modify the provided query object', function () {
    const query = {}

    return mongoose.model('User').paginate(query, {
      key: 'value',
      sort: { value: -1 },
      endingBefore: 995
    })
      .then(() => {
        query.should.eql({})
      })
  })
})
