'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Checkbox, Progress, List, Badge, Calendar } from 'antd';
import dynamic from 'next/dynamic';
// const MainLayout = dynamic(() => import('../components/mainLayout'), { ssr: false });

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState({
    calendarEvents: true,
    reminders: true,
    recurringEvents: true,
  });
  const [connectedCalendars, setConnectedCalendars] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [toDoList, setToDoList] = useState([
    { task: 'Renew car insurance', priority: 'High', done: false },
    { task: 'Plan birthday gift', priority: 'Medium', done: false },
    { task: 'Update password manager', priority: 'Low', done: false },
    { task: 'Schedule dentist appointment', priority: 'Medium', done: true },
  ]);

  const calendarProviders = ['Google Calendar', 'Apple Calendar', 'Outlook Calendar', 'Yahoo Calendar'];

  const providerColors: { [key: string]: string } = {
    'Google Calendar': '#F3F4F6',
    'Apple Calendar': '#111827',
    'Outlook Calendar': '#2563EB',
    'Yahoo Calendar': '#8B5CF6',
  };

  const textColors: { [key: string]: string } = {
    'Google Calendar': '#DC2626',
    'Apple Calendar': '#FFFFFF',
    'Outlook Calendar': '#FFFFFF',
    'Yahoo Calendar': '#FFFFFF',
  };

  const handleCalendarSelect = (provider: string) => {
    setSelectedCalendars((prev) =>
      prev.includes(provider) ? prev.filter((cal) => cal !== provider) : [...prev, provider]
    );
  };

  const toggleOption = (option: keyof typeof selectedOptions) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleConnect = async () => {
    await new Promise((res) => setTimeout(res, 1000));
    setConnectedCalendars(selectedCalendars);
    setStep(4);
  };

  const toggleToDo = (index: number) => {
    setToDoList((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, done: !item.done } : item
      )
    );
  };

  const handleAddTask = () => {
    router.push('/add-task');
  };

  const handleViewChange = (mode: 'Day' | 'Week' | 'Month') => {
    setViewMode(mode);
  };

  const handlePin = () => {
    alert('Pinned to dashboard!');
  };

  const handleConnectMore = () => {
    setStep(1);
    setSelectedCalendars([]);
  };

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => {
        setStep(5); // Move to dashboard view after connection
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const containerStyle: React.CSSProperties = {
    padding: '24px',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    padding: '24px',
    marginBottom: '16px',
  };

  const buttonBase: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
  };

  const renderStep1 = () => (
    <div style={cardStyle}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb', marginBottom: '4px' }}>
        Connect Calendars
      </h2>
      <p>Select the calendars you want to connect to Dockly.</p>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>Step 1 of 3</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {calendarProviders.map((provider) => {
          const isSelected = selectedCalendars.includes(provider);
          return (
            <Button
              key={provider}
              onClick={() => handleCalendarSelect(provider)}
              style={{
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                border: `1px solid ${isSelected ? '#2563eb' : '#d1d5db'}`,
                backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                height: 'auto',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  margin: '0 auto 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  backgroundColor: providerColors[provider],
                  color: textColors[provider],
                }}
              >
                {provider[0]}
              </div>
              <div style={{ fontWeight: 500, color: '#111827' }}>{provider}</div>
              {isSelected && (
                <div style={{ fontSize: '12px', color: '#2563eb', marginTop: '4px' }}>✓ Selected</div>
              )}
            </Button>
          );
        })}
      </div>
      <div style={{ textAlign: 'right' }}>
        <Button
          onClick={() => setStep(2)}
          disabled={selectedCalendars.length === 0}
          style={{
            ...buttonBase,
            backgroundColor: selectedCalendars.length > 0 ? '#2563eb' : '#9ca3af',
            color: '#fff',
            cursor: selectedCalendars.length > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={cardStyle}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Import Options</h3>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          Select import options for {selectedCalendars.join(', ')}
        </p>
      </div>
      {[
        { key: 'calendarEvents', label: 'Calendar Events', desc: 'Appointments, meetings, and events' },
        { key: 'reminders', label: 'Reminders', desc: 'Tasks with deadlines' },
        { key: 'recurringEvents', label: 'Recurring Events', desc: 'Weekly, monthly, or annual repeats' },
      ].map(({ key, label, desc }) => (
        <div
          key={key}
          onClick={() => toggleOption(key as keyof typeof selectedOptions)}
          style={{
            padding: '16px',
            borderRadius: '12px',
            border: `1px solid ${selectedOptions[key as keyof typeof selectedOptions] ? '#3b82f6' : '#d1d5db'}`,
            backgroundColor: selectedOptions[key as keyof typeof selectedOptions] ? '#eff6ff' : '#ffffff',
            marginBottom: '12px',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '14px' }}>{label}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>{desc}</div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
        <Button onClick={() => setStep(1)} style={{ ...buttonBase, background: 'none', color: '#6b7280' }}>
          Back
        </Button>
        <Button
          onClick={() => setStep(3)}
          style={{ ...buttonBase, backgroundColor: '#2563eb', color: '#fff' }}
        >
          Next
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={cardStyle}>
      <p style={{ fontSize: '14px', color: '#111827', marginBottom: '16px' }}>
        Dockly needs the following permissions to connect and sync your calendars.
      </p>
      <div
        style={{
          backgroundColor: '#f9fafb',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: '2px solid #d1d5db',
          }}
        ></div>
        <p style={{ fontSize: '14px', color: '#111827' }}>
          <span style={{ fontWeight: 500 }}>You'll be redirected to sign in</span><br />
          <span style={{ color: '#6b7280' }}>
            For each selected calendar, you'll need to sign in and authorize Dockly.
          </span>
        </p>
      </div>
      <div
        style={{
          backgroundColor: '#f9fafb',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          marginBottom: '16px',
        }}
      >
        <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
          Dockly will be able to:
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="#22c55e" fill="none" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span style={{ fontSize: '14px', color: '#111827' }}>Read calendar events and details</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="#22c55e" fill="none" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span style={{ fontSize: '14px', color: '#111827' }}>Create new events and reminders in Dockly</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="#22c55e" fill="none" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span style={{ fontSize: '14px', color: '#111827' }}>Modify or delete events created by Dockly</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="#ef4444" fill="none" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span style={{ fontSize: '14px', color: '#111827' }}>Cannot modify or delete events created outside of Dockly</span>
          </li>
        </ul>
      </div>
      <div
        style={{
          backgroundColor: '#f9fafb',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          marginBottom: '24px',
        }}
      >
        <p style={{ fontSize: '14px', color: '#111827' }}>
          <span style={{ fontWeight: 500 }}>Data & Privacy</span><br />
          <span style={{ color: '#6b7280' }}>
            Dockly syncs calendar data securely and doesn't share your information with third parties. You can disconnect calendars at any time.
          </span>
        </p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={() => setStep(2)} style={{ ...buttonBase, background: 'none', color: '#6b7280', border: '1px solid #d1d5db' }}>
          Back
        </Button>
        <Button
          onClick={handleConnect}
          style={{ ...buttonBase, backgroundColor: '#2563eb', color: '#fff' }}
        >
          Connect
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div style={cardStyle}>
      <div
        style={{
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#dcfce7',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" stroke="green" fill="none" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
          Calendars Connected!
        </h3>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
          Your calendars have been successfully connected to Dockly.
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {selectedCalendars.map((cal) => (
            <div
              key={cal}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: providerColors[cal],
                color: textColors[cal],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              {cal[0]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div>
      <Card style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Good morning, John!</h2>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              You have 3 accounts that need attention and 2 bills due this week.
            </p>
            <Progress percent={65} style={{ width: '200px' }} />
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Continue setup: 13/20 steps completed</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button onClick={handleConnectMore} style={{ ...buttonBase, backgroundColor: '#2563eb', color: '#fff' }}>
              + Connect
            </Button>
            <Button onClick={handlePin} style={{ ...buttonBase, background: 'none', border: '1px solid #d1d5db' }}>
              Pin Doc
            </Button>
            <Button style={{ ...buttonBase, background: 'none', border: '1px solid #d1d5db' }}>
              Family
            </Button>
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 2 }}>
          <Card style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Calendar</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  onClick={() => handleViewChange('Day')}
                  style={{ ...buttonBase, backgroundColor: viewMode === 'Day' ? '#2563eb' : '#fff', color: viewMode === 'Day' ? '#fff' : '#000' }}
                >
                  Day
                </Button>
                <Button
                  onClick={() => handleViewChange('Week')}
                  style={{ ...buttonBase, backgroundColor: viewMode === 'Week' ? '#2563eb' : '#fff', color: viewMode === 'Week' ? '#fff' : '#000' }}
                >
                  Week
                </Button>
                <Button
                  onClick={() => handleViewChange('Month')}
                  style={{ ...buttonBase, backgroundColor: viewMode === 'Month' ? '#2563eb' : '#fff', color: viewMode === 'Month' ? '#fff' : '#000' }}
                >
                  Month
                </Button>
              </div>
            </div>
            {viewMode === 'Day' && (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>May 15, 2025</h4>
                <div style={{ height: '400px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '50px', fontSize: '12px', color: '#6b7280' }}>8 AM</div>
                    <div
                      style={{
                        flex: 1,
                        backgroundColor: '#fee2e2',
                        padding: '8px',
                        borderRadius: '4px',
                        borderLeft: '4px solid #ef4444',
                      }}
                    >
                      <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>Pay Credit Card Bill</p>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>8:00 - 9:00 PM</p>
                    </div>
                  </div>
                  {[...Array(9)].map((_, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ width: '50px', fontSize: '12px', color: '#6b7280' }}>{`${i + 9} AM`}</div>
                      <div style={{ flex: 1, borderBottom: '1px solid #e5e7eb' }}></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {viewMode === 'Week' && <div>Week view placeholder</div>}
            {viewMode === 'Month' && <Calendar fullscreen={false} />}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <Badge color="#2563eb" text="Personal" />
              <Badge color="#22c55e" text="Work" />
              <Badge color="#f59e0b" text="Family" />
              <Badge color="#8b5cf6" text="Health" />
              <Badge color="#ef4444" text="Bills & Finance" />
            </div>
          </Card>
        </div>

        <div style={{ flex: 1 }}>
          <Card style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Today's Overview</h3>
              <Button type="link">View All</Button>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>15</h2>
            <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>THUR 2025</p>
            <div style={{ marginTop: '16px' }}>
              <p style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Badge color="#2563eb" /> 5 Personal Tasks <Progress percent={50} size="small" />
              </p>
              <p style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Badge color="#22c55e" /> 2 Work Tasks <Progress percent={80} size="small" />
              </p>
              <p style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Badge color="#f59e0b" /> 4 Family Activities <Progress percent={25} size="small" />
              </p>
            </div>
          </Card>

          <Card style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>To-Do List</h3>
              <Button onClick={handleAddTask}>Add Task</Button>
            </div>
            <List
              dataSource={toDoList}
              renderItem={(item, index) => (
                <List.Item>
                  <Checkbox checked={item.done} onChange={() => toggleToDo(index)}>
                    <span style={{ color: item.done ? '#6b7280' : '#111827', textDecoration: item.done ? 'line-through' : 'none' }}>
                      {item.task}
                    </span>
                    <span
                      style={{
                        marginLeft: '8px',
                        fontSize: '12px',
                        color:
                          item.priority === 'High' ? '#ef4444' : item.priority === 'Medium' ? '#f59e0b' : '#22c55e',
                      }}
                    >
                      {item.priority}
                    </span>
                  </Checkbox>
                </List.Item>
              )}
            />
            <Button type="link" style={{ marginTop: '8px' }}>
              View All Tasks
            </Button>
          </Card>

          <Card style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Upcoming Activities</h3>
              <Button type="link">View All</Button>
            </div>
            <List
              dataSource={[
                { date: '16', title: 'Team Project Review', time: '10:00 AM - 11:30 AM' },
                { date: '18', title: 'Mortgage Payment', time: '$1450.00 - Due' },
                { date: '20', title: 'Family Dinner', time: '6:30 PM - 9:00 PM' },
                { date: '22', title: 'Annual Checkup', time: '9:00 AM - Dr. Johnson' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                      }}
                    >
                      {item.date}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>{item.title}</p>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{item.time}</p>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    // <MainLayout>
      <div style={containerStyle}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderDashboard()}
      </div>
    // </MainLayout>
  );
};

export default Dashboard;