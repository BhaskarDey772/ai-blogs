import { Request, Response, NextFunction } from "express";
import { clerkClient, getAuth } from "@clerk/express";

export interface AuthPayload {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get auth state WITHOUT requiring auth (no redirect)
    const auth = getAuth(req as any);

    console.log("[AUTH] Request headers:", {
      authorization: req.headers.authorization,
      cookie: req.headers.cookie?.substring(0, 100),
    });
    console.log("[AUTH] Clerk auth object:", auth);

    if (!auth || !auth.userId) {
      console.log("[AUTH] No userId found, returning 401");
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    console.log("[AUTH] User authenticated:", auth.userId);

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
  } catch (err) {
    res.status(401).json({ error: "Authentication failed" });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get auth state WITHOUT requiring auth (no redirect)
    const auth = getAuth(req as any);

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

    // Always continue, even if not authenticated
    next();
  } catch (err) {
    // On any error, just continue without auth
    next();
  }
};
