const joi = require('joi');

const followSchema = joi.object({
  // :id from route param is the followee, no body needed
  // but we can allow empty body for flexibility
}).allow(null);

module.exports = { followSchema };
