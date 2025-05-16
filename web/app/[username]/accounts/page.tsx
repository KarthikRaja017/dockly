
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Steps, Card, Checkbox, Select, Input, Space, Divider } from 'antd';
import Button from 'antd/es/button';
import Typography from 'antd/es/typography';
import { CheckCircleOutlined, CloudOutlined, UsergroupAddOutlined, EditOutlined } from '@ant-design/icons';

const { Step } = Steps;
const { Option } = Select;
const { Text, Title } = Typography;

interface StepConfig {
  title: string;
  content: React.ReactNode;
}

const DocklyWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([
    'Chase Bank', 'Gmail', 'Amazon', 'Netflix', 'Spotify', 'Instagram', 'LinkedIn', 'Dropbox',
  ]);
  const [currentAccountIndex, setCurrentAccountIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedDiscoveryOption, setSelectedDiscoveryOption] = useState<string | null>(null);
  const [selectedManagerOption, setSelectedManagerOption] = useState<string | null>(null);
  const router = useRouter();

  const handleStartSelection = (option: string) => {
    setSelectedOption(option);
  };

  const handleDiscoverySelection = (option: string) => {
    setSelectedDiscoveryOption(option);
  };

  const handleManagerSelection = (option: string) => {
    setSelectedManagerOption(option);
  };

  const steps: StepConfig[] = [
    {
      title: 'Start',
      content: (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <Title level={2} style={{ marginBottom: '20px', fontWeight: 600 }}>
            Welcome to Dockly
          </Title>
          <Text style={{ fontSize: '16px', color: '#666' }}>
            Dockly helps you centralize access to all your accounts and documents in one secure place.
          </Text>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '15px',
              marginTop: '40px',
            }}
          >
            {[
              { title: 'Quick Setup', description: 'Get started with automatic account discovery', icon: '⚡' },
              { title: 'Manual Setup', description: 'Add accounts one by one manually', icon: '📝' },
              { title: 'Import Data', description: 'Import from password manager or CSV', icon: '📊' },
              { title: 'From Template', description: 'Setup based on pre-made templates', icon: '📋' },
            ].map((option) => (
              <Card
                key={option.title}
                hoverable
                onClick={() => handleStartSelection(option.title)}
                style={{
                  width: '400px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  padding: '20px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: selectedOption === option.title ? '2px solid #1890ff' : '1px solid #e8e8e8',
                  backgroundColor: selectedOption === option.title ? '#e6f7ff' : '#fff',
                  transition: 'all 0.3s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '28px', marginRight: '20px' }}>{option.icon}</span>
                  <div>
                    <Title level={5} style={{ margin: '0', fontWeight: 500 }}>
                      {option.title}
                    </Title>
                    <Text style={{ color: '#888', fontSize: '14px' }}>{option.description}</Text>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '40px',
              marginBottom: '20px',
              backgroundColor: '#e6f7e6',
              borderRadius: '8px',
              padding: '10px 20px',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <span style={{ fontSize: '28px', marginRight: '20px' }}>🔒</span>
            <Text style={{ fontSize: '14px', color: '#666' }}>
              Your data is secure. Dockly uses bank-level encryption and never stores your passwords.
            </Text>
          </div>
          <Button
            type="primary"
            size="large"
            disabled={!selectedOption}
            style={{
              padding: '10px 40px',
              borderRadius: '8px',
              marginTop: '20px',
              opacity: !selectedOption ? 0.5 : 1,
              transition: 'opacity 0.3s',
            }}
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
          <Title level={2} style={{ marginBottom: '20px', fontWeight: 600 }}>
            Discovering your accounts
          </Title>
          <Text style={{ fontSize: '16px', color: '#666' }}>
            Select which sources Dockly should use to find your accounts.
          </Text>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '15px',
              marginTop: '40px',
            }}
          >
            {[
              { title: 'Browser History', description: 'Find accounts from sites you visit', icon: '🌐' },
              { title: 'Password Manager', description: 'Import from saved passwords', icon: '🔑' },
              { title: 'Email Scan', description: 'Find accounts from email receipts', icon: '📧' },
              { title: 'Mobile Apps', description: 'Sync with apps on your phone', icon: '📱' },
            ].map((option) => (
              <Card
                key={option.title}
                hoverable
                onClick={() => handleDiscoverySelection(option.title)}
                style={{
                  width: '400px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  padding: '20px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: selectedDiscoveryOption === option.title ? '2px solid #1890ff' : '1px solid #e8e8e8',
                  backgroundColor: selectedDiscoveryOption === option.title ? '#e6f7ff' : '#fff',
                  transition: 'all 0.3s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '28px', marginRight: '20px' }}>{option.icon}</span>
                  <div>
                    <Title level={5} style={{ margin: '0', fontWeight: 500 }}>
                      {option.title}
                    </Title>
                    <Text style={{ color: '#888', fontSize: '14px' }}>{option.description}</Text>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '40px',
              marginBottom: '20px',
              backgroundColor: '#e6f7e6',
              borderRadius: '8px',
              padding: '10px 20px',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <span style={{ fontSize: '28px', marginRight: '20px' }}>ℹ</span>
            <Text style={{ fontSize: '14px', color: '#666' }}>
              How it works: Dockly scans for domains you regularly visit to suggest accounts but never
              accesses your actual browsing history or content.
            </Text>
          </div>
          <div style={{ marginTop: '20px' }}>
            <Button
              style={{ marginRight: '8px', borderRadius: '6px' }}
              onClick={() => {
                setCurrentStep(0);
                setSelectedDiscoveryOption(null);
              }}
            >
              Back
            </Button>
            <Button
              type="primary"
              size="large"
              disabled={!selectedDiscoveryOption}
              style={{
                padding: '10px 40px',
                borderRadius: '8px',
                opacity: !selectedDiscoveryOption ? 0.5 : 1,
                transition: 'opacity 0.3s',
              }}
              onClick={() => setCurrentStep(2)}
            >
              Continue
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: 'Manager',
      content: (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Title level={3} style={{ marginBottom: '20px', fontWeight: 600 }}>
            Connect your password manager
          </Title>
          <Text style={{ fontSize: '16px', color: '#666' }}>
            Dockly works with your existing password manager for secure login to your accounts.
          </Text>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '15px',
              marginTop: '40px',
            }}
          >
            {[
              { icon: '1', title: '1Password', desc: 'Browser extension' },
              { icon: 'G', title: 'Google Password', desc: 'Chrome built-in' },
              { icon: 'K', title: 'Keeper', desc: 'Browser extension' },
              { icon: 'L', title: 'LastPass', desc: 'Browser extension' },
              { icon: 'B', title: 'Bitwarden', desc: 'Browser extension' },
              { icon: 'E', title: 'Edge Passwords', desc: 'Edge built-in' },
            ].map((option) => (
              <Card
                key={option.title}
                hoverable
                onClick={() => handleManagerSelection(option.title)}
                style={{
                  width: '300px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  padding: '20px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: selectedManagerOption === option.title ? '2px solid #1890ff' : '1px solid #e8e8e8',
                  backgroundColor: selectedManagerOption === option.title ? '#e6f7ff' : '#fff',
                  transition: 'all 0.3s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '28px', marginRight: '20px' }}>{option.icon}</span>
                  <div>
                    <Title level={5} style={{ margin: '0', fontWeight: 500 }}>
                      {option.title}
                    </Title>
                    <Text style={{ color: '#888', fontSize: '14px' }}>{option.desc}</Text>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '40px',
              marginBottom: '20px',
              backgroundColor: '#e6f7e6',
              borderRadius: '8px',
              padding: '10px 20px',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <span style={{ fontSize: '28px', marginRight: '20px' }}>🔒</span>
            <Text style={{ fontSize: '14px', color: '#666' }}>
              Zero-knowledge design: Dockly never stores or handles your actual passwords, it simply
              connects to your existing password manager.
            </Text>
          </div>
          <div style={{ marginTop: '20px' }}>
            <Button
              style={{ marginRight: '8px', borderRadius: '6px' }}
              onClick={() => {
                setCurrentStep(1);
                setSelectedManagerOption(null);
              }}
            >
              Back
            </Button>
            <Button
              type="primary"
              size="large"
              disabled={!selectedManagerOption}
              style={{
                padding: '10px 40px',
                borderRadius: '8px',
                opacity: !selectedManagerOption ? 0.5 : 1,
                transition: 'opacity 0.3s',
              }}
              onClick={() => setCurrentStep(3)}
            >
              Continue
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: 'Selection',
      content: (
        <div style={{ padding: '20px' }}>
          <Title level={2} style={{ marginBottom: '20px', fontWeight: 600 }}>
            We found 47 potential accounts
          </Title>
          <Text style={{ display: 'block', marginBottom: '20px', color: '#666', fontSize: '16px' }}>
            Select the accounts you'd like to add to Dockly. These were detected based on your browser
            history.
          </Text>
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center' }}>
            <Text style={{ marginRight: '10px', fontSize: '20px' }}>🔒</Text>
            <Text style={{ color: '#666', fontSize: '14px' }}>
              Your privacy is protected. Dockly never stores your passwords - connections are managed
              securely through your password manager.
            </Text>
          </div>
          <Divider orientation="left" style={{ margin: '20px 0', color: '#666' }}>
            Frequently Visited (15)
          </Divider>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '50px' }}>
            {[
              'Chase Bank', 'Gmail', 'Amazon', 'Netflix', 'Spotify', 'Instagram', 'LinkedIn', 'Dropbox',
            ].map((account) => (
              <Checkbox
                key={account}
                checked={selectedAccounts.includes(account)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedAccounts([...selectedAccounts, account]);
                  } else {
                    setSelectedAccounts(selectedAccounts.filter((a) => a !== account));
                  }
                }}
                style={{ width: '150px', fontSize: '14px' }}
              >
                {account}
              </Checkbox>
            ))}
          </div>
          <Divider orientation="left" style={{ margin: '20px 0', color: '#666' }}>
            Additional Sites (32)
          </Divider>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {[
              'State Farm', 'Ameren', 'Water Utility', 'Xfinity', 'Santander', 'Waste Mgmt',
              'Google Drive', 'Facebook',
            ].map((account) => (
              <Checkbox
                key={account}
                checked={selectedAccounts.includes(account)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedAccounts([...selectedAccounts, account]);
                  } else {
                    setSelectedAccounts(selectedAccounts.filter((a) => a !== account));
                  }
                }}
                style={{ width: '350px', fontSize: '14px' }}
              >
                {account}
              </Checkbox>
            ))}
          </div>
          <div style={{ marginTop: '20px' }}>
            <Button
              onClick={() => setSelectedAccounts([
                'Chase Bank', 'Gmail', 'Amazon', 'Netflix', 'Spotify', 'Instagram', 'LinkedIn', 'Dropbox',
                'State Farm', 'Ameren', 'Water Utility', 'Xfinity', 'Santander', 'Waste Mgmt',
                'Google Drive', 'Facebook',
              ])}
              style={{ marginRight: '10px', borderRadius: '6px' }}
            >
              Select All
            </Button>
            <Button
              onClick={() => setSelectedAccounts([])}
              style={{ marginRight: '10px', borderRadius: '6px' }}
            >
              Select None
            </Button>
            <Select
              defaultValue="Filter"
              style={{ width: '120px', borderRadius: '6px' }}
              options={[{ value: 'Filter', label: 'Filter' }]}
            />
          </div>
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <Button
              style={{ marginRight: '8px', borderRadius: '6px' }}
              onClick={() => setCurrentStep(2)}
            >
              Back
            </Button>
            <Button
              type="primary"
              style={{ borderRadius: '6px' }}
              onClick={() => setCurrentStep(4)}
            >
              Add Selected ({selectedAccounts.length})
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: 'Details',
      content: (
        <div style={{ padding: '20px' }}>
          <Title level={2} style={{ marginBottom: '20px', fontWeight: 600 }}>
            Organizing your accounts ({currentAccountIndex + 1}/{selectedAccounts.length})
          </Title>
          <Text style={{ display: 'block', marginBottom: '20px', color: '#666', fontSize: '16px' }}>
            Let's categorize your accounts to keep your dashboard organized.
          </Text>
          <Card
            style={{
              maxWidth: '600px',
              margin: '0 auto',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Space direction="vertical" style={{ width: '100%', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Text style={{ marginRight: '10px', fontSize: '24px' }}>C</Text>
                <Text style={{ fontWeight: 600, fontSize: '16px' }}>
                  {selectedAccounts[currentAccountIndex]}
                </Text>
              </div>

            
              <div>
                <Text style={{ fontWeight: 500, fontSize: '14px' }}>Category</Text>
                <Select
                  defaultValue="Financial"
                  style={{ width: '100%', marginTop: '5px', borderRadius: '6px' }}
                  options={[
                    { value: 'Financial', label: 'Financial' },
                    { value: 'Shopping', label: 'Shopping' },
                    { value: 'Entertainment', label: 'Entertainment' },
                    { value: 'Social', label: 'Social' },
                    { value: 'Work', label: 'Work' },
                    { value: 'Travel', label: 'Travel' },
                    { value: 'Utilities', label: 'Utilities' },
                    { value: 'Custom...', label: 'Custom...' },
                  ]}
                />
              </div>
              <div>
                <Text style={{ fontWeight: 500, fontSize: '14px' }}>Tags (optional)</Text>
                <div style={{ marginTop: '5px' }}>
                  <Button
                    size="small"
                    style={{ marginRight: '5px', borderRadius: '6px' }}
                  >
                    banking ×
                  </Button>
                  <Button size="small" style={{ borderRadius: '6px' }}>
                    personal ×
                  </Button>
                </div>
              </div>
              <div>
                <Text style={{ fontWeight: 500, fontSize: '14px' }}>Notes (optional)</Text>
                <Input.TextArea
                  defaultValue="Primary checking and savings accounts"
                  style={{ marginTop: '5px', borderRadius: '6px' }}
                />
              </div>
              <div>
                <Text style={{ fontWeight: 500, fontSize: '14px' }}>Board Assignment</Text>
                <div style={{ marginTop: '5px' }}>
                  {['Home', 'Finance', 'Family Hub'].map((board) => (
                    <Button
                      key={board}
                      size="small"
                      style={{ marginRight: '5px', borderRadius: '6px' }}
                    >
                      {board}
                    </Button>
                  ))}
                </div>
              </div>
            </Space>
          </Card>
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <Button
              style={{ marginRight: '8px', borderRadius: '6px' }}
              onClick={() => setCurrentStep(3)}
            >
              Back
            </Button>
            <Button
              style={{ marginRight: '8px', borderRadius: '6px' }}
              onClick={() => {
                if (currentAccountIndex < selectedAccounts.length - 1) {
                  setCurrentAccountIndex(currentAccountIndex + 1);
                } else {
                  setCurrentStep(5);
                }
              }}
            >
              Skip
            </Button>
            <Button
              type="primary"
              style={{ borderRadius: '6px' }}
              onClick={() => {
                if (currentAccountIndex < selectedAccounts.length - 1) {
                  setCurrentAccountIndex(currentAccountIndex + 1);
                } else {
                  setCurrentStep(5);
                }
              }}
            >
              Save & Next
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: 'Verification',
      content: (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Title level={2} style={{ marginBottom: '20px', fontWeight: 600 }}>
            Testing connections
          </Title>
          <Text style={{ display: 'block', marginBottom: '20px', color: '#666', fontSize: '16px' }}>
            Let's make sure Dockly can help you log in seamlessly.
          </Text>
          <Card
            style={{
              maxWidth: '600px',
              margin: '0 auto',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <Text style={{ marginRight: '10px', fontSize: '30px' }}>🔐</Text>
              <Text style={{ fontWeight: 600, fontSize: '16px' }}>
                Test account access with {selectedAccounts[currentAccountIndex]}
              </Text>
            </div>
            <Text style={{ display: 'block', marginBottom: '20px', color: '#666', fontSize: '14px' }}>
              This helps ensure smooth connections when using Dockly.
            </Text>
            <div style={{ marginLeft: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <Text style={{ marginRight: '10px', fontSize: '20px' }}>1</Text>
                <Text style={{ color: '#666', fontSize: '14px' }}>
                  We'll open {selectedAccounts[currentAccountIndex]} in a new tab
                </Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <Text style={{ marginRight: '10px', fontSize: '20px' }}>2</Text>
                <Text style={{ color: '#666', fontSize: '14px' }}>
                  Your password manager will offer to fill credentials
                </Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <Text style={{ marginRight: '10px', fontSize: '20px' }}>3</Text>
                <Text style={{ color: '#666', fontSize: '14px' }}>
                  Return here after successful login
                </Text>
              </div>
            </div>
            <Button
              type="primary"
              style={{ marginTop: '20px', borderRadius: '6px' }}
            >
              Test Connection
            </Button>
          </Card>
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <Button
              style={{ marginRight: '8px', borderRadius: '6px' }}
              onClick={() => setCurrentStep(4)}
            >
              Back
            </Button>
            <Button
              style={{ marginRight: '8px', borderRadius: '6px' }}
              onClick={() => {
                if (currentAccountIndex < selectedAccounts.length - 1) {
                  setCurrentAccountIndex(currentAccountIndex + 1);
                } else {
                  setCurrentStep(6);
                }
              }}
            >
              Skip Test
            </Button>
            <Button
              type="primary"
              style={{ borderRadius: '6px' }}
              onClick={() => {
                if (currentAccountIndex < selectedAccounts.length - 1) {
                  setCurrentAccountIndex(currentAccountIndex + 1);
                } else {
                  setCurrentStep(6);
                }
              }}
            >
              Next Account
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: 'Complete',
      content: (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Title level={2} style={{ marginBottom: '20px', fontWeight: 600 }}>
            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '10px' }} />
            Accounts successfully connected!
          </Title>
          <Text style={{ display: 'block', marginBottom: '20px', color: '#666', fontSize: '16px' }}>
            {selectedAccounts.length} accounts are now part of your Dockly dashboard. You can easily add more accounts anytime
            from your dashboard.
          </Text>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '20px',
            }}
          >
            {[
              { icon: <CloudOutlined />, title: 'Connect cloud storage' },
              { icon: <UsergroupAddOutlined />, title: 'Set up family sharing' },
              { icon: <EditOutlined />, title: 'Customize your boards' },
            ].map((option, index) => (
              <Card
                key={index}
                hoverable
                style={{
                  width: '200px',
                  textAlign: 'center',
                  border: '1px solid #e8e8e8',
                  borderRadius: '8px',
                  padding: '10px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div style={{ fontSize: '30px', marginBottom: '10px' }}>{option.icon}</div>
                <Text style={{ fontWeight: 600, fontSize: '14px' }}>{option.title}</Text>
              </Card>
            ))}
          </div>
          <Button
            type="primary"
            style={{ marginTop: '20px', borderRadius: '6px' }}
            onClick={() => {
              const currentSteps = parseInt(localStorage.getItem('completedSteps') || '0', 10);
              if (currentSteps < 2) {
                localStorage.setItem('completedSteps', '2');
              }
              router.push('/');
            }}
          >
            Return to Dashboard
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Steps current={currentStep}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
      </div>
      <div
        style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          minHeight: '400px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        {steps[currentStep].content}
      </div>
    </div>
  );
};

export default DocklyWizard;

