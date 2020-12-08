const router = require('express').Router();
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator({});

const { share } = require('./share');

const shareSchema = Joi.object({
  type: Joi.string().trim().valid('view', 'embed').required(),
  uuid: Joi.string().trim().required(),
  locale: Joi.string().trim().valid('fr', 'en').required(),
});
router.get('/:type/:uuid/:locale', validator.params(shareSchema), share);

module.exports = router;
