let express = require('express')
let app = express()
let request = require('request')
let constants = require('constants')
let fs = require('fs')
let path = require('path')

let port = process.env.PORT || 8080

app.use(express.static(__dirname))

const key = path.resolve(__dirname, 'ssl/apiKey.key')
const certificate = path.resolve(__dirname, 'ssl/certificate.pem')

const urlApi = 'https://openbadgefactory.com/v1'

const apiKey = fs.readFileSync(key).toString()
const clientId = 'P7F99NaEEOa66L'

app.get('/', (req, res) => {
	request(`${urlApi}/client/OBF.rsa.pub`, (error, response, body) => {		
		let forge = require('node-forge')
		let publicKey = forge.pki.publicKeyFromPem(body)
		let apiKeyDecoded = forge.util.decode64(apiKey)

		let decrypt = JSON.parse(forge.pki.rsa.decrypt(apiKeyDecoded, publicKey, true))

		res.json(decrypt)
  })
})

app.get('/csr', (req, res) => {
	request({
		method: 'POST',
		url: `${urlApi}/client/${clientId}/sign_request`,
		json: {
			signature: apiKey,
			request: fs.readFileSync('./ssl/obf.csr').toString()
		}
	}, (error, response, body) => {
		if (error) res.send(error)

		if (!body.error) fs.writeFileSync(certificate, body)

		res.send(response)
	})
})

app.get('/ping', (req, res) => {
	let result = api('GET', `/ping/${clientId}`, (error, response, body) => {
		res.json(body)
	})
})

app.get('/badges', (req, res) => {
	let result = api('GET', `/badge/${clientId}`, (error, response, body) => {
		res.json(JSON.parse(body))
	})
})

app.get('/badge', (req, res) => {
	let result = api('GET', `/badge/${clientId}/P7FLCHaEEOa6AY`, (error, response, body) => {
		res.json(JSON.parse(body))
	})
})

api = (method, url, callback) => {
	request({
		method,
		url: `${urlApi}${url}`,
		agentOptions: {
			key: fs.readFileSync('./ssl/obf.key').toString(),
			cert: fs.readFileSync(certificate).toString()
		},
		header: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0'
		}
	}, (error, response, body) => {
		return callback(error, response, body)
	})
}

app.listen(port, () => {
	console.log('listening on http://localhost:' + port)
})
