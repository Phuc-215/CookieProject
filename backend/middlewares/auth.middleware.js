const jwt = require('jsonwebtoken');

exports.requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'UNAUTHORIZED' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Ensure id is always an integer
    req.user = {
      ...payload,
      id: parseInt(payload.id, 10)
    };
    console.log('Authenticated user:', req.user);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'TOKEN_INVALID' });
  }
};
