import nodemailer from "nodemailer";

console.log("---process.env.EMAIL_USERprocess.env.EMAIL_USER", process.env.EMAIL_USER)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTP = async (to, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "Fit_Connect - OTP Verification",
      html: `
        <div style="font-family:sans-serif;padding:20px;border:1px solid #ddd;border-radius:10px;">
          <h2 style="color:#e63946;">Fit_Connect</h2>
          <p>Dear user,</p>
          <p>Your One Time Password (OTP) for signup verification is:</p>
          <h1 style="letter-spacing:5px;">${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
          <p>Regards,<br/>Fit_Connect Team 📚</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return { success: false, message: "Email sending failed" };
  }
};
