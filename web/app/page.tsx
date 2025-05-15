"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "./routes";
import DocklyLogin from "./docklyIn";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("Dtoken");
    const username = localStorage.getItem("username");
    if (username && token) {
      router.replace(`/${username}/dashboard`);
    }
  }, []);

  return <DocklyLogin />;
}
