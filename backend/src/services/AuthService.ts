/**
 * Local AuthService removed — Clerk now manages authentication.
 * This module remains as a lightweight stub to avoid breaking imports.
 */

export interface AuthPayload {
  userId: string;
  email?: string;
  firstName?: string;
}

export const AuthService = {
  verifyToken: (_: string) => null as AuthPayload | null,
};
