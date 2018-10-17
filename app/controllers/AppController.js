const api     = require('../lib/api')
const fs      = require('fs')
const path    = require('path')
const pkg     = require('../../package.json')

exports.app = (req, res) => {
  res.json({ name: pkg.name, version: pkg.version })
}

exports.ping = (req, res) => {
  api.req({ method: 'GET', url: `/ping/:clientId` }).then((result) => {
    const clientId = fs.readFileSync(path.resolve('app/ssl/client'), 'utf-8')

    return res.json({ status: (result.body === clientId) ? 'success' : 'error', data: (result.body === clientId) ? 'pong' : 'Customer IDs do not match' })
  }).catch((error) => {
    return res.json({ status: 'error', data: error })
  })
}
