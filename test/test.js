/* global before, describe, it */
/* eslint global-require: 0, no-unused-expressions: 0 */

const request = require('supertest');
const { expect } = require('chai');
const pkg = require('../package.json');

process.env.NODE_ENV = 'production';
let api;

describe('Routes', () => {
  before((done) => {
    api = require('../server.js');
    done();
  });

  it('GET    /', (done) => {
    request(api)
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.body).to.have.property('version');
        expect(res.body.version).to.equal(pkg.version);
      })
      .end(done);
  });
});
