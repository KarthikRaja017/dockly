"use client";

import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
  RefObject,
} from "react";
import { Avatar, Divider, Layout, Menu, Typography } from "antd";
import { usePathname, useRouter } from "next/navigation";
import {
  ACTIVE_BG_COLOR,
  ACTIVE_TEXT_COLOR,
  DEFAULT_TEXT_COLOR,
  PRIMARY_COLOR,
  SIDEBAR_BG,
} from "../../app/comman";
import {
  // FlatColorIconsCalendar,
  FlatColorIconsHome,
  FluentColorPeopleCommunity48,
  FluentEmojiDollarBanknote,
  FluentEmojiFlatRedHeart,
  FxemojiCloud,
  IconParkFolderLock,
  TwemojiPuzzlePiece,
  RiDashboardFill,
} from "./icons";
import { motion } from "framer-motion";
import { CalendarCheckIcon } from "lucide-react";

const { Text } = Typography;
const { Sider } = Layout;

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

    const menuGroup = (
      title: string,
      items?: { key: string; icon: React.ReactNode; label: string }[]
    ) => (
      <div style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: 500,
            marginLeft: 16,
            color: "#a0a0a0",
            textTransform: "uppercase",
            display: collapsed ? "none" : "block",
          }}
        >
          {title}
        </Text>
        <Menu
          mode="vertical"
          selectedKeys={[currentPath]}
          onClick={({ key }) => router.push(`/${username}/${key}`)}
          style={{
            backgroundColor: "transparent",
            color: DEFAULT_TEXT_COLOR,
            fontSize: "15px",
            border: "none",
            marginTop: 8,
          }}
          items={(items ?? []).map(({ key, icon, label }) => ({
            key,
            icon: <motion.div whileHover={{ scale: 1.1 }}>{icon}</motion.div>,
            label: collapsed ? null : label,
            style: {
              padding: 8,
              backgroundColor:
                currentPath === key ? ACTIVE_BG_COLOR : "transparent",
              color:
                currentPath === key ? ACTIVE_TEXT_COLOR : DEFAULT_TEXT_COLOR,
              borderRadius: 6,
              transition: "all 0.2s ease-in-out",
              marginLeft: 14,
            },
          }))}
        />
      </div>
    );

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

        {menuGroup("Command Center", [
          { key: "dashboard", icon: <RiDashboardFill />, label: "Dashboard" },
          { key: "calendar", icon: <CalendarCheckIcon />, label: "Planner" },
        ])}

        {menuGroup("Hubs", [
          { key: "family-hub", icon: <FluentColorPeopleCommunity48 />, label: "Family" },
          { key: "finance", icon: <FluentEmojiDollarBanknote />, label: "Finance" },
          { key: "home", icon: <FlatColorIconsHome />, label: "Home" },
          { key: "health", icon: <FluentEmojiFlatRedHeart />, label: "Health" },
        ])}

        {menuGroup("Utilities", [
          { key: "notes", icon: <TwemojiPuzzlePiece />, label: "Notes & Lists" },
          { key: "bookmarks", icon: <FxemojiCloud />, label: "Bookmarks" },
          { key: "files", icon: <FxemojiCloud />, label: "Files" },
          { key: "password-manager", icon: <IconParkFolderLock />, label: "Vault" },
        ])}

        {!collapsed && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: "#fff7e6",
              padding: "12px 20px",
              margin: "16px 10px",
              borderRadius: 8,
              color: "#ad4e00",
              fontWeight: 600,
              fontSize: 14,
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            Refer Dockly
          </motion.div>
        )}

        <Divider style={{ margin: "12px 0" }} />
      </Sider>
    );
  }
);

Sidebar.displayName = "Sidebar";

export default Sidebar;

