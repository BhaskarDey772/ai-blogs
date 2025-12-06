import { Router, Response } from "express";
import { AuthService, EmailService } from "../services";
import { AuthRequest, authMiddleware } from "../middleware/auth";

const router = Router();

// Signup with email/password
router.post("/signup", async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    // Signup
    const user = await AuthService.signup(email, password, firstName, lastName);

    // Send welcome email
    try {
      await EmailService.sendWelcomeEmail(email, firstName);
    } catch (err) {
      console.error("Email sending failed, but signup succeeded:", err);
    }

    // Generate token
    const token = AuthService.generateToken(user);

    // Set cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Login with email/password
router.post("/login", async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    // Login
    const user = await AuthService.login(email, password);

    // Generate token
    const token = AuthService.generateToken(user);

    // Set cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
    });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

// Forgot password - send reset email
router.post("/forgot-password", async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    // Generate reset token
    const resetToken = await AuthService.forgotPassword(email);

    // Send reset email (EmailService will log link if email client not configured)
    try {
      await EmailService.sendPasswordResetEmail(email, resetToken);
    } catch (err) {
      console.error("Failed to send reset email:", err);
      // Continue — in dev we still want the token available via logs/response
    }

    // In non-production/dev environments, return the token in the response
    // so developers can copy it from the API response instead of email.
    const debugToken =
      process.env.NODE_ENV === "production" || process.env.RESEND_API_KEY
        ? undefined
        : resetToken;

    res.json({
      message: "Password reset email sent",
      debugToken,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Reset password - verify token and set new password
router.post("/reset-password", async (req: AuthRequest, res: Response) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: "Token and new password are required" });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ error: "Passwords do not match" });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    // Reset password
    const user = await AuthService.resetPassword(token, newPassword);

    // Generate new token
    const newToken = AuthService.generateToken(user);

    // Set cookie
    res.cookie("accessToken", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Password reset successful",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Logout
router.post("/logout", (req: AuthRequest, res: Response) => {
  res.clearCookie("accessToken");
  res.json({ message: "Logged out successfully" });
});

// Get current user
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const user = await AuthService.getUserById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile
router.patch(
  "/profile",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const { firstName, lastName, profileImage } = req.body;
      const user = await AuthService.updateProfile(req.user.userId, {
        firstName,
        lastName,
        profileImage,
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json({
        message: "Profile updated",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage,
        },
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
