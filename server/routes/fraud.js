import express from 'express';
import FraudAlert from '../models/FraudAlert.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/alerts', verifyToken, async (req, res) => {
  try {
    const alerts = await FraudAlert.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/alerts/:alertId', verifyToken, async (req, res) => {
  try {
    const { action } = req.body;
    const alert = await FraudAlert.findById(req.params.alertId);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    alert.resolvedAt = new Date();
    alert.resolvedBy = req.userId;
    alert.notes = action;
    await alert.save();
    
    res.json({ success: true, message: 'Alert resolved' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;