const express = require('express')
const app = express()
const request = require('request')
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const cfg = require('config')

process.env.PORT = cfg.port
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 3000

const key = path.resolve(__dirname, 'ssl/apiKey.key')
const certificate = path.resolve(__dirname, 'ssl/certificate.pem')
const privateKey = path.resolve(__dirname, 'ssl/obf.key')

const apiKey = fs.readFileSync(key, 'utf-8')
const clientId = 'P7F99NaEEOa66L'

app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', 'http://ezpaarse.couperin.org/')
	res.header('Access-Control-Allow-Methods', 'GET')
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/emit', (req, res) => {
	const recipient = req.body.recipient
	const email_subject = req.body.email_subject
	const email_link_text = req.body.email_link_text
	const email_body = req.body.email_body
	const email_footer = req.body.email_footer

	api({
		method: 'POST',
		url: `/badge/${clientId}/P7FLCHaEEOa6AY`,
		data: {
			recipient: (recipient.indexOf(';') > -1) ? recipient.split(';') : [ recipient ],
			issued_on: moment().unix(),
			email_subject,
			email_body,
			email_link_text,
			email_footer,
			api_consumer_id: clientId,
			log_entry: {
				client: 'app',
				issuer: 'Test app'
			}
		}
	}, (error, response, body) => {
		res.json(response)
		// res.redirect(url.format({ pathname: '/' }))
	})
})

app.get('/event', (req, res) => {
	api({ method: 'GET', url: `/event/${clientId}?email=wilmouthsteven@gmail.com` }, (error, response, body) => {
		body = body.split('\r\n')
		body.splice((body.length - 1), body.length)

		const json = []
		body.forEach((v, k) => {
			json[k] = JSON.parse(v)
		})

		res.json(json)
	})
})

app.get('/rsa', (req, res) => {
	api({ 
		method: 'GET', 
		url: `/client/OBF.rsa.pub`
	}, (error, response, body) => {
		const forge = require('node-forge')
		const publicKey = forge.pki.publicKeyFromPem(body)
		const apiKeyDecoded = forge.util.decode64(apiKey)

		const decrypt = JSON.parse(forge.pki.rsa.decrypt(apiKeyDecoded, publicKey, true))

		res.json(decrypt)
	})
})

app.get('/csr', (req, res) => {
	api({ 
		method: 'POST',
		url: `/client/${clientId}/sign_request`,
		data: {
			signature: apiKey,
			request: fs.readFileSync('./ssl/obf.csr', 'utf-8')
		}
	}, (error, response, body) => {
		if (error) res.send(error)

		if (!body.error) fs.writeFileSync(certificate, body)

		res.send(response)
	})
})

app.get('/', (req, res) => {
	res.json('a')
})

app.get('/ping', (req, res) => {
	api({ method: 'GET', url: `/ping/${clientId}` }, (error, response, body) => {
		res.json((body === clientId) ? 'pong' : 'Error: ping is not possible')
	})
})

app.get('/badges', (req, res) => {
	api({ method: 'GET', url: `/badge/${clientId}` }, (error, response, body) => {
		res.json(JSON.parse(body))
	})
})

app.get('/badge', (req, res) => {
	api({ method: 'GET', url: `/badge/${clientId}/P7FLCHaEEOa6AY` }, (error, response, body) => {;
		res.json(JSON.parse(body))
	})
})

api = (options, callback) => {
	request({
		method: options.method,
		url: `${cfg.urlApi}${options.url}`,
		json: options.data || null,
		key: fs.readFileSync(privateKey, 'utf-8'),
		cert: fs.readFileSync(certificate, 'utf-8')
	}, callback)
}

app.listen(port, host)
console.log(`Listening on http://${host}:${port}`)
