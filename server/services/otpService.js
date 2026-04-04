import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Twilio configuration
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Store OTPs temporarily (in production use Redis)
const otpStore = new Map();

export const sendOTP = async (phoneNumber) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Send SMS via Twilio
    const message = await client.messages.create({
      body: `Your GigShield AI verification OTP is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phoneNumber}`
    });
    
    // Store OTP with expiry (10 minutes)
    otpStore.set(phoneNumber, {
      otp: otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0
    });
    
    console.log(`📱 OTP sent to ${phoneNumber}: ${otp}`);
    return { success: true, sid: message.sid };
    
  } catch (error) {
    console.error('SMS Error:', error);
    return { success: false, error: error.message };
  }
};

export const verifyOTP = (phoneNumber, enteredOtp) => {
  const stored = otpStore.get(phoneNumber);
  
  if (!stored) {
    return { success: false, message: 'OTP expired or not found' };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phoneNumber);
    return { success: false, message: 'OTP expired' };
  }
  
  if (stored.attempts >= 5) {
    otpStore.delete(phoneNumber);
    return { success: false, message: 'Too many attempts' };
  }
  
  if (stored.otp === enteredOtp) {
    otpStore.delete(phoneNumber);
    return { success: true, message: 'OTP verified' };
  }
  
  stored.attempts++;
  return { success: false, message: 'Invalid OTP' };
};

export default { sendOTP, verifyOTP };