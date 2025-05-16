"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";

export default function UserRedirectPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const username = localStorage.getItem("username") || "";
    setUsername(username);
  }, []);

  useEffect(() => {
    router.replace(`/${username}/dashboard`);
  }, [username]);

  return <Spin />;
}
