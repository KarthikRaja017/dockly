
"use client";

import React, { useEffect, useState } from 'react';
import { Card, List, Button, Modal, Input, Form, Select } from 'antd';
import { PlusOutlined, EditOutlined, MoreOutlined, PhoneOutlined, CalendarOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Option } = Select;

// Interfaces for dynamic data (same as before)
interface HealthRecord { name: string; source: string; category: string; }
interface Provider { name: string; specialty: string; contact: string; category: string; }
interface Appointment { day: string; month: string; title: string; meta: string; time: string; status: string; badge: string; category: string; }
interface Medication { name: string; meta: string; schedule: string; refill: string; isSoon: boolean; category: string; }
interface Goal { title: string; targetDate: string; current: string; target: string; progress: number; subtext: string; category: string; }
interface Activity { icon: string; title: string; meta: string; value: string; date: string; category: string; }
interface Insurance { provider: string; plan: string; subscriber: string; group: string; effectiveDate: string; copayLabel: string; copayValue: string; id: string; logo: string; category: string; }
interface MentalHealth { title: string; description: string; date: string; category: string; }
interface CustomSection { id: string; title: string; category: string; content: { title: string; description: string }[]; }

const HealthDashboard = () => {
  // State for dynamic data (same as before, but updating activities)
  const [username, setUsername] = useState<string>("");
  console.log("🚀 ~ HealthDashboard ~ username:", username)
  const router = useRouter();

  useEffect(() => {
    const username = localStorage.getItem("username") || "";
    setUsername(username);
    if (localStorage.getItem('health') === null) {
      router.push(`/${username}/health/setup`);
    }
  }, []);

  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([
    { name: 'Annual Physical Results.pdf', source: 'Google Drive • Feb 15, 2025', category: 'Medical' },
    { name: 'Vaccination Records.pdf', source: 'Google Drive • Jan 10, 2025', category: 'Medical' },
  ]);

  const [providers, setProviders] = useState<Provider[]>([
    { name: 'Dr. Robert Williams', specialty: 'Primary Care Physician', contact: '(555) 123-4567 • Springfield Medical Group', category: 'Medical' },
    { name: 'Dr. Jessica Chen', specialty: 'Dermatologist', contact: '(555) 987-6543 • Westside Dermatology', category: 'Medical' },
    { name: 'Dr. Michael Johnson', specialty: 'Dentist', contact: '(555) 456-7890 • Clear Smile Dental Care', category: 'Medical' },
    { name: 'Dr. Sarah Thompson', specialty: 'Ophthalmologist', contact: '(555) 321-6547 • Clear Vision Eye Care', category: 'Medical' },
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    { day: '28', month: 'Apr', title: 'Dental Checkup', meta: 'Dr. Michael Johnson', time: '10:30 AM', status: 'Reminder Set', badge: 'Confirmed', category: 'Medical' },
    { day: '15', month: 'May', title: 'Annual Physical', meta: 'Dr. Robert Williams', time: '9:00 AM', status: 'Reminder Set', badge: 'Confirmed', category: 'Medical' },
  ]);

  const [medications, setMedications] = useState<Medication[]>([
    { name: 'Zyrtec', meta: '10mg • Allergies', schedule: 'Once Daily', refill: '15 days left', isSoon: false, category: 'Medical' },
    { name: 'Albuterol Inhaler', meta: '90mcg • Asthma', schedule: 'As Needed', refill: '5 days left', isSoon: true, category: 'Medical' },
  ]);

  const [goals, setGoals] = useState<Goal[]>([
    { title: 'Daily Steps', targetDate: 'Daily Goal', current: '7,842', target: '10,000', progress: 78, subtext: '2,158 steps to go', category: 'Fitness' },
    { title: 'Daily Calorie Intake', targetDate: 'Daily Goal', current: '1800 kcal', target: '2000 kcal', progress: 90, subtext: '200 kcal remaining', category: 'Nutrition' },
  ]);

  // Updated activities with the new one at the top
  const [activities, setActivities] = useState<Activity[]>([
    { icon: '🏃‍♂️', title: 'Evening Walk', meta: 'Park Trail', value: '2.1 miles', date: 'Today', category: 'Fitness' }, // New activity added at the top
    { icon: '🏃‍♂️', title: 'Morning Run', meta: 'Neighborhood Loop', value: '3.2 miles', date: 'Today', category: 'Fitness' },
    { icon: '🏋️', title: 'Strength Training', meta: 'Upper Body', value: '45 mins', date: 'Yesterday', category: 'Fitness' },
  ]);

  const [insuranceCards, setInsuranceCards] = useState<Insurance[]>([
    {
      provider: 'Blue Cross Blue Shield',
      plan: 'PPO Family Plan',
      subscriber: 'John Smith',
      group: 'XP45782',
      effectiveDate: 'Jan 1, 2025',
      copayLabel: 'PCP Copay',
      copayValue: '$25',
      id: 'BCBS4872094538',
      logo: 'BC',
      category: 'Medical',
    },
  ]);

  const [mentalHealthRecords, setMentalHealthRecords] = useState<MentalHealth[]>([
    { title: 'Therapy Session', description: 'Discussed stress management', date: 'Apr 20, 2025', category: 'Mental Health' },
    { title: 'Meditation', description: '10-minute guided meditation', date: 'Apr 19, 2025', category: 'Mental Health' },
  ]);

  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isCustomSectionModalVisible, setIsCustomSectionModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editSection, setEditSection] = useState<string>('');
  const [editItem, setEditItem] = useState<any>(null);

  const [customSectionForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Dynamic header bar data (same as before)
  const getHeaderData = () => {
    switch (activeTab) {
      case 'Medical':
        return { title: 'Medical Overview', count: healthRecords.length + providers.length + appointments.length + medications.length + insuranceCards.length };
      case 'Fitness':
        return { title: 'Fitness Overview', count: goals.filter(g => g.category === 'Fitness').length + activities.length };
      case 'Nutrition':
        return { title: 'Nutrition Overview', count: goals.filter(g => g.category === 'Nutrition').length };
      case 'Mental Health':
        return { title: 'Mental Health Overview', count: mentalHealthRecords.length };
      default:
        return { title: 'Health Overview', count: healthRecords.length + providers.length + appointments.length + medications.length + goals.length + activities.length + insuranceCards.length + mentalHealthRecords.length };
    }
  };

  // Handlers (same as before)
  const handleAddCustomSection = (values: { title: string; category: string; content: string }) => {
    const newSection: CustomSection = {
      id: Date.now().toString(),
      title: values.title,
      category: values.category,
      content: [{ title: values.content, description: 'Initial content' }],
    };
    setCustomSections([...customSections, newSection]);
    setIsCustomSectionModalVisible(false);
    customSectionForm.resetFields();
  };

  const handleAddContent = (sectionId: string) => {
    setEditSection(sectionId);
    setEditItem(null);
    setIsEditModalVisible(true);
  };

  const handleEdit = (section: string, item: any) => {
    setEditSection(section);
    setEditItem(item);
    editForm.setFieldsValue(item || {});
    setIsEditModalVisible(true);
  };

  const handleEditOk = (values: any) => {
    if (editSection === 'Health Records' && editItem) {
      setHealthRecords(healthRecords.map(item => item.name === editItem.name ? { ...item, ...values } : item));
    } else if (editSection === 'Healthcare Providers' && editItem) {
      setProviders(providers.map(item => item.name === editItem.name ? { ...item, ...values } : item));
    } else if (editSection === 'Upcoming Appointments' && editItem) {
      setAppointments(appointments.map(item => item.title === editItem.title && item.time === editItem.time ? { ...item, ...values } : item));
    } else if (editSection === 'Medications' && editItem) {
      setMedications(medications.map(item => item.name === editItem.name ? { ...item, ...values } : item));
    } else if (editSection === 'Health Goals' && editItem) {
      setGoals(goals.map(item => item.title === editItem.title ? { ...item, ...values } : item));
    } else if (editSection === 'Recent Fitness Activities' && editItem) {
      setActivities(activities.map(item => item.title === editItem.title && item.date === editItem.date ? { ...item, ...values } : item));
    } else if (editSection === 'Insurance Information' && editItem) {
      setInsuranceCards(insuranceCards.map(item => item.id === editItem.id ? { ...item, ...values } : item));
    } else if (editSection === 'Mental Health Records' && editItem) {
      setMentalHealthRecords(mentalHealthRecords.map(item => item.title === editItem.title && item.date === editItem.date ? { ...item, ...values } : item));
    } else if (editSection === 'Nutrition Tracking' && editItem) {
      // Handle nutrition tracking updates
    } else if (customSections.some(section => section.id === editSection)) {
      if (editItem) {
        setCustomSections(customSections.map(section => section.id === editSection ? {
          ...section,
          content: section.content.map(content => content.title === editItem.title ? { ...content, ...values } : content)
        } : section));
      } else {
        setCustomSections(customSections.map(section => section.id === editSection ? {
          ...section,
          content: [...section.content, { title: values.title, description: values.description }]
        } : section));
      }
    }
    setIsEditModalVisible(false);
    editForm.resetFields();
    setEditItem(null);
  };

  // Render main column sections (left) (same as before)
  const renderSections = () => {
    const sections = [];

    // Health Summary
    if (activeTab === 'Overview' || activeTab === 'Fitness') {
      sections.push(
        <Card
          key="health-summary"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>📊</span> Health Summary
                <span style={{ marginLeft: '8px', fontSize: '14px', color: '#6b7280' }}>({goals.filter(g => g.category === 'Fitness').length} metrics)</span>
              </h3>
              <Button onClick={() => handleEdit('Health Summary', null)} style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
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

    // Healthcare Providers (updated with call and calendar options)
    if (activeTab === 'Overview' || activeTab === 'Medical') {
      sections.push(
        <Card
          key="healthcare-providers"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>👨‍⚕️</span> Healthcare Providers
                <span style={{ marginLeft: '8px', fontSize: '14px', color: '#6b7280' }}>({providers.length} providers)</span>
              </h3>
              <Button onClick={() => handleEdit('Healthcare Providers', null)} style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          }
          style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
          bodyStyle={{ padding: '20px' }}
        >
          {providers.filter(p => p.category === 'Medical').map((provider, index) => (
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
                {index === 0 ? '👨‍⚕️' : '👩‍⚕️'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 500 }}>{provider.name}</div>
                <div style={{ fontSize: '14px', color: '#374151' }}>{provider.specialty}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{provider.contact}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  onClick={() => window.location.href = `tel:${provider.contact.split(' • ')[0]}`}
                  style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}
                >
                  <PhoneOutlined />
                </Button>
                <Button
                  onClick={() => handleEdit('Upcoming Appointments', { meta: provider.name, category: 'Medical' })}
                  style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}
                >
                  <CalendarOutlined />
                </Button>
                <Button
                  onClick={() => handleEdit('Healthcare Providers', provider)}
                  style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}
                >
                  <EditOutlined />
                </Button>
              </div>
            </div>
          ))}
        </Card>
      );
    }

    // Health Records (same as before)
    if (activeTab === 'Overview' || activeTab === 'Medical') {
      sections.push(
        <Card
          key="health-records"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>📋</span> Health Records
                <span style={{ marginLeft: '8px', fontSize: '14px', color: '#6b7280' }}>({healthRecords.length} records)</span>
              </h3>
              <Button onClick={() => handleEdit('Health Records', null)} style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          }
          style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
          bodyStyle={{ padding: '20px' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {healthRecords.filter(r => r.category === 'Medical').map((record, index) => (
              <div key={index} style={{ backgroundColor: '#f0f4f8', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ height: '120px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', fontSize: '36px' }}>
                  📄
                </div>
                <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{record.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{record.source}</div>
                  </div>
                  <Button onClick={() => handleEdit('Health Records', record)} style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                    <EditOutlined />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      );
    }

    // Recent Fitness Activities (same as before, but data updated above)
    if (activeTab === 'Overview' || activeTab === 'Fitness') {
      sections.push(
        <Card
          key="fitness-activities"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>🏃‍♂️</span> Recent Fitness Activities
                <span style={{ marginLeft: '8px', fontSize: '14px', color: '#6b7280' }}>({activities.length} activities)</span>
              </h3>
              <Button onClick={() => handleEdit('Recent Fitness Activities', null)} style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          }
          style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
          bodyStyle={{ padding: '20px' }}
        >
          <List
            dataSource={activities.filter(a => a.category === 'Fitness')}
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
                <Button onClick={() => handleEdit('Recent Fitness Activities', item)} style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                  <EditOutlined />
                </Button>
              </List.Item>
            )}
          />
        </Card>
      );
    }

    // Health Goals (same as before)
    if (activeTab === 'Overview' || activeTab === 'Fitness' || activeTab === 'Nutrition') {
      const filteredGoals = activeTab === 'Overview' ? goals : goals.filter(goal => goal.category === activeTab);
      if (filteredGoals.length > 0) {
        sections.push(
          <Card
            key="health-goals"
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>🎯</span> Health Goals
                  <span style={{ marginLeft: '8px', fontSize: '14px', color: '#6b7280' }}>({filteredGoals.length} goals)</span>
                </h3>
                <Button onClick={() => handleEdit('Health Goals', null)} style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
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
                <Button onClick={() => handleEdit('Health Goals', goal)} style={{ marginTop: '8px', width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                  <EditOutlined />
                </Button>
              </div>
            ))}
          </Card>
        );
      }
    }

    // Mental Health Records (same as before)
    if (activeTab === 'Mental Health') {
      sections.push(
        <Card
          key="mental-health"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>🧠</span> Mental Health Records
                <span style={{ marginLeft: '8px', fontSize: '14px', color: '#6b7280' }}>({mentalHealthRecords.length} records)</span>
              </h3>
              <Button onClick={() => handleEdit('Mental Health Records', null)} style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          }
          style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
          bodyStyle={{ padding: '20px' }}
        >
          <List
            dataSource={mentalHealthRecords.filter(r => r.category === 'Mental Health')}
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
                <Button onClick={() => handleEdit('Mental Health Records', item)} style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                  <EditOutlined />
                </Button>
              </List.Item>
            )}
          />
        </Card>
      );
    }

    // Nutrition Tracking (same as before)
    if (activeTab === 'Nutrition') {
      sections.push(
        <Card
          key="nutrition"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>🍎</span> Nutrition Tracking
                <span style={{ marginLeft: '8px', fontSize: '14px', color: '#6b7280' }}>({goals.filter(g => g.category === 'Nutrition').length} goals)</span>
              </h3>
              <Button onClick={() => handleEdit('Nutrition Tracking', null)} style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          }
          style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
          bodyStyle={{ padding: '20px' }}
        >
          <div style={{ fontSize: '14px', color: '#374151' }}>
            Track your daily food intake and nutritional goals here.
          </div>
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
            onClick={() => handleEdit('Nutrition Tracking', null)}
          >
            <PlusOutlined style={{ marginRight: '8px', opacity: 0.7 }} /> Add Nutrition Entry
          </Button>
        </Card>
      );
    }

    return sections;
  };

  // Render sidebar sections (right) (same as before)
  const renderSidebarSections = () => {
    const sections = [];

    // Upcoming Appointments
    if (activeTab === 'Overview' || activeTab === 'Medical') {
      sections.push(
        <Card
          key="upcoming-appointments"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>📅</span> Upcoming Appointments
                <span style={{ marginLeft: '8px', fontSize: '14px', color: '#6b7280' }}>({appointments.length} appointments)</span>
              </h3>
              <Button onClick={() => handleEdit('Upcoming Appointments', null)} style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          }
          style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
          bodyStyle={{ padding: '20px' }}
        >
          {appointments.filter(a => a.category === 'Medical').map((appointment, index) => (
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
              <Button onClick={() => handleEdit('Upcoming Appointments', appointment)} style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          ))}
        </Card>
      );
    }

    // Medications
    if (activeTab === 'Overview' || activeTab === 'Medical') {
      sections.push(
        <Card
          key="medications"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>💊</span> Medications
                <span style={{ marginLeft: '8px', fontSize: '14px', color: '#6b7280' }}>({medications.length} medications)</span>
              </h3>
              <Button onClick={() => handleEdit('Medications', null)} style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          }
          style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
          bodyStyle={{ padding: '20px' }}
        >
          {medications.filter(m => m.category === 'Medical').map((medication, index) => (
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
              <Button onClick={() => handleEdit('Medications', medication)} style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          ))}
        </Card>
      );
    }

    // Insurance Information
    if (activeTab === 'Overview' || activeTab === 'Medical') {
      sections.push(
        <Card
          key="insurance-information"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', opacity: '0.8', color: '#10b981' }}>🛡️</span> Insurance Information
                <span style={{ marginLeft: '8px', fontSize: '14px', color: '#6b7280' }}>({insuranceCards.length} plans)</span>
              </h3>
              <Button onClick={() => handleEdit('Insurance Information', null)} style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          }
          style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
          bodyStyle={{ padding: '20px' }}
        >
          {insuranceCards.filter(i => i.category === 'Medical').map((card, index) => (
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
              <Button onClick={() => handleEdit('Insurance Information', card)} style={{ marginTop: '8px', width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          ))}
        </Card>
      );
    }

    // Mental Health Records (only in right column for Overview)
    if (activeTab === 'Overview') {
      sections.push(
        <Card
          key="mental-health"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>🧠</span> Mental Health Records
                <span style={{ marginLeft: '8px', fontSize: '14px', color: '#6b7280' }}>({mentalHealthRecords.length} records)</span>
              </h3>
              <Button onClick={() => handleEdit('Mental Health Records', null)} style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          }
          style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
          bodyStyle={{ padding: '20px' }}
        >
          <List
            dataSource={mentalHealthRecords.filter(r => r.category === 'Mental Health')}
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
                <Button onClick={() => handleEdit('Mental Health Records', item)} style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                  <EditOutlined />
                </Button>
              </List.Item>
            )}
          />
        </Card>
      );
    }

    // Nutrition Tracking (only in right column for Overview)
    if (activeTab === 'Overview') {
      sections.push(
        <Card
          key="nutrition"
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>🍎</span> Nutrition Tracking
                <span style={{ marginLeft: '8px', fontSize: '14px', color: '#6b7280' }}>({goals.filter(g => g.category === 'Nutrition').length} goals)</span>
              </h3>
              <Button onClick={() => handleEdit('Nutrition Tracking', null)} style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <EditOutlined />
              </Button>
            </div>
          }
          style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
          bodyStyle={{ padding: '20px' }}
        >
          <div style={{ fontSize: '14px', color: '#374151' }}>
            Track your daily food intake and nutritional goals here.
          </div>
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
            onClick={() => handleEdit('Nutrition Tracking', null)}
          >
            <PlusOutlined style={{ marginRight: '8px', opacity: 0.7 }} /> Add Nutrition Entry
          </Button>
        </Card>
      );
    }

    // Custom Sections
    customSections.forEach((section) => {
      if (activeTab === 'Overview' || activeTab === section.category) {
        sections.push(
          <Card
            key={`custom-${section.id}`}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px', opacity: 0.8, color: '#10b981' }}>📌</span> {section.title}
                  <span style={{ marginLeft: '8px', fontSize: '14px', color: '#6b7280' }}>({section.content.length} items)</span>
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button onClick={() => handleAddContent(section.id)} style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                    <PlusOutlined />
                  </Button>
                  <Button onClick={() => handleEdit(section.id, null)} style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                    <EditOutlined />
                  </Button>
                </div>
              </div>
            }
            style={{ borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}
            bodyStyle={{ padding: '20px' }}
          >
            <List
              dataSource={section.content}
              renderItem={(item, index) => (
                <List.Item
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: index === section.content.length - 1 ? 'none' : '1px solid #e5e7eb',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.description}</div>
                  </div>
                  <Button onClick={() => handleEdit(section.id, item)} style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                    <EditOutlined />
                  </Button>
                </List.Item>
              )}
            />
          </Card>
        );
      }
    });

    return sections;
  };

  return (
    <div style={{ height: '100vh', backgroundColor: '#f9fafb', padding: '20px 30px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ width: '48px', height: '48px', backgroundColor: '#d1fae5', color: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginRight: '16px' }}>
          ❤️
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827' }}>{getHeaderData().title} <span style={{ fontSize: '16px', color: '#6b7280' }}>({getHeaderData().count} items)</span></h1>
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

      {/* Custom Section Modal */}
      <Modal
        title="Add New Section"
        open={isCustomSectionModalVisible}
        onCancel={() => setIsCustomSectionModalVisible(false)}
        onOk={() => customSectionForm.submit()}
      >
        <Form form={customSectionForm} onFinish={handleAddCustomSection}>
          <Form.Item name="title" label="Section Title" rules={[{ required: true, message: 'Please enter the section title' }]}>
            <Input placeholder="e.g., Wellness Notes" />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Please select a category' }]}>
            <Select placeholder="Select a category">
              {['Overview', 'Medical', 'Fitness', 'Nutrition', 'Mental Health'].map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="content" label="Initial Content" rules={[{ required: true, message: 'Please enter initial content' }]}>
            <Input placeholder="Enter initial content" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={editItem ? `Edit ${editSection}` : `Add to ${editSection}`}
        open={isEditModalVisible}
        onCancel={() => { setIsEditModalVisible(false); editForm.resetFields(); setEditItem(null); }}
        onOk={() => editForm.submit()}
      >
        <Form form={editForm} onFinish={handleEditOk}>
          {editSection === 'Health Records' && (
            <>
              <Form.Item name="name" label="Record Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="source" label="Source" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </>
          )}
          {editSection === 'Healthcare Providers' && (
            <>
              <Form.Item name="name" label="Provider Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="specialty" label="Specialty" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="contact" label="Contact" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </>
          )}
          {editSection === 'Upcoming Appointments' && (
            <>
              <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="meta" label="Details" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="time" label="Time" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </>
          )}
          {editSection === 'Medications' && (
            <>
              <Form.Item name="name" label="Medication Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="meta" label="Details" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="schedule" label="Schedule" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="refill" label="Refill" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </>
          )}
          {editSection === 'Health Goals' && (
            <>
              <Form.Item name="title" label="Goal Title" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="current" label="Current" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="target" label="Target" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="progress" label="Progress (%)" rules={[{ required: true, type: 'number', min: 0, max: 100 }]}>
                <Input type="number" />
              </Form.Item>
            </>
          )}
          {editSection === 'Recent Fitness Activities' && (
            <>
              <Form.Item name="title" label="Activity Title" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="meta" label="Details" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="value" label="Value" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </>
          )}
          {editSection === 'Insurance Information' && (
            <>
              <Form.Item name="provider" label="Provider" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="plan" label="Plan" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="subscriber" label="Subscriber" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </>
          )}
          {editSection === 'Mental Health Records' && (
            <>
              <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </>
          )}
          {editSection === 'Nutrition Tracking' && (
            <>
              <Form.Item name="title" label="Nutrition Entry" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Details" rules={[{ required: true }]}>
                <Input.TextArea rows={4} />
              </Form.Item>
            </>
          )}
          {customSections.some(section => section.id === editSection) && (
            <>
              <Form.Item name="title" label="Content Title" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                <Input.TextArea rows={4} />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default HealthDashboard;
