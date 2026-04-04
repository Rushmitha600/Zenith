// Fraud Detection Service
export const calculateFraudScore = (userData) => {
  let score = 0;
  const factors = [];

  // Check email domain
  const riskyDomains = ['tempmail.com', 'mailinator.com', '10minutemail.com', 'guerrillamail.com'];
  const emailDomain = userData.email?.split('@')[1];
  if (riskyDomains.includes(emailDomain)) {
    score += 30;
    factors.push('Disposable email domain detected');
  }

  // Check password strength
  if (userData.password?.length < 6) {
    score += 20;
    factors.push('Weak password');
  }
  if (!/[A-Z]/.test(userData.password)) {
    score += 10;
    factors.push('No uppercase letters in password');
  }
  if (!/[0-9]/.test(userData.password)) {
    score += 10;
    factors.push('No numbers in password');
  }

  // Check phone number (simple validation)
  if (userData.phone && !/^[0-9]{10}$/.test(userData.phone)) {
    score += 15;
    factors.push('Invalid phone number format');
  }

  // Check name
  if (userData.name?.length < 2) {
    score += 10;
    factors.push('Name too short');
  }

  // Check for suspicious patterns
  const suspiciousPatterns = ['test', 'demo', '123', 'abc'];
  if (suspiciousPatterns.some(p => userData.email?.toLowerCase().includes(p))) {
    score += 15;
    factors.push('Suspicious email pattern');
  }

  // Device fingerprint (browser, OS)
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Headless')) {
    score += 25;
    factors.push('Headless browser detected');
  }

  const riskLevel = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
  
  return {
    score: Math.min(score, 100),
    level: riskLevel,
    factors,
    isSuspicious: score >= 40,
    requiresVerification: score >= 60
  };
};

export const getFraudAlertMessage = (score) => {
  if (score >= 70) {
    return {
      title: '⚠️ High Risk Detected',
      message: 'Your registration has been flagged for manual review. Please contact support.',
      color: 'red'
    };
  } else if (score >= 40) {
    return {
      title: '🔍 Additional Verification Required',
      message: 'Please verify your phone number to complete registration.',
      color: 'yellow'
    };
  }
  return null;
};