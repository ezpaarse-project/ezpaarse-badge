const router = require('express').Router();
const { app, ping } = require('./app');

router.get('/', app);
router.get('/ping', ping);

module.exports = router;
