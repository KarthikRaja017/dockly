import React from "react";
import { Progress, Badge, Button } from "antd";

const GoalsCard = () => {
    const containerStyle = {
        background: "#fff",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        width: 360,
        fontFamily: "'Segoe UI', sans-serif",
        height: 735
    };

    const headerStyle = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        fontSize: 18,
        fontWeight: 600,
    };

    const goalStyle = {
        marginBottom: 28,
    };

    const labelStyle = {
        fontWeight: 600,
        fontSize: 16,
        marginBottom: 4,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    };

    const amountStyle = {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 14,
        marginTop: 4,
        color: "#444",
    };

    const statusBadge = {
        fontSize: 12,
        padding: "2px 8px",
        borderRadius: 8,
        fontWeight: 500,
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <span>Goals</span>
                <Button type="link" style={{ padding: 0, fontSize: 14 }}>
                    + Add Goal
                </Button>
            </div>

            {/* Emergency Fund */}
            <div style={goalStyle}>
                <div style={labelStyle}>
                    <span>Emergency Fund</span>
                    <span style={{ ...statusBadge, backgroundColor: "#E6F4FF", color: "#1677FF" }}>
                        Ongoing
                    </span>
                </div>
                <Progress percent={(18500 / 25000) * 100} strokeColor="#1677FF" showInfo={false} />
                <div style={amountStyle}>
                    <span>$18,500</span>
                    <span>$25,000</span>
                </div>
            </div>

            {/* Vacation Fund */}
            <div style={goalStyle}>
                <div style={labelStyle}>
                    <span>Vacation Fund</span>
                    <span style={{ ...statusBadge, backgroundColor: "#FFF3CD", color: "#C68A00" }}>
                        Jun 2025
                    </span>
                </div>
                <Progress percent={(1800 / 3000) * 100} strokeColor="#4A90E2" showInfo={false} />
                <div style={amountStyle}>
                    <span>$1,800</span>
                    <span>$3,000</span>
                </div>
            </div>

            {/* Student Loan */}
            <div style={{ ...goalStyle, marginBottom: 0 }}>
                <div style={labelStyle}>
                    <span>Student Loan</span>
                    <span style={{ ...statusBadge, backgroundColor: "#F8D7DA", color: "#A94442" }}>
                        Debt
                    </span>
                </div>
                <Progress percent={(8750 / (8750 + 16250)) * 100} strokeColor="#D9534F" showInfo={false} />
                <div style={amountStyle}>
                    <span>$8,750 paid</span>
                    <span>$16,250 remaining</span>
                </div>
            </div>
        </div>
    );
};

export default GoalsCard;
