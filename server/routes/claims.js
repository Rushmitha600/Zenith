import express from 'express';
import Claim from '../models/Claim.js';
import Policy from '../models/Policy.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const claimPopulate = [
  { path: 'policyId' },
  { path: 'userId', select: 'name email phone' },
  { path: 'verifiedBy', select: 'name email' },
  { path: 'approvedBy', select: 'name email' },
  { path: 'rejectedBy', select: 'name email' }
];

router.get('/my-claims', verifyToken, async (req, res) => {
  try {
    const claims = await Claim.find({ userId: req.userId }).populate('policyId');
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { policyId, type, description, amount } = req.body;
    const claim = new Claim({ policyId, userId: req.userId, type, description, amount });
    await claim.save();
    res.status(201).json({ message: 'Claim submitted', claim });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ——— Admin ———
router.get('/admin/pending', verifyToken, requireAdmin, async (req, res) => {
  try {
    const claims = await Claim.find({ status: 'pending' })
      .populate(claimPopulate)
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/admin/verified-queue', verifyToken, requireAdmin, async (req, res) => {
  try {
    const claims = await Claim.find({ status: 'verified' })
      .populate(claimPopulate)
      .sort({ verifiedAt: -1 });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/admin/approved-history', verifyToken, requireAdmin, async (req, res) => {
  try {
    const claims = await Claim.find({ status: 'approved' })
      .populate(claimPopulate)
      .sort({ approvedAt: -1 });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/admin/:claimId/verify', verifyToken, requireAdmin, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    if (claim.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending claims can be verified' });
    }
    claim.status = 'verified';
    claim.verifiedAt = new Date();
    claim.verifiedBy = req.userId;
    if (req.body.adminNotes !== undefined) claim.adminNotes = req.body.adminNotes;
    await claim.save();
    const updated = await Claim.findById(claim._id).populate(claimPopulate);
    res.json({ message: 'Claim verified', claim: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/admin/:claimId/approve', verifyToken, requireAdmin, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    if (claim.status !== 'verified') {
      return res.status(400).json({ message: 'Only verified claims can be approved' });
    }
    claim.status = 'approved';
    claim.approvedAt = new Date();
    claim.approvedBy = req.userId;
    if (req.body.adminNotes !== undefined) claim.adminNotes = req.body.adminNotes;
    await claim.save();
    const updated = await Claim.findById(claim._id).populate(claimPopulate);
    res.json({ message: 'Claim approved', claim: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/admin/:claimId/reject', verifyToken, requireAdmin, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    if (claim.status === 'approved' || claim.status === 'rejected') {
      return res.status(400).json({ message: 'Claim cannot be rejected' });
    }
    claim.status = 'rejected';
    claim.rejectedAt = new Date();
    claim.rejectedBy = req.userId;
    if (req.body.adminNotes !== undefined) claim.adminNotes = req.body.adminNotes;
    await claim.save();
    const updated = await Claim.findById(claim._id).populate(claimPopulate);
    res.json({ message: 'Claim rejected', claim: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;