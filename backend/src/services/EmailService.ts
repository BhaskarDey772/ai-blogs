import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@example.com";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

console.log(
  "Resend API Key Loaded:",
  Boolean(resendApiKey) ? "(present)" : "(missing)"
);

let resend: Resend | null = null;
if (resendApiKey) {
  try {
    resend = new Resend(resendApiKey);
  } catch (err) {
    console.warn("Failed to initialize Resend client:", err);
    resend = null;
  }
} else {
  // No API key provided - email sending will be a no-op
  resend = null;
}

function assertResend(): Resend | null {
  if (!resend) {
    return null;
  }
  return resend;
}

export class EmailService {
  // Send password reset email
  static async sendPasswordResetEmail(
    email: string,
    resetToken: string
  ): Promise<void> {
    const resetLink = `${APP_URL}/reset-password?token=${resetToken}`;

    const client = assertResend();
    if (!client) {
      // Email client not configured — log the reset link for local/dev use
      console.warn(
        "Resend client not configured. Password reset link (dev):",
        resetLink
      );
      return;
    }

    try {
      await client.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: "Reset Your Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password. Click the link below to proceed:</p>
            <p>
              <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
                Reset Password
              </a>
            </p>
            <p>Or copy this link: ${resetLink}</p>
            <p style="color: #666; font-size: 12px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Failed to send password reset email:", err);
      // Don't throw - let the caller decide; surface warning instead
      return;
    }
  }

  // Send welcome email
  static async sendWelcomeEmail(
    email: string,
    firstName: string
  ): Promise<void> {
    const client = assertResend();
    if (!client) {
      console.info("Resend not configured — welcome email skipped for:", email);
      return;
    }

    try {
      await client.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: "Welcome to Auto-Generated Blog",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome, ${firstName}!</h2>
            <p>Your account has been created successfully. Start generating amazing content today!</p>
            <p>
              <a href="${APP_URL}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px;">
                Go to Dashboard
              </a>
            </p>
            <p>If you have any questions, feel free to reach out to us.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Failed to send welcome email:", err);
      return;
    }
  }

  // Send email change confirmation
  static async sendEmailConfirmation(
    email: string,
    verificationCode: string
  ): Promise<void> {
    const client = assertResend();
    if (!client) {
      console.info(
        "Resend not configured — verification email skipped for:",
        email
      );
      return;
    }

    try {
      await client.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: "Verify Your Email Address",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verify Your Email Address</h2>
            <p>Please use this code to verify your email:</p>
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${verificationCode}
            </p>
            <p style="color: #666; font-size: 12px;">This code expires in 15 minutes.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Failed to send verification email:", err);
      return;
    }
  }
}
