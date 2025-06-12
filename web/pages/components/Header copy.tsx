'use client';

import React from 'react';
import { Search, User, Bell, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '28px',
            fontWeight: '800',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
            color: 'white',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(255, 107, 107, 0.4)',
          }}>
            D
          </div>
          <span>Dockly</span>
        </motion.div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
        }}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{
              position: 'relative',
              width: '350px',
            }}
          >
            <Search
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.7)',
                width: '20px',
                height: '20px',
              }}
            />
            <input
              type="text"
              placeholder="Search accounts, documents, tasks..."
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                backdropFilter: 'blur(20px)',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </motion.div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: '44px',
                height: '44px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(20px)',
              }}
            >
              <Bell color="white" size={20} />
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: '44px',
                height: '44px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(20px)',
              }}
            >
              <Settings color="white" size={20} />
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: '44px',
                height: '44px',
                background: 'linear-gradient(135deg, #ff9a9e, #fecfef)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#667eea',
                fontWeight: '600',
                boxShadow: '0 4px 20px rgba(255, 154, 158, 0.4)',
              }}
            >
              JS
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;