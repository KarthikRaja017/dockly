"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "./routes";


export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      router.replace(ROUTES.dashboard);
    } else {
      router.replace(ROUTES.signIn);
    }
  }, []);

  return null; 
}
