import Policy from '../models/Policy.js';
import fraudDetectionService from '../services/fraudDetectionService.js';

export const createPolicy = async (req, res) => {
  try {
    const { planType, coverageAmount, location } = req.body;
    
    const basePremium = coverageAmount * 0.02;
    const totalPremium = basePremium * (Math.random() * 0.5 + 0.8);
    
    const policy = new Policy({
      userId: req.userId,
      planType,
      basePremium,
      totalPremium: Math.round(totalPremium * 100) / 100,
      coverageAmount,
      location,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    
    await policy.save();
    
    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      policy
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMyPolicies = async (req, res) => {
  try {
    const policies = await Policy.find({ userId: req.userId });
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};