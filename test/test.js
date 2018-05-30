/* global before, describe, it */
/* eslint global-require: 0, no-unused-expressions: 0 */
'use strict'

process.env.NODE_ENV = 'production'

const request = require('supertest')
const cfg = require('config')
const mongo = require('../app/lib/mongo')

let app

const mongoUrl = `mongodb://${cfg.mongo.host}:${cfg.mongo.port}/test`

/**
 * Tests a complete scenario involving sequences of requests
 */
describe('Routes', () => {
  before(done => {
    mongo.connect(mongoUrl, (err) => {
      if (err) { throw err }

      app = require('../index')
      mongo.db.dropDatabase(done)
    })
  })

  it(`GET /`, done => {
    request(app)
      .get(`/`)
      .expect(404)
      .end(done)
  })
})
