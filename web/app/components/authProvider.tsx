"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "../routes";
import { getCurrentUser } from "../services/apiConfig";

const PUBLIC_ROUTES = [
  ROUTES.signIn,
  ROUTES.signUp,
  ROUTES.emailVerification,
  ROUTES.mobileVerification,
  ROUTES.mobile,
  ROUTES.signInVerification,
];

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    const token = localStorage.getItem("Dtoken");
    const uid = localStorage.getItem("uid");
    const storedSessionId = localStorage.getItem("session_id");
    const storedIp = localStorage.getItem("ip_address");

    if (!token && !PUBLIC_ROUTES.includes(pathname)) {
      router.replace(ROUTES.signIn);
      return;
    }

    if (token && uid) {
      try {
        const response = await getCurrentUser(uid);
        const user = response?.data?.payload?.user;
        const sessionId = user?.session_id;
        const ipAddress = user?.ip_address;

        if (!user || !sessionId || !ipAddress) {
          localStorage.removeItem("Dtoken");
          localStorage.removeItem("session_id");
          localStorage.removeItem("ip_address");
          router.replace(ROUTES.signIn);
          return;
        }

        // Handle session ID
        if (!storedSessionId) {
          localStorage.setItem("session_id", sessionId);
        } else if (storedSessionId !== sessionId) {
          localStorage.removeItem("session_id");
          localStorage.removeItem("Dtoken");
          localStorage.removeItem("ip_address");
          router.replace(ROUTES.signIn);
          return;
        }

        // Handle IP address
        if (!storedIp) {
          localStorage.setItem("ip_address", ipAddress);
        } else if (storedIp !== ipAddress) {
          localStorage.removeItem("ip_address");
          localStorage.removeItem("Dtoken");
          localStorage.removeItem("session_id");
          router.replace(ROUTES.signIn);
        }

      } catch (err) {
        console.error("User fetch failed:", err);
        localStorage.removeItem("Dtoken");
        localStorage.removeItem("session_id");
        localStorage.removeItem("ip_address");
        router.replace(ROUTES.signIn);
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  return <>{children}</>;
}
