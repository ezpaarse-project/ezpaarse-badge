const express = require('express');

const app = express();
const morgan = require('morgan');
const winston = require('winston');
const cfg = require('config');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const mongo = require('./app/lib/mongo');
const cache = require('./app/lib/cache');

process.env.PORT = cfg.port;

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 4000;

app.use(express.static(__dirname));

if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs');
}

winston.addColors({
  verbose: 'green', info: 'green', warn: 'yellow', error: 'red',
});
const { format } = winston;
const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
  ),
  transports: [new (winston.transports.Console)()],
});

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const env = process.env.NODE_ENV;
if (env === 'development') {
  app.use(morgan('dev'));
}
if (env === 'production') {
  app.use(morgan('combined', {
    stream: fs.createWriteStream(path.resolve(__dirname, 'logs/access.log'), { flags: 'a+' }),
  }));
}

app.set('views', './app/views');
app.set('view engine', 'ejs');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  next();
});

const AppController = require('./app/controllers/AppController');
const BadgeController = require('./app/controllers/BadgeController');
const ReportController = require('./app/controllers/ReportController');
const ShareController = require('./app/controllers/ShareController');

app.get('/', AppController.app);
app.get('/ping', AppController.ping);
app.get('/badges', BadgeController.badges);
app.post('/emit', bodyParser.urlencoded({ extended: true }), bodyParser.json(), BadgeController.emit);
app.get('/users', BadgeController.users);
app.put('/visibility', bodyParser.urlencoded({ extended: true }), bodyParser.json(), BadgeController.visibility);
app.get('/metrics', ReportController.metrics);
app.get('/embed/:uuid/:locale', ShareController.embed);
app.get('/view/:uuid/:locale', ShareController.view);

const text = JSON.parse(fs.readFileSync(path.resolve('app/locales/en.json'), 'utf-8'));
const styleError = fs.readFileSync(path.resolve('public/css/error.css'), 'utf-8');

// eslint-disable-next-line no-unused-vars
app.use((req, res, next) => res.status(404).render('error', {
  locale: 'en',
  styleError,
  error: 404,
  message: 'pageNotFound',
  text,
}));

app.use((err, req, res, next) => {
  if (err) {
    logger.error(err.stack);
  }
  next(err);
});

const mongoUrl = `mongodb://${cfg.mongo.host}:${cfg.mongo.port}/${cfg.mongo.db}`;
mongo.connect(mongoUrl, (err) => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }

  app.listen(port, host, () => {
    if (!cfg.continuousIntegration) {
      BadgeController.getBadges((error) => {
        if (error) {
          logger.error(error);
          process.exit(1);
        }

        setTimeout(() => {
          if (!cache.isValid()) {
            BadgeController.getBadges();
          }
        }, cache.time);
      });
    }

    logger.info(`Listening on http://${host}:${port}`);
  });
});

module.exports = app;
