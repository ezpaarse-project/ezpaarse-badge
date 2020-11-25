const router = require('express').Router();
const logger = require('../lib/logger');
const error = require('./error');

// eslint-disable-next-line no-unused-vars
router.use((req, res, next) => error(req, res));

router.use((err, req, res, next) => {
  if (err) {
    logger.error(err.stack);
  }
  next(err);
});

module.exports = router;
