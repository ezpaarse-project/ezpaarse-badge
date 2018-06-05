const api = require('../lib/api')
const fs = require('fs')
const path = require('path')
const pkg = require('../../package.json')

exports.app = (req, res) => {
  res.json({ name: pkg.name, version: pkg.version })
}

exports.ping = (req, res) => {
  api.req({ method: 'GET', url: `/ping/:clientId` }, (error, response, body) => {
    if (error || response.statusCode !== 200) res.json({ status: 'error', data: body })

    const clientId = fs.readFileSync(path.resolve('app/ssl/client'), 'utf-8')

    res.json({ status: (body === clientId) ? 'success' : 'error', data: (body === clientId) ? 'pong' : 'Customer IDs do not match' })
  })
}
