const api = require('../api')
const cfg = require('config')
const pkg = require('../../package.json')

exports.app = (req, res) => {
  res.json({ name: pkg.name, version: pkg.version })
}

exports.ping = (req, res) => {
  api.req({ method: 'GET', url: `/ping/:clientId` }, (error, response, body) => {
    if (error || response.statusCode != 200) res.json({ status: 'error', data: body })

		res.json({ status: 'success', data: (body == cfg.clientId) ? 'pong' : 'Customer IDs do not match'})
	})
}