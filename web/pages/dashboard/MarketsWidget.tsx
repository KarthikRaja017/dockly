import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MarketsWidget: React.FC = () => {
    const [markets, setMarkets] = useState([
        {
            symbol: 'S&P 500',
            price: 5487.03,
            change: 0.85,
            changeValue: 46.23,
            isPositive: true,
            volume: '3.2B'
        },
        // {
        //     symbol: 'NASDAQ',
        //     price: 17862.31,
        //     change: 1.24,
        //     changeValue: 219.45,
        //     isPositive: true,
        //     volume: '4.1B'
        // },
        {
            symbol: 'DOW',
            price: 39308.00,
            change: -0.22,
            changeValue: -86.77,
            isPositive: false,
            volume: '2.8B'
        }
    ]);

    const [selectedMarket, setSelectedMarket] = useState(0);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsUpdating(true);
            setTimeout(() => {
                setMarkets(prev => prev.map(market => ({
                    ...market,
                    price: market.price + (Math.random() - 0.5) * 10,
                    change: market.change + (Math.random() - 0.5) * 0.1,
                    changeValue: market.changeValue + (Math.random() - 0.5) * 5
                })));
                setIsUpdating(false);
            }, 300);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    const marketSummary = {
        gainers: 1247,
        losers: 892,
        unchanged: 234
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
            animation: 'fadeInUp 0.6s ease-out 0.3s forwards',
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
                        backgroundColor: '#f0f9ff',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <BarChart3 size={16} style={{ color: '#0284c7' }} />
                    </div>
                    <h3 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1e293b',
                        margin: 0
                    }}>
                        Markets
                    </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{
                        width: '6px',
                        height: '6px',
                        backgroundColor: isUpdating ? '#10b981' : '#6b7280',
                        borderRadius: '50%',
                        animation: isUpdating ? 'pulse 1s infinite' : 'none'
                    }} />
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '500' }}>
                        {isUpdating ? 'Updating' : 'Live'}
                    </span>
                </div>
            </div>

            {/* Featured Market */}
            <div style={{
                backgroundColor: markets[selectedMarket].isPositive ? '#f0fdf4' : '#fef2f2',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '12px',
                border: `1px solid ${markets[selectedMarket].isPositive ? '#bbf7d0' : '#fecaca'}`
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                        <h4 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1e293b',
                            margin: '0 0 4px 0'
                        }}>
                            {markets[selectedMarket].symbol}
                        </h4>
                        <p style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: markets[selectedMarket].isPositive ? '#10b981' : '#ef4444',
                            margin: '0 0 2px 0'
                        }}>
                            {markets[selectedMarket].price.toFixed(2)}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            justifyContent: 'flex-end',
                            marginBottom: '2px'
                        }}>
                            {markets[selectedMarket].isPositive ?
                                <ArrowUpRight size={12} style={{ color: '#10b981' }} /> :
                                <ArrowDownRight size={12} style={{ color: '#ef4444' }} />
                            }
                            <span style={{
                                fontSize: '12px',
                                color: markets[selectedMarket].isPositive ? '#10b981' : '#ef4444',
                                fontWeight: '600'
                            }}>
                                {markets[selectedMarket].isPositive ? '+' : ''}{markets[selectedMarket].change.toFixed(2)}%
                            </span>
                        </div>
                        <p style={{
                            fontSize: '10px',
                            color: markets[selectedMarket].isPositive ? '#10b981' : '#ef4444',
                            fontWeight: '500',
                            margin: 0
                        }}>
                            {markets[selectedMarket].isPositive ? '+' : ''}{markets[selectedMarket].changeValue.toFixed(2)}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>
                        Volume: {markets[selectedMarket].volume}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Activity size={10} style={{ color: '#64748b' }} />
                        <span style={{ fontSize: '10px', color: '#64748b' }}>Active</span>
                    </div>
                </div>
            </div>

            {/* Market List */}
            <div style={{ marginBottom: '12px' }}>
                {markets.map((market, index) => (
                    <div
                        key={market.symbol}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            marginBottom: '2px',
                            backgroundColor: selectedMarket === index ? '#f8fafc' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: 0,
                            animation: `slideIn 0.4s ease-out ${0.4 + index * 0.1}s forwards`
                        }}
                        onClick={() => setSelectedMarket(index)}
                        onMouseEnter={(e) => {
                            if (selectedMarket !== index) {
                                e.currentTarget.style.backgroundColor = '#f1f5f9';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selectedMarket !== index) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }
                        }}
                    >
                        <div>
                            <span style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: '#1e293b'
                            }}>
                                {market.symbol}
                            </span>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#1e293b'
                                }}>
                                    {market.price.toFixed(2)}
                                </span>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                    justifyContent: 'flex-end'
                                }}>
                                    {market.isPositive ?
                                        <TrendingUp size={8} style={{ color: '#10b981' }} /> :
                                        <TrendingDown size={8} style={{ color: '#ef4444' }} />
                                    }
                                    <span style={{
                                        fontSize: '9px',
                                        color: market.isPositive ? '#10b981' : '#ef4444',
                                        fontWeight: '500'
                                    }}>
                                        {market.isPositive ? '+' : ''}{market.change.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Market Summary */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px',
                marginBottom: '8px',
                padding: '8px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#10b981', margin: '0 0 2px 0' }}>
                        {marketSummary.gainers}
                    </p>
                    <p style={{ fontSize: '9px', color: '#64748b', margin: 0 }}>Gainers</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#ef4444', margin: '0 0 2px 0' }}>
                        {marketSummary.losers}
                    </p>
                    <p style={{ fontSize: '9px', color: '#64748b', margin: 0 }}>Losers</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', margin: '0 0 2px 0' }}>
                        {marketSummary.unchanged}
                    </p>
                    <p style={{ fontSize: '9px', color: '#64748b', margin: 0 }}>Unchanged</p>
                </div>
            </div>

            {/* Mini Chart Visualization */}
            <div style={{
                height: '24px',
                backgroundColor: '#f8fafc',
                borderRadius: '6px',
                padding: '4px',
                display: 'flex',
                alignItems: 'end',
                gap: '1px',
                marginBottom: '8px'
            }}>
                {[...Array(16)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            flex: 1,
                            backgroundColor: i % 3 === 0 ? '#10b981' : i % 2 === 0 ? '#3b82f6' : '#ef4444',
                            borderRadius: '1px',
                            height: `${Math.random() * 100}%`,
                            opacity: 0.7,
                            animation: `grow 0.5s ease-out ${i * 0.03}s forwards`
                        }}
                    />
                ))}
            </div>

            {/* Market Status */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '10px',
                color: '#64748b'
            }}>
                <div style={{
                    width: '4px',
                    height: '4px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                }} />
                <span>Market Open • Real-time data</span>
            </div>

            <style>{`
        @keyframes grow {
          from { height: 0; }
        }
      `}</style>
        </div>
    );
};

export default MarketsWidget;