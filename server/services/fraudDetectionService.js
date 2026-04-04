import crypto from 'crypto';
import geoip from 'geoip-lite';
import DeviceDetector from 'device-detector-js';
import User from '../models/User.js';
import FraudAlert from '../models/FraudAlert.js';
import DeviceFingerprint from '../models/DeviceFingerprint.js';

class FraudDetectionService {
  constructor() {
    this.deviceDetector = new DeviceDetector();
    this.fraudRules = {
      MAX_REGISTRATION_ATTEMPTS: 5,
      MAX_LOGIN_ATTEMPTS: 10,
      SUSPICIOUS_IP_THRESHOLD: 3,
      SAME_DEVICE_MULTIPLE_ACCOUNTS: 3,
      UNUSUAL_LOCATION_THRESHOLD_KM: 500,
      TIME_WINDOW_MINUTES: 60
    };
  }

  /**
   * Generate unique device fingerprint
   */
  generateDeviceFingerprint(req) {
    const userAgent = req.headers['user-agent'];
    const ip = req.ip || req.connection.remoteAddress;
    const acceptLanguage = req.headers['accept-language'];
    
    const fingerprintData = `${userAgent}|${ip}|${acceptLanguage}`;
    const fingerprint = crypto
      .createHash('sha256')
      .update(fingerprintData)
      .digest('hex');
    
    return {
      fingerprint,
      userAgent,
      ip,
      acceptLanguage,
      deviceInfo: this.deviceDetector.parse(userAgent)
    };
  }

  /**
   * Check for suspicious IP patterns
   */
  async checkSuspiciousIP(ip, userId = null) {
    const geo = geoip.lookup(ip);
    
    // Check if IP is from high-risk countries
    const highRiskCountries = ['KP', 'IR', 'SY', 'CU', 'VE'];
    const isHighRiskCountry = geo && highRiskCountries.includes(geo.country);
    
    // Check for VPN/Proxy
    const isVPN = await this.checkVPN(ip);
    
    // Check if IP has multiple accounts
    const accountCount = await User.countDocuments({ 'security.ip': ip });
    const hasMultipleAccounts = accountCount > this.fraudRules.SAME_DEVICE_MULTIPLE_ACCOUNTS;
    
    return {
      isSuspicious: isHighRiskCountry || isVPN || hasMultipleAccounts,
      riskScore: this.calculateIPRiskScore(geo, isVPN, hasMultipleAccounts),
      geo,
      isVPN,
      hasMultipleAccounts,
      isHighRiskCountry
    };
  }

  /**
   * Check for multiple accounts from same device
   */
  async checkMultipleAccounts(deviceFingerprint, email) {
    const existingFingerprints = await DeviceFingerprint.find({
      fingerprint: deviceFingerprint.fingerprint
    }).populate('userId');
    
    const uniqueUsers = new Set();
    existingFingerprints.forEach(fp => {
      if (fp.userId && fp.userId.email !== email) {
        uniqueUsers.add(fp.userId.email);
      }
    });
    
    return {
      hasMultipleAccounts: uniqueUsers.size > 0,
      accountCount: uniqueUsers.size,
      accounts: Array.from(uniqueUsers)
    };
  }

  /**
   * Check for unusual location changes
   */
  async checkLocationAnomaly(userId, currentLocation) {
    const lastLogin = await User.findById(userId).select('lastLocation lastLoginAt');
    
    if (!lastLogin || !lastLogin.lastLocation) {
      return { isAnomaly: false, distance: 0 };
    }
    
    const distance = this.calculateDistance(
      lastLogin.lastLocation.lat,
      lastLogin.lastLocation.lng,
      currentLocation.lat,
      currentLocation.lng
    );
    
    const isAnomaly = distance > this.fraudRules.UNUSUAL_LOCATION_THRESHOLD_KM;
    
    return {
      isAnomaly,
      distance,
      lastLocation: lastLogin.lastLocation
    };
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  /**
   * Calculate IP risk score (0-100)
   */
  calculateIPRiskScore(geo, isVPN, hasMultipleAccounts) {
    let score = 0;
    
    if (isVPN) score += 40;
    if (hasMultipleAccounts) score += 30;
    if (geo && geo.country === 'KP') score += 20;
    if (geo && !geo.city) score += 10;
    
    return Math.min(score, 100);
  }

  /**
   * Check if IP is a VPN/Proxy
   */
  async checkVPN(ip) {
    // In production, integrate with VPN detection API
    // This is a mock implementation
    const vpnIPs = ['1.1.1.1', '2.2.2.2'];
    return vpnIPs.includes(ip);
  }

  /**
   * Email domain risk check
   */
  checkEmailDomainRisk(email) {
    const domain = email.split('@')[1];
    
    const riskyDomains = [
      'guerrillamail.com', 'mailinator.com', '10minutemail.com',
      'tempmail.com', 'throwawaymail.com'
    ];
    
    const disposableDomains = [
      'tempmail.com', 'guerrillamail.com', 'mailinator.com'
    ];
    
    return {
      isRisky: riskyDomains.includes(domain),
      isDisposable: disposableDomains.includes(domain),
      domain
    };
  }

  /**
   * Name similarity check for duplicate accounts
   */
  async checkDuplicateAccounts(name, email, phone) {
    const existingUsers = await User.find({
      $or: [
        { email: email },
        { phone: phone },
        { name: { $regex: name, $options: 'i' } }
      ]
    });
    
    return {
      hasDuplicate: existingUsers.length > 0,
      duplicates: existingUsers,
      count: existingUsers.length
    };
  }

  /**
   * Calculate overall fraud risk score
   */
  async calculateFraudScore(req, userData) {
    const deviceFingerprint = this.generateDeviceFingerprint(req);
    const ipRisk = await this.checkSuspiciousIP(deviceFingerprint.ip);
    const emailRisk = this.checkEmailDomainRisk(userData.email);
    const duplicateCheck = await this.checkDuplicateAccounts(
      userData.name,
      userData.email,
      userData.phone
    );
    
    let totalRiskScore = 0;
    const riskFactors = [];
    
    // IP Risk
    if (ipRisk.riskScore > 50) {
      totalRiskScore += 25;
      riskFactors.push({
        factor: 'suspicious_ip',
        score: ipRisk.riskScore,
        details: ipRisk
      });
    }
    
    // Email Risk
    if (emailRisk.isRisky) {
      totalRiskScore += 30;
      riskFactors.push({
        factor: 'risky_email_domain',
        score: 30,
        details: emailRisk
      });
    }
    
    if (emailRisk.isDisposable) {
      totalRiskScore += 40;
      riskFactors.push({
        factor: 'disposable_email',
        score: 40,
        details: emailRisk
      });
    }
    
    // Duplicate Accounts
    if (duplicateCheck.hasDuplicate) {
      totalRiskScore += 35;
      riskFactors.push({
        factor: 'duplicate_account',
        score: 35,
        details: duplicateCheck
      });
    }
    
    // Device Fingerprint
    const deviceCheck = await this.checkMultipleAccounts(deviceFingerprint, userData.email);
    if (deviceCheck.hasMultipleAccounts) {
      totalRiskScore += 30;
      riskFactors.push({
        factor: 'multiple_accounts_same_device',
        score: 30,
        details: deviceCheck
      });
    }
    
    // Determine fraud level
    let level = 'low';
    if (totalRiskScore >= 70) level = 'high';
    else if (totalRiskScore >= 40) level = 'medium';
    
    return {
      totalRiskScore: Math.min(totalRiskScore, 100),
      level,
      riskFactors,
      deviceFingerprint,
      requiresManualReview: totalRiskScore >= 60,
      recommendation: this.getRecommendation(totalRiskScore)
    };
  }

  /**
   * Get fraud recommendation
   */
  getRecommendation(score) {
    if (score >= 80) {
      return 'BLOCK_IMMEDIATELY - High fraud probability';
    } else if (score >= 60) {
      return 'MANUAL_REVIEW - Suspicious activity detected';
    } else if (score >= 40) {
      return 'ENHANCED_VERIFICATION - Require additional verification';
    } else {
      return 'ALLOW - Standard registration';
    }
  }

  /**
   * Log fraud alert
   */
  async logFraudAlert(userId, fraudScore, riskFactors, action) {
    const fraudAlert = new FraudAlert({
      userId,
      fraudScore: fraudScore.totalRiskScore,
      level: fraudScore.level,
      riskFactors: fraudScore.riskFactors,
      action,
      timestamp: new Date()
    });
    
    await fraudAlert.save();
    return fraudAlert;
  }

  /**
   * Enhanced verification for high-risk users
   */
  async sendEnhancedVerification(userId, verificationType) {
    const verificationCodes = {
      'phone': Math.floor(100000 + Math.random() * 900000),
      'email': Math.floor(100000 + Math.random() * 900000),
      'document': 'PENDING'
    };
    
    // In production, send SMS/Email here
    console.log(`📱 Verification code for ${userId}: ${verificationCodes[verificationType]}`);
    
    return verificationCodes[verificationType];
  }

  /**
   * Verify document (Aadhar/PAN)
   */
  async verifyDocument(documentNumber, documentType) {
    // Mock document verification
    // In production, integrate with government APIs
    const validFormats = {
      'aadhar': /^\d{12}$/,
      'pan': /^[A-Z]{5}\d{4}[A-Z]{1}$/
    };
    
    const isValid = validFormats[documentType]?.test(documentNumber);
    
    return {
      isValid,
      documentType,
      documentNumber: documentNumber.substring(0, 4) + '****'
    };
  }
}

export default new FraudDetectionService();