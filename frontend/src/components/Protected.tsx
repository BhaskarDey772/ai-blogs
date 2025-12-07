import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

export function Protected({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>

      <SignedOut>
        <RedirectToSignIn redirectUrl="/signin" />
      </SignedOut>
    </>
  );
}
