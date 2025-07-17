// // import { PlusOutlined } from "@ant-design/icons";
// // import { Card, Avatar, Button, Tooltip, Typography } from "antd";
// // import { ArrowRightOutlined, BarChartOutlined } from "@ant-design/icons";
// // const { Title, Text } = Typography;

// // const AccountCard = (props: any) => {
// //   const { name, balance, id } = props;
// //   const initial = name?.charAt(0).toUpperCase() || "?";
// //   const shortId = id?.slice(-6) || "------";
// //   const isNegative = parseFloat(balance.current) < 0;

// //   return (
// //     <Card
// //       style={{
// //         borderRadius: 16,
// //         background: "#e6f4ff",
// //         boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
// //         marginBottom: 16,
// //         padding: 16,
// //       }}
// //       bodyStyle={{ padding: 0 }}
// //     >
// //       <div
// //         style={{
// //           display: "flex",
// //           alignItems: "center",
// //           justifyContent: "space-between",
// //         }}
// //       >
// //         <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
// //           <Avatar
// //             style={{
// //               backgroundColor: "#f5f5f5",
// //               color: "#555",
// //               fontWeight: "bold",
// //             }}
// //             size="large"
// //           >
// //             {initial}
// //           </Avatar>
// //           <div>
// //             <div style={{ fontWeight: 600 }}>{name}</div>
// //             <div style={{ color: isNegative ? "#ff4d4f" : "#111" }}>
// //               $
// //               {parseFloat(balance.current).toLocaleString(undefined, {
// //                 minimumFractionDigits: 2,
// //               })}
// //             </div>
// //             <div style={{ color: "#999" }}>••••{shortId}</div>
// //           </div>
// //         </div>

// //         <div style={{ display: "flex", gap: 8 }}>
// //           <Tooltip title="Transfer">
// //             <Button shape="circle" icon={<ArrowRightOutlined />} />
// //           </Tooltip>
// //           <Tooltip title="Analytics">
// //             <Button shape="circle" icon={<BarChartOutlined />} />
// //           </Tooltip>
// //         </div>
// //       </div>
// //     </Card>
// //   );
// // };

// // const AccountsList = (props: any) => {
// //   const { accountDetails } = props;

// //   return (
// //     <Card
// //       title="🏦 Accounts"
// //       extra={<Button shape="circle" icon={<PlusOutlined />} />}
// //       style={{
// //         borderRadius: 16,
// //         boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
// //         background: "#ffffff",
// //         maxWidth: 1500,
// //       }}
// //     >
// //       {(accountDetails ?? []).map((acct: any, idx: any) => (
// //         <AccountCard key={idx} {...acct} />
// //       ))}

// //       <Button
// //         type="dashed"
// //         icon={<PlusOutlined />}
// //         block
// //         style={{ marginTop: 16, borderRadius: 8 }}
// //       >
// //         Add Account
// //       </Button>
// //     </Card>
// //   );
// // };

// // export default AccountsList;


// // import React from 'react';
// // import { Card, Typography, Row, Col, Avatar, Divider } from 'antd';

// // const { Title, Text } = Typography;

// // const accountsData = {
// //   netWorth: 47543.87,
// //   assets: 72543.87,
// //   liabilities: 25000.0,
// //   cashFlow: -506.55,
// //   sections: [
// //     {
// //       title: 'Cash Accounts',
// //       total: 12543.87,
// //       items: [
// //         { name: 'Chase Checking', type: 'Checking Account', value: 4856.23, color: '#3b82f6' },
// //         { name: 'Chase Savings', type: 'Savings Account', value: 7687.64, color: '#3b82f6' },
// //       ],
// //     },
// //     {
// //       title: 'Credit Cards',
// //       total: -3250.0,
// //       items: [
// //         { name: 'Visa Card', type: 'Credit Card', value: -1414.58, color: '#1e40af' },
// //         { name: 'Amex Card', type: 'Credit Card', value: -1835.42, color: '#059669' },
// //       ],
// //     },
// //     {
// //       title: 'Investments',
// //       total: 60000.0,
// //       items: [
// //         { name: 'Fidelity 401(k)', type: 'Retirement', value: 42350.0, color: '#8b5cf6' },
// //         { name: 'Vanguard IRA', type: 'Retirement', value: 17650.0, color: '#0ea5e9' },
// //       ],
// //     },
// //     {
// //       title: 'Loans',
// //       total: -21750.0,
// //       items: [
// //         { name: 'Student Loan', type: 'Sallie Mae', value: -16250.0, color: '#ef4444' },
// //         { name: 'Auto Loan', type: 'Toyota Financial', value: -5500.0, color: '#f97316' },
// //       ],
// //     },
// //   ],
// // };

// // const AccountsOverview = () => {
// //   const formatCurrency = (amount: number) =>
// //     `${amount < 0 ? '-' : ''}$${Math.abs(amount).toLocaleString(undefined, {
// //       minimumFractionDigits: 2,
// //     })}`;

// //   return (
// //     <Card
// //       style={{
// //         borderRadius: 16,
// //         boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
// //         padding: 24,
// //         margin: 24,
// //       }}
// //       bodyStyle={{ padding: 0 }}
// //     >
// //       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
// //         <Title level={4} style={{ margin: 0 }}>
// //           Accounts & Net Worth
// //         </Title>
// //         <Text style={{ color: '#3b82f6', cursor: 'pointer' }}>Manage Accounts</Text>
// //       </div>

// //       {/* Net Summary */}
// //       <Row
// //         gutter={24}
// //         style={{
// //           background: '#f9fafb',
// //           borderRadius: 12,
// //           padding: '24px 16px',
// //           marginBottom: 32,
// //         }}
// //       >
// //         <Col span={6}>
// //           <Text type="secondary">Net Worth</Text>
// //           <Title level={3} style={{ color: '#22c55e' }}>
// //             {formatCurrency(accountsData.netWorth)}
// //           </Title>
// //         </Col>
// //         <Col span={6}>
// //           <Text type="secondary">Total Assets</Text>
// //           <Title level={3}>{formatCurrency(accountsData.assets)}</Title>
// //         </Col>
// //         <Col span={6}>
// //           <Text type="secondary">Total Liabilities</Text>
// //           <Title level={3} style={{ color: '#ef4444' }}>
// //             {formatCurrency(accountsData.liabilities)}
// //           </Title>
// //         </Col>
// //         <Col span={6}>
// //           <Text type="secondary">Monthly Cash Flow</Text>
// //           <Title level={3} style={{ color: '#ef4444' }}>
// //             {formatCurrency(accountsData.cashFlow)}
// //           </Title>
// //         </Col>
// //       </Row>

// //       {/* Account Sections */}
// //       <Row gutter={[24, 24]}>
// //         {accountsData.sections.map((section, index) => (
// //           <Col span={12} key={index}>
// //             <Card
// //               title={section.title}
// //               extra={
// //                 <Text
// //                   style={{
// //                     color: section.total >= 0 ? '#111827' : '#ef4444',
// //                     fontWeight: 500,
// //                   }}
// //                 >
// //                   {formatCurrency(section.total)}
// //                 </Text>
// //               }
// //               style={{
// //                 borderRadius: 12,
// //                 background: '#ffffff',
// //               }}
// //               bodyStyle={{ padding: 0 }}
// //             >
// //               {section.items.map((item, idx) => (
// //                 <div
// //                   key={idx}
// //                   style={{
// //                     display: 'flex',
// //                     justifyContent: 'space-between',
// //                     alignItems: 'center',
// //                     padding: '12px 16px',
// //                     borderBottom:
// //                       idx !== section.items.length - 1 ? '1px solid #f3f4f6' : 'none',
// //                   }}
// //                 >
// //                   <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
// //                     <Avatar
// //                       style={{
// //                         backgroundColor: item.color,
// //                         fontWeight: 600,
// //                       }}
// //                     >
// //                       {item.name.charAt(0)}
// //                     </Avatar>
// //                     <div>
// //                       <Text style={{ fontWeight: 500 }}>{item.name}</Text>
// //                       <br />
// //                       <Text type="secondary" style={{ fontSize: 12 }}>
// //                         {item.type}
// //                       </Text>
// //                     </div>
// //                   </div>
// //                   <div>
// //                     <Text
// //                       strong
// //                       style={{
// //                         color: item.value < 0 ? '#ef4444' : '#111827',
// //                       }}
// //                     >
// //                       {formatCurrency(item.value)}
// //                     </Text>
// //                   </div>
// //                 </div>
// //               ))}
// //             </Card>
// //           </Col>
// //         ))}
// //       </Row>
// //     </Card>
// //   );
// // };

// // export default AccountsOverview;




// import React, { useEffect, useState } from 'react';
// import { Card, Typography, Row, Col, Avatar } from 'antd';
// import { getAccounts, getExpenseIncome } from '../../services/apiConfig';

// const { Title, Text } = Typography;

// const AccountsOverview = () => {
//   const [sections, setSections] = useState<any[]>([]);
//   const [netWorth, setNetWorth] = useState<number>(0);
//   const [assets, setAssets] = useState<number>(0);
//   const [liabilities, setLiabilities] = useState<number>(0);
//   const [cashFlow, setCashFlow] = useState<number>(0);
//   console.log("🚀 ~ AccountsOverview ~ cashFlow:", cashFlow)

//   const formatCurrency = (amount: number) =>
//     `${amount < 0 ? '-' : ''}$${Math.abs(amount).toLocaleString(undefined, {
//       minimumFractionDigits: 2,
//     })}`;

//   useEffect(() => {
//     const fetchAccounts = async () => {
//       try {
//         const res = await getAccounts({});
//         const { payload } = res.data;
//         setNetWorth(payload.total_balance || 0);
//         setAssets(payload.assets || 0);
//         setLiabilities(payload.liabilities || 0);
//         // setCashFlow(payload.negative_balance || 0);
//         setSections(payload.sections || []);

//       } catch (err) {
//         console.error('Error fetching account data', err);
//       }
//     };
//     fetchAccounts();
//   }, []);
//   useEffect(() => {
//     const fetchIncomeExpense = async () => {
//       try {
//         const response = await getExpenseIncome({});

//         if (response.expense_total !== undefined) {
//           setCashFlow(Number(response.expense_total));
//         }

//       } catch (error) {
//         console.error('Error fetching income and expense:', error);

//       }
//     };

//     fetchIncomeExpense();
//   }
//     , []);
//   return (
//     <Card style={{ borderRadius: 16, padding: 24, margin: 24 }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
//         <Title level={4}>Accounts & Net Worth</Title>
//         <Text style={{ color: '#3b82f6', cursor: 'pointer' }}>Manage Accounts</Text>
//       </div>

//       <Row
//         gutter={24}
//         style={{
//           background: '#f9fafb',
//           borderRadius: 12,
//           padding: '24px 16px',
//           marginBottom: 32,
//         }}
//       >
//         <Col span={6}>
//           <Text type="secondary">Net Worth</Text>
//           <Title level={3} style={{ color: '#22c55e' }}>{formatCurrency(netWorth)}</Title>
//         </Col>
//         <Col span={6}>
//           <Text type="secondary">Total Assets</Text>
//           <Title level={3}>{formatCurrency(assets)}</Title>
//         </Col>
//         <Col span={6}>
//           <Text type="secondary">Total Liabilities</Text>
//           <Title level={3} style={{ color: '#ef4444' }}>{formatCurrency(liabilities)}</Title>
//         </Col>
//         <Col span={6}>
//           <Text type="secondary">Monthly Cash Flow</Text>
//           <Title level={3} style={{ color: '#ef4444' }}>{formatCurrency(cashFlow)}</Title>
//         </Col>
//       </Row>

//       <Row gutter={[24, 24]}>
//         {sections.map((section, index) => (
//           <Col span={12} key={index}>
//             <Card
//               title={section.title}
//               extra={
//                 <Text
//                   style={{
//                     color: section.total >= 0 ? '#111827' : '#ef4444',
//                     fontWeight: 500,
//                   }}
//                 >
//                   {formatCurrency(section.total)}
//                 </Text>
//               }
//               style={{ borderRadius: 12, background: '#fff' }}
//               bodyStyle={{ padding: 0 }}
//             >
//               {section.items.map((item: any, idx: number) => (
//                 <div
//                   key={idx}
//                   style={{
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     alignItems: 'center',
//                     padding: '12px 16px',
//                     borderBottom:
//                       idx !== section.items.length - 1 ? '1px solid #f3f4f6' : 'none',
//                   }}
//                 >
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                     <Avatar style={{ backgroundColor: item.color }}>
//                       {item.name.charAt(0)}
//                     </Avatar>
//                     <div>
//                       <Text style={{ fontWeight: 500 }}>{item.name}</Text>
//                       <br />
//                       <Text type="secondary" style={{ fontSize: 12 }}>
//                         {item.type}
//                       </Text>
//                     </div>
//                   </div>
//                   <Text
//                     strong
//                     style={{
//                       color: item.value < 0 ? '#ef4444' : '#111827',
//                     }}
//                   >
//                     {formatCurrency(item.value)}
//                   </Text>
//                 </div>
//               ))}
//             </Card>
//           </Col>
//         ))}
//       </Row>
//     </Card>
//   );
// };

// export default AccountsOverview;


import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Avatar } from 'antd';
import { getAccounts, getExpenseIncome } from '../../services/apiConfig';
import { useRouter } from 'next/navigation';
const { Title, Text } = Typography;

const AccountsOverview = () => {
  const [sections, setSections] = useState<any[]>([]);
  const [netWorth, setNetWorth] = useState<number>(0);
  const [assets, setAssets] = useState<number>(0);
  const [liabilities, setLiabilities] = useState<number>(0);
  const [cashFlow, setCashFlow] = useState<number>(0);
  const router = useRouter();
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username') || '';
    setUsername(storedUsername);
  }, []);

  const formatCurrency = (amount: number) =>
    `${amount < 0 ? '-' : ''}$${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
    })}`;

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await getAccounts({});
        const { payload } = res.data;
        setNetWorth(payload.total_balance || 0);
        setAssets(payload.assets || 0);
        setLiabilities(payload.liabilities || 0);
        setSections(payload.sections || []);
      } catch (err) {
        console.error('Error fetching account data', err);
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    const fetchIncomeExpense = async () => {
      try {
        const response = await getExpenseIncome({});
        if (response.expense_total !== undefined) {
          setCashFlow(Number(response.expense_total));
        }
      } catch (error) {
        console.error('Error fetching income and expense:', error);
      }
    };
    fetchIncomeExpense();
  }, []);

  return (
    <Card style={{ borderRadius: 16, padding: 24, margin: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={4}>Accounts & Net Worth</Title>
        <Text
          style={{ color: '#3b82f6', cursor: 'pointer' }}
        // onClick={() => router.push(`/${username}/finance-hub/setup`)}
        >
          Manage Accounts
        </Text>
      </div>

      <Row
        gutter={24}
        style={{
          background: '#f9fafb',
          borderRadius: 12,
          padding: '24px 16px',
          marginBottom: 32,
        }}
      >
        <Col span={6}>
          <Text type="secondary">Net Worth</Text>
          <Title level={3} style={{ color: netWorth < 0 ? '#ef4444' : '#22c55e' }}>
            {formatCurrency(netWorth)}
          </Title>
        </Col>
        <Col span={6}>
          <Text type="secondary">Total Assets</Text>
          <Title level={3}>{formatCurrency(assets)}</Title>
        </Col>
        <Col span={6}>
          <Text type="secondary">Total Liabilities</Text>
          <Title level={3} style={{ color: '#ef4444' }}>
            {formatCurrency(liabilities)}
          </Title>
        </Col>
        <Col span={6}>
          <Text type="secondary">Monthly Cash Flow</Text>
          <Title level={3} style={{ color: cashFlow < 0 ? '#ef4444' : '#111827' }}>
            {formatCurrency(cashFlow)}
          </Title>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {sections.map((section, index) => (
          <Col span={12} key={index}>
            <Card
              title={section.title}
              extra={
                <Text
                  style={{
                    color: section.total >= 0 ? '#22c55e' : '#ef4444',
                    fontWeight: 500,
                  }}
                >
                  {formatCurrency(section.total)}
                </Text>
              }
              style={{ borderRadius: 12, background: '#fff' }}
              bodyStyle={{ padding: 0 }}
            >
              {section.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom:
                      idx !== section.items.length - 1 ? '1px solid #f3f4f6' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar style={{ backgroundColor: item.color }}>
                      {item.name.charAt(0)}
                    </Avatar>
                    <div>
                      <Text style={{ fontWeight: 500 }}>{item.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.type}
                      </Text>
                    </div>
                  </div>
                  <Text
                    strong
                    style={{
                      color: item.value < 0 ? '#ef4444' : '#111827',
                    }}
                  >
                    {formatCurrency(item.value)}
                  </Text>
                </div>
              ))}
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default AccountsOverview;
