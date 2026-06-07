const jwt  = require('jsonwebtoken');
const User = require('../models/User.model');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token)
    return res.status(401).json({ success: false, data: null, message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user)
      return res.status(401).json({ success: false, data: null, message: 'User not found' });
    next();
  } catch {
    return res.status(401).json({ success: false, data: null, message: 'Invalid or expired token' });
  }
};
