
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

const { Title } = Typography;

const CashFlow = ({ bankDetails }: any) => {
    const transactions = bankDetails?.transactions?.nodes ?? [];


    const graphData = getLastSixMonthsSummary(transactions);

    return (
        <Card
            style={{
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                padding: "20px",
                background: "#fdfefe",
                margin: "20px",
                width: "1300px",
            }}
        >
            <div style={{ display: "flex" }}>
                <div>
                    <div style={{ padding: "24px 24px 12px 24px" }}>
                        <Title level={4} style={{ marginBottom: 0 }}>
                            Cash Flow
                        </Title>
                        <span
                            style={{
                                color: "#999",
                                float: "right",
                                fontWeight: 500,
                            }}
                        >
                            Last 6 Months
                        </span>
                    </div>
                    <div style={{ width: "700px", height: 300, padding: "0 24px 24px 24px" }}>
                        <ResponsiveContainer>
                            <LineChart data={graphData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#28c76f" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#28c76f" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ff4d4f" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <RechartsTooltip />
                                <Legend verticalAlign="top" height={36} />
                                <Line
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#28c76f"
                                    strokeWidth={3}
                                    dot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                                    activeDot={{ r: 8 }}
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="expenses"
                                    stroke="#ff4d4f"
                                    strokeWidth={3}
                                    dot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                                    activeDot={{ r: 8 }}
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

