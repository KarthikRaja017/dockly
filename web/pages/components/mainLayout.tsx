"use client";
import { Button, Layout } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";

import Sidebar from "./sideBar";
import Header from "./header";
import { useIsHovered } from "../../app/comman";
import { useState } from "react";

interface MainLayoutProps {
  children: React.ReactNode;
  colors?: {
    primaryColor?: string;
    activeTextColor?: string;
    sidebarBg?: string;
  };
}

export default function MainLayout({ children, colors }: MainLayoutProps) {
  // const [hoverRef, isHovered] = useIsHovered();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout>
      {/* <Sidebar ref={hoverRef} isHovered={isHovered} /> */}
      <Sidebar collapsed={collapsed} isHovered={!collapsed} />
      <Layout
        style={{
          marginLeft: !collapsed ? 140 : 25,
          transition: "all 0.3s ease",
          minHeight: "100vh",
        }}
      >

        <Header isHovered={!collapsed} collapsed={collapsed} setCollapsed={setCollapsed} />
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
