'use client';

import { Layout } from 'antd';
import Sidebar, { useIsHovered } from '../components/sideBar';
import Header from '../components/header';
import Dashboard from '../components/dashboard';

const DashboardPage = () => {
  const [ref, isHovered] = useIsHovered();
  console.log("🚀 ~ DashboardPage ~ isHovered:", isHovered)

  return (
    <Layout>
      <Sidebar ref={ref} isHovered={isHovered} />
      <Layout style={{ marginLeft: isHovered ? 200 : 80 }}>
        <Header />
        <Dashboard />
      </Layout>
    </Layout>
  );
};

export default DashboardPage;
