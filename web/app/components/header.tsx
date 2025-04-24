import { Layout, Input, Avatar } from 'antd';

const { Header } = Layout;

const HeaderBar = () => (
  <Header style={{ background: '#fff', padding: '0 24px', marginLeft: 220, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Input.Search placeholder="Search accounts, files, notes..." style={{ maxWidth: 400 }} />
    <Avatar style={{ backgroundColor: '#1A73E8' }}>JS</Avatar>
  </Header>
);

export default HeaderBar;