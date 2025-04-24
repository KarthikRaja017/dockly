import { Menu, Layout } from 'antd';
import {
  AppstoreOutlined,
  CalendarOutlined,
  HomeOutlined,
  TeamOutlined,
  DollarOutlined,
  HeartOutlined,
  ProjectOutlined,
  KeyOutlined,
  CloudOutlined,
  LockOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = () => (
  <Sider width={220} style={{ background: '#fff', height: '100vh', position: 'fixed' }}>
    <div className="logo" style={{ fontSize: 24, fontWeight: 'bold', padding: 16, color: '#1A73E8' }}>
      Dockly
    </div>
    <Menu mode="inline" defaultSelectedKeys={['dock']}>
      <Menu.Item key="dock" icon={<AppstoreOutlined />}>Dock</Menu.Item>
      <Menu.Item key="boards" icon={<CalendarOutlined />}>Boards</Menu.Item>
      <Menu.Item key="calendar" icon={<CalendarOutlined />}>Calendar</Menu.Item>

      <Menu.Divider />
      <Menu.Item key="home" icon={<HomeOutlined />}>Home Management</Menu.Item>
      <Menu.Item key="family" icon={<TeamOutlined />}>Family Hub</Menu.Item>
      <Menu.Item key="finance" icon={<DollarOutlined />}>Finance</Menu.Item>
      <Menu.Item key="health" icon={<HeartOutlined />}>Health</Menu.Item>
      <Menu.Item key="projects" icon={<ProjectOutlined />}>Projects</Menu.Item>

      <Menu.Divider />
      <Menu.Item key="accounts" icon={<KeyOutlined />}>Accounts (34)</Menu.Item>
      <Menu.Item key="cloud" icon={<CloudOutlined />}>Cloud Storage (3)</Menu.Item>
      <Menu.Item key="password" icon={<LockOutlined />}>Password Manager</Menu.Item>
    </Menu>
  </Sider>
);

export default Sidebar;
