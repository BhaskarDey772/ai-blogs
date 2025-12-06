import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User, IUser } from "../models";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRY = "7d";

export interface AuthPayload {
  userId: string;
  email: string;
  firstName: string;
}

export class AuthService {
  // Generate JWT token
  static generateToken(user: IUser): string {
    const payload: AuthPayload = {
      userId: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  }

  // Verify JWT token
  static verifyToken(token: string): AuthPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
      return decoded;
    } catch (err) {
      console.error("Token verification error:", err);
      return null;
    }
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Compare passwords
  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate reset token
  static generateResetToken(): { token: string; hashed: string } {
    const token = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    return { token, hashed };
  }

  // Signup (email/password)
  static async signup(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<IUser> {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    await user.save();
    return user;
  }

  // Login (email/password)
  static async login(email: string, password: string): Promise<IUser> {
    // Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check password
    if (!user.password) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    return user;
  }

  // Forgot password - generate reset token
  static async forgotPassword(email: string): Promise<string> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("No user found with this email");
    }

    const { token, hashed } = this.generateResetToken();
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetToken = hashed;
    user.resetTokenExpiry = resetExpiry;
    await user.save();

    return token; // Return actual token to send via email
  }

  // Reset password - verify token and set new password
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<IUser> {
    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetToken: hashed,
      resetTokenExpiry: { $gt: new Date() },
    }).select("+resetToken +resetTokenExpiry");

    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return user;
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  // Update user profile
  static async updateProfile(
    userId: string,
    data: Partial<{ firstName: string; lastName: string; profileImage: string }>
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(userId, data, { new: true });
  }
}
