const request = require('request')
const cfg = require('config')
const fs = require('fs')
const path = require('path')

const certificate = path.resolve('app/ssl/certificate.pem')
const privateKey = path.resolve('app/ssl/obf.key')

exports.req = (options, callback) => {
	request({
		method: options.method,
		url: `${cfg.urlApi}${options.url.replace(':clientId', cfg.clientId)}`,
		json: options.data || null,
		key: fs.readFileSync(privateKey, 'utf-8'),
		cert: fs.readFileSync(certificate, 'utf-8')
	}, callback)
}