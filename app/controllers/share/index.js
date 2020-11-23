const router = require('express').Router();

const { share } = require('./share');

router.get('/:type/:uuid/:locale', share);

module.exports = router;
