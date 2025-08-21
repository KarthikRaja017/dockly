"use client";

import { Card, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
} from "recharts";
import FinancialSummary from "./financialSummary";

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const { Title } = Typography;

const CashFlow = ({ bankDetails }: any) => {
    const transactions = bankDetails?.transactions?.nodes ?? [];

    const graphData = getLastSixMonthsSummary(transactions);

    return (
        <Card
            style={{
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
                padding: "16px",
                background: "linear-gradient(145deg, #ffffff, #f8fafc)",
                margin: "12px",
                width: "1300px",
                border: "1px solid #e2e8f0",
                fontFamily: FONT_FAMILY,
            }}
        >
            <div style={{ display: "flex" }}>
                <div>
                    <div style={{ padding: "16px 16px 8px 16px" }}>
                        <Title level={4} style={{ marginBottom: 0, fontFamily: FONT_FAMILY, fontSize: "16px", fontWeight: 600, color: "#111827" }}>
                            Cash Flow
                        </Title>
                        <span
                            style={{
                                color: "#6b7280",
                                float: "right",
                                fontWeight: 500,
                                fontSize: "12px",
                                fontFamily: FONT_FAMILY,
                            }}
                        >
                            Last 6 Months
                        </span>
                    </div>
                    <div style={{ width: "800px", height: 400, padding: "0 16px 16px 16px" }}>
                        <ResponsiveContainer>
                            <LineChart data={graphData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="month" style={{ fontFamily: FONT_FAMILY, fontSize: '12px' }} />
                                <YAxis style={{ fontFamily: FONT_FAMILY, fontSize: '12px' }} />
                                <RechartsTooltip contentStyle={{ fontFamily: FONT_FAMILY, borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                <Legend verticalAlign="top" height={32} wrapperStyle={{ fontFamily: FONT_FAMILY, fontSize: '12px' }} />
                                <Line
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#10b981"
                                    strokeWidth={2.5}
                                    dot={{ r: 4, stroke: "#fff", strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="expenses"
                                    stroke="#ef4444"
                                    strokeWidth={2.5}
                                    dot={{ r: 4, stroke: "#fff", strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                    fillOpacity={1}
                                    fill="url(#colorExpenses)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <FinancialSummary />
            </div>
        </Card>
    );
};

export default CashFlow;

const getLastSixMonthsSummary = (transactions: any[] = []) => {
    const summary = [];

    for (let i = 5; i >= 0; i--) {
        const monthDate = dayjs().subtract(i, "month");
        const targetMonth = monthDate.month();
        const targetYear = monthDate.year();
        const label = monthDate.format("MMM YYYY");

        let income = 0;
        let expenses = 0;

        transactions.forEach((tx) => {
            const txDate = dayjs(tx?.date);
            if (txDate.month() === targetMonth && txDate.year() === targetYear) {
                const amount = parseFloat(tx?.amount || "0");
                if (tx?.entryType === "CREDIT") income += amount;
                else if (tx?.entryType === "DEBIT") expenses += Math.abs(amount);
            }
        });

        summary.push({
            month: label,
            income: parseFloat(income.toFixed(2)),
            expenses: parseFloat(expenses.toFixed(2)),
        });
    }

    return summary;
};