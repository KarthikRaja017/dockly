import React, { useState } from 'react';
import { Newspaper, TrendingUp, Clock, ExternalLink, Bookmark, Share } from 'lucide-react';

const TopNewsWidget: React.FC = () => {
    const [news] = useState([
        {
            id: 1,
            title: 'Fed Announces Rate Decision',
            time: '2h',
            category: 'Finance',
            priority: 'high',
            readTime: '3 min',
            source: 'Reuters',
            engagement: 1247
        },
        {
            id: 2,
            title: 'Tech Giants Report Earnings',
            time: '5h',
            category: 'Technology',
            priority: 'medium',
            readTime: '5 min',
            source: 'TechCrunch',
            engagement: 892
        },
        {
            id: 3,
            title: 'Market Volatility Update',
            time: '8h',
            category: 'Markets',
            priority: 'low',
            readTime: '2 min',
            source: 'Bloomberg',
            engagement: 634
        }
    ]);

    const [selectedNews, setSelectedNews] = useState(0);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Finance': return '#3b82f6';
            case 'Technology': return '#8b5cf6';
            case 'Markets': return '#10b981';
            default: return '#6b7280';
        }
    };

    return (
        <div className="card-hover" style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            opacity: 0,
            animation: 'fadeInUp 0.6s ease-out 0.2s forwards',
            minHeight: '200px'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                        padding: '6px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Newspaper size={16} style={{ color: '#475569' }} />
                    </div>
                    <h3 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1e293b',
                        margin: 0
                    }}>
                        Top News
                    </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <TrendingUp size={12} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: '10px', color: '#10b981', fontWeight: '500' }}>Live</span>
                </div>
            </div>

            {/* Featured News */}
            <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '12px',
                border: `2px solid ${getPriorityColor(news[selectedNews].priority)}20`
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <div style={{
                        width: '4px',
                        height: '40px',
                        backgroundColor: getPriorityColor(news[selectedNews].priority),
                        borderRadius: '2px'
                    }} />
                    <div style={{ flex: 1 }}>
                        <p style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#1e293b',
                            margin: '0 0 4px 0',
                            lineHeight: '1.3'
                        }}>
                            {news[selectedNews].title}
                        </p>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '10px',
                            color: '#64748b',
                            marginBottom: '6px'
                        }}>
                            <span style={{
                                padding: '2px 6px',
                                backgroundColor: getCategoryColor(news[selectedNews].category) + '20',
                                color: getCategoryColor(news[selectedNews].category),
                                borderRadius: '4px',
                                fontSize: '9px',
                                fontWeight: '500'
                            }}>
                                {news[selectedNews].category}
                            </span>
                            <span>{news[selectedNews].source}</span>
                            <span>•</span>
                            <span>{news[selectedNews].time}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '10px', color: '#64748b' }}>
                                {news[selectedNews].readTime} read
                            </span>
                            <span style={{ fontSize: '10px', color: '#64748b' }}>
                                {news[selectedNews].engagement} views
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button style={{
                        flex: 1,
                        padding: '6px',
                        fontSize: '10px',
                        color: '#3b82f6',
                        backgroundColor: '#eff6ff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                    }}>
                        <ExternalLink size={10} />
                        Read
                    </button>
                    <button style={{
                        padding: '6px 8px',
                        fontSize: '10px',
                        color: '#64748b',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}>
                        <Bookmark size={10} />
                    </button>
                    <button style={{
                        padding: '6px 8px',
                        fontSize: '10px',
                        color: '#64748b',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}>
                        <Share size={10} />
                    </button>
                </div>
            </div>

            {/* News List */}
            <div style={{ marginBottom: '8px' }}>
                {news.slice(1).map((item, index) => (
                    <div
                        key={item.id}
                        style={{
                            padding: '6px 8px',
                            marginBottom: '4px',
                            borderLeft: `2px solid ${getPriorityColor(item.priority)}`,
                            backgroundColor: selectedNews === index + 1 ? '#f8fafc' : 'transparent',
                            borderRadius: '0 6px 6px 0',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            opacity: 0,
                            animation: `slideIn 0.4s ease-out ${0.3 + index * 0.1}s forwards`
                        }}
                        onClick={() => setSelectedNews(index + 1)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                            e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = selectedNews === index + 1 ? '#f8fafc' : 'transparent';
                            e.currentTarget.style.transform = 'translateX(0)';
                        }}
                    >
                        <p style={{
                            fontSize: '11px',
                            fontWeight: '500',
                            color: '#1e293b',
                            margin: '0 0 2px 0',
                            lineHeight: '1.3'
                        }}>
                            {item.title}
                        </p>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '9px',
                            color: '#64748b'
                        }}>
                            <Clock size={8} />
                            <span>{item.time}</span>
                            <span>•</span>
                            <span>{item.source}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '8px',
                borderTop: '1px solid #f1f5f9'
            }}>
                <a
                    href="#"
                    style={{
                        fontSize: '11px',
                        color: '#3b82f6',
                        textDecoration: 'none',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    View all news
                    <span style={{ fontSize: '10px' }}>→</span>
                </a>
                <div style={{
                    display: 'flex',
                    gap: '2px'
                }}>
                    {news.map((_, index) => (
                        <div
                            key={index}
                            style={{
                                width: '4px',
                                height: '4px',
                                backgroundColor: selectedNews === index ? '#3b82f6' : '#e2e8f0',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s ease'
                            }}
                            onClick={() => setSelectedNews(index)}
                        />
                    ))}
                </div>
            </div>

            {/* Background decoration */}
            <div style={{
                position: 'absolute',
                top: '-15px',
                right: '-15px',
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '50%',
                opacity: 0.05,
                transform: 'scale(0)',
                animation: 'scaleIn 0.8s ease-out 0.5s forwards'
            }} />

            <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          to {
            transform: scale(1);
          }
        }
      `}</style>
        </div>
    );
};

export default TopNewsWidget;