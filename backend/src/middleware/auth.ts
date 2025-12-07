import { Request, Response, NextFunction } from "express";
import { requireAuth, clerkClient } from "@clerk/express";

export interface AuthPayload {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Use Clerk server-side session verification only
    requireAuth()(req as any, res as any, async (err?: any) => {
      if (err) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const auth = (req as any).auth;
      if (!auth || !auth.userId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      // Try to enrich with Clerk user data when possible
      try {
        const clerkUser = await clerkClient.users.getUser(auth.userId);
        const primaryEmail =
          clerkUser.emailAddresses.find(
            (e) => e.id === clerkUser.primaryEmailAddressId
          )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

        req.user = {
          userId: auth.userId,
          email: primaryEmail,
          firstName: clerkUser.firstName || undefined,
          lastName: clerkUser.lastName || undefined,
        } as AuthPayload;
      } catch (e) {
        // If clerkClient not configured or lookup fails, at least provide userId
        req.user = { userId: auth.userId } as AuthPayload;
      }

      next();
    });
  } catch (err) {
    res.status(401).json({ error: "Authentication failed" });
  }
};

export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Optional: try Clerk, but never fail the request if unauthenticated
    requireAuth()(req as any, res as any, async (err?: any) => {
      if (!err) {
        const auth = (req as any).auth;
        if (auth && auth.userId) {
          try {
            const clerkUser = await clerkClient.users.getUser(auth.userId);
            const primaryEmail =
              clerkUser.emailAddresses.find(
                (e) => e.id === clerkUser.primaryEmailAddressId
              )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

            req.user = {
              userId: auth.userId,
              email: primaryEmail,
              firstName: clerkUser.firstName || undefined,
              lastName: clerkUser.lastName || undefined,
            } as AuthPayload;
          } catch (e) {
            req.user = { userId: auth.userId } as AuthPayload;
          }
        }
      }
      next();
    });
  } catch (err) {
    next();
  }
};
