'use client';

import React from 'react';
import {
  Home,
  Users,
  DollarSign,
  Heart,
  Plane,
  Puzzle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StatusItem {
  type: 'urgent' | 'pending' | 'complete';
  text: string;
}

interface BoardCardProps {
  title: string;
  icon: string;
  accounts: number;
  documents: number;
  statusItems: StatusItem[];
  index: number;
}

const BoardCard: React.FC<BoardCardProps> = ({
  title,
  icon,
  accounts,
  documents,
  statusItems,
  index
}) => {
  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      home: <Home size={24} />,
      family: <Users size={24} />,
      finance: <DollarSign size={24} />,
      health: <Heart size={24} />,
      travel: <Plane size={24} />,
      projects: <Puzzle size={24} />,
    };
    return iconMap[iconName] || <Home size={24} />;
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return '#ef4444'; // red
      case 'pending':
        return '#f59e0b'; // amber
      case 'complete':
        return '#22c55e'; // green
      default:
        return '#64748b'; // slate
    }
  };

  const cardColors = [
    { bg: '#e6f0ff', border: '#3b82f6' },   // blue
    { bg: '#ffeaf0', border: '#ec4899' },   // pink
    { bg: '#e7fff6', border: '#10b981' },   // mint green
    { bg: '#fffbe6', border: '#facc15' },   // yellow
    { bg: '#f3f0ff', border: '#8b5cf6' },   // violet
    { bg: '#fff1e6', border: '#fb923c' },   // orange peach
  ];

  const safeIndex = typeof index === 'number' ? index : 0;
  const colorSet = cardColors[safeIndex % cardColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: safeIndex * 0.1, duration: 0.5 }}
      whileHover={{
        y: -8,
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.05)',
        scale: 1.02
      }}
      whileTap={{ scale: 0.98 }}
      style={{
        // background: colorSet.bg,
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        border: `1px solid ${colorSet.border}`,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
        fontFamily: `'Inter', sans-serif`,
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        marginBottom: '16px',
      }}>
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          style={{
            width: '52px',
            height: '52px',
            background: colorSet.border,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          }}
        >
          {getIcon(icon)}
        </motion.div>
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: '4px',
          }}>
            {title}
          </h3>
          <div style={{
            fontSize: '13px',
            color: '#475569',
            display: 'flex',
            gap: '8px',
          }}>
            <span>{accounts} accounts</span>
            <span>•</span>
            <span>{documents} documents</span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        {(statusItems || []).map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (index * 0.1) + (idx * 0.05) + 0.3 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: '#ffffffcc',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#334155',
              border: '1px solid #e2e8f0',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: (index * 0.1) + (idx * 0.05) + 0.5, type: 'spring' }}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: getStatusColor(item.type),
                boxShadow: `0 0 12px ${getStatusColor(item.type)}40`,
              }}
            />
            <span>{item.text}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default BoardCard;
