import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  Target,
  Award,
  BarChart3,
  Zap,
  Brain,
  Coffee,
  CheckCircle,
  Calendar,
  Timer,
  Activity,
} from 'lucide-react';

const ProductivityStats: React.FC = () => {
  const [stats, setStats] = useState({
    focusTime: 5.5,
    tasksToday: 12,
    tasksCompleted: 9,
    weeklyGoal: 85,
    currentStreak: 12,
    pomodoroSessions: 8,
    deepWorkHours: 3.2,
    distractions: 15,
    energyLevel: 78,
    weeklyData: [85, 92, 78, 96, 88, 91, 94],
    hourlyProductivity: [20, 45, 70, 85, 90, 75, 60, 80, 95, 85, 70, 50],
    topCategories: [
      { name: 'Development', hours: 4.2, color: '#3b82f6' },
      { name: 'Meetings', hours: 2.1, color: '#10b981' },
      { name: 'Planning', hours: 1.3, color: '#f59e0b' },
      { name: 'Learning', hours: 0.8, color: '#8b5cf6' },
    ],
  });

  const [animatedValues, setAnimatedValues] = useState({
    focusTime: 0,
    tasksCompleted: 0,
    weeklyGoal: 0,
    streak: 0,
    pomodoroSessions: 0,
    energyLevel: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues({
        focusTime: stats.focusTime,
        tasksCompleted: stats.tasksCompleted,
        weeklyGoal: stats.weeklyGoal,
        streak: stats.currentStreak,
        pomodoroSessions: stats.pomodoroSessions,
        energyLevel: stats.energyLevel,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [stats]);

  const getTaskCompletionPercentage = () => {
    return (stats.tasksCompleted / stats.tasksToday) * 100;
  };

  const getDayLabel = (index: number) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[index];
  };

  const getEnergyColor = (level: number) => {
    if (level >= 80) return '#10b981';
    if (level >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        opacity: 0,
        animation: 'fadeInUp 0.6s ease-out 1.1s forwards',
      }}>
      {/* Header */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} style={{ color: '#8b5cf6' }} />
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e293b',
                margin: 0,
              }}>
              Productivity Analytics
            </h3>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
            }}>
            <div
              style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                animation: 'pulse 2s infinite',
              }}
            />
            <span
              style={{ fontSize: '12px', color: '#16a34a', fontWeight: '500' }}>
              Live Tracking
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Key Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '24px',
          }}>
          {/* Focus Time */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#faf5ff',
              borderRadius: '16px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
            <Clock
              size={20}
              style={{ color: '#8b5cf6', marginBottom: '8px' }}
            />
            <p
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 4px 0',
              }}>
              {animatedValues.focusTime.toFixed(1)}h
            </p>
            <p
              style={{
                fontSize: '11px',
                color: '#64748b',
                margin: 0,
              }}>
              Deep Focus
            </p>
          </div>

          {/* Pomodoro Sessions */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#fef2f2',
              borderRadius: '16px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
            <Timer
              size={20}
              style={{ color: '#ef4444', marginBottom: '8px' }}
            />
            <p
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 4px 0',
              }}>
              {animatedValues.pomodoroSessions}
            </p>
            <p
              style={{
                fontSize: '11px',
                color: '#64748b',
                margin: 0,
              }}>
              Pomodoros
            </p>
          </div>

          {/* Current Streak */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#f0fdf4',
              borderRadius: '16px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
            <Award
              size={20}
              style={{ color: '#10b981', marginBottom: '8px' }}
            />
            <p
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 4px 0',
              }}>
              {animatedValues.streak}
            </p>
            <p
              style={{
                fontSize: '11px',
                color: '#64748b',
                margin: 0,
              }}>
              Day Streak
            </p>
          </div>

          {/* Energy Level */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#fffbeb',
              borderRadius: '16px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
            <Zap size={20} style={{ color: '#f59e0b', marginBottom: '8px' }} />
            <p
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 4px 0',
              }}>
              {animatedValues.energyLevel}%
            </p>
            <p
              style={{
                fontSize: '11px',
                color: '#64748b',
                margin: 0,
              }}>
              Energy
            </p>
          </div>
        </div>

        {/* Tasks Progress */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} style={{ color: '#10b981' }} />
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1e293b',
                }}>
                Daily Progress
              </span>
            </div>
            <span style={{ fontSize: '14px', color: '#64748b' }}>
              {stats.tasksCompleted}/{stats.tasksToday} tasks
            </span>
          </div>

          <div
            style={{
              height: '8px',
              backgroundColor: '#f1f5f9',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '8px',
            }}>
            <div
              style={{
                height: '100%',
                backgroundColor: '#10b981',
                width: `${getTaskCompletionPercentage()}%`,
                borderRadius: '4px',
                transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
              }}>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '4px',
                  height: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  animation: 'shimmer 2s infinite',
                }}
              />
            </div>
          </div>
        </div>

        {/* Time Categories */}
        <div style={{ marginBottom: '24px' }}>
          <h4
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '12px',
              margin: '0 0 12px 0',
            }}>
            Time Distribution
          </h4>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}>
            {stats.topCategories.map((category, index) => (
              <div
                key={category.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  opacity: 0,
                  animation: `slideIn 0.4s ease-out ${1.3 + index * 0.1
                    }s forwards`,
                }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: category.color,
                    borderRadius: '50%',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#1e293b',
                      margin: 0,
                    }}>
                    {category.name}
                  </p>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                    {category.hours}h
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Productivity Chart */}
        <div style={{ marginBottom: '24px' }}>
          <h4
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '12px',
              margin: '0 0 12px 0',
            }}>
            Today's Productivity Pattern
          </h4>

          <div
            style={{
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'space-between',
              height: '60px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              padding: '12px 8px 8px 8px',
            }}>
            {stats.hourlyProductivity.map((value, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  flex: 1,
                }}>
                <div
                  style={{
                    width: '8px',
                    backgroundColor:
                      value > 80
                        ? '#10b981'
                        : value > 50
                          ? '#3b82f6'
                          : '#f59e0b',
                    borderRadius: '2px',
                    height: `${(value / 100) * 40}px`,
                    transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    animationDelay: `${index * 0.05}s`,
                    opacity: 0,
                    animation: `fadeInUp 0.5s ease-out ${1.4 + index * 0.05
                      }s forwards`,
                  }}
                />
                <span
                  style={{
                    fontSize: '9px',
                    color: '#64748b',
                    fontWeight: '500',
                  }}>
                  {index + 9}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div style={{ marginBottom: '24px' }}>
          <h4
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '12px',
              margin: '0 0 12px 0',
            }}>
            Weekly Performance
          </h4>

          <div
            style={{
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'space-between',
              height: '60px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              padding: '12px',
            }}>
            {stats.weeklyData.map((value, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  flex: 1,
                }}>
                <div
                  style={{
                    width: '16px',
                    backgroundColor:
                      value > 90
                        ? '#10b981'
                        : value > 80
                          ? '#3b82f6'
                          : '#f59e0b',
                    borderRadius: '2px',
                    height: `${(value / 100) * 40}px`,
                    transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0,
                    animation: `fadeInUp 0.5s ease-out ${1.5 + index * 0.1
                      }s forwards`,
                  }}
                />
                <span
                  style={{
                    fontSize: '10px',
                    color: '#64748b',
                    fontWeight: '500',
                  }}>
                  {getDayLabel(index)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        {/* <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '16px',
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
          }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px',
              }}>
              <Brain
                size={14}
                style={{ color: '#8b5cf6', marginRight: '4px' }}
              />
            </div>
            <p
              style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#8b5cf6',
                margin: '0 0 2px 0',
              }}>
              {stats.deepWorkHours}h
            </p>
            <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>
              Deep Work
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px',
              }}>
              <Activity
                size={14}
                style={{ color: '#ef4444', marginRight: '4px' }}
              />
            </div>
            <p
              style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#ef4444',
                margin: '0 0 2px 0',
              }}>
              {stats.distractions}
            </p>
            <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>
              Distractions
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px',
              }}>
              <Coffee
                size={14}
                style={{ color: '#f59e0b', marginRight: '4px' }}
              />
            </div>
            <p
              style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#f59e0b',
                margin: '0 0 2px 0',
              }}>
              4
            </p>
            <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>
              Breaks
            </p>
          </div>
        </div> */}

        {/* Action Buttons */}
        {/* <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '13px',
              color: '#8b5cf6',
              backgroundColor: '#faf5ff',
              border: '1px solid #e9d5ff',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}>
            Start Focus Session
          </button>
          <button
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '13px',
              color: '#64748b',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}>
            View Analytics →
          </button>
        </div> */}
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ProductivityStats;
