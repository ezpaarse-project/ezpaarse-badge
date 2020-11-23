const router = require('express').Router();

const { metrics, metricsCount } = require('./metrics');

router.get('/', metrics);
router.get('/count', metricsCount);

module.exports = router;
