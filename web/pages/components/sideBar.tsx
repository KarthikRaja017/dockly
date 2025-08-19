"use client";

import React, { forwardRef, useEffect, useRef, useState, RefObject } from "react";
import { Avatar, Divider, Layout, Menu, Tooltip, Typography } from "antd";
import { usePathname, useRouter } from "next/navigation";
import {
  AppstoreOutlined,
  CalendarOutlined,
  TeamOutlined,
  DollarOutlined,
  HomeOutlined,
  HeartOutlined,
  FileTextOutlined,
  BookOutlined,
  FolderOpenOutlined,
  LockOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useCurrentUser } from "../../app/userContext";
import { getUserHubs } from "../../services/dashboard";
import { useGlobalLoading } from "../../app/loadingContext";
import DocklyLoader from "../../utils/docklyLoader";
import { PRIMARY_COLOR } from "../../app/comman";

const { Text } = Typography;
const { Sider } = Layout;

const Sidebar = forwardRef<HTMLDivElement, { collapsed: boolean }>(({ collapsed }, ref) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useCurrentUser();
  const username = currentUser?.user_name || "";
  const [currentPath, setCurrentPath] = useState("dashboard");
  const [hubs, setHubs] = useState([]);
  const [utilities, setUtilities] = useState([]);
  const { loading, setLoading } = useGlobalLoading();

  useEffect(() => {
    const pathSegments = pathname?.split("/") || [];
    const active = pathSegments[2] || "dashboard";
    setCurrentPath(active);
  }, [pathname]);

  const menuGroup = (
    title: string,
    items?: { key: string; icon: React.ReactNode; label: string }[]
  ) => (
    <div style={{ marginBottom: 14 }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: 600,
          marginLeft: 16,
          color: "#999",
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
          border: "none",
          fontSize: 13,
          paddingLeft: 4,
        }}
        items={(items ?? []).map(({ key, icon, label }) => ({
          key,
          icon: <motion.div whileHover={{ scale: 1.05 }}>{icon}</motion.div>,
          label: collapsed ? (
            <Tooltip title={label} placement="right">
              <span style={{ fontSize: 12 }}>{label}</span>
            </Tooltip>
          ) : (
            <span style={{ fontSize: 13 }}>{label}</span>
          ),
          style: {
            padding: "6px 10px",
            backgroundColor: currentPath === key ? "#e8f4ff" : "transparent",
            color: currentPath === key ? "#1677ff" : "#555",
            borderRadius: 6,
            marginLeft: 10,
            marginRight: 10,
          },
        }))}
      />
    </div>
  );

  const getUserMenus = async () => {
    setLoading(true);
    const response = await getUserHubs({});
    const { status, payload } = response.data;
    if (status) {
      setHubs(payload.hubs);
      setUtilities(payload.utilities);
    }
    setLoading(false);
  };

  // useEffect(() => {
  //   getUserMenus();
  // }, []);

  // if (loading) return <DocklyLoader />;

  return (
    <>
      <style jsx>{`
        @keyframes logo-collapsed {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .logo-collapsed {
          animation: logo-collapsed 8s linear infinite;
          transform-origin: center;
        }
      `}</style>
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
          backgroundColor: "#f9fafa",
          padding: "6px 0",
          borderRight: "1px solid #f0f0f0",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
          }}
          onClick={() => router.push(`/${username}/dashboard`)}
        >
          {/* <img
            src={collapsed ? "/dockly-logo.png" : "/dockly-logo-full.png"}
            alt="Dockly Logo"
            className={collapsed ? "logo-collapsed" : "logo"}
            style={{
              width: collapsed ? 148 : 160,
              transition: "all 0.3s ease-in-out",
              marginLeft: collapsed ? -38 : 0,
            }}
          /> */}
          {/* <img
            src={"/dockly-logo.png"}
            alt="Dockly Logo"
            // className={"logo-collapsed"}
            style={{
              width: 58,
              transition: "all 0.3s ease-in-out",
              marginLeft: collapsed ? "-8px" : "-50px",
            }}
            draggable="false"
          /> */}
          <div style={{ marginLeft: collapsed ? "-8px" : "-50px", marginTop: 15 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40px" height="40px" viewBox="0 0 128 128" aria-hidden="true">
              <g fill="#6366F1">
                <rect x="34" y="28" width="60" height="16" rx="8" />
                <rect x="26" y="56" width="76" height="16" rx="8" />
                <rect x="18" y="84" width="92" height="16" rx="8" />
              </g>
            </svg>
          </div>
          {!collapsed && (
            <Text
              style={{
                color: PRIMARY_COLOR,
                // marginLeft: '-50px',
                marginTop: 20,
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}
            >
              DOCKLY
            </Text>
          )}
        </div>

        {menuGroup("Command Center", [
          {
            key: "dashboard",
            icon: <AppstoreOutlined style={{ color: "#1677ff" }} />,
            label: "Dashboard",
          },
          {
            key: "planner",
            icon: <CalendarOutlined style={{ color: "#9254de" }} />,
            label: "Planner",
          },
        ])}

        {menuGroup("Hubs", [
          {
            key: "family-hub",
            icon: <TeamOutlined style={{ color: "#eb2f96" }} />,
            label: "Family",
          },
          {
            key: "finance-hub",
            icon: <DollarOutlined style={{ color: "#13c2c2" }} />,
            label: "Finance",
          },
          {
            key: "home-hub",
            icon: <HomeOutlined style={{ color: "#fa8c16" }} />,
            label: "Home",
          },
          {
            key: "health-hub",
            icon: <HeartOutlined style={{ color: "#f5222d" }} />,
            label: "Health",
          },
        ])}

        {menuGroup("Utilities", [
          {
            key: "notes",
            icon: <FileTextOutlined style={{ color: "#722ed1" }} />,
            label: "Notes & Lists",
          },
          {
            key: "bookmarks",
            icon: <BookOutlined style={{ color: "#faad14" }} />,
            label: "Bookmarks",
          },
          {
            key: "files",
            icon: <FolderOpenOutlined style={{ color: "#52c41a" }} />,
            label: "Files",
          },
          {
            key: "vault",
            icon: <LockOutlined style={{ color: "#595959" }} />,
            label: "Vault",
          },
        ])}

        {collapsed ? <GiftOutlined style={{ color: "#ad4e00", marginLeft: 25, marginTop: 25 }} /> : (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: "#fff7e6",
              padding: "10px 14px",
              margin: "16px",
              borderRadius: 8,
              color: "#ad4e00",
              fontWeight: 600,
              fontSize: 13,
              textAlign: "center",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <GiftOutlined />
            Refer Dockly
          </motion.div>
        )}

        {/* <Divider style={{ margin: "10px 0" }} /> */}


      </Sider>
    </>
  );
});

Sidebar.displayName = "Sidebar";
export default Sidebar;
