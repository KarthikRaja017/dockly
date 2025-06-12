'use client';
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { motion } from 'framer-motion';

const CalendarSection: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState('Month');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const views = ['List', 'Day', 'Week', 'Month'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      style={{
        background: 'white',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
      }}>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#1a202c',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Calendar size={15} color="#667eea" />
          {format(currentDate, 'MMMM yyyy')}
        </motion.h2>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            gap: '4px',
            background: '#f8fafc',
            padding: '4px',
            borderRadius: '12px',
          }}>
            {views.map((view) => (
              <motion.button
                key={view}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedView(view)}
                style={{
                  padding: '8px 16px',
                  background: selectedView === view ? '#667eea' : 'transparent',
                  color: selectedView === view ? 'white' : '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {view}
              </motion.button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: '40px',
                height: '40px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={20} color="#64748b" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: '40px',
                height: '40px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronRight size={20} color="#64748b" />
            </motion.button>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '2px',
        background: '#e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '2px solid #e2e8f0',
      }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            style={{
              background: '#f8fafc',
              padding: '16px 8px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '700',
              color: '#64748b',
            }}
          >
            {day}
          </div>
        ))}

        {monthDays.map((day, index) => (
          <motion.div
            key={day.toISOString()}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01 }}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            style={{
              background: isToday(day) ? '#667eea' : 'white',
              minHeight: '80px',
              padding: '12px',
              position: 'relative',
              cursor: 'pointer',
              color: isToday(day) ? 'white' : '#1a202c',
            }}
          >
            <div style={{
              fontSize: '16px',
              fontWeight: isToday(day) ? '700' : '600',
              marginBottom: '8px',
            }}>
              {format(day, 'd')}
            </div>

            {/* Sample events */}
            {index === 11 && (
              <div style={{
                fontSize: '10px',
                padding: '2px 6px',
                background: '#ff6b6b',
                color: 'white',
                borderRadius: '4px',
                marginBottom: '2px',
              }}>
                Mortgage
              </div>
            )}
            {index === 16 && (
              <div style={{
                fontSize: '10px',
                padding: '2px 6px',
                background: '#4caf50',
                color: 'white',
                borderRadius: '4px',
              }}>
                Soccer
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '16px',
          border: '2px dashed #cbd5e1',
        }}
      >
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}>
          <input
            type="text"
            placeholder="Add an event in natural language (e.g., 'Dinner with Sarah tomorrow at 7pm')"
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              background: 'white',
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Plus size={16} />
            Add
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CalendarSection;