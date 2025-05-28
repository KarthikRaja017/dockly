'use client';
import React from 'react';
import { Card, Button, Tag, Space, Typography, Table, Progress, Select, Switch } from 'antd';
import { CloudOutlined, MoreOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const FilesStorage: React.FC = () => {
  const columns = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text: string, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={record.icon} alt="file" style={{ width: '24px', marginRight: '8px' }} />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary">{record.path}</Text>
          </div>
        </div>
      ),
    },
    { title: 'Storage', dataIndex: 'storage', key: 'storage' },
    { title: 'Size', dataIndex: 'size', key: 'size' },
    { title: 'Modified', dataIndex: 'modified', key: 'modified' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => <Tag color="green">{text}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="link">Open</Button>
          <Button type="link" icon={<MoreOutlined />} />
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      fileName: 'Q2 Financial Report.docx',
      path: 'Documents/Finance',
      storage: 'OneDrive',
      size: '2.4 MB',
      modified: 'Today, 9:45 AM',
      status: 'Synced',
      icon: 'path/to/doc-icon.png',
    },
    {
      key: '2',
      fileName: 'Budget 2025.xlsx',
      path: 'Finance/Planning',
      storage: 'Google Drive',
      size: '1.8 MB',
      modified: 'Today, 10:12 AM',
      status: 'Synced',
      icon: 'path/to/xls-icon.png',
    },
    {
      key: '3',
      fileName: 'Home Insurance Policy.pdf',
      path: 'Documents/Insurance',
      storage: 'Dropbox',
      size: '4.2 MB',
      modified: 'Yesterday, 3:22 PM',
      status: 'Synced',
      icon: 'path/to/pdf-icon.png',
    },
    {
      key: '4',
      fileName: 'Family Vacation Photos.zip',
      path: 'Photos/2025/Spring',
      storage: 'Google Drive',
      size: '256 MB',
      modified: 'Yesterday, 8:45 PM',
      status: 'Synced',
      icon: 'path/to/zip-icon.png',
    },
    {
      key: '5',
      fileName: 'Project Timeline.pptx',
      path: 'Work/Projects/Q2',
      storage: 'OneDrive',
      size: '3.7 MB',
      modified: 'May 26, 2025',
      status: 'Synced',
      icon: 'path/to/pptx-icon.png',
    },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Main Content */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <CloudOutlined style={{ fontSize: '24px', marginRight: '10px', color: '#1890ff' }} />
          <Title level={3} style={{ margin: 0, color: '#1f1f1f' }}>Connected Cloud Storage</Title>
        </div>
        <Text style={{ color: '#595959' }}>Manage your cloud storage accounts and connect new ones</Text>

        {/* Storage Summary */}
        <div style={{ margin: '20px 0' }}>
          <Card style={{ marginBottom: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={5} style={{ color: '#1f1f1f' }}>Total Storage</Title>
                <Text strong style={{ color: '#1f1f1f' }}>7.8 TB</Text>
              </div>
              <Progress type="circle" percent={41} width={60} strokeColor="#1890ff" />
            </div>
            <Text style={{ color: '#595959' }}>Used: 3.2 TB (41%)</Text>
          </Card>
          <Card style={{ marginBottom: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Title level={5} style={{ color: '#1f1f1f' }}>Connected Accounts (3)</Title>
            <Space style={{ margin: '10px 0' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#1890ff' }} />
              <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fa8c16' }} />
              <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fadb14' }} />
            </Space>
            <Text style={{ color: '#595959' }}>Last sync: Today, 10:23 AM</Text>
          </Card>
          <Card style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Title level={5} style={{ color: '#1f1f1f' }}>Files Synced (4,328)</Title>
          </Card>
        </div>

        {/* Connected Storage Services */}
        <div style={{ margin: '20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ color: '#1f1f1f' }}>Connected Storage Services</Title>
            <Button type="primary" style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}>Connect New</Button>
          </div>
          {[
            { name: 'Google Drive', email: '[email protected]', total: '15 GB', used: '75%', files: 2458, folders: 146, shared: 63, icon: 'path/to/gdrive-icon.png' },
            { name: 'OneDrive', email: '[email protected]', total: '1 TB', used: '35%', files: 1287, folders: 93, shared: 27, icon: 'path/to/onedrive-icon.png' },
            { name: 'Dropbox', email: '[email protected]', total: '2 TB', used: '10%', files: 583, folders: 42, shared: 15, icon: 'path/to/dropbox-icon.png' },
          ].map((service) => (
            <Card key={service.name} style={{ marginBottom: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={service.icon} alt={service.name} style={{ width: '40px', marginRight: '10px' }} />
                  <div>
                    <Title level={5} style={{ margin: 0, color: '#1f1f1f' }}>{service.name}</Title>
                    <Text style={{ color: '#595959' }}>{service.email}</Text>
                  </div>
                </div>
                <Space>
                  <Tag color="green">Active</Tag>
                  <Button type="link" icon={<MoreOutlined />} />
                </Space>
              </div>
              <div style={{ margin: '10px 0' }}>
                <Text style={{ color: '#595959' }}>{`${service.total} Total, ${service.used} Used`}</Text>
                <Progress percent={parseInt(service.used)} style={{ margin: '10px 0' }} strokeColor="#1890ff" />
              </div>
              <Space style={{ marginBottom: '10px' }}>
                <Text style={{ color: '#595959' }}>Files: {service.files}</Text>
                <Text style={{ color: '#595959' }}>Folders: {service.folders}</Text>
                <Text style={{ color: '#595959' }}>Shared: {service.shared}</Text>
              </Space>
              <Button type="primary" style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}>View Files</Button>
            </Card>
          ))}
        </div>

        {/* Recently Synced Files */}
        <div style={{ margin: '20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ color: '#1f1f1f' }}>Recently Synced Files</Title>
            <Button type="link" style={{ color: '#1890ff' }}>View All</Button>
          </div>
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            style={{ border: '1px solid #e8e8e8', borderRadius: '8px' }}
            rowClassName={() => 'ant-table-row-hover'}
          />
        </div>

        {/* Storage Usage by Type */}
        <div style={{ margin: '20px 0' }}>
          <Title level={4} style={{ color: '#1f1f1f' }}>Storage Usage by Type</Title>
          <Select defaultValue="All Drives" style={{ width: 200, marginBottom: '10px' }}>
            <Option value="All Drives">All Drives</Option>
            <Option value="Google Drive">Google Drive</Option>
            <Option value="OneDrive">OneDrive</Option>
            <Option value="Dropbox">Dropbox</Option>
          </Select>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Card style={{ flex: 1, borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <Title level={5} style={{ color: '#1f1f1f' }}>Usage by File Type</Title>
              <Text strong style={{ color: '#1f1f1f' }}>3.2 TB Used</Text>
              <div style={{ margin: '20px 0' }}>
                {/* Pie chart placeholder - replace with a chart component */}
              </div>
              {[
                { type: 'Documents', percent: 25, size: '800 GB', color: '#1890ff' },
                { type: 'Photos', percent: 10, size: '320 GB', color: '#69c0ff' },
                { type: 'Videos', percent: 15, size: '480 GB', color: '#52c41a' },
                { type: 'Audio', percent: 8, size: '256 GB', color: '#fadb14' },
                { type: 'Archives', percent: 5, size: '160 GB', color: '#722ed1' },
                { type: 'Other', percent: 12, size: '384 GB', color: '#d9d9d9' },
              ].map((item) => (
                <div key={item.type} style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: item.color, marginRight: '8px' }} />
                  <Text style={{ color: '#595959', flex: 1 }}>{item.type}</Text>
                  <Text style={{ color: '#595959' }}>{`${item.percent}% - ${item.size}`}</Text>
                </div>
              ))}
            </Card>
            <Card style={{ flex: 1, borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <Title level={5} style={{ color: '#1f1f1f' }}>Storage Growth</Title>
              <div style={{ margin: '20px 0' }}>
                {/* Bar chart placeholder - replace with a chart component */}
              </div>
            </Card>
          </div>
        </div>

        {/* Connect New Storage Service */}
        <div style={{ margin: '20px 0' }}>
          <Title level={4} style={{ color: '#1f1f1f' }}>Connect a New Storage Service</Title>
          <Space>
            {['Box', 'iCloud', 'Amazon S3'].map((service) => (
              <Button
                key={service}
                style={{
                  border: '1px dashed #d9d9d9',
                  borderRadius: '4px',
                  color: '#595959',
                  backgroundColor: 'transparent',
                }}
              >
                {service}
              </Button>
            ))}
            <Button type="link" style={{ color: '#1890ff' }}>More Options</Button>
          </Space>
        </div>

        {/* Security & Backup */}
        <div style={{ margin: '20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ color: '#1f1f1f' }}>Security & Backup</Title>
            <Button type="link" style={{ color: '#1890ff' }}>Advanced Settings</Button>
          </div>
          <Text style={{ color: '#595959' }}>Manage encryption, backup settings, and permissions</Text>
          {[
            { title: 'End-to-end Encryption', desc: 'Protect your files with additional encryption' },
            { title: 'Auto Backup', desc: 'Automatically backup files between services' },
            { title: 'Ransomware Protection', desc: 'Detect and block suspicious file changes' },
            { title: 'Family Sharing', desc: 'Share storage access with family members' },
          ].map((item) => (
            <Card key={item.title} style={{ marginBottom: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Title level={5} style={{ margin: 0, color: '#1f1f1f' }}>{item.title}</Title>
                  <Text style={{ color: '#595959' }}>{item.desc}</Text>
                </div>
                <Switch defaultChecked={false} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilesStorage;