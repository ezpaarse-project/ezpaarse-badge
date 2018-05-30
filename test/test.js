/* global before, describe, it */
/* eslint global-require: 0, no-unused-expressions: 0 */
'use strict'

process.env.NODE_ENV = 'production'

const request = require('supertest')
const expect = require('chai').expect

const cfg = require('config')
const mongo = require('../app/lib/mongo')
let app

const mongoUrl = `mongodb://${cfg.mongo.host}:${cfg.mongo.port}/test`

const userId = ''

/**
 * Tests a complete scenario involving sequences of requests
 */
describe('Routes', () => {
  // TODO : make tests
})