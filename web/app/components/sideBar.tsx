'use client';

import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
  RefObject,
} from 'react';
import { Layout, Menu, Space } from 'antd';
import {
  CalendarFilled,
  HomeFilled,
  TeamOutlined,
  DollarCircleFilled,
  HeartFilled,
  ProjectFilled,
  CloudFilled,
  LockFilled,
  KeyOutlined,
  ApiFilled,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

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

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return [ref, isHovered] as const;
};

// Sidebar Component
interface SidebarProps {
  isHovered: boolean;
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(({ isHovered }, ref) => {
  const router = useRouter();
  const collapsed = !isHovered;

  const [currentPath, setCurrentPath] = useState<string>('dashboard');

  useEffect(() => {
    // Since useRouter().pathname doesn't exist in 'next/navigation', we can skip this
    // or adapt based on how you manage routes
    const path = window?.location?.pathname.split('/').pop() || 'dashboard';
    setCurrentPath(path);
  }, []);

  const mainMenuItems = [
    { key: 'calendar', icon: <CalendarFilled />, label: 'Calendar' },
    { key: 'home', icon: <HomeFilled />, label: 'Home' },
    { key: 'family-hub', icon: <TeamOutlined />, label: 'Family Hub' },
    { key: 'finance', icon: <DollarCircleFilled />, label: 'Finance' },
    { key: 'health', icon: <HeartFilled />, label: 'Health' },
    { key: 'projects', icon: <ProjectFilled />, label: 'Projects' },
  ];

  const bottomMenuItems = [
    { key: 'accounts', icon: <KeyOutlined />, label: 'Accounts (34)' },
    { key: 'cloud-storage', icon: <CloudFilled />, label: 'Cloud Storage (3)' },
    { key: 'password-manager', icon: <LockFilled />, label: 'Password Manager' },
  ];

  return (
    <Sider
      ref={ref as RefObject<HTMLDivElement>}
      width={200}
      collapsedWidth={80}
      collapsed={collapsed}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        backgroundColor: '#007B8F',
        padding: '10px',
        borderRadius: '0 20px 20px 0',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      }}
    >
      <div style={{ marginBottom: '20px', display: 'flex', cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
        <img
          src="/logoWhite.png"
          alt="Logo"
          style={{
            width: '80px',
            transition: 'width 0.3s ease-in-out',
            marginLeft: '-10px',
          }}
        />
        {!collapsed && (
          <h2
            style={{
              margin: 0,
              color: 'white',
              marginTop: 10,
              marginLeft: '-10px',
            }}
          >
            DOCKLY
          </h2>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div>
          <Menu
            theme="dark"
            mode="vertical"
            selectedKeys={[currentPath]}
            onClick={({ key }) => router.push(`/${key}`)}
            style={{
              backgroundColor: '#007B8F',
              color: 'white',
              fontSize: '16px',
              border: 'none',
            }}
            items={mainMenuItems.map(({ key, icon, label }) => ({
              key,
              icon,
              label: !collapsed ? label : null,
              style: {
                marginBottom: '10px',
                backgroundColor: currentPath === key ? 'white' : 'transparent',
                color: currentPath === key ? '#007B8F' : 'white',
              },
            }))}
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          {!collapsed ? (
            <Space style={{ marginBottom: 10, display: 'flex', color: 'white' }}>
              <ApiFilled style={{ fontSize: '30px', color: 'white' }} />
              <h4 style={{ color: 'white', margin: 0, marginBottom: 10 }}>
                Connected Services
              </h4>
            </Space>
          ) : (
            <div
              style={{
                color: 'white',
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <ApiFilled style={{ fontSize: '30px' }} />
            </div>
          )}

          <Menu
            theme="dark"
            mode="vertical"
            selectedKeys={[currentPath]}
            onClick={({ key }) => router.push(`/${key}`)}
            style={{
              backgroundColor: '#007B8F',
              color: 'white',
              fontSize: '16px',
              border: 'none',
            }}
            items={bottomMenuItems.map(({ key, icon, label }) => ({
              key,
              icon,
              label: !collapsed ? label : null,
              style: {
                marginBottom: '10px',
                backgroundColor: currentPath === key ? 'white' : 'transparent',
                color: currentPath === key ? '#007B8F' : 'white',
              },
            }))}
          />
        </div>
      </div>
    </Sider>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
