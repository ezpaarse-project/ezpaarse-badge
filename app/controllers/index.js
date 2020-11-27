const router = require('express').Router();

router.use(require('./app'));
router.use('/badges', require('./badges'));
router.use('/metrics', require('./metrics'));
router.use('/share', require('./share'));

module.exports = router;
