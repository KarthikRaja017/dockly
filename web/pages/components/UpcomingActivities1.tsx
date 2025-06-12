'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, Users, Heart, AlertCircle } from 'lucide-react';

interface Activity {
  date: { day: string; month: string };
  title: string;
  info: string;
  status: { type: string; label: string };
  category: 'finance' | 'family' | 'health' | 'general';
}

const UpcomingActivities: React.FC = () => {
  const activities: Activity[] = [
    {
      date: { day: '12', month: 'JUN' },
      title: 'Mortgage Payment',
      info: 'Chase Bank - $1,450.00',
      status: { type: 'urgent', label: 'Due Soon' },
      category: 'finance'
    },
    {
      date: { day: '15', month: 'JUN' },
      title: 'Internet Bill',
      info: 'Xfinity - $89.99',
      status: { type: 'pending', label: 'Due Soon' },
      category: 'finance'
    },
    {
      date: { day: '17', month: 'JUN' },
      title: "Emma's Soccer Practice",
      info: '4:00 PM - Community Park',
      status: { type: 'family', label: 'Family Event' },
      category: 'family'
    },
    {
      date: { day: '25', month: 'JUN' },
      title: 'Annual Checkup',
      info: 'Dr. Smith - 10:00 AM',
      status: { type: 'health', label: 'Health' },
      category: 'health'
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'finance': return <DollarSign size={16} />;
      case 'family': return <Users size={16} />;
      case 'health': return <Heart size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'urgent': return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
      case 'pending': return { bg: '#fffbeb', color: '#d97706', border: '#fed7aa' };
      case 'family': return { bg: '#f0f9ff', color: '#0284c7', border: '#bae6fd' };
      case 'health': return { bg: '#f0fdf4', color: '#059669', border: '#bbf7d0' };
      default: return { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7 }}
      style={{
        background: 'white',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        height: 'fit-content',
      }}
    >
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        style={{
          fontSize: '24px',
          fontWeight: '500',
          color: '#1a202c',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <AlertCircle size={28} color="#667eea" />
        Upcoming Activities
      </motion.h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {activities.map((activity, index) => {
          const statusColors = getStatusColor(activity.status.type);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              whileHover={{
                x: 8,
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                scale: 1.02
              }}
              style={{
                display: 'flex',
                gap: '16px',
                padding: '20px',
                background: '#fafbfc',
                borderRadius: '16px',
                border: '1px solid #f1f5f9',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                style={{
                  width: '60px',
                  height: '60px',
                  background: 'white',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  color: '#1a202c',
                  lineHeight: 1,
                }}>
                  {activity.date.day}
                </div>
                <div style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {activity.date.month}
                </div>
              </motion.div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#1a202c',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    {getCategoryIcon(activity.category)}
                    {activity.title}
                  </h3>

                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: statusColors.bg,
                      color: statusColors.color,
                      border: `1px solid ${statusColors.border}`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {activity.status.label}
                  </motion.span>
                </div>

                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  fontWeight: '500',
                }}>
                  {activity.info}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default UpcomingActivities;