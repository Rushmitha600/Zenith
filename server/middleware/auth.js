import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = 'gigshield_secret_key_2024';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    console.log('Token verified - userId:', req.userId, 'role:', req.userRole);
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    // First check token role
    if (req.userRole === 'admin') {
      console.log('Admin access granted via token role');
      return next();
    }
    
    // Fallback: check database
    const user = await User.findById(req.userId).select('role');
    console.log('Database check - user role:', user?.role);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('RequireAdmin error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};