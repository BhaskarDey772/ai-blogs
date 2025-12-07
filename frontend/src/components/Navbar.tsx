import { UserButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="w-full border-b bg-white">
      <div className="container mx-auto flex items-center justify-between py-4">
        <Link to="/" className="text-xl font-bold">
          AI Blogs
        </Link>

        <nav className="flex items-center gap-4">
          <SignedOut>
            <Link to="/signin" className="text-sm font-medium">
              Login
            </Link>
            <Link
              to="/signup"
              className="text-sm font-medium px-3 py-1 rounded bg-black text-white"
            >
              Sign up
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/signin" />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
