const router = require('express').Router();
const bodyParser = require('body-parser');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator({});

const {
  badges,
  emit,
  users,
  visibility,
} = require('./badges');

router.get('/', badges);

const usersSchema = Joi.object({
  id: Joi.string().trim().required(),
});
router.get('/users', validator.query(usersSchema), users);

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const emitSchema = Joi.object({
  badgeId: Joi.string().trim().required(),
  userId: Joi.string().trim().required(),
  email: Joi.string().trim().email().required(),
  name: Joi.string().trim().required(),
});
router.post('/emit', validator.body(emitSchema), emit);

const visibilitySchema = Joi.object({
  userId: Joi.string().trim().required(),
  visibility: Joi.string().trim().required(),
});
router.put('/visibility', validator.body(visibilitySchema), visibility);

module.exports = router;
