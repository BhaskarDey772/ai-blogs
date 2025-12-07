import { SignIn, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/blogs", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-dark">
      <SignIn />
    </div>
  );
}
