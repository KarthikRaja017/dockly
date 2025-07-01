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

    const getPriorityColor = (priority: string) =>
        ({ high: '#ef4444', medium: '#f59e0b', low: '#10b981' }[priority] || '#6b7280');

    const getCategoryColor = (category: string) =>
        ({ Finance: '#3b82f6', Technology: '#8b5cf6', Markets: '#10b981' }[category] || '#6b7280');

    return (
        <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 12,
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
            overflow: 'hidden',
            opacity: 0,
            animation: 'fadeInUp 0.6s ease-out 0.2s forwards'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{
                        padding: 4,
                        background: '#f1f5f9',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <Newspaper size={14} color="#475569" />
                    </div>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', margin: 0 }}>Top News</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <TrendingUp size={10} color="#10b981" />
                    <span style={{ fontSize: 9, color: '#10b981', fontWeight: 500 }}>Live</span>
                </div>
            </div>

            {/* Featured News */}
            <div style={{
                background: '#f8fafc',
                borderRadius: 10,
                padding: 10,
                marginBottom: 8,
                border: `1px solid ${getPriorityColor(news[selectedNews].priority)}30`
            }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{
                        width: 3,
                        height: 36,
                        background: getPriorityColor(news[selectedNews].priority),
                        borderRadius: 2
                    }} />
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 600, color: '#1e293b', margin: '0 0 4px' }}>
                            {news[selectedNews].title}
                        </p>
                        <div style={{ fontSize: 9, color: '#64748b', display: 'flex', gap: 6, marginBottom: 4 }}>
                            <span style={{
                                padding: '2px 5px',
                                backgroundColor: getCategoryColor(news[selectedNews].category) + '20',
                                color: getCategoryColor(news[selectedNews].category),
                                borderRadius: 4,
                                fontWeight: 500
                            }}>
                                {news[selectedNews].category}
                            </span>
                            <span>{news[selectedNews].source}</span>
                            <span>•</span>
                            <span>{news[selectedNews].time}</span>
                        </div>
                        <div style={{ fontSize: 9, color: '#64748b', display: 'flex', gap: 8 }}>
                            <span>{news[selectedNews].readTime} read</span>
                            <span>{news[selectedNews].engagement} views</span>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button style={{
                        flex: 1,
                        padding: '5px 6px',
                        fontSize: 9,
                        color: '#3b82f6',
                        backgroundColor: '#eff6ff',
                        border: 'none',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        fontWeight: 500
                    }}>
                        <ExternalLink size={10} /> Read
                    </button>
                    <button style={{
                        padding: '5px 6px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 6,
                        cursor: 'pointer'
                    }}>
                        <Bookmark size={10} color="#64748b" />
                    </button>
                    <button style={{
                        padding: '5px 6px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 6,
                        cursor: 'pointer'
                    }}>
                        <Share size={10} color="#64748b" />
                    </button>
                </div>
            </div>

            {/* News List */}
            <div>
                {news.slice(1).map((item, index) => (
                    <div
                        key={item.id}
                        style={{
                            padding: '6px 8px',
                            marginBottom: 4,
                            borderLeft: `2px solid ${getPriorityColor(item.priority)}`,
                            backgroundColor: selectedNews === index + 1 ? '#f8fafc' : 'transparent',
                            borderRadius: '0 6px 6px 0',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: 0,
                            animation: `slideIn 0.3s ease-out ${0.3 + index * 0.1}s forwards`
                        }}
                        onClick={() => setSelectedNews(index + 1)}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                            e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = selectedNews === index + 1 ? '#f8fafc' : 'transparent';
                            e.currentTarget.style.transform = 'translateX(0)';
                        }}
                    >
                        <p style={{ fontSize: 11, fontWeight: 500, color: '#1e293b', margin: '0 0 2px' }}>
                            {item.title}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 8.5, color: '#64748b' }}>
                            <Clock size={8} />
                            <span>{item.time}</span>
                            <span>•</span>
                            <span>{item.source}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
                <a href="#" style={{
                    fontSize: 10.5,
                    color: '#3b82f6',
                    fontWeight: 500,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                }}>
                    View all news <span style={{ fontSize: 9 }}>→</span>
                </a>
                <div style={{ display: 'flex', gap: 3 }}>
                    {news.map((_, index) => (
                        <div
                            key={index}
                            style={{
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                backgroundColor: selectedNews === index ? '#3b82f6' : '#e2e8f0',
                                cursor: 'pointer'
                            }}
                            onClick={() => setSelectedNews(index)}
                        />
                    ))}
                </div>
            </div>

            {/* Background circle */}
            <div style={{
                position: 'absolute',
                top: -12,
                right: -12,
                width: 50,
                height: 50,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '50%',
                opacity: 0.05,
                transform: 'scale(0)',
                animation: 'scaleIn 0.6s ease-out 0.5s forwards'
            }} />

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-8px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes scaleIn {
                    to { transform: scale(1); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default TopNewsWidget;
