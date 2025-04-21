"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "../routes";
import { getCurrentUser } from "../services/apiConfig";

const PUBLIC_ROUTES = [ROUTES.signIn, ROUTES.signUp, ROUTES.emailVerification];

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    const token = localStorage.getItem("token");

    if (!token && !PUBLIC_ROUTES.includes(pathname)) {
      router.replace(ROUTES.signIn);
      return;
    }

    if (token) {
      try {
        const response = await getCurrentUser(token);

        if (!response || Object.keys(response).length === 0) {
          localStorage.removeItem("token");
          router.replace(ROUTES.signIn);
        }
      } catch (err) {
        console.error("User fetch failed:", err);
        localStorage.removeItem("token");
        router.replace(ROUTES.signIn);
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  return <>{children}</>;
}
