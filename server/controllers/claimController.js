import Claim from '../models/Claim.js';
import Policy from '../models/Policy.js';

export const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ userId: req.userId }).populate('policyId');
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const submitClaim = async (req, res) => {
  try {
    const { policyId, type, description, amount } = req.body;
    
    const policy = await Policy.findOne({ _id: policyId, userId: req.userId });
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    
    const claim = new Claim({
      policyId,
      userId: req.userId,
      type,
      description,
      amount,
      status: 'pending'
    });
    
    await claim.save();
    
    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully',
      claim
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const autoClaim = async (req, res) => {
  try {
    const { weatherData, policyId } = req.body;
    
    const policy = await Policy.findOne({ _id: policyId, userId: req.userId });
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    
    // Check triggers
    let claimAmount = 0;
    let claimType = null;
    
    if (weatherData.rainfall > 50) {
      claimAmount = 500;
      claimType = 'rain_disruption';
    } else if (weatherData.temp > 40) {
      claimAmount = 300;
      claimType = 'heat_wave';
    } else if (weatherData.aqi > 300) {
      claimAmount = 200;
      claimType = 'air_pollution';
    }
    
    if (claimAmount > 0) {
      const claim = new Claim({
        policyId,
        userId: req.userId,
        type: claimType,
        description: `Auto-generated claim due to ${claimType}`,
        amount: claimAmount,
        status: 'approved',
        processedAt: new Date()
      });
      
      await claim.save();
      
      res.json({
        success: true,
        message: 'Auto-claim created',
        claim
      });
    } else {
      res.json({ success: true, message: 'No triggers activated' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};