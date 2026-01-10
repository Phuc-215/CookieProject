module.exports = function(schema) {
  return function(req, res, next) {
    try {
      const validator = schema.default || schema;
      validator.parse(req.body);
      next();
    } catch (error) {
      const formattedErrors = error.flatten();
      return res.status(400).json({ 
        success: false,
        errors: formattedErrors
      });
    }
  };
};