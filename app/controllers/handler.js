const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');
const logger = require('../lib/logger');
const en = require('../locales/en.json');

const styleError = fs.readFileSync(path.resolve('public', 'css', 'error.css'), 'utf-8');

// eslint-disable-next-line no-unused-vars
router.use((req, res, next) => res.status(404).render('error', {
  locale: 'en',
  styleError,
  error: 404,
  message: 'pageNotFound',
  text: en,
}));

router.use((err, req, res, next) => {
  if (err) {
    logger.error(err.stack);
  }
  next(err);
});

module.exports = router;
