"use client";

import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
  RefObject,
} from "react";
import { Layout, Menu, Space } from "antd";
import { usePathname, useRouter } from "next/navigation";
import {
  ACTIVE_BG_COLOR,
  ACTIVE_TEXT_COLOR,
  DEFAULT_TEXT_COLOR,
  PRIMARY_COLOR,
  SIDEBAR_BG,
} from "../../app/comman";
import FlatColorIconsCalendar, {
  FlatColorIconsHome,
  FluentColorPeopleCommunity48,
  FluentEmojiDollarBanknote,
  FluentEmojiFlatRedHeart,
  FxemojiCloud,
  IconParkFolderLock,
  MaterialIconThemeFolderConnectionOpen,
  NotoKey,
  RiDashboardFill,
  TwemojiPuzzlePiece,
} from "./icons";

const { Sider } = Layout;

// Hover hook
export const useIsHovered = () => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return [ref, isHovered] as const;
};

interface SidebarProps {
  isHovered: boolean;
  colors?: {
    primaryColor?: string;
    activeTextColor?: string;
    sidebarBg?: string;
  };
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ isHovered, colors }, ref) => {
    const router = useRouter();
    const collapsed = !isHovered;
    const [currentPath, setCurrentPath] = useState<string>("dashboard");
    const [username, setUsername] = useState<string>("");

    useEffect(() => {
      const username = localStorage.getItem("username") || "";
      setUsername(username);
    }, []);
    const pathname = usePathname();
    if (!pathname) return null;

    useEffect(() => {
      const pathSegments = pathname.split("/") || [];
      const currentPath = pathSegments[2] || "dashboard";
      setCurrentPath(currentPath);
    }, [pathname]);

    const mainMenuItems = [
      {
        key: "dashboard",
        icon: <RiDashboardFill />,
        label: "Dashboard",
      },
      { key: "calendar", icon: <FlatColorIconsCalendar />, label: "Calendar" },
      { key: "home", icon: <FlatColorIconsHome />, label: "Home" },
      {
        key: "family-hub",
        icon: <FluentColorPeopleCommunity48 />,
        label: "Family Hub",
      },
      { key: "finance", icon: <FluentEmojiDollarBanknote />, label: "Finance" },
      { key: "health", icon: <FluentEmojiFlatRedHeart />, label: "Health" },
      { key: "projects", icon: <TwemojiPuzzlePiece />, label: "Projects" },
    ];

    const bottomMenuItems = [
      { key: "accounts", icon: <NotoKey />, label: "Accounts (34)" },
      {
        key: "cloud-storage",
        icon: <FxemojiCloud />,
        label: "Cloud Storage (3)",
      },
      {
        key: "password-manager",
        icon: <IconParkFolderLock />,
        label: "Password Manager",
      },
    ];

    return (
      <Sider
        ref={ref as RefObject<HTMLDivElement>}
        width={200}
        collapsedWidth={80}
        collapsed={collapsed}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          backgroundColor: SIDEBAR_BG,
          padding: "10px",
          borderRadius: "0 20px 20px 0",
          overflow: "hidden",
          transition: "all 0.2s ease-in-out",
          display: "flex",
          flexDirection: "column",
          caretColor: "transparent",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            cursor: "pointer",
            alignItems: "center",
            // paddingLeft: collapsed ? 0 : 10,
            // backgroundColor:
            //   currentPath === "dashboard" ? ACTIVE_BG_COLOR : "transparent",
            padding: "10px 20px",
            borderRadius: "8px",
            transition: "all 0.3s ease-in-out",
          }}
          onClick={() => router.push(`/${username}/dashboard`)}
        >
          <img
            src="/logoBlue.png"
            alt="Logo"
            style={{
              width: "30px",
              marginLeft: collapsed ? "0px" : "2px",
              // transition: "all 0.3s ease-in-out",
              // paddingLeft: "8px",
            }}
          />
          {!collapsed && (
            <h2
              style={{
                margin: 0,
                color: PRIMARY_COLOR,
                marginTop: 0,
                marginLeft: "10px",
              }}
            >
              DOCKLY
            </h2>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <Menu
            theme="light"
            mode="vertical"
            selectedKeys={[currentPath]}
            onClick={({ key }) => router.push(`/${username}/${key}`)}
            style={{
              backgroundColor: SIDEBAR_BG,
              color: DEFAULT_TEXT_COLOR,
              fontSize: "16px",
              border: "none",
            }}
            items={mainMenuItems.map(({ key, icon, label }) => ({
              key,
              icon,
              label: !collapsed ? label : null,
              style: {
                marginBottom: "10px",
                backgroundColor:
                  currentPath === key ? ACTIVE_BG_COLOR : "transparent",
                color:
                  currentPath === key ? ACTIVE_TEXT_COLOR : DEFAULT_TEXT_COLOR,
                borderRadius: "8px",
                transition: "all 0.3s ease-in-out",
              },
            }))}
          />
        </div>

        <div style={{ marginTop: "20px" }}>
          {!collapsed ? (
            <Space style={{ marginBottom: 10, color: DEFAULT_TEXT_COLOR }}>
              <MaterialIconThemeFolderConnectionOpen />
              <h4 style={{ margin: 0 }}>Connected Services</h4>
            </Space>
          ) : (
            <div
              style={{
                color: DEFAULT_TEXT_COLOR,
                marginBottom: 10,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <MaterialIconThemeFolderConnectionOpen />
            </div>
          )}

          <Menu
            theme="light"
            mode="vertical"
            selectedKeys={[currentPath]}
            onClick={({ key }) => router.push(`/${username}/${key}`)}
            style={{
              backgroundColor: SIDEBAR_BG,
              color: DEFAULT_TEXT_COLOR,
              fontSize: "16px",
              border: "none",
            }}
            items={bottomMenuItems.map(({ key, icon, label }) => ({
              key,
              icon,
              label: !collapsed ? label : null,
              style: {
                marginBottom: "10px",
                backgroundColor:
                  currentPath === key ? ACTIVE_BG_COLOR : "transparent",
                color:
                  currentPath === key ? ACTIVE_TEXT_COLOR : DEFAULT_TEXT_COLOR,
                borderRadius: "8px",
                transition: "all 0.3s ease-in-out",
              },
            }))}
          />
        </div>
      </Sider>
    );
  }
);

Sidebar.displayName = "Sidebar";

export default Sidebar;
