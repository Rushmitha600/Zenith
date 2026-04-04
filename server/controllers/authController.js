import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import fraudDetectionService from '../services/fraudDetectionService.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, aadharNumber, panNumber } = req.body;
    
    // Check existing user
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'worker',
      fraudScore: req.fraudScore?.totalRiskScore || 0,
      riskLevel: req.fraudScore?.level || 'low',
      verificationLevel: req.requiresEnhancedVerification ? 'enhanced' : 'basic'
    });
    
    // Add KYC if provided
    if (aadharNumber) {
      const aadharVerification = await fraudDetectionService.verifyDocument(aadharNumber, 'aadhar');
      if (aadharVerification.isValid) {
        user.kycDocuments.aadharNumber = aadharVerification.documentNumber;
      }
    }
    
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        verificationLevel: user.verificationLevel,
        riskLevel: user.riskLevel
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        verificationLevel: user.verificationLevel,
        riskLevel: user.riskLevel
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};