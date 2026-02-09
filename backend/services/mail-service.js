import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Add connection timeout
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

/**
 * Send OTP email with timeout and retry logic
 * @param {string} to - Recipient email
 * @param {number} otp - 6-digit OTP
 * @param {number} retries - Number of retry attempts (default: 3)
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const sendOTP = async (to, otp, retries = 3) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "FitConnect - OTP Verification",
    html: `
      <div style="font-family:sans-serif;padding:20px;border:1px solid #ddd;border-radius:10px;">
        <h2 style="color:#e63946;">FitConnect</h2>
        <p>Dear user,</p>
        <p>Your One Time Password (OTP) for signup verification is:</p>
        <h1 style="letter-spacing:5px;">${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
        <p>Regards,<br/>FitConnect Team 💪</p>
      </div>
    `,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Add timeout wrapper
      await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Email timeout")), 10000)
        ),
      ]);

      console.log(`✅ OTP sent to ${to} (attempt ${attempt})`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Email attempt ${attempt} failed:`, error.message);

      // If this was the last attempt, return failure
      if (attempt === retries) {
        console.error(`❌ All ${retries} email attempts failed for ${to}`);
        return { 
          success: false, 
          message: "Email sending failed after retries",
          error: error.message 
        };
      }

      // Exponential backoff: wait 1s, 2s, 4s between retries
      const backoffTime = Math.pow(2, attempt - 1) * 1000;
      console.log(`⏳ Retrying in ${backoffTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, backoffTime));
    }
  }
};

/**
 * Send OTP asynchronously (fire-and-forget)
 * Logs errors but doesn't block execution
 * @param {string} to - Recipient email
 * @param {number} otp - 6-digit OTP
 */
export const sendOTPAsync = (to, otp) => {
  // Fire and forget - don't await
  sendOTP(to, otp).catch((error) => {
    console.error(`❌ Async OTP send failed for ${to}:`, error);
  });
  
  console.log(`📧 OTP email queued for ${to}`);
};
