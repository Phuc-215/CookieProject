// Generic request validation middleware
// Usage: validate(schema, 'body' | 'query' | 'params')
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return res.status(400).json({
          message: 'VALIDATION_ERROR',
          details: error.details.map((d) => d.message),
        });
      }

      // Replace with sanitized values
      req[source] = value;
      next();
    } catch (err) {
      return res.status(400).json({ message: 'VALIDATION_ERROR' });
    }
  };
};

module.exports = { validate };
