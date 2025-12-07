import { UserButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="w-full border-b border-slate-200 bg-dark dark:bg-slate-900 shadow-sm">
      <div className="app-container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="rounded-md bg-accent/10 p-2 text-accent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 1.343-3 3v4h6v-4c0-1.657-1.343-3-3-3z"
              />
            </svg>
          </div>
          <div className="text-lg font-semibold">AI Blogs</div>
        </Link>

        <nav className="flex items-center gap-4">
          <SignedOut>
            <Link
              to="/signin"
              className="text-sm font-medium text-slate-600 dark:text-slate-300"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="ml-2 inline-flex items-center gap-2 rounded-full bg-accent-600 hover:bg-accent-500 px-4 py-2 text-sm font-semibold text-white shadow"
            >
              Get Started
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
