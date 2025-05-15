
'use client';

import React, { useState } from 'react';
import { Layout, Card, List, Button, Modal, Input, Form, Select } from 'antd';
import { PlusOutlined, EditOutlined, MoreOutlined, PhoneOutlined, CalendarOutlined } from '@ant-design/icons';

const { Content } = Layout;

// Interfaces for dynamic data
const HealthRecord = ({ name, source, category = 'Medical' }) => ({ name, source, category });
const Provider = ({ name, specialty, contact, category = 'Medical' }) => ({ name, specialty, contact, category });
const Appointment = ({ day, month, title, meta, time, status, badge, category = 'Medical' }) => ({ day, month, title, meta, time, status, badge, category });
const Medication = ({ name, meta, schedule, refill, isSoon, category = 'Medical' }) => ({ name, meta, schedule, refill, isSoon, category });
const Goal = ({ title, targetDate, current, target, progress, subtext, category }) => ({ title, targetDate, current, target, progress, subtext, category });
const Activity = ({ icon, title, meta, value, date, category = 'Fitness' }) => ({ icon, title, meta, value, date, category });
const Insurance = ({ provider, plan, subscriber, group, effectiveDate, copayLabel, copayValue, id, logo, category = 'Medical' }) => ({
  provider,
  plan,
  subscriber,
  group,
  effectiveDate,
  copayLabel,
  copayValue,
  id,
  logo,
  category,
});
const MentalHealth = ({ title, description, date, category = 'Mental Health' }) => ({ title, description, date, category });
const CustomSection = ({ id, title, category, content }) => ({ id, title, category, content });

const HealthDashboard = () => {
  // State for dynamic data
  const [healthRecords] = useState([
    HealthRecord({ name: 'Annual Physical Results.pdf', source: 'Google Drive • Feb 15, 2025' }),
    HealthRecord({ name: 'Vaccination Records.pdf', source: 'Google Drive • Jan 10, 2025' }),
  ]);

  const [providers] = useState([
    Provider({ name: 'Dr. Robert Williams', specialty: 'Primary Care Physician', contact: '(555) 123-4567 • Springfield Medical Group' }),
    Provider({ name: 'Dr. Jessica Chen', specialty: 'Dermatologist', contact: '(555) 987-6543 • Westside Dermatology' }),
  ]);

  const [appointments] = useState([
    Appointment({ day: '28', month: 'Apr', title: 'Dental Checkup', meta: 'Dr. Michael Johnson', time: '10:30 AM', status: 'Reminder Set', badge: 'Confirmed' }),
    Appointment({ day: '15', month: 'May', title: 'Annual Physical', meta: 'Dr. Robert Williams', time: '9:00 AM', status: 'Reminder Set', badge: 'Confirmed' }),
  ]);

  const [medications] = useState([
    Medication({ name: 'Zyrtec', meta: '10mg • Allergies', schedule: 'Once Daily', refill: '15 days left', isSoon: false }),
    Medication({ name: 'Albuterol Inhaler', meta: '90mcg • Asthma', schedule: 'As Needed', refill: '5 days left', isSoon: true }),
  ]);

  const [goals] = useState([
    Goal({ title: 'Daily Steps', targetDate: 'Daily Goal', current: '7,842', target: '10,000', progress: 78, subtext: '2,158 steps to go', category: 'Fitness' }),
    Goal({ title: 'Daily Calorie Intake', targetDate: 'Daily Goal', current: '1800 kcal', target: '2000 kcal', progress: 90, subtext: '200 kcal remaining', category: 'Nutrition' }),
  ]);

  const [activities] = useState([
    Activity({ icon: '🏃‍♂', title: 'Morning Run', meta: 'Neighborhood Loop', value: '3.2 miles', date: 'Today' }),
    Activity({ icon: '🏋', title: 'Strength Training', meta: 'Upper Body', value: '45 mins', date: 'Yesterday' }),
  ]);

  const [insuranceCards] = useState([
    Insurance({
      provider: 'Blue Cross Blue Shield',
      plan: 'PPO Family Plan',
      subscriber: 'John Smith',
      group: 'XP45782',
      effectiveDate: 'Jan 1, 2025',
      copayLabel: 'PCP Copay',
      copayValue: '$25',
      id: 'BCBS4872094538',
      logo: 'BC',
    }),
  ]);

  const [mentalHealthRecords] = useState([
    MentalHealth({ title: 'Therapy Session', description: 'Discussed stress management', date: 'Apr 20, 2025' }),
    MentalHealth({ title: 'Meditation', description: '10-minute guided meditation', date: 'Apr 19, 2025' }),
  ]);

  const [customSections, setCustomSections] = useState([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isCustomSectionModalVisible, setIsCustomSectionModalVisible] = useState(false);

  // Form reference for custom section
  const [customSectionForm] = Form.useForm();

  // Handler for adding new custom section
  const handleAddCustomSection = (values) => {
    const newSection = CustomSection({
      id: Date.now().toString(),
      title: values.title,
      category: values.category,
      content: values.content || 'Add content to this section.',
    });
    setCustomSections([...customSections, newSection]);
    setIsCustomSectionModalVisible(false);
    customSectionForm.resetFields();
  };

  // Render main column sections
  const renderSections = () => {
    const sections = [];

    // Health Summary (Overview and Fitness)
    if (activeTab === 'Overview' || activeTab === 'Fitness') {
      sections.push(
        <Card
          key="health-summary"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>📊</span> Health Summary
              </h3>
              <Button style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          }
          style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
          bodyStyle={{ padding: '20px' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ backgroundColor: '#f0f4f8', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Activity Today</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#10b981' }}>7,842</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>steps</div>
            </div>
            <div style={{ backgroundColor: '#f0f4f8', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Sleep Last Night</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#10b981' }}>7.5</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>hours</div>
            </div>
            <div style={{ backgroundColor: '#f0f4f8', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Weight</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#10b981' }}>178</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>lbs</div>
            </div>
          </div>
        </Card>
      );
    }

    // Healthcare Providers (Medical and Overview)
    if (activeTab === 'Overview' || activeTab === 'Medical') {
      sections.push(
        <Card
          key="healthcare-providers"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>👨‍⚕</span> Healthcare Providers
              </h3>
              <Button style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          }
          style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
          bodyStyle={{ padding: '20px' }}
        >
          {providers.filter((provider) => provider.category === 'Medical').map((provider, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#f0f4f8',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                marginBottom: index === providers.length - 1 ? '0' : '12px',
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', fontSize: '24px', color: '#10b981' }}>
                {index === 0 ? '👨‍⚕' : '👩‍⚕'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 500 }}>{provider.name}</div>
                <div style={{ fontSize: '14px', color: '#374151' }}>{provider.specialty}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{provider.contact}</div>
              </div>
              <Button style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <PhoneOutlined />
              </Button>
            </div>
          ))}
        </Card>
      );
    }

    // Health Records (Medical and Overview)
    if (activeTab === 'Overview' || activeTab === 'Medical') {
      sections.push(
        <Card
          key="health-records"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>📋</span> Health Records
              </h3>
              <Button style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          }
          style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
          bodyStyle={{ padding: '20px' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {healthRecords.filter((record) => record.category === 'Medical').map((record, index) => (
              <div key={index} style={{ backgroundColor: '#f0f4f8', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ height: '120px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', fontSize: '36px' }}>
                  📄
                </div>
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{record.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{record.source}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      );
    }

    // Recent Fitness Activities (Fitness and Overview)
    if (activeTab === 'Overview' || activeTab === 'Fitness') {
      sections.push(
        <Card
          key="fitness-activities"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>🏃‍♂</span> Recent Fitness Activities
              </h3>
              <Button style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          }
          style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
          bodyStyle={{ padding: '20px' }}
        >
          <List
            dataSource={activities.filter((activity) => activity.category === 'Fitness')}
            renderItem={(item, index) => (
              <List.Item
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: index === activities.length - 1 ? 'none' : '1px solid #e5e7eb',
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.meta}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{item.value}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.date}</div>
                </div>
              </List.Item>
            )}
          />
        </Card>
      );
    }

    return sections;
  };

  // Render sidebar sections
  const renderSidebarSections = () => {
    const sections = [];

    // Upcoming Appointments (Medical and Overview)
    if (activeTab === 'Overview' || activeTab === 'Medical') {
      sections.push(
        <Card
          key="upcoming-appointments"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>📅</span> Upcoming Appointments
              </h3>
              <Button style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          }
          style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
          bodyStyle={{ padding: '20px' }}
        >
          {appointments.filter((appointment) => appointment.category === 'Medical').map((appointment, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                padding: '12px 0',
                borderBottom: index === appointments.length - 1 ? 'none' : '1px solid #e5e7eb',
              }}
            >
              <div style={{ width: '45px', textAlign: 'center', marginRight: '12px' }}>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{appointment.day}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{appointment.month}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{appointment.title}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{appointment.meta}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{appointment.time}</div>
                <div style={{ fontSize: '12px', color: '#10b981' }}>{appointment.status}</div>
              </div>
            </div>
          ))}
        </Card>
      );
    }

    // Medications (Medical and Overview)
    if (activeTab === 'Overview' || activeTab === 'Medical') {
      sections.push(
        <Card
          key="medications"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>💊</span> Medications
              </h3>
              <Button style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          }
          style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
          bodyStyle={{ padding: '20px' }}
        >
          {medications.filter((medication) => medication.category === 'Medical').map((medication, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: index === medications.length - 1 ? '0' : '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '18px' }}>
                💊
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{medication.name}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{medication.meta}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{medication.schedule}</div>
                <div style={{ fontSize: '12px', color: medication.isSoon ? '#f59e0b' : '#6b7280' }}>Refill: {medication.refill}</div>
              </div>
            </div>
          ))}
        </Card>
      );
    }

    // Health Goals (Fitness, Nutrition, Overview)
    if (activeTab === 'Overview' || activeTab === 'Fitness' || activeTab === 'Nutrition') {
      const filteredGoals = activeTab === 'Overview' ? goals : goals.filter((goal) => goal.category === activeTab);
      if (filteredGoals.length > 0) {
        sections.push(
          <Card
            key="health-goals"
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px', opacity: '0.8', color: '#10b981' }}>🎯</span> Health Goals
                </h3>
                <Button style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                  <EditOutlined />
                </Button>
              </div>
            }
            style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
            bodyStyle={{ padding: '20px' }}
          >
            {filteredGoals.map((goal, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#f0f4f8',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: index === filteredGoals.length - 1 ? '0' : '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 500 }}>{goal.title}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{goal.targetDate}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{goal.current}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>{goal.target}</div>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', backgroundColor: '#10b981', width: `${goal.progress}%` }} />
                </div>
              </div>
            ))}
          </Card>
        );
      }
    }

    // Insurance Information (Medical and Overview)
    if (activeTab === 'Overview' || activeTab === 'Medical') {
      sections.push(
        <Card
          key="insurance-information"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>🛡</span> Insurance Information
              </h3>
              <Button style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          }
          style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
          bodyStyle={{ padding: '20px' }}
        >
          {insuranceCards.filter((card) => card.category === 'Medical').map((card, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#f0f4f8',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: index === insuranceCards.length - 1 ? '0' : '16px',
              }}
            >
              <div style={{ fontSize: '14px', color: '#6b7280' }}>{card.provider}</div>
              <div style={{ fontSize: '18px', fontWeight: 600 }}>{card.plan}</div>
              <div style={{ fontSize: '13px', marginTop: '8px' }}>
                <div style={{ color: '#6b7280' }}>Subscriber</div>
                <div style={{ fontWeight: 500 }}>{card.subscriber}</div>
              </div>
            </div>
          ))}
        </Card>
      );
    }

    // Mental Health Records (Mental Health and Overview)
    if (activeTab === 'Overview' || activeTab === 'Mental Health') {
      sections.push(
        <Card
          key="mental-health"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>🧠</span> Mental Health Records
              </h3>
              <Button style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          }
          style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
          bodyStyle={{ padding: '20px' }}
        >
          <List
            dataSource={mentalHealthRecords.filter((record) => record.category === 'Mental Health')}
            renderItem={(item, index) => (
              <List.Item
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: index === mentalHealthRecords.length - 1 ? 'none' : '1px solid #e5e7eb',
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                  🧠
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.description}</div>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.date}</div>
              </List.Item>
            )}
          />
        </Card>
      );
    }

    // Nutrition Tracking (Nutrition and Overview)
    if (activeTab === 'Overview' || activeTab === 'Nutrition') {
      sections.push(
        <Card
          key="nutrition"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>🍎</span> Nutrition Tracking
              </h3>
              <Button style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          }
          style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
          bodyStyle={{ padding: '20px' }}
        >
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Track your daily food intake and nutritional goals here.
          </div>
        </Card>
      );
    }

    // Custom Sections (Sidebar)
    customSections.forEach((section) => {
      if (activeTab === 'Overview' || activeTab === section.category) {
        sections.push(
          <Card
            key={`custom-${section.id}`}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>📌</span> {section.title}
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                    <EditOutlined />
                  </Button>
                  <Button style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                    <MoreOutlined />
                  </Button>
                </div>
              </div>
            }
            style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
            bodyStyle={{ padding: '20px' }}
          >
            <div style={{ fontSize: '14px', color: '#374151' }}>{section.content}</div>
            <Button
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PlusOutlined style={{ marginRight: '8px', opacity: 0.7 }} /> Add Content
            </Button>
          </Card>
        );
      }
    });

    return sections;
  };

  return (
    <Layout style={{ height: '100vh', backgroundColor: '#f9fafb',margin: "80px 10px 10px 60px" }}>
      <Content style={{ padding: '20px 30px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#d1fae5', color: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginRight: '16px' }}>
            ❤
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827' }}>Health</h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
          {['Overview', 'Medical', 'Fitness', 'Nutrition', 'Mental Health'].map((tab) => (
            <div
              key={tab}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                color: activeTab === tab ? '#3355ff' : '#374151',
                borderBottom: activeTab === tab ? '2px solid #3355ff' : '2px solid transparent',
                cursor: 'pointer',
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>{renderSections()}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {renderSidebarSections()}
            <div
              style={{
                backgroundColor: 'white',
                border: '2px dashed #e5e7eb',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setIsCustomSectionModalVisible(true)}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '24px', backgroundColor: '#eef1ff', color: '#3355ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 16px' }}>
                +
              </div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#3355ff' }}>Add a new section</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Customize your board with additional sections</div>
            </div>
          </div>
        </div>
      </Content>

      {/* Custom Section Modal */}
      <Modal
        title="Add New Section"
        visible={isCustomSectionModalVisible}
        onCancel={() => setIsCustomSectionModalVisible(false)}
        onOk={() => customSectionForm.submit()}
      >
        <Form form={customSectionForm} onFinish={handleAddCustomSection}>
          <Form.Item name="title" label="Section Title" rules={[{ required: true, message: 'Please enter the section title' }]}>
            <Input placeholder="e.g., Wellness Notes" />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Please select a category' }]}>
            <Select placeholder="Select a category">
              {['Overview', 'Medical', 'Fitness', 'Nutrition', 'Mental Health'].map((category) => (
                <Select.Option key={category} value={category}>
                  {category}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="content" label="Content" rules={[{ required: true, message: 'Please enter the content' }]}>
            <Input.TextArea rows={4} placeholder="Enter section content" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default HealthDashboard;

