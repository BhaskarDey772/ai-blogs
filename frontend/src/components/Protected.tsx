import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

import type { ReactNode } from "react";

export function Protected({ children }: { children: ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>

      <SignedOut>
        <RedirectToSignIn redirectUrl="/signin" />
      </SignedOut>
    </>
  );
}
