import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Policy from '../models/Policy.js';
import Payment from '../models/Payment.js';
import { verifyToken } from '../middleware/auth.js';
import { sendEmailOTP, verifyEmailOTP } from '../services/emailService.js';
import { generateCaptcha, verifyCaptcha } from '../services/captchaService.js';
import Admin from '../models/Admin.js';

const router = express.Router();
const JWT_SECRET = 'gigshield_secret_key_2024';

// Send Email OTP
router.post('/send-email-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const result = await sendEmailOTP(email);
    
    if (result.success) {
      return res.json({ success: true, message: 'OTP sent to your email', previewUrl: result.previewUrl });
    }

    res.status(500).json({ success: false, message: result.error });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify Email OTP
router.post('/verify-email-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    
    const result = verifyEmailOTP(email, otp);
    
    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate Captcha
router.get('/captcha', (req, res) => {
  const captcha = generateCaptcha();
  res.json(captcha);
});

// Verify Captcha
router.post('/verify-captcha', (req, res) => {
  const { captchaId, answer } = req.body;
  
  if (!captchaId || !answer) {
    return res.status(400).json({ message: 'Captcha ID and answer are required' });
  }
  
  const result = verifyCaptcha(captchaId, answer);
  
  if (result.success) {
    res.json({ success: true, message: result.message });
  } else {
    res.status(400).json({ success: false, message: result.message });
  }
});

// Register (with email verification check)
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      dailyIncome,
      emailVerified,
      aadharNumber,
      panNumber,
      gigWorkerId,
      bankDetails,
      currentLocation,
      deliveryLocations
    } = req.body;

    if (!emailVerified) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const cleanPhone = phone != null ? String(phone).trim() : '';

    if (!cleanName || !cleanEmail || !password || !cleanPhone) {
      return res.status(400).json({ message: 'Name, email, password, and phone are required' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { phone: cleanPhone }]
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const income = Number(dailyIncome);
    const user = new User({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      phone: cleanPhone,
      dailyIncome: Number.isFinite(income) ? income : 0,
      aadharNumber: aadharNumber ? String(aadharNumber).trim() : '',
      panNumber: panNumber ? String(panNumber).trim().toUpperCase() : '',
      gigWorkerId: gigWorkerId ? String(gigWorkerId).trim() : '',
      bankDetails: bankDetails && typeof bankDetails === 'object' ? bankDetails : undefined,
      currentLocation: currentLocation && typeof currentLocation === 'object' ? currentLocation : undefined,
      deliveryLocations: Array.isArray(deliveryLocations) ? deliveryLocations : [],
      role: 'worker',
      isEmailVerified: true
    });

    await user.save();

    const role = user.role || 'worker';
    const token = jwt.sign(
      { userId: String(user._id), email: user.email, role },
      JWT_SECRET,
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
        role,
        dailyIncome: user.dailyIncome,
        currentLocation: user.currentLocation,
        deliveryLocations: user.deliveryLocations
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists with this email or phone' });
    }
    if (error.name === 'ValidationError') {
      const msg = Object.values(error.errors || {})
        .map((e) => e.message)
        .join(' ');
      return res.status(400).json({ message: msg || 'Validation failed' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin registration (simple - no invite code, no emailVerified)
// Admin registration (simple - no checks)
router.post('/admin/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    console.log('Admin registration request:', { name, email, phone });

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check in Admin collection
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { phone }] });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists with this email or phone' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'admin'
    });
    
    await admin.save();
    console.log('Admin user created in Admin collection:', admin._id);

    const token = jwt.sign(
      { adminId: admin._id, email: admin.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Forgot password — send OTP (same store as email verification)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email is required' });
    }
    const trimmed = email.trim();
    const user = await User.findOne({
      email: new RegExp(`^${escapeRegex(trimmed)}$`, 'i')
    });
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists for this email, a reset code has been sent.'
      });
    }
    const result = await sendEmailOTP(user.email);
    if (!result.success) {
      return res.status(500).json({ message: result.error || 'Could not send email' });
    }
    return res.json({
      success: true,
      message: 'If an account exists for this email, a reset code has been sent.',
      previewUrl: result.previewUrl || undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Reset password with email OTP (use same email you entered on “Forgot password”)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const trimmed = email.trim();
    const user = await User.findOne({
      email: new RegExp(`^${escapeRegex(trimmed)}$`, 'i')
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }
    const otpResult = verifyEmailOTP(user.email, String(otp).trim());
    if (!otpResult.success) {
      return res.status(400).json({ message: otpResult.message });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.json({ success: true, message: 'Password updated. You can sign in now.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Login with captcha check
router.post('/login', async (req, res) => {
  try {
    const { email, password, captchaId, captchaAnswer } = req.body;
    
    // Verify captcha first
    if (!captchaId || !captchaAnswer) {
      return res.status(400).json({ message: 'Captcha verification required' });
    }
    
    const captchaResult = verifyCaptcha(captchaId, captchaAnswer);
    if (!captchaResult.success) {
      return res.status(400).json({ message: captchaResult.message });
    }
    
    const user = await User.findOne({ email: email?.trim?.() || email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const hash = user.password;
    if (!hash || typeof hash !== 'string') {
      console.error('Login: user has no password hash', user.email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    let isValid = false;
    try {
      if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
        isValid = await bcrypt.compare(password, hash);
      } else {
        // Legacy plain-text (migrate on success)
        isValid = password === hash;
        if (isValid) {
          user.password = await bcrypt.hash(password, 10);
          await user.save();
        }
      }
    } catch (bcryptErr) {
      console.error('Login bcrypt error:', bcryptErr.message, user.email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const role = user.role || 'worker';
    const token = jwt.sign(
      { userId: String(user._id), email: user.email, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const policies = await Policy.find({ userId: user._id, status: 'active' }).lean();
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role,
        dailyIncome: user.dailyIncome,
        currentLocation: user.currentLocation,
        deliveryLocations: user.deliveryLocations,
        policies
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Activate/Buy Policy
// Activate/Buy Policy
router.post('/activate-policy', verifyToken, async (req, res) => {
  try {
    const { planType } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // City risk data
    const cityRisk = {
      mumbai: 1.35, delhi: 1.40, bangalore: 0.85,
      hyderabad: 1.05, chennai: 1.10, kolkata: 1.15,
      pune: 0.90, ahmedabad: 1.0, vijayawada: 0.90,
      guntur: 1.0
    };
    
    const plans = { basic: 99, standard: 199, premium: 299 };
    const coverage = { basic: 2000, standard: 5000, premium: 10000 };
    
    const basePrice = plans[planType];
    const cityMultiplier = cityRisk[user.currentLocation?.city?.toLowerCase()] || 1.0;
    const deliveryCount = user.deliveryLocations?.length || 1;
    const monthlyIncome = (user.dailyIncome || 500) * 30;
    
    let finalPrice = basePrice * cityMultiplier;
    finalPrice = finalPrice * (1 + (deliveryCount * 0.03));
    
    let incomeMultiplier = 1.0;
    if (monthlyIncome > 50000) incomeMultiplier = 1.2;
    else if (monthlyIncome > 30000) incomeMultiplier = 1.1;
    else if (monthlyIncome < 15000) incomeMultiplier = 0.9;
    finalPrice = finalPrice * incomeMultiplier;
    
    const weeklyPremium = Math.round(finalPrice * 100) / 100;
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 28);
    
    // Create policy
    const policy = new Policy({
      userId: user._id,
      policyNumber: `POL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      planType,
      basePremium: basePrice,
      totalPremium: weeklyPremium,  // Use calculated premium
      coverageAmount: coverage[planType],
      status: 'active',
      startDate: startDate,
      endDate: endDate
    });
    await policy.save();
    
    // Delete existing pending payments
    await Payment.deleteMany({ userId: user._id, policyId: policy._id, status: 'pending' });
    
    // Create 4 weekly payments
    for (let i = 1; i <= 4; i++) {
      const dueDate = new Date();
      dueDate.setDate(startDate.getDate() + (i * 7));
      
      const payment = new Payment({
        userId: user._id,
        policyId: policy._id,
        amount: weeklyPremium,
        weekNumber: i,
        dueDate: dueDate,
        status: 'pending'
      });
      await payment.save();
    }
    
    res.json({
      success: true,
      message: `Policy activated! Weekly premium: ₹${weeklyPremium}`,
      policy: policy
    });
  } catch (error) {
    console.error('Activate policy error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get User's Policies
router.get('/my-policies', verifyToken, async (req, res) => {
  try {
    const policies = await Policy.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Upcoming Payments
router.get('/upcoming-payments', verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find({ 
      userId: req.userId, 
      status: 'pending'
    }).populate('policyId').sort({ weekNumber: 1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Process Payment
router.post('/pay/:paymentId', verifyToken, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findOne({ _id: paymentId, userId: req.userId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    payment.status = 'paid';
    payment.paidDate = new Date();
    payment.transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    await payment.save();
    
    res.json({ success: true, message: 'Payment successful', payment });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Payment History
router.get('/payment-history', verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find({ 
      userId: req.userId, 
      status: 'paid' 
    }).populate('policyId').sort({ paidDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Renew Policy - Complete Fix
router.post('/renew-policy', verifyToken, async (req, res) => {
  try {
    const { policyId } = req.body;
    
    console.log('Renewing policy:', policyId);
    
    // Convert policyId to ObjectId
    const policyObjectId = new mongoose.Types.ObjectId(policyId);
    
    // Find the policy
    const policy = await Policy.findOne({ _id: policyObjectId, userId: req.userId });
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    
    // Update policy dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 28);
    
    policy.startDate = startDate;
    policy.endDate = endDate;
    policy.status = 'active';
    await policy.save();
    
    // Preserve payment history: append new renewal payments instead of deleting old records.
    const lastPayment = await Payment.findOne({ policyId: policyObjectId }).sort({ weekNumber: -1 });
    const startWeek = lastPayment ? lastPayment.weekNumber + 1 : 1;
    
    const newPayments = [];
    for (let i = 1; i <= 4; i++) {
      const dueDate = new Date();
      dueDate.setDate(startDate.getDate() + (i * 7));
      
      const payment = new Payment({
        userId: req.userId,
        policyId: policyObjectId,
        amount: policy.totalPremium,
        weekNumber: startWeek + i - 1,
        dueDate: dueDate,
        status: 'pending'
      });
      await payment.save();
      newPayments.push(payment);
    }
    
    console.log(`Created ${newPayments.length} new payments`);
    
    res.json({ 
      success: true, 
      message: 'Policy renewed successfully for 4 more weeks!',
      payments: newPayments
    });
  } catch (error) {
    console.error('Renew policy error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get Active Policies with Payment Status
// Get Active Policies with Payment Status
router.get('/active-policies-status', verifyToken, async (req, res) => {
  try {
    const policies = await Policy.find({ 
      userId: req.userId, 
      status: 'active'
    });
    
    const policiesWithStatus = await Promise.all(policies.map(async (policy) => {
      // Get payments for this policy
      const payments = await Payment.find({ policyId: policy._id });
      
      const pendingPayments = payments.filter(p => p.status === 'pending');
      const paidPayments = payments.filter(p => p.status === 'paid');
      
      // Calculate if all 4 weeks are complete
      const isComplete = paidPayments.length === 4 && pendingPayments.length === 0;
      
      console.log(`Policy ${policy.planType}: Paid=${paidPayments.length}, Pending=${pendingPayments.length}, Complete=${isComplete}`);
      
      return {
        ...policy.toObject(),
        paymentsPending: pendingPayments.length,
        paymentsPaid: paidPayments.length,
        totalPayments: payments.length,
        isComplete: isComplete
      };
    }));
    
    res.json(policiesWithStatus);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get payments for a specific policy
router.get('/policy-payments/:policyId', verifyToken, async (req, res) => {
  try {
    const { policyId } = req.params;
    
    // Convert to ObjectId
    const policyObjectId = new mongoose.Types.ObjectId(policyId);
    
    const payments = await Payment.find({ 
      policyId: policyObjectId,
      userId: req.userId
    }).sort({ weekNumber: 1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching policy payments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Admin login request:', email);
    
    // Check in Admin collection
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const token = jwt.sign(
      { adminId: admin._id, email: admin.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('Admin login successful:', admin.email);
    
    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;