"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";

export default function UserRedirectPage({
  params,
}: {
  params: { username: string };
}) {
  const router = useRouter();
  const { username } = params;

  useEffect(() => {
    router.replace(`/${username}/dashboard`);
  }, [username]);

  return <Spin />; 
}
