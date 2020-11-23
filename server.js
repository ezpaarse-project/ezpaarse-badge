const express = require('express');
const morgan = require('morgan');
const cfg = require('config');
const fs = require('fs-extra');
const path = require('path');
const mongo = require('./app/lib/mongo');
const cache = require('./app/lib/cache');
const logger = require('./app/lib/logger');

process.env.PORT = cfg.port;

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 4000;

const app = express();
app.use(express.static(__dirname));

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const env = process.env.NODE_ENV;
if (env === 'development') {
  app.use(morgan('dev'));
}
if (env === 'production') {
  fs.ensureDir('logs', (err) => {
    if (err) { logger.error(err); }
  });

  const stream = fs.createWriteStream(path.resolve(__dirname, 'logs', 'access.log'), { flags: 'a+' });
  app.use(morgan('combined', { stream }));
}

app.set('views', './app/views');
app.set('view engine', 'ejs');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  next();
});

app.use('/', require('./app/controllers'));

cache.start();

const mongoUrl = `mongodb://${cfg.mongo.host}:${cfg.mongo.port}/${cfg.mongo.db}`;
mongo.connect(mongoUrl, (err) => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }

  app.listen(port, host, () => {
    logger.info(`Listening on http://${host}:${port}`);
  });
});

module.exports = app;
