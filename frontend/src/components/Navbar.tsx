import { UserButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="w-full border-b border-slate-800 bg-slate-900 shadow-sm">
      <div className="app-container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="rounded-md bg-accent/10 p-2 text-accent">
            {/* Logo */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
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
            <Link to="/signin" className="text-sm text-slate-300">
              Login
            </Link>
            <Link
              to="/signup"
              className="ml-2 rounded-full bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow"
            >
              Get Started
            </Link>
          </SignedOut>

          <SignedIn>
            <Link
              to="/myblogs"
              className="text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              My Blogs
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
