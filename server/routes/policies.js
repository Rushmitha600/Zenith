import express from 'express';
import Policy from '../models/Policy.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Create policy
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { planType, coverageAmount, totalPremium, location } = req.body;
    
    console.log('Creating policy for user:', req.userId);
    console.log('Plan:', planType, 'Premium:', totalPremium);
    
    const policy = new Policy({
      userId: req.userId,
      policyNumber: `POL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      planType,
      basePremium: planType === 'basic' ? 99 : planType === 'standard' ? 199 : 299,
      totalPremium: totalPremium || (planType === 'basic' ? 99 : planType === 'standard' ? 199 : 299),
      coverageAmount: coverageAmount,
      status: 'active',
      location: location || {},
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    
    await policy.save();
    console.log('Policy created:', policy._id);
    
    res.status(201).json({ 
      success: true,
      message: 'Policy created successfully', 
      policy 
    });
  } catch (error) {
    console.error('Create policy error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get my policies
router.get('/my-policies', verifyToken, async (req, res) => {
  try {
    const policies = await Policy.find({ userId: req.userId }).sort({ createdAt: -1 });
    console.log('Found policies:', policies.length);
    res.json(policies);
  } catch (error) {
    console.error('Get policies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;