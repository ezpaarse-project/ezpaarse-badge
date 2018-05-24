const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const cfg = require('config')
const bodyParser = require('body-parser')

process.env.PORT = cfg.port
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, POST')
  next()
})

const AppController = require('./app/controllers/AppController')
const BadgeController = require('./app/controllers/BadgeController')
const ReportController = require('./app/controllers/ReportController')

app.get('/', AppController.app)

app.get('/ping', AppController.ping)

app.get('/badges', BadgeController.badges)
app.post('/emit', BadgeController.emit)

app.get('/metrics', ReportController.metrics)

app.listen(port, host)
console.log(`Listening on http://${host}:${port}`)
