const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const cfg = require('config')
const bodyParser = require('body-parser')

process.env.PORT = cfg.port
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const AppController = require('./app/controllers/AppController')
const BadgeController = require('./app/controllers/BadgeController')

const key = path.resolve(__dirname, 'app/ssl/apiKey.key')

const apiKey = fs.readFileSync(key, 'utf-8')
const clientId = cfg.clientId

// app.post('/emit', (req, res) => {
// 	const recipient = req.body.recipient
// 	const email_subject = req.body.email_subject
// 	const email_link_text = req.body.email_link_text
// 	const email_body = req.body.email_body
// 	const email_footer = req.body.email_footer

// 	api({
// 		method: 'POST',
// 		url: `/badge/${clientId}/P7FLCHaEEOa6AY`,
// 		data: {
// 			recipient: (recipient.indexOf(';') > -1) ? recipient.split(';') : [ recipient ],
// 			issued_on: moment().unix(),
// 			email_subject,
// 			email_body,
// 			email_link_text,
// 			email_footer,
// 			api_consumer_id: clientId,
// 			log_entry: {
// 				client: 'app',
// 				issuer: 'Test app'
// 			}
// 		}
// 	}, (error, response, body) => {
// 		res.json(response)
// 		// res.redirect(url.format({ pathname: '/' }))
// 	})
// })

// app.get('/rsa', (req, res) => {
// 	api({ 
// 		method: 'GET', 
// 		url: `/client/OBF.rsa.pub`
// 	}, (error, response, body) => {
// 		const forge = require('node-forge')
// 		const publicKey = forge.pki.publicKeyFromPem(body)
// 		const apiKeyDecoded = forge.util.decode64(apiKey)

// 		const decrypt = JSON.parse(forge.pki.rsa.decrypt(apiKeyDecoded, publicKey, true))

// 		res.json(decrypt)
// 	})
// })

// app.get('/csr', (req, res) => {
// 	api({ 
// 		method: 'POST',
// 		url: `/client/${clientId}/sign_request`,
// 		data: {
// 			signature: apiKey,
// 			request: fs.readFileSync('./ssl/obf.csr', 'utf-8')
// 		}
// 	}, (error, response, body) => {
// 		if (error) res.send(error)

// 		if (!body.error) fs.writeFileSync(certificate, body)

// 		res.send(response)
// 	})
// })

app.get('/', AppController.app)

app.get('/ping', AppController.ping)

app.post('/badges', BadgeController.badges)

app.listen(port, host)
console.log(`Listening on http://${host}:${port}`)
