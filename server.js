const express     = require('express')
const app         = express()
const morgan      = require('morgan')
const cfg         = require('config')
const bodyParser  = require('body-parser')
const mongo       = require('./app/lib/mongo')
const fs          = require('fs')
const cache       = require('./app/lib/cache')
const path        = require('path')

process.env.PORT = cfg.port

app.use(express.static(__dirname))

const env = process.env.NODE_ENV = process.env.NODE_ENV || 'development'
if (env === 'development') {
  app.use(morgan('dev'))
}

if (env === 'production') {
  app.use(morgan('combined', {
    stream: fs.createWriteStream(path.resolve(__dirname, 'logs/access.log'), { flags: 'a+' })
  }))
}

app.set('views', './app/views')
app.set('view engine', 'ejs')

const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 4000

const mongoUrl = `mongodb://${cfg.mongo.host}:${cfg.mongo.port}/${cfg.mongo.db}`

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, POST')
  next()
})

const AppController = require('./app/controllers/AppController')
const BadgeController = require('./app/controllers/BadgeController')
const ReportController = require('./app/controllers/ReportController')
const ShareController = require('./app/controllers/ShareController')

app.get('/', AppController.app)

app.get('/ping', AppController.ping)

app.get('/badges', BadgeController.badges)
app.post('/emit', bodyParser.urlencoded({ extended: true }), bodyParser.json(), BadgeController.emit)
app.get('/users', BadgeController.users)
app.put('/visibility', bodyParser.urlencoded({ extended: true }), bodyParser.json(), BadgeController.visibility)

app.get('/metrics', ReportController.metrics)

app.get('/embed/:uuid/:locale', ShareController.embed)
app.get('/view/:uuid/:locale', ShareController.view)

mongo.connect(mongoUrl, (err) => {
  if (err) {
    // eslint-disable-next-line
    console.error(`Couldn't connect to ${mongoUrl}`)
    process.exit(1)
  }

  BadgeController.getBadges((err) => {
    if (err) return

    app.listen(port, host)
    // eslint-disable-next-line
    console.log(`Listening on http://${host}:${port}`)

    setTimeout(() => {
      if (!cache.isValid()) {
        BadgeController.getBadges()
      }
    }, cache.time)
  })
})
