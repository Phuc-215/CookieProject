// Ensure the authenticated user is the owner of the resource (by :id)
exports.ensureOwner = (paramName = 'id') => {
  return (req, res, next) => {
    const idParam = parseInt(req.params[paramName], 10);

    if (Number.isNaN(idParam)) {
      return res.status(400).json({ message: 'INVALID_USER_ID' });
    }

    if (!req.user || req.user.id !== idParam) {
      return res.status(403).json({ message: 'FORBIDDEN' });
    }

    next();
  };
};
