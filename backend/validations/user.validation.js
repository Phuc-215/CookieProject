const joi = require('joi');

const updateProfileSchema = joi
  .object({
    username: joi.string().alphanum().min(3).max(30),
    email: joi.string().email(),
    bio: joi.string().max(300).allow('', null),
    avatar_url: joi.string().uri().allow('', null),
  })
  .min(1);

module.exports = {
  updateProfileSchema,
};
