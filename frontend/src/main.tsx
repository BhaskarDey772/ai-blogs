import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import AuthTokenSetter from "./components/AuthTokenSetter";

const runtimeEnv =
  (typeof window !== "undefined" && (window as any)._env_) || null;
const PUBLISHABLE_KEY =
  runtimeEnv?.VITE_CLERK_PUBLISHABLE_KEY ||
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  "";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      signInUrl="/signin"
      signUpUrl="/signup"
      afterSignOutUrl="/signin"
      afterSignInUrl="/"
    >
      <AuthTokenSetter />
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
