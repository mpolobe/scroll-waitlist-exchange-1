/**
 * OTP Service with Africa's Talking (Primary) and Twilio (Fallback)
 * 
 * Handles SMS OTP delivery for phone-based wallet authentication
 */

interface OTPResponse {
  success: boolean;
  provider: 'africas-talking' | 'twilio' | 'none';
  messageId?: string;
  error?: string;
}

interface OTPVerification {
  valid: boolean;
  error?: string;
}

interface StoredOTP {
  code: string;
  expires: number;
  attempts: number;
}

class OTPService {
  private africasTalkingApiKey: string;
  private africasTalkingUsername: string;
  private twilioAccountSid: string;
  private twilioAuthToken: string;
  private twilioPhoneNumber: string;
  private otpStore: Map<string, StoredOTP>;

  constructor() {
    this.africasTalkingApiKey = import.meta.env.VITE_AFRICAS_TALKING_API_KEY || '';
    this.africasTalkingUsername = import.meta.env.VITE_AFRICAS_TALKING_USERNAME || '';
    this.twilioAccountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID || '';
    this.twilioAuthToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN || '';
    this.twilioPhoneNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER || '';
    this.otpStore = new Map();
  }

  /**
   * Generate a 6-digit OTP code
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Validate phone number format (E.164)
   */
  validatePhoneNumber(phoneNumber: string): { valid: boolean; error?: string } {
    if (!phoneNumber) {
      return { valid: false, error: 'Phone number is required' };
    }
    
    // E.164 format: +[country code][number], max 15 digits
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    if (!e164Regex.test(phoneNumber)) {
      return { 
        valid: false, 
        error: 'Invalid phone number format. Use E.164 format (e.g., +254712345678)' 
      };
    }
    
    return { valid: true };
  }

  /**
   * Send OTP via Africa's Talking
   */
  private async sendViaAfricasTalking(phoneNumber: string, code: string): Promise<OTPResponse> {
    try {
      const message = `Your Africoin verification code is: ${code}. Valid for 10 minutes. Do not share this code.`;
      
      const response = await fetch('https://api.africastalking.com/version1/messaging', {
        method: 'POST',
        headers: {
          'apiKey': this.africasTalkingApiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          username: this.africasTalkingUsername,
          to: phoneNumber,
          message: message,
          from: 'AFRICOIN'
        })
      });

      const data = await response.json();

      if (data.SMSMessageData?.Recipients?.[0]?.status === 'Success') {
        return {
          success: true,
          provider: 'africas-talking',
          messageId: data.SMSMessageData.Recipients[0].messageId
        };
      }

      throw new Error(data.SMSMessageData?.Recipients?.[0]?.status || 'Unknown error');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("Africa's Talking error:", errorMessage);
      return {
        success: false,
        provider: 'africas-talking',
        error: errorMessage
      };
    }
  }

  /**
   * Send OTP via Twilio (Fallback)
   */
  private async sendViaTwilio(phoneNumber: string, code: string): Promise<OTPResponse> {
    try {
      const message = `Your Africoin verification code is: ${code}. Valid for 10 minutes. Do not share this code.`;
      
      const auth = btoa(`${this.twilioAccountSid}:${this.twilioAuthToken}`);
      
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            To: phoneNumber,
            From: this.twilioPhoneNumber,
            Body: message
          })
        }
      );

      const data = await response.json();

      if (response.ok && data.sid) {
        return {
          success: true,
          provider: 'twilio',
          messageId: data.sid
        };
      }

      throw new Error(data.message || 'Unknown error');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Twilio error:', errorMessage);
      return {
        success: false,
        provider: 'twilio',
        error: errorMessage
      };
    }
  }

  /**
   * Send OTP with automatic fallback
   */
  async sendOTP(phoneNumber: string): Promise<OTPResponse> {
    // Validate phone number format
    const validation = this.validatePhoneNumber(phoneNumber);
    if (!validation.valid) {
      return {
        success: false,
        provider: 'none',
        error: validation.error
      };
    }

    // Check rate limiting (max 3 OTPs per 10 minutes)
    const existing = this.otpStore.get(phoneNumber);
    if (existing && existing.expires > Date.now() && existing.attempts >= 3) {
      return {
        success: false,
        provider: 'none',
        error: 'Too many OTP requests. Please wait before requesting a new code.'
      };
    }

    // Generate OTP
    const code = this.generateOTP();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    this.otpStore.set(phoneNumber, { code, expires, attempts: 0 });

    // Try Africa's Talking first
    if (this.africasTalkingApiKey && this.africasTalkingUsername) {
      const result = await this.sendViaAfricasTalking(phoneNumber, code);
      if (result.success) {
        console.log(`OTP sent via Africa's Talking to ${phoneNumber}`);
        return result;
      }
      console.warn("Africa's Talking failed, trying Twilio...");
    }

    // Fallback to Twilio
    if (this.twilioAccountSid && this.twilioAuthToken) {
      const result = await this.sendViaTwilio(phoneNumber, code);
      if (result.success) {
        console.log(`OTP sent via Twilio to ${phoneNumber}`);
        return result;
      }
      console.error('Both OTP providers failed');
    }

    // Both providers failed or not configured
    return {
      success: false,
      provider: 'none',
      error: 'SMS service unavailable. Please check your configuration or try again later.'
    };
  }

  /**
   * Verify OTP code
   */
  verifyOTP(phoneNumber: string, code: string): OTPVerification {
    const stored = this.otpStore.get(phoneNumber);

    if (!stored) {
      return {
        valid: false,
        error: 'No OTP found for this phone number. Please request a new code.'
      };
    }

    // Check expiration
    if (Date.now() > stored.expires) {
      this.otpStore.delete(phoneNumber);
      return {
        valid: false,
        error: 'OTP has expired. Please request a new code.'
      };
    }

    // Check attempts
    if (stored.attempts >= 3) {
      this.otpStore.delete(phoneNumber);
      return {
        valid: false,
        error: 'Too many failed attempts. Please request a new code.'
      };
    }

    // Verify code
    if (stored.code === code) {
      this.otpStore.delete(phoneNumber);
      return { valid: true };
    }

    // Increment attempts
    stored.attempts++;
    this.otpStore.set(phoneNumber, stored);

    return {
      valid: false,
      error: `Invalid code. ${3 - stored.attempts} attempts remaining.`
    };
  }

  /**
   * Resend OTP
   */
  async resendOTP(phoneNumber: string): Promise<OTPResponse> {
    // Clear existing OTP
    this.otpStore.delete(phoneNumber);
    
    // Send new OTP
    return this.sendOTP(phoneNumber);
  }

  /**
   * Clear OTP for a phone number
   */
  clearOTP(phoneNumber: string): void {
    this.otpStore.delete(phoneNumber);
  }

  /**
   * Check if SMS providers are configured
   */
  isConfigured(): boolean {
    return !!(
      (this.africasTalkingApiKey && this.africasTalkingUsername) ||
      (this.twilioAccountSid && this.twilioAuthToken)
    );
  }
}

// Export singleton instance
export const otpService = new OTPService();
export default otpService;
