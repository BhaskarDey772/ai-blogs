import React, { FC, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { authApi } from "@/api/client";

interface ResetPasswordPageProps {
  onSuccess?: () => void;
}

const ResetPasswordPage: FC<ResetPasswordPageProps> = ({ onSuccess }) => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const resetToken = searchParams.get("token");
    if (!resetToken) {
      setError("Invalid or missing reset token");
    } else {
      setToken(resetToken);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!token) {
        setError("Invalid reset token");
        return;
      }

      if (!formData.newPassword || !formData.confirmPassword) {
        setError("Both password fields are required");
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (formData.newPassword.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      await authApi.resetPassword(
        token,
        formData.newPassword,
        formData.confirmPassword
      );
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gray-900 text-gray-100 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Reset Your Password</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-800 text-red-200 rounded">{error}</div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-800 text-green-200 rounded">
          Password reset successful! Redirecting...
        </div>
      )}

      {!success && !error && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-gray-100"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-gray-100"
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordPage;
