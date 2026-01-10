const joi = require('joi');

const updateProfileSchema = joi
  .object({
    username: joi.string().min(3).max(30),
    email: joi.string().email(),
    bio: joi.string().max(300).allow('', null),
    avatar_url: joi.string().uri().allow('', null),
  })
  .unknown(true);

module.exports = {
  updateProfileSchema,
};
