import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod');

      req.user = await User.findById(decoded.id).select('-loginToken -loginTokenExpires');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error('❌ Auth Error:', error.message);
      
      if (error.name === 'JsonWebTokenError') {
         return res.status(401).json({ message: 'Token inválido o firma no coincidente. Por favor inicia sesión nuevamente.' });
      }
      
      if (error.name === 'TokenExpiredError') {
         return res.status(401).json({ message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.' });
      }

      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
