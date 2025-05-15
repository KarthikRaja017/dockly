
'use client';

import React, { useState } from 'react';
import { Button, Steps, Card, Checkbox, Select, Input, Tag, Space, Typography, Divider } from 'antd';
import { CheckCircleOutlined, CloudOutlined, TeamOutlined, EditOutlined } from '@ant-design/icons';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface StepConfig {
  title: string;
  content: React.ReactNode;
}

const DocklyWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([
    'Chase Bank', 'Gmail', 'Amazon', 'Netflix', 'Spotify', 'Instagram', 'LinkedIn', 'Dropbox'
  ]);
  const [currentAccountIndex, setCurrentAccountIndex] = useState<number>(0);

  const steps: StepConfig[] = [
    {
      title: 'Start',
      content: (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <Title level={2} style={{ marginBottom: '20px' }}>Welcome to Dockly</Title>
          <Text style={{ fontSize: '16px', color: '#666' }}>
            Dockly helps you centralize access to all your accounts and documents in one secure place.
          </Text>
          <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <Select defaultValue="Quick Setup" style={{ width: 200, borderRadius: '8px' }}>
              <Option value="Quick Setup">Quick Setup</Option>
              <Option value="Manual Setup">Manual Setup</Option>
              <Option value="Import Data">Import Data</Option>
              <Option value="From Template">From Template</Option>
            </Select>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
            {['Quick Setup', 'Manual Setup', 'Import Data', 'From Template'].map((option, index) => (
              <Card
                key={option}
                hoverable
                style={{
                  width: '200px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  padding: '20px',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '28px', marginRight: '20px' }}>{['⚡', '📝', '📱', '📚'][index]}</span>
                  <div>
                    <Title level={5} style={{ margin: 0 }}>{option}</Title>
                    <Text style={{ color: '#888' }}>
                      {['Automated account discovery', 'Add accounts manually', 'Import from CSV', 'Use pre-made templates'][index]}
                    </Text>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Divider style={{ margin: '30px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '28px', marginRight: '20px' }}>🔒</span>
            <Text style={{ fontSize: '14px', color: '#666' }}>
              Your data is secure. Dockly uses bank-level encryption and never stores your passwords.
            </Text>
          </div>
          <Button
            type="primary"
            size="large"
            style={{ padding: '10px 40px', borderRadius: '8px' }}
            onClick={() => setCurrentStep(1)}
          >
            Continue
          </Button>
        </div>
      ),
    },
    {
      title: 'Discovery',
      content: (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <Title level={2} style={{ marginBottom: '20px' }}>Discovering your accounts</Title>
          <Text style={{ fontSize: '16px', color: '#666' }}>
            Select which sources Dockly should use to find your accounts.
          </Text>
          <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <Select defaultValue="All Sources" style={{ width: 200, borderRadius: '8px' }}>
              <Option value="All Sources">All Sources</Option>
              <Option value="Browser History">Browser History</Option>
              <Option value="Password Manager">Password Manager</Option>
              <Option value="Email Scan">Email Scan</Option>
              <Option value="Mobile Apps">Mobile Apps</Option>
            </Select>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
            {['Browser History', 'Password Manager', 'Email Scan', 'Mobile Apps'].map((source, index) => (
              <div key={source} style={{ width: '200px', textAlign: 'left', padding: '10px' }}>
                <Checkbox style={{ fontSize: '16px' }}>
                  <span style={{ marginRight: '12px', fontSize: '20px' }}>{['🌐', '🔑', '📧', '📱'][index]}</span>
                  {source}
                  <Text type="secondary" style={{ display: 'block', marginLeft: '32px', color: '#888' }}>
                    {['Sites you visit', 'Saved passwords', 'Email receipts', 'Apps on your phone'][index]}
                  </Text>
                </Checkbox>
              </div>
            ))}
          </div>
          <Divider style={{ margin: '30px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '28px', marginRight: '20px' }}>ℹ</span>
            <Text style={{ fontSize: '14px', color: '#666' }}>
              How it works: Dockly scans for domains you regularly visit to suggest accounts but never accesses your actual browsing history or content.
            </Text>
          </div>
          <Space style={{ marginTop: '20px' }}>
            <Button
              style={{ padding: '8px 30px', borderRadius: '8px' }}
              onClick={() => setCurrentStep(0)}
            >
              Back
            </Button>
            <Button
              type="primary"
              style={{ padding: '8px 30px', borderRadius: '8px' }}
              onClick={() => setCurrentStep(2)}
            >
              Continue
            </Button>
          </Space>
        </div>
      ),
    },
    {
      title: 'Manager',
      content: (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <Title level={2} style={{ marginBottom: '20px' }}>Connect your password manager</Title>
          <Text style={{ fontSize: '16px', color: '#666' }}>
            Dockly works with your existing password manager for secure login to your accounts.
          </Text>
          <div style={{ marginTop: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
              {['1Password', 'Google Password', 'Keeper'].map((manager) => (
                <Card
                  key={manager}
                  hoverable
                  style={{
                    width: '160px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    padding: '15px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '28px', marginRight: '12px' }}>{manager[0]}</span>
                    <div>
                      <Title level={5} style={{ margin: 0 }}>{manager}</Title>
                      <Text style={{ color: '#888' }}>
                        {manager.includes('Google') || manager.includes('Edge') ? 'Built-in' : 'Browser extension'}
                      </Text>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
              {['LastPass', 'Bitwarden', 'Edge Passwords'].map((manager) => (
                <Card
                  key={manager}
                  hoverable
                  style={{
                    width: '160px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    padding: '15px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '28px', marginRight: '12px' }}>{manager[0]}</span>
                    <div>
                      <Title level={5} style={{ margin: 0 }}>{manager}</Title>
                      <Text style={{ color: '#888' }}>
                        {manager.includes('Google') || manager.includes('Edge') ? 'Built-in' : 'Browser extension'}
                      </Text>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <Divider style={{ margin: '30px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '28px', marginRight: '20px' }}>🔒</span>
            <Text style={{ fontSize: '14px', color: '#666' }}>
              Zero-knowledge design: Dockly never stores or handles your actual passwords, it simply connects to your existing password manager.
            </Text>
          </div>
          <Space style={{ marginTop: '20px' }}>
            <Button
              style={{ padding: '8px 30px', borderRadius: '8px' }}
              onClick={() => setCurrentStep(1)}
            >
              Back
            </Button>
            <Button
              type="primary"
              style={{ padding: '8px 30px', borderRadius: '8px' }}
              onClick={() => setCurrentStep(3)}
            >
              Continue
            </Button>
          </Space>
        </div>
      ),
    },
    {
      title: 'Selection',
      content: (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <Title level={2} style={{ marginBottom: '20px' }}>We found 47 potential accounts</Title>
          <Text style={{ fontSize: '16px', color: '#666' }}>
            Select the accounts you'd like to add to Dockly. These were detected based on your browser history.
          </Text>
          <Divider style={{ margin: '30px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '28px', marginRight: '20px' }}>🔒</span>
            <Text style={{ fontSize: '14px', color: '#666' }}>
              Your privacy is protected. Dockly never stores your passwords - connections are managed securely through your password manager.
            </Text>
          </div>
          <Title level={4} style={{ marginTop: '20px', marginBottom: '15px' }}>Frequently Visited (15)</Title>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
              {['Chase Bank', 'Gmail', 'Amazon'].map((account) => (
                <div key={account} style={{ width: '200px', textAlign: 'left', padding: '10px' }}>
                  <Checkbox
                    checked={selectedAccounts.includes(account)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAccounts([...selectedAccounts, account]);
                      } else {
                        setSelectedAccounts(selectedAccounts.filter((a) => a !== account));
                      }
                    }}
                  >
                    <span style={{ marginRight: '12px', fontSize: '20px' }}>{account[0]}</span>
                    {account}
                  </Checkbox>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
              {['Netflix', 'Spotify', 'Instagram'].map((account) => (
                <div key={account} style={{ width: '200px', textAlign: 'left', padding: '10px' }}>
                  <Checkbox
                    checked={selectedAccounts.includes(account)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAccounts([...selectedAccounts, account]);
                      } else {
                        setSelectedAccounts(selectedAccounts.filter((a) => a !== account));
                      }
                    }}
                  >
                    <span style={{ marginRight: '12px', fontSize: '20px' }}>{account[0]}</span>
                    {account}
                  </Checkbox>
                </div>
              ))}
            </div>
          </div>
          <Title level={4} style={{ marginTop: '20px', marginBottom: '15px' }}>Additional Sites (32)</Title>
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
              {['State Farm', 'Ameren', 'Water Utility'].map((account) => (
                <div key={account} style={{ width: '200px', textAlign: 'left', padding: '10px' }}>
                  <Checkbox
                    checked={selectedAccounts.includes(account)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAccounts([...selectedAccounts, account]);
                      } else {
                        setSelectedAccounts(selectedAccounts.filter((a) => a !== account));
                      }
                    }}
                  >
                    <span style={{ marginRight: '12px', fontSize: '20px' }}>{account[0]}</span>
                    {account}
                  </Checkbox>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
              {['Xfinity', 'Santander', 'Waste Mgmt'].map((account) => (
                <div key={account} style={{ width: '200px', textAlign: 'left', padding: '10px' }}>
                  <Checkbox
                    checked={selectedAccounts.includes(account)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAccounts([...selectedAccounts, account]);
                      } else {
                        setSelectedAccounts(selectedAccounts.filter((a) => a !== account));
                      }
                    }}
                  >
                    <span style={{ marginRight: '12px', fontSize: '20px' }}>{account[0]}</span>
                    {account}
                  </Checkbox>
                </div>
              ))}
            </div>
          </div>
          <Space style={{ marginTop: '30px', justifyContent: 'center', width: '100%' }}>
            <Button
              style={{ padding: '8px 20px', borderRadius: '8px' }}
              onClick={() => setSelectedAccounts(['Chase Bank', 'Gmail', 'Amazon', 'Netflix', 'Spotify', 'Instagram', 'LinkedIn', 'Dropbox'])}
            >
              Select All
            </Button>
            <Button
              style={{ padding: '8px 20px', borderRadius: '8px' }}
              onClick={() => setSelectedAccounts([])}
            >
              Select None
            </Button>
            <Select defaultValue="Filter" style={{ width: 120, borderRadius: '8px' }}>
              <Option value="Filter">Filter</Option>
            </Select>
          </Space>
          <Space style={{ marginTop: '20px' }}>
            <Button
              style={{ padding: '8px 30px', borderRadius: '8px' }}
              onClick={() => setCurrentStep(2)}
            >
              Back
            </Button>
            <Button
              type="primary"
              style={{ padding: '8px 30px', borderRadius: '8px' }}
              onClick={() => setCurrentStep(4)}
              disabled={selectedAccounts.length === 0}
            >
              Add Selected ({selectedAccounts.length})
            </Button>
          </Space>
        </div>
      ),
    },
    {
      title: 'Details',
      content: (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <Title level={2} style={{ marginBottom: '20px' }}>
            Organizing your accounts ({currentAccountIndex + 1}/{selectedAccounts.length})
          </Title>
          <Text style={{ fontSize: '16px', color: '#666' }}>
            Let's categorize your accounts to keep your dashboard organized.
          </Text>
          <Card
            style={{
              marginTop: '30px',
              textAlign: 'left',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '28px', marginRight: '20px' }}>{selectedAccounts[currentAccountIndex][0]}</span>
              <Title level={4} style={{ margin: 0 }}>{selectedAccounts[currentAccountIndex]}</Title>
            </div>
            <Divider style={{ margin: '20px 0' }} />
            <Text style={{ fontSize: '16px' }}>Category</Text>
            <Select defaultValue="Financial" style={{ width: '100%', marginTop: '10px', borderRadius: '8px' }}>
              {['Financial', 'Shopping', 'Entertainment', 'Social', 'Work', 'Travel', 'Utilities', 'Custom'].map((category) => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
            <Text style={{ marginTop: '20px', display: 'block', fontSize: '16px' }}>Tags (optional)</Text>
            <Space style={{ marginTop: '10px' }}>
              <Tag closable style={{ padding: '5px 10px', borderRadius: '6px' }}>banking</Tag>
              <Tag closable style={{ padding: '5px 10px', borderRadius: '6px' }}>personal</Tag>
            </Space>
            <Text style={{ marginTop: '20px', display: 'block', fontSize: '16px' }}>Notes (optional)</Text>
            <TextArea
              defaultValue="Primary checking and savings accounts"
              rows={4}
              style={{ marginTop: '10px', borderRadius: '8px' }}
            />
            <Text style={{ marginTop: '20px', display: 'block', fontSize: '16px' }}>Board Assignment</Text>
            <Select
              mode="multiple"
              defaultValue={['Home', 'Finance']}
              style={{ width: '100%', marginTop: '10px', borderRadius: '8px' }}
            >
              {['Home', 'Finance', 'Family Hub'].map((board) => (
                <Option key={board} value={board}>{board}</Option>
              ))}
            </Select>
          </Card>
          <Space style={{ marginTop: '30px' }}>
            <Button
              style={{ padding: '8px 30px', borderRadius: '8px' }}
              onClick={() => setCurrentStep(3)}
            >
              Back
            </Button>
            <Button
              style={{ padding: '8px 30px', borderRadius: '8px' }}
              onClick={() => {
                if (currentAccountIndex < selectedAccounts.length - 1) {
                  setCurrentAccountIndex(currentAccountIndex + 1);
                } else {
                  setCurrentStep(5);
                  setCurrentAccountIndex(0);
                }
              }}
            >
              Skip
            </Button>
            <Button
              type="primary"
              style={{ padding: '8px 30px', borderRadius: '8px' }}
              onClick={() => {
                if (currentAccountIndex < selectedAccounts.length - 1) {
                  setCurrentAccountIndex(currentAccountIndex + 1);
                } else {
                  setCurrentStep(5);
                  setCurrentAccountIndex(0);
                }
              }}
            >
              Save & Next
            </Button>
          </Space>
        </div>
      ),
    },
    {
      title: 'Verification',
      content: (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <Title level={2} style={{ marginBottom: '20px' }}>Testing connections</Title>
          <Text style={{ fontSize: '16px', color: '#666' }}>
            Let's make sure Dockly can help you log in seamlessly.
          </Text>
          <Card
            style={{
              marginTop: '30px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '28px', marginRight: '20px' }}>🔐</span>
              <Title level={4} style={{ margin: 0 }}>
                Test account access with {selectedAccounts[currentAccountIndex]}
              </Title>
            </div>
            <Text style={{ display: 'block', marginBottom: '20px', color: '#666' }}>
              This helps ensure smooth connections when using Dockly.
            </Text>
            <Divider style={{ margin: '20px 0' }} />
            <Space direction="vertical" style={{ width: '100%', textAlign: 'left' }}>
              <Text style={{ fontSize: '14px', color: '#666' }}>
                <strong>1</strong> We'll open {selectedAccounts[currentAccountIndex]} in a new tab
              </Text>
              <Text style={{ fontSize: '14px', color: '#666' }}>
                <strong>2</strong> Your password manager will offer to fill credentials
              </Text>
              <Text style={{ fontSize: '14px', color: '#666' }}>
                <strong>3</strong> Return here after successful login
              </Text>
            </Space>
            <Button
              type="primary"
              style={{ marginTop: '20px', padding: '8px 30px', borderRadius: '8px' }}
              onClick={() => {
                const account = selectedAccounts[currentAccountIndex].toLowerCase().replace(' ', '');
                window.open(`https://${account}.com`, '_blank');
              }}
            >
              Test Connection
            </Button>
          </Card>
          <Space style={{ marginTop: '30px' }}>
            <Button
              style={{ padding: '8px 30px', borderRadius: '8px' }}
              onClick={() => setCurrentStep(4)}
            >
              Back
            </Button>
            <Button
              style={{ padding: '8px 30px', borderRadius: '8px' }}
              onClick={() => {
                if (currentAccountIndex < selectedAccounts.length - 1) {
                  setCurrentAccountIndex(currentAccountIndex + 1);
                } else {
                  setCurrentStep(6);
                  setCurrentAccountIndex(0);
                }
              }}
            >
              Skip Test
            </Button>
            <Button
              type="primary"
              style={{ padding: '8px 30px', borderRadius: '8px' }}
              onClick={() => {
                if (currentAccountIndex < selectedAccounts.length - 1) {
                  setCurrentAccountIndex(currentAccountIndex + 1);
                } else {
                  setCurrentStep(6);
                  setCurrentAccountIndex(0);
                }
              }}
            >
              Next Account
            </Button>
          </Space>
        </div>
      ),
    },
    {
      title: 'Complete',
      content: (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <CheckCircleOutlined style={{ fontSize: '60px', color: '#52c41a', marginBottom: '20px' }} />
          <Title level={2} style={{ marginBottom: '20px' }}>Accounts successfully connected!</Title>
          <Text style={{ fontSize: '16px', color: '#666' }}>
            {selectedAccounts.length} accounts are now part of your Dockly dashboard. You can easily add more accounts anytime from your dashboard.
          </Text>
          <Space direction="vertical" size="large" style={{ width: '100%', marginTop: '30px' }}>
            {['Connect cloud storage', 'Set up family sharing', 'Customize your boards'].map((option, index) => (
              <Card
                key={option}
                hoverable
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  padding: '15px',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ fontSize: '28px', marginRight: '20px' }}>
                    {index === 0 && <CloudOutlined />}
                    {index === 1 && <TeamOutlined />}
                    {index === 2 && <EditOutlined />}
                  </div>
                  <div>
                    <Title level={5} style={{ margin: 0 }}>{option}</Title>
                  </div>
                </div>
              </Card>
            ))}
          </Space>
          <Button
            type="primary"
            size="large"
            style={{ marginTop: '30px', padding: '10px 40px', borderRadius: '8px' }}
            onClick={() => alert('Redirect to Dashboard')}
          >
            Return to Dashboard
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '1500px', margin: '0px 100px', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Steps current={currentStep}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
      </div>
      <Steps current={currentStep} style={{ marginBottom: '40px', padding: '0 20px' }}>
        {steps.map((step, index) => (
          <Step key={index} title={step.title} />
        ))}
      </Steps>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        {steps[currentStep].content}
      </div>
    </div>
  );
};

export default DocklyWizard;

