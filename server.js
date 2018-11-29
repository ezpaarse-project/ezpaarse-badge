const express     = require('express')
const app         = express()
const morgan      = require('morgan')
const cfg         = require('config')
const bodyParser  = require('body-parser')
const mongo       = require('./app/lib/mongo')
const fs          = require('fs')
const cache       = require('./app/lib/cache')

process.env.PORT = cfg.port

app.use(express.static(__dirname))
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.engine('html', (filePath, options, callback) => {
  fs.readFile(filePath, (err, content) => {
    if (err) return callback(new Error(err))

    const rendered = content.toString()
      .replace(new RegExp('{{badge.id}}', 'g'), options.badge.id)
      .replace(new RegExp('{{badge.name}}', 'g'), options.badge.name)
      .replace(new RegExp('{{badge.issuedOn}}', 'g'), options.badge.issuedOn)
      .replace(new RegExp('{{badge.description}}', 'g'), options.badge.description)
      .replace(new RegExp('{{badge.criteria}}', 'g'), options.badge.criteria)
      .replace(new RegExp('{{badge.image}}', 'g'), options.badge.image)
      .replace(new RegExp('{{user.name}}', 'g'), options.user.name)
      .replace(new RegExp('{{user.avatar}}', 'g'), options.user.avatar)
      .replace(new RegExp('{{t.issuedOn}}', 'g'), options.t.issuedOn)
      .replace(new RegExp('{{t.seeMore}}', 'g'), options.t.seeMore)
      .replace(new RegExp('{{t.description}}', 'g'), options.t.description)
      .replace(new RegExp('{{t.criteria}}', 'g'), options.t.criteria)
      .replace(new RegExp('{{t.recipient}}', 'g'), options.t.recipient)
      .replace(new RegExp('{{link.u}}', 'g'), options.link.u)
      .replace(new RegExp('{{link.b}}', 'g'), options.link.b)
      .replace(new RegExp('{{link.l}}', 'g'), options.link.l)
      .replace(new RegExp('{{link.url}}', 'g'), options.link.url)
      .replace(new RegExp('{{style.css}}', 'g'), options.style.css)
      .replace(new RegExp('{{style.img.ang}}', 'g'), options.style.img.ang)
      .replace(new RegExp('{{style.img.obf}}', 'g'), options.style.img.obf)

    return callback(null, rendered)
  })
})
app.set('views', './app/views')
app.set('view engine', 'html')

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
app.post('/emit', BadgeController.emit)
app.get('/users', BadgeController.users)
app.put('/visibility', BadgeController.visibility)

app.get('/metrics', ReportController.metrics)

app.get('/embed', ShareController.embed)
app.get('/view', ShareController.view)

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
