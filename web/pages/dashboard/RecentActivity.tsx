import React, { useState } from 'react';
import { FileText, Star, Clock, Folder } from 'lucide-react';

const RecentActivity: React.FC = () => {
  const [filter, setFilter] = useState('Documents');
  const [activities, setActivities] = useState([
    {
      id: 1,
      name: 'Tax Return 2024.pdf',
      time: '2 hours ago',
      hub: 'Finance Hub',
      type: 'pdf',
      isFavorite: false,
      bgColor: '#eff6ff',
      iconColor: '#3b82f6'
    },
    {
      id: 2,
      name: 'Monthly Budget.xlsx',
      time: '5 hours ago',
      hub: 'Finance Hub',
      type: 'excel',
      isFavorite: true,
      bgColor: '#f0fdf4',
      iconColor: '#16a34a'
    },
    {
      id: 3,
      name: 'Passport Scan.jpg',
      time: '1 day ago',
      hub: 'Documents',
      type: 'image',
      isFavorite: false,
      bgColor: '#faf5ff',
      iconColor: '#9333ea'
    },
    {
      id: 4,
      name: 'Insurance Policy.pdf',
      time: '3 days ago',
      hub: 'Documents',
      type: 'pdf',
      isFavorite: false,
      bgColor: '#fef2f2',
      iconColor: '#dc2626'
    },
    {
      id: 5,
      name: 'Travel Itinerary.doc',
      time: '1 week ago',
      hub: 'Travel Hub',
      type: 'doc',
      isFavorite: false,
      bgColor: '#fffbeb',
      iconColor: '#d97706'
    }
  ]);

  const filters = ['All', 'Documents', 'Favorites'];

  const toggleFavorite = (id: number) => {
    setActivities(prev => prev.map(activity =>
      activity.id === id ? { ...activity, isFavorite: !activity.isFavorite } : activity
    ));
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'All') return true;
    if (filter === 'Favorites') return activity.isFavorite;
    return filter === 'Documents';
  });

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      opacity: 0,
      animation: 'fadeInUp 0.6s ease-out 0.7s forwards'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #f1f5f9',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Folder size={20} style={{ color: '#6366f1' }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>
              Recent Activity
            </h3>
          </div>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {filters.map((filterName) => (
            <button
              key={filterName}
              onClick={() => setFilter(filterName)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '500',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: filter === filterName ? '#3b82f6' : 'transparent',
                color: filter === filterName ? 'white' : '#64748b'
              }}
            >
              {filterName}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        <div>
          {filteredActivities.map((activity, index) => (
            <div
              key={activity.id}
              className="card-hover"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 8px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: index < filteredActivities.length - 1 ? '8px' : 0,
                opacity: 0,
                animation: `slideIn 0.4s ease-out ${0.8 + index * 0.1}s forwards`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: activity.bgColor,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px',
                flexShrink: 0
              }}>
                <FileText size={20} style={{ color: activity.iconColor }} />
              </div>

              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: '0 0 4px 0'
                }}>
                  {activity.name}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  <Clock size={12} />
                  <span>{activity.time}</span>
                  <span>•</span>
                  <span>{activity.hub}</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(activity.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  color: activity.isFavorite ? '#f59e0b' : '#9ca3af'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Star
                  size={16}
                  fill={activity.isFavorite ? 'currentColor' : 'none'}
                />
              </button>
            </div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#64748b'
          }}>
            <Folder size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', margin: 0 }}>
              No {filter.toLowerCase()} found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;