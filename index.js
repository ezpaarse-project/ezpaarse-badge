const express = require('express')
const app = express()
const cfg = require('config')
const bodyParser = require('body-parser')
const mongo = require('./app/lib/mongo')

process.env.PORT = cfg.port
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 3000

const mongoUrl = `mongodb://${cfg.mongo.host}:${cfg.mongo.port}/${cfg.mongo.db}`

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

mongo.connect(mongoUrl, (err) => {
  if (err) {
    // eslint-disable-next-line
    console.error(`Couldn't connect to ${mongoUrl}`)
    process.exit(1)
  }

  app.listen(port, host)
  // eslint-disable-next-line
  console.log(`Listening on http://${host}:${port}`)
})
