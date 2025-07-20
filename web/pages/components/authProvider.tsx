"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "../../app/routes";
import { getCurrentUser } from "../../services/apiConfig";
import MainLayout from "./mainLayout";
import { UserContext } from "../../app/userContext";
import { Spin } from "antd";
import DocklyLoader from "../../utils/docklyLoader";
import { useGlobalLoading } from "../../app/loadingContext";
interface AuthProviderProps {
  children: React.ReactNode;
}
const PUBLIC_ROUTE_PATTERNS = [
  /^\/$/,
  /^\/[^/]+\/sign-up$/,
  /^\/[^/]+\/verify-email$/,
  // /^\/[^/]+\/dashboard$/,
];

export default function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const [user, setUser] = useState<any>(null);
  const { loading, setLoading } = useGlobalLoading();


  const isPublicRoute = (path: string) => {
    return PUBLIC_ROUTE_PATTERNS.some((pattern) => pattern.test(path));
  };
  const fetchUser = async () => {
    setLoading(true)
    const token = localStorage.getItem("Dtoken");
    const uid = localStorage.getItem("userId");
    // const storedSessionId = localStorage.getItem("session_id");
    // const storedIp = localStorage.getItem("ip_address");

    if (!token && !isPublicRoute(pathname)) {
      router.replace(ROUTES.home);
      return;
    }

    if (token && uid) {
      try {
        const response = await getCurrentUser(uid);
        const user = response?.data?.payload?.user;
        const sessionId = user?.session_id;
        const ipAddress = user?.ip_address;

        if (!user) {
          localStorage.clear();
          router.replace(ROUTES.home);
        }

        setUser(user);
      } catch (err) {
        console.error("User fetch failed:", err);
        localStorage.clear();
        router.replace(ROUTES.home);
      }
    }
    setLoading(false)
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  if (user === undefined) {
    return <DocklyLoader />
  }

  // if (loading) {
  //   return <DocklyLoader />
  // }

  return (
    <UserContext.Provider value={user}>
      {user ? <MainLayout>{children}</MainLayout> : children}
    </UserContext.Provider>
  );
}

// if (!user || !sessionId || !ipAddress) {
//   localStorage.removeItem("Dtoken");
//   localStorage.removeItem("session_id");
//   localStorage.removeItem("ip_address");
//   localStorage.removeItem("uid");
//   router.replace(ROUTES.signIn);
//   return;
// }

// if (!storedSessionId || storedSessionId !== sessionId) {
//   localStorage.clear();
//   router.replace(ROUTES.signIn);
//   return;
// }

// if (!storedIp || storedIp !== ipAddress) {
//   localStorage.clear();
//   router.replace(ROUTES.signIn);
//   return;
// }
