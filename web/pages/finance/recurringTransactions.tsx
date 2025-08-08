'use client';
import React, { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import { getRecurringTransactions } from '../../services/apiConfig';
import DocklyLoader from '../../utils/docklyLoader';
import { Calendar, Clock, Repeat, TrendingDown } from 'lucide-react';

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

interface RecurringTransactionsProps {
    onRecurringUpdate?: (transactions: any[]) => void;
}

const RecurringTransactions = ({ onRecurringUpdate }: RecurringTransactionsProps) => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRecurring();
    }, []);

    const fetchRecurring = async () => {
        const user_id = localStorage.getItem('userId');
        if (!user_id) {
            message.error('User ID not found.');
            return;
        }

        try {
            setLoading(true);
            const res = await getRecurringTransactions({ user_id });
            const recurringData = res.recurring_transactions || [];
            setTransactions(recurringData);
            onRecurringUpdate?.(recurringData);
        } catch (err) {
            console.error('Error fetching recurring transactions:', err);
            message.error('Failed to load recurring transactions.');
            onRecurringUpdate?.([]);
        } finally {
            setLoading(false);
        }
    };

    const EmptyRecurringTemplate = () => (
        <div
            style={{
                background: 'linear-gradient(145deg, #fef3c7, #fde68a)',
                borderRadius: 12,
                padding: 20,
                textAlign: 'center',
                border: '1px solid #fcd34d',
                cursor: 'pointer',
            }}
            onClick={() => message.info("Set up recurring transaction tracking!")}
        >
            <Repeat size={32} style={{ color: '#d97706', marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4, fontFamily: FONT_FAMILY }}>
                Track Recurring Bills
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12, fontFamily: FONT_FAMILY }}>
                Never miss a payment again
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                <span style={{ background: '#fef3c7', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#d97706' }}>
                    💡 Utilities
                </span>
                <span style={{ background: '#ddd6fe', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#7c3aed' }}>
                    📺 Subscriptions
                </span>
                <span style={{ background: '#fecaca', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#dc2626' }}>
                    🏠 Rent
                </span>
            </div>
        </div>
    );

    const UpcomingBillsPreview = () => {
        const nextBills = [
            { name: 'Netflix', amount: '$15.99', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
            { name: 'Electric Bill', amount: '$85.00', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
            { name: 'Phone Plan', amount: '$45.00', date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) }
        ];

        return (
            <div style={{ marginTop: 12 }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#111827',
                    marginBottom: 8,
                    fontFamily: FONT_FAMILY
                }}>
                    <Clock size={14} style={{ marginRight: 4, color: '#f59e0b' }} />
                    Upcoming Bills
                </div>
                {nextBills.map((bill, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 8px',
                        background: '#fef7f0',
                        borderRadius: 6,
                        marginBottom: 4,
                        border: '1px solid #fed7aa'
                    }}>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 500, color: '#111827', fontFamily: FONT_FAMILY }}>
                                {bill.name}
                            </div>
                            <div style={{ fontSize: 9, color: '#6b7280', fontFamily: FONT_FAMILY }}>
                                Due {bill.date.toLocaleDateString()}
                            </div>
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#dc2626', fontFamily: FONT_FAMILY }}>
                            {bill.amount}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (!loading && transactions.length === 0) {
        return (
            <div
                style={{
                    background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                    width: 360,
                    fontFamily: FONT_FAMILY,
                    marginTop: '12px',
                    border: '1px solid #e2e8f0',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16,
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#111827',
                        fontFamily: FONT_FAMILY,
                    }}
                >
                    <span>Recurring Transactions</span>
                    <Button
                        type="link"
                        style={{
                            padding: 0,
                            fontSize: 13,
                            fontFamily: FONT_FAMILY,
                            fontWeight: 500,
                            color: '#3b82f6'
                        }}
                        onClick={() => message.info("Set up recurring transactions!")}
                    >
                        Setup
                    </Button>
                </div>
                <EmptyRecurringTemplate />
                <UpcomingBillsPreview />
            </div>
        );
    }

    return (
        <div
            style={{
                background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                width: 360,
                height: 475,
                fontFamily: FONT_FAMILY,
                overflowY: 'auto',
                marginTop: '12px',
                border: '1px solid #e2e8f0',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#111827',
                    fontFamily: FONT_FAMILY,
                }}
            >
                <span>Recurring Transactions</span>
                <Button
                    type="link"
                    style={{
                        padding: 0,
                        fontSize: 13,
                        fontFamily: FONT_FAMILY,
                        fontWeight: 500,
                        color: '#3b82f6'
                    }}
                    onClick={() => message.info("Manage functionality coming soon!")}
                >
                    Manage
                </Button>
            </div>

            {loading ? (
                <DocklyLoader />
            ) : (
                transactions.map((t, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 16,
                            padding: '8px',
                            borderRadius: '8px',
                            border: '1px solid #f3f4f6',
                            background: '#fefefe',
                            transition: 'transform 0.2s ease',
                            cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                background: 'linear-gradient(145deg, #f3f4f6, #e5e7eb)',
                                borderRadius: 8,
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                                fontWeight: 600,
                                fontSize: 12,
                                fontFamily: FONT_FAMILY,
                                border: '1px solid #e5e7eb',
                            }}
                        >
                            <div style={{ fontSize: 14, color: '#111827' }}>{new Date(t.last_date).getDate()}</div>
                            <div style={{ fontSize: 10, color: '#6b7280' }}>
                                {new Date(t.last_date).toLocaleString('en-US', { month: 'short' }).toUpperCase()}
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontWeight: 600,
                                fontSize: 13,
                                color: '#111827',
                                fontFamily: FONT_FAMILY,
                                marginBottom: 2
                            }}>
                                {t.description}
                            </div>
                            <div style={{
                                fontSize: 11,
                                color: '#6b7280',
                                fontFamily: FONT_FAMILY
                            }}>
                                {t.frequency} • Last on {new Date(t.last_date).toLocaleDateString()}
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <div
                                style={{
                                    fontWeight: 600,
                                    fontSize: 13,
                                    minWidth: 70,
                                    textAlign: 'right',
                                    color: '#ef4444',
                                    fontFamily: FONT_FAMILY,
                                }}
                            >
                                {t.amount}
                            </div>
                            <div>
                                <span
                                    style={{
                                        backgroundColor: '#ecfdf5',
                                        color: '#059669',
                                        fontSize: 10,
                                        fontWeight: 500,
                                        borderRadius: 6,
                                        padding: '2px 6px',
                                        marginTop: 4,
                                        display: 'inline-block',
                                        fontFamily: FONT_FAMILY,
                                        border: '1px solid #a7f3d0',
                                    }}
                                >
                                    {t.frequency}
                                </span>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default RecurringTransactions;