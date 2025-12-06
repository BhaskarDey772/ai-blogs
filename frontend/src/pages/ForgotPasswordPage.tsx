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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email) {
        setError("Email is required");
        return;
      }

      await authApi.forgotPassword(email);
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || "Failed to send reset email"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Reset Password</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          Check your email for password reset instructions
        </div>
      )}

      {!success ? (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-gray-600 text-sm mb-4">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <button
            onClick={onBack}
            className="w-full mt-4 text-sm text-blue-500 hover:text-blue-600"
          >
            Back to Login
          </button>
        </>
      ) : (
        <p className="text-gray-600 text-center">Redirecting...</p>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
