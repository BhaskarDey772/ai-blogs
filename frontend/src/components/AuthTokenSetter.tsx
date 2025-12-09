import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { setAuthTokenGetter } from "@/api/client";

export default function AuthTokenSetter() {
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(async () => {
      try {
        if (!getToken) return null;
        const token = await getToken();
        return token ?? null;
      } catch (e) {
        console.debug("AuthTokenSetter: failed to get Clerk token", e);
        return null;
      }
    });
  }, [getToken]);

  return null;
}
