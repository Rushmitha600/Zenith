import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const smtpHost = process.env.EMAIL_HOST;
const smtpPort = Number(process.env.EMAIL_PORT || 587);
const smtpSecure = process.env.EMAIL_SECURE === 'true';
const smtpUser = process.env.EMAIL_USER;
const smtpPass = process.env.EMAIL_PASS;
const fromName = process.env.EMAIL_FROM_NAME || 'Zenith';
const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'noreply@zenith.com';

let transporterPromise = null;
let usingTestAccount = false;

const getTransporter = async () => {
  if (transporterPromise) {
    return transporterPromise;
  }

  const allowSelfSigned = process.env.EMAIL_ALLOW_SELF_SIGNED === 'true';

  if (smtpHost && smtpUser && smtpPass) {
    transporterPromise = Promise.resolve(nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        rejectUnauthorized: !allowSelfSigned
      }
    }));
  } else {
    console.warn('SMTP settings are not configured. Falling back to Ethereal test SMTP for OTP emails.');
    const testAccount = await nodemailer.createTestAccount();
    usingTestAccount = true;
    transporterPromise = Promise.resolve(nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    }));
  }

  return transporterPromise;
};

// For demo, store OTPs in memory (use Redis in production)
const otpStore = new Map();

export const sendEmailOTP = async (email) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(email, {
      otp: otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0
    });

    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: email,
      subject: 'Zenith Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #2563eb; text-align: center;">Zenith</h2>
          <h3 style="text-align: center;">Email Verification</h3>
          <p style="font-size: 16px;">Hello,</p>
          <p style="font-size: 16px;">Your OTP for email verification is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background: #f3f4f6; padding: 10px 20px; border-radius: 8px;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #6b7280;">This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
          <hr style="margin: 20px 0; border-color: #e0e0e0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">Zenith - Elevating GIG Insurance Standards</p>
        </div>
      `
    });

    const previewUrl = usingTestAccount ? nodemailer.getTestMessageUrl(info) : null;
    if (previewUrl) {
      console.log(`📧 OTP preview URL: ${previewUrl}`);
    }

    console.log(`📧 OTP sent to ${email}: ${otp}, messageId=${info.messageId}`);
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message || 'Failed to send OTP email' };
  }
};

export const verifyEmailOTP = (email, enteredOtp) => {
  const stored = otpStore.get(email);
  
  if (!stored) {
    return { success: false, message: 'OTP expired or not found' };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    return { success: false, message: 'OTP expired' };
  }
  
  if (stored.attempts >= 5) {
    otpStore.delete(email);
    return { success: false, message: 'Too many attempts' };
  }
  
  if (stored.otp === enteredOtp) {
    otpStore.delete(email);
    return { success: true, message: 'Email verified successfully' };
  }
  
  stored.attempts++;
  return { success: false, message: 'Invalid OTP' };
};