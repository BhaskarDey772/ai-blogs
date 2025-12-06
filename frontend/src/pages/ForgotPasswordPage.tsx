import React, { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/api/client";

interface ForgotPasswordPageProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

const ForgotPasswordPage: FC<ForgotPasswordPageProps> = ({
  onSuccess,
  onBack,
}) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debugToken, setDebugToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email) {
        setError("Email is required");
        return;
      }

      const resp: any = await authApi.forgotPassword(email);
      setSuccess(true);
      if (resp?.debugToken) setDebugToken(resp.debugToken);

      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || "Failed to send reset email"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gray-900 text-gray-100 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Reset Password</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-800 text-red-200 rounded">{error}</div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-800 text-green-200 rounded">
          Check your email for password reset instructions
        </div>
      )}

      {!success ? (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-gray-300 text-sm mb-4">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-gray-100"
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <button
            onClick={onBack}
            className="w-full mt-4 text-sm text-blue-300"
          >
            Back to Login
          </button>
        </>
      ) : (
        <div>
          <p className="text-gray-300 text-center">Redirecting...</p>
          {debugToken && (
            <div className="mt-4 p-3 bg-gray-800 text-sm rounded">
              <div className="text-yellow-300">Debug token (dev):</div>
              <pre className="break-words text-gray-100">{debugToken}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
