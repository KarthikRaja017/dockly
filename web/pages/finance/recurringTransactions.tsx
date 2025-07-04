'use client';
import React, { useEffect, useState } from 'react';
import { Button, message, Spin } from 'antd';
import { getRecurringTransactions } from '../../services/apiConfig';
import DocklyLoader from '../../utils/docklyLoader';

const RecurringTransactions = () => {
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
            setTransactions(res.recurring_transactions || []);
        } catch (err) {
            console.error('Error fetching recurring transactions:', err);
            message.error('Failed to load recurring transactions.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                width: 380,
                height: 560,
                fontFamily: "'Segoe UI', sans-serif",
                overflowY: 'auto',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24,
                    fontSize: 18,
                    fontWeight: 600,
                }}
            >
                <span>Recurring Transactions</span>
                <Button type="link" style={{ padding: 0, fontSize: 14 }} onClick={() => message.info("Manage functionality coming soon!")}>
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
                            marginBottom: 20,
                        }}
                    >
                        <div
                            style={{
                                width: 50,
                                height: 50,
                                background: '#f2f2f2',
                                borderRadius: 10,
                                textAlign: 'center',
                                paddingTop: 6,
                                marginRight: 12,
                                fontWeight: 600,
                                fontSize: 14,
                            }}
                        >
                            <div style={{ fontSize: 16 }}>{new Date(t.last_date).getDate()}</div>
                            <div style={{ fontSize: 12, color: '#888' }}>
                                {new Date(t.last_date).toLocaleString('en-US', { month: 'short' }).toUpperCase()}
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 15 }}>{t.description}</div>
                            <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
                                {t.frequency} • Last on {new Date(t.last_date).toLocaleDateString()}
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <div
                                style={{
                                    fontWeight: 600,
                                    fontSize: 15,
                                    minWidth: 80,
                                    textAlign: 'right',
                                    color: '#D9534F',
                                }}
                            >
                                {t.amount}
                            </div>
                            <div>
                                <span
                                    style={{
                                        backgroundColor: '#D4EDDA',
                                        color: '#155724',
                                        fontSize: 11,
                                        fontWeight: 500,
                                        borderRadius: 8,
                                        padding: '2px 8px',
                                        marginTop: 4,
                                        display: 'inline-block',
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