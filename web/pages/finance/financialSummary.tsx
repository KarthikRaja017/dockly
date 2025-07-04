// import React from 'react';
// import { Card, Typography } from 'antd';

// const { Title, Text } = Typography;

// const FinancialCard = ({
//     title,
//     value,
//     change,
//     changeColor,
//     note,
//     valueColor,
// }: {
//     title: string;
//     value: string;
//     change: string;
//     note: string;
//     changeColor: string;
//     valueColor: string;
// }) => {
//     return (
//         <Card
//             style={{
//                 borderRadius: '16px',
//                 boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
//                 marginBottom: '20px',
//                 padding: '20px',
//                 width: '350px'
//             }}
//             bodyStyle={{ padding: 0 }}
//         >
//             <div>
//                 <Text style={{ fontSize: '16px', fontWeight: 500, color: '#444' }}>{title}</Text>
//                 <Title
//                     level={2}
//                     style={{
//                         color: valueColor,
//                         margin: '10px 0 4px 0',
//                         fontWeight: 600,
//                     }}
//                 >
//                     {value}
//                 </Title>
//                 <Text style={{ color: changeColor, fontWeight: 500 }}>{change}</Text>
//                 <br />
//                 <Text style={{ color: '#999', fontSize: '13px' }}>{note}</Text>
//             </div>
//         </Card>
//     );
// };

// const FinancialSummary = () => {


//     return (
//         <div style={{ maxWidth: '200px', margin: 'auto' }}>
//             <FinancialCard
//                 title="Total Balance"
//                 value="$12,543.87"
//                 change="↑ 5.2% from last month"
//                 note=""
//                 valueColor="#1e1e1e"
//                 changeColor="#28c76f"
//             />
//             <FinancialCard
//                 title="Monthly Income"
//                 value="$1,649.45"
//                 change="↑ 100% Jun 2025"
//                 note=""
//                 valueColor="#28c76f"
//                 changeColor="#28c76f"
//             />
//             <FinancialCard
//                 title="Monthly Expenses"
//                 value="$2,156.00"
//                 change="↑ 100% Jun 2025"
//                 note=""
//                 valueColor="#ff4d4f"
//                 changeColor="#ff4d4f"
//             />
//         </div>
//     );
// };

// export default FinancialSummary;




import React, { useEffect, useState } from 'react';
import { Card, Typography } from 'antd';
import { getAccounts, getExpenseIncome, getTotalBalance } from '../../services/apiConfig';

const { Title, Text } = Typography;

type CardProps = {
    title: string;
    amount: string;
    change: string;
    note: string;
    changeColor: string;
    amountColor: string;
};

const FinancialCard = ({
    title,
    amount,
    change,
    note,
    changeColor,
    amountColor,
}: CardProps) => (
    <Card
        style={{
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            marginBottom: '20px',
            padding: '20px',
            width: '350px',
        }}
        bodyStyle={{ padding: 0 }}
    >
        <div>
            <Text style={{ fontSize: '16px', fontWeight: 500, color: '#444' }}>{title}</Text>
            <Title
                level={2}
                style={{
                    color: amountColor,
                    margin: '10px 0 4px 0',
                    fontWeight: 600,
                }}
            >
                {amount}
            </Title>
            <Text style={{ color: changeColor, fontWeight: 500 }}>{change}</Text>
            <br />
            <Text style={{ color: '#999', fontSize: '13px' }}>{note}</Text>
        </div>
    </Card>
);

const FinancialSummary: React.FC = () => {
    const [totalBalance, setTotalBalance] = useState<string>('Loading...');
    const [income_total, setIncome] = useState<string>('Loading...');
    // console.log("🚀 ~ income:", income_total)
    const [expense, setExpense] = useState<string>('Loading...');
    // console.log("🚀 ~ expense:", expense)


    useEffect(() => {
        const fetchAll = async () => {
            try {
                const accountRes = await getTotalBalance({});
                // const { status, payload } = accountRes.data;
                // console.log("🚀 ~ fetchAll ~ getTotalBalance:", getTotalBalance)
                if (accountRes?.total_balance !== undefined) {
                    setTotalBalance(`$${Number(accountRes.total_balance.toFixed(2))}`);
                }
                // else {
                //     setTotalBalance('Unavailable');
                // }
            } catch (error) {
                console.error('Error fetching total balance:', error);
                setTotalBalance('Error');
            }
        }


        fetchAll();
        // fetchIncomeExpense();
    }, []);


    useEffect(() => {
        const fetchIncomeExpense = async () => {
            try {
                const response = await getExpenseIncome({});
                // console.log("🚀 ~ fetchIncomeExpense ~ response:", response)
                // console.log("🚀 ~ fetchIncomeExpense ~ response.income_total:", response.income_total)
                // setIncome(`${response.income_total.toFixed(2)}`);
                // setExpense(`${response.expense_total.toFixed(2)}`);
                if (response.income_total !== undefined && response.expense_total !== undefined) {
                    setIncome(`$${Number(response.income_total).toFixed(2)}`);
                    setExpense(`$${Number(response.expense_total).toFixed(2)}`);
                }
                // const { status, payload } = response;
                // if (status && payload?.income_total !== undefined && payload.expense_total !== undefined) {
                //     console.log("🚀 ~ fetchIncomeExpense ~ setIncome:", setIncome)
                // } else {
                //     console.log("🚀 ~ fetchIncomeExpense ~ setExpense:", setExpense)
                //     setIncome('Unavailable');
                //     setExpense('Unavailable');
                // }
            } catch (error) {
                console.error('Error fetching income and expense:', error);

            }
        };

        fetchIncomeExpense();
    }
        , []);

    return (
        <div style={{ maxWidth: '400px', margin: 'auto' }}>
            <FinancialCard
                title="Total Balance"
                amount={totalBalance}
                change="↑ 5.2% from last month"
                note=""
                amountColor="#1e1e1e"
                changeColor="#28c76f"
            />

            <FinancialCard
                title="Monthly Income"
                amount={income_total}
                change="↑ 100% Jun 2025"
                note=""
                amountColor="#28c76f"
                changeColor="#28c76f"
            />
            <FinancialCard
                title="Monthly Expenses"
                amount={expense}
                change=" 100% Jun 2025"
                note=""
                amountColor="#ff4d4f"
                changeColor="#ff4d4f"
            />
        </div>
    );
};

export default FinancialSummary;
