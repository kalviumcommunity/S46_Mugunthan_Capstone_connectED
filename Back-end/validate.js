const Joi = require("joi");

const authSchema = Joi.object({
  username: Joi.string().min(5).required(),
  password: Joi.string().min(8).required(),
});

module.exports = {
  authSchema,
};
