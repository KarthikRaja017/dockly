"use client";
import { Layout } from "antd";

import Sidebar from "./sideBar";
import Header from "./header";
import { useIsHovered } from "../../app/comman";

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
      <Sidebar ref={ref} isHovered={isHovered} />
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
            background: "#fefefe",
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
