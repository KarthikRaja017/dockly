"use client";
import { Layout } from "antd";

import Sidebar, { useIsHovered } from "./sideBar";
import Header from "./header";

interface MainLayoutProps {
  children: React.ReactNode;
  colors?: {
    primaryColor?: string;
    activeTextColor?: string;
    sidebarBg?: string;
  };
}

export default function MainLayout({ children, colors }: MainLayoutProps) {
  const [ref, isHovered] = useIsHovered();

  return (
    <Layout>
      <Sidebar ref={ref} isHovered={isHovered} colors={colors} />
      <Layout
        style={{
          marginLeft: isHovered ? 140 : 25,
          transition: "all 0.3s ease",
          minHeight: "100vh",
        }}
      >
        <Header isHovered={isHovered} />
        <div
          style={{
            background: "#f0f2f5",
            minHeight: "calc(100vh - 64px)",
            caretColor: "transparent"
          }}
        >
          {children}
        </div>
      </Layout>
    </Layout>
  );
}
