import express from 'express';
import Payment from '../models/Payment.js';
import Policy from '../models/Policy.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all payments for a user
router.get('/my-payments', verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.userId })
      .populate('policyId')
      .sort({ dueDate: 1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming payments
router.get('/upcoming-payments', verifyToken, async (req, res) => {
  try {
    const today = new Date();
    const payments = await Payment.find({ 
      userId: req.userId, 
      status: 'pending',
      dueDate: { $gte: today }
    }).populate('policyId').sort({ dueDate: 1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create payment record when policy is purchased
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { policyId, amount, dueDate } = req.body;
    
    const payment = new Payment({
      userId: req.userId,
      policyId,
      amount,
      dueDate,
      status: 'pending'
    });
    
    await payment.save();
    res.status(201).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Process payment (mark as paid)
router.post('/pay/:paymentId', verifyToken, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { transactionId } = req.body;
    
    const payment = await Payment.findOne({ _id: paymentId, userId: req.userId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    payment.status = 'paid';
    payment.paidDate = new Date();
    payment.transactionId = transactionId || `TXN${Date.now()}`;
    await payment.save();
    
    // Create next payment for weekly schedule
    const nextDueDate = new Date(payment.dueDate);
    nextDueDate.setDate(nextDueDate.getDate() + 7);
    
    const nextPayment = new Payment({
      userId: req.userId,
      policyId: payment.policyId,
      amount: payment.amount,
      dueDate: nextDueDate,
      status: 'pending'
    });
    await nextPayment.save();
    
    res.json({ success: true, message: 'Payment successful', payment });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;