'use client';
import { Layout } from "antd";

import Sidebar, { useIsHovered } from "./sideBar";
import Header from "./header";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [ref, isHovered] = useIsHovered();

  return (
    <Layout>
      <Sidebar ref={ref} isHovered={isHovered} />
      <Layout
        style={{
          marginLeft: isHovered ? 200 : 80,
          transition: "all 0.3s ease",
          minHeight: "100vh",
        }}
      >
        <Header />
        <div
          style={{
            padding: 24,
            background: "#f0f2f5",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {children}
        </div>
      </Layout>
    </Layout>
  );
}
