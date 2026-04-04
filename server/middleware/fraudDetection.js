import fraudDetectionService from '../services/fraudDetectionService.js';
import User from '../models/User.js';
import FraudAlert from '../models/FraudAlert.js';

export const detectFraudDuringRegistration = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;
    
    // Calculate fraud score
    const fraudScore = await fraudDetectionService.calculateFraudScore(req, {
      name,
      email,
      phone
    });
    
    // Attach fraud score to request
    req.fraudScore = fraudScore;
    
    // Log fraud attempt
    if (fraudScore.totalRiskScore > 40) {
      console.log(`⚠️ Fraud risk detected: ${fraudScore.totalRiskScore}% - ${fraudScore.recommendation}`);
    }
    
    // Handle based on risk level
    if (fraudScore.totalRiskScore >= 80) {
      // Block registration
      await fraudDetectionService.logFraudAlert(
        null,
        fraudScore,
        fraudScore.riskFactors,
        'block'
      );
      
      return res.status(403).json({
        success: false,
        message: 'Registration blocked due to suspicious activity',
        fraudDetected: true,
        requiresAction: false
      });
    } else if (fraudScore.totalRiskScore >= 60) {
      // Require manual review
      req.requiresManualReview = true;
      
      await fraudDetectionService.logFraudAlert(
        null,
        fraudScore,
        fraudScore.riskFactors,
        'manual_review'
      );
      
      // Continue but flag for review
      next();
    } else if (fraudScore.totalRiskScore >= 40) {
      // Require enhanced verification
      req.requiresEnhancedVerification = true;
      
      await fraudDetectionService.logFraudAlert(
        null,
        fraudScore,
        fraudScore.riskFactors,
        'enhanced_verification'
      );
      
      next();
    } else {
      // Low risk - proceed normally
      next();
    }
  } catch (error) {
    console.error('Fraud detection error:', error);
    next(); // Proceed even if fraud detection fails
  }
};

export const detectFraudDuringLogin = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return next();
    }
    
    const deviceFingerprint = fraudDetectionService.generateDeviceFingerprint(req);
    
    // Check location anomaly
    let locationAnomaly = null;
    if (req.body.location) {
      locationAnomaly = await fraudDetectionService.checkLocationAnomaly(
        user._id,
        req.body.location
      );
    }
    
    // Check IP risk
    const ipRisk = await fraudDetectionService.checkSuspiciousIP(
      deviceFingerprint.ip,
      user._id
    );
    
    // Check multiple devices
    const deviceCheck = await fraudDetectionService.checkMultipleAccounts(
      deviceFingerprint,
      user.email
    );
    
    // Calculate total risk
    let riskScore = 0;
    const riskFactors = [];
    
    if (locationAnomaly?.isAnomaly) {
      riskScore += 40;
      riskFactors.push({
        factor: 'location_anomaly',
        details: locationAnomaly
      });
    }
    
    if (ipRisk.isSuspicious) {
      riskScore += 30;
      riskFactors.push({
        factor: 'suspicious_ip',
        details: ipRisk
      });
    }
    
    if (deviceCheck.hasMultipleAccounts) {
      riskScore += 20;
      riskFactors.push({
        factor: 'multiple_accounts',
        details: deviceCheck
      });
    }
    
    // Store risk info in request
    req.loginRisk = {
      riskScore,
      riskFactors,
      isSuspicious: riskScore > 50
    };
    
    if (riskScore > 70) {
      // Block login and increment attempts
      user.loginAttempts += 1;
      
      if (user.loginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 min
      }
      
      await user.save();
      
      return res.status(403).json({
        success: false,
        message: 'Login blocked due to suspicious activity',
        isLocked: user.lockedUntil > new Date(),
        lockExpires: user.lockedUntil
      });
    }
    
    next();
  } catch (error) {
    console.error('Login fraud detection error:', error);
    next();
  }
};

export const rateLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
};