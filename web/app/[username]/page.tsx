"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";

export default function UserRedirectPage() {
  const router = useRouter();
  const username = localStorage.getItem("username") || "";

  useEffect(() => {
    router.replace(`/${username}/dashboard`);
  }, [username]);

  return <Spin />;
}
