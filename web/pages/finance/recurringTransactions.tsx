import React from "react";
import { Tag, Button } from "antd";

const RecurringTransactions = () => {
    const containerStyle = {
        background: "#fff",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        width: 380,
        fontFamily: "'Segoe UI', sans-serif",
        height: 560
    };

    const headerStyle = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        fontSize: 18,
        fontWeight: 600,
    };

    const itemStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    };

    const dateBoxStyle = {
        width: 50,
        height: 50,
        background: "#f2f2f2",
        borderRadius: 10,
        textAlign: "center",
        paddingTop: 6,
        marginRight: 12,
        fontWeight: 600,
        fontSize: 14,
    };

    const transactionInfoStyle = {
        flex: 1,
    };

    const nameStyle = {
        fontWeight: 600,
        fontSize: 15,
    };

    const descStyle = {
        fontSize: 13,
        color: "#888",
        marginTop: 2,
    };

    const amountStyle = {
        fontWeight: 600,
        fontSize: 15,
        minWidth: 80,
        textAlign: "right",
    };

    const transactions = [
        {
            date: { day: "23", month: "APR" },
            name: "Internet Bill",
            company: "Xfinity",
            price: "$89.99",
            color: "#D9534F",
            tag: { label: "Due Soon", color: "#FFECB3", textColor: "#C68A00" },
        },
        {
            date: { day: "25", month: "APR" },
            name: "Cell Phone",
            company: "Verizon",
            price: "$142.50",
            color: "#D9534F",
            tag: { label: "Due Soon", color: "#FFECB3", textColor: "#C68A00" },
        },
        {
            date: { day: "1", month: "MAY" },
            name: "Amex Credit Card",
            company: "American Express",
            price: "$1,835.42",
            color: "#28a745",
            tag: { label: "Auto-Pay", color: "#D4EDDA", textColor: "#155724" },
        },
        {
            date: { day: "5", month: "MAY" },
            name: "Car Insurance",
            company: "Progressive",
            price: "$132.50",
            color: "#D9534F",
            tag: { label: "Auto-Pay", color: "#D4EDDA", textColor: "#155724" },
        },
        {
            date: { day: "15", month: "MAY" },
            name: "Student Loan",
            company: "Sallie Mae",
            price: "$285.00",
            color: "#D9534F",
            tag: { label: "Auto-Pay", color: "#D4EDDA", textColor: "#155724" },
        },
    ];

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <span>Recurring Transactions</span>
                <Button type="link" style={{ padding: 0, fontSize: 14 }}>
                    Manage
                </Button>
            </div>

            {transactions.map((t, i) => (
                <div style={itemStyle} key={i}>
                    <div style={{
                        width: 50,
                        height: 50,
                        background: "#f2f2f2",
                        borderRadius: 10,
                        textAlign: "center",
                        paddingTop: 6,
                        marginRight: 12,
                        fontWeight: 600,
                        fontSize: 14,
                    }}>
                        <div style={{ fontSize: 16 }}>{t.date.day}</div>
                        <div style={{ fontSize: 12, color: "#888" }}>{t.date.month}</div>
                    </div>
                    <div style={transactionInfoStyle}>
                        <div style={nameStyle}>{t.name}</div>
                        <div style={descStyle}>{t.company} • Monthly</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={{
                            fontWeight: 600,
                            fontSize: 15,
                            minWidth: 80,
                            textAlign: "right", color: t.color
                        }}>{t.price}</div>
                        <div>
                            <span
                                style={{
                                    backgroundColor: t.tag.color,
                                    color: t.tag.textColor,
                                    fontSize: 11,
                                    fontWeight: 500,
                                    borderRadius: 8,
                                    padding: "2px 8px",
                                    marginTop: 4,
                                    display: "inline-block",
                                }}
                            >
                                {t.tag.label}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecurringTransactions;
