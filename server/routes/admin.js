import express from 'express';
import User from '../models/User.js';
import Claim from '../models/Claim.js';
import Policy from '../models/Policy.js';
import Payment from '../models/Payment.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all claims (Admin only)
router.get('/claims', verifyToken, requireAdmin, async (req, res) => {
  try {
    const claims = await Claim.find().populate('userId', 'name email phone');
    res.json(claims);
  } catch (error) {
    console.error('Get claims error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard stats (Admin only)
router.get('/stats', verifyToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalWorkers = await User.countDocuments({ role: 'worker' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalClaims = await Claim.countDocuments();
    const pendingClaims = await Claim.countDocuments({ status: 'pending' });
    const approvedClaims = await Claim.countDocuments({ status: 'approved' });
    
    const claims = await Claim.find();
    const totalClaimAmount = claims.reduce((sum, c) => sum + (c.amount || 0), 0);
    
    res.json({
      totalUsers,
      totalWorkers,
      totalAdmins,
      totalClaims,
      pendingClaims,
      approvedClaims,
      totalClaimAmount
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve claim (Admin only)
router.put('/claims/:claimId/approve', verifyToken, requireAdmin, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    claim.status = 'approved';
    claim.processedAt = new Date();
    await claim.save();
    
    res.json({ success: true, message: 'Claim approved successfully' });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject claim (Admin only)
router.put('/claims/:claimId/reject', verifyToken, requireAdmin, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    claim.status = 'rejected';
    claim.processedAt = new Date();
    await claim.save();
    
    res.json({ success: true, message: 'Claim rejected' });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (Admin only)
router.delete('/users/:userId', verifyToken, requireAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;