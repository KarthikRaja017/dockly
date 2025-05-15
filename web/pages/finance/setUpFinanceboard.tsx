"use client";
import React, { useState } from "react";
import {
  Steps,
  Card,
  Typography,
  Alert,
  Avatar,
  Button,
  Checkbox,
  Col,
  Row,
  Divider,
} from "antd";
import { LockOutlined } from "@ant-design/icons";
import {
  ConnectorSDKCallbackMetadata,
  QuilttButton,
  useQuilttSession,
} from "@quiltt/react";
import { PRIMARY_COLOR } from "../../app/comman";
import { getBankAccount } from "../services/apiConfig";
import { useRouter } from "next/navigation";

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

const SetupFinanceBoard = () => {
  const [connectionId, setConnectionId] = useState<string>();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const accounts = bankDetails?.connections[0].accounts || [];

  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(
    accounts.filter((acc: any) => acc.checked).map((acc: any) => acc.id)
  );
  const { session } = useQuilttSession();

  const getUserBankAccount = async () => {
    const response = await getBankAccount({ session: session });
    const data = response?.data?.data;
    if (data) {
      console.log("🚀 ~ getUserBankAccount ~ response:", response);
      setBankDetails(data);
    }
  };

  const handleExitSuccess = (metadata: ConnectorSDKCallbackMetadata) => {
    setConnectionId(metadata?.connectionId);
    getUserBankAccount();
    setCurrentStep(2);
    console.log("Successfully connected:", metadata.connectionId);
  };

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "75px auto",
        padding: "0 20px",
      }}
    >
      <Title level={2} style={{ textAlign: "center" }}>
        Set Up Your Finance Board
      </Title>
      <Paragraph style={{ textAlign: "center", marginBottom: 50 }}>
        Connect your accounts, customize your board, and get insights into your
        financial health, all in one place.
      </Paragraph>

      <div style={{ overflowX: "auto", marginBottom: 40 }}>
        <Steps current={currentStep} style={{ minWidth: 600 }}>
          <Step title="Introduction" />
          <Step title="Connect Accounts" />
          <Step title="Select Accounts" />
          <Step title="Summary" />
          <Step title="Complete" />
        </Steps>
      </div>

      {currentStep === 1 && (
        <Card style={{ borderRadius: 12 }}>
          <Title level={4}>Connect Your Financial Accounts</Title>
          <Paragraph>
            Search for your bank or financial institution to securely connect
            your accounts.
          </Paragraph>

          <div style={{ marginTop: 30 }}>
            <Alert
              message={
                <span>
                  <LockOutlined style={{ marginRight: 8 }} />
                  <Text strong>Your data is secure</Text>
                </span>
              }
              description="We use bank-level encryption and never store your credentials. You can disconnect your accounts at any time."
              type="info"
              showIcon
              style={{ backgroundColor: "#f0faff", borderRadius: 8 }}
            />
          </div>
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
          >
            <QuilttButton
              connectorId={"lc9h19r4no"}
              onExitSuccess={handleExitSuccess}
              style={{
                marginTop: 20,
                borderRadius: 10,
                background: PRIMARY_COLOR,
                color: "#fff",
                padding: "20px",
                cursor: "pointer",
              }}
            >
              Connect Account
            </QuilttButton>
          </div>
        </Card>
      )}
      {currentStep === 2 && bankDetails && (
        <AccountSelection
          accounts={bankDetails?.connections[0].accounts}
          setCurrentStep={setCurrentStep}
          setSelectedAccounts={setSelectedAccounts}
          selectedAccounts={selectedAccounts}
        />
      )}
      {currentStep === 3 && bankDetails && (
        <ConnectedAccountsSummary
          setCurrentStep={setCurrentStep}
          selectedAccounts={selectedAccounts}
        />
      )}
      {currentStep === 4 && <FinanceBoardCompletedCard />}
    </div>
  );
};

export default SetupFinanceBoard;

// const AccountSelection = (props: any) => {
// const { accounts, setCurrentStep, setSelectedAccounts, selectedAccounts } =
//   props;

//   const handleCheckboxChange = (accountId: string, checked: boolean) => {
//     setSelectedAccounts((prev) =>
//       checked ? [...prev, accountId] : prev.filter((id) => id !== accountId)
//     );
//   };

//   const handleNext = () => {
//     console.log("Selected Account IDs: ", selectedAccounts);
// if (selectedAccounts.length !== 0) {
//   setCurrentStep(3);
// }
//     // You can now pass `selectedAccounts` to props, localStorage, Redux, etc.
//   };

//   return (
//     <div
//       style={{
//         maxWidth: 800,
//         margin: "75px auto",
//         padding: "0 20px",
//         background: "#fff",
//         borderRadius: 12,
//         boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//         paddingBottom: 40,
//       }}
//     >
//       <div style={{ padding: "40px 20px 10px" }}>
//         <Title level={4} style={{ marginBottom: 8 }}>
//           Select Accounts to Connect
//         </Title>
//         <Text type="secondary">
//           Choose which accounts you want to include in your Finance Board.
//         </Text>
//       </div>

//       <div style={{ padding: "0 20px" }}>
//         {accounts.map((acc: any, index: number) => (
//           <Card
//             key={index}
//             style={{
//               border: "1px solid #e5e5e5",
//               borderRadius: 12,
//               marginTop: 20,
//             }}
//           >
//             <Row align="middle" justify="space-between">
//               <Col>
//                 <Row align="middle" gutter={16}>
//                   <Col>
//                     <Checkbox
//                       checked={selectedAccounts.includes(acc.id)}
//                       onChange={(e) =>
//                         handleCheckboxChange(acc.id, e.target.checked)
//                       }
//                     />
//                   </Col>
//                   <Col>
//                     <Avatar
//                       style={{
//                         backgroundColor: "#1890ff",
//                         fontWeight: 600,
//                         verticalAlign: "middle",
//                       }}
//                       size="large"
//                     >
//                       {acc.name?.charAt(0).toUpperCase() || "C"}
//                     </Avatar>
//                   </Col>
//                   <Col>
//                     <div>
//                       <Text strong>{acc.name}</Text>
//                       <br />
//                       <Text type="secondary">••••{acc.id.slice(-4)}</Text>
//                     </div>
//                   </Col>
//                 </Row>
//               </Col>

//               <Col>
//                 <Text strong style={{ fontSize: 16 }}>
//                   {acc.balance?.available}
//                 </Text>
//               </Col>
//             </Row>
//           </Card>
//         ))}
//       </div>

//       <Row justify="space-between" style={{ marginTop: 40, padding: "0 20px" }}>
//         <Button onClick={() => setCurrentStep(1)}>Back</Button>
//         <Button
//           type="primary"
//           style={{ backgroundColor: "#0050ff" }}
//           onClick={handleNext}
//         >
//           Next
//         </Button>
//       </Row>
//     </div>
//   );
// };

const AccountSelection = (props: any) => {
  const { accounts, setCurrentStep, setSelectedAccounts, selectedAccounts } =
    props;

  // Toggle selection
  const handleCheckboxChange = (accountId: string, checked: boolean) => {
    setSelectedAccounts((prev: any) =>
      checked
        ? [...prev, accountId]
        : prev.filter((id: any) => id !== accountId)
    );
  };

  const handleNext = () => {
    const selected = accounts.filter((acc: any) =>
      selectedAccounts.includes(acc.id)
    );
    setSelectedAccounts(selected);
    if (selectedAccounts.length !== 0) {
      setCurrentStep(3);
    }
    console.log("Selected Accounts: ", selected); // or send to backend, etc.
  };

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "75px auto",
        padding: "0 20px",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        paddingBottom: 40,
      }}
    >
      <div style={{ padding: "40px 20px 10px" }}>
        <Title level={4} style={{ marginBottom: 8 }}>
          Select Accounts to Connect
        </Title>
        <Text type="secondary">
          Choose which accounts you want to include in your Finance Board.
        </Text>
      </div>

      <div style={{ padding: "0 20px" }}>
        {accounts.map((acc: any, index: number) => (
          <Card
            key={index}
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              marginTop: 20,
            }}
          >
            <Row align="middle" justify="space-between">
              <Col>
                <Row align="middle" gutter={16}>
                  <Col>
                    <Checkbox
                      checked={selectedAccounts.includes(acc.id)}
                      onChange={(e) =>
                        handleCheckboxChange(acc.id, e.target.checked)
                      }
                    />
                  </Col>
                  <Col>
                    <Avatar
                      style={{
                        backgroundColor: "#1890ff",
                        fontWeight: 600,
                        verticalAlign: "middle",
                      }}
                      size="large"
                    >
                      {acc.name?.charAt(0).toUpperCase() || "C"}
                    </Avatar>
                  </Col>
                  <Col>
                    <div>
                      <Text strong>{acc.name}</Text>
                      <br />
                      <Text type="secondary">••••{acc.id.slice(-4)}</Text>
                    </div>
                  </Col>
                </Row>
              </Col>

              <Col>
                <Text strong style={{ fontSize: 16 }}>
                  {acc.balance?.available}
                </Text>
              </Col>
            </Row>
          </Card>
        ))}
      </div>

      <Row justify="space-between" style={{ marginTop: 40, padding: "0 20px" }}>
        <Button>Back</Button>
        <Button
          type="primary"
          style={{ backgroundColor: "#0050ff" }}
          onClick={handleNext}
        >
          Next
        </Button>
      </Row>
    </div>
  );
};

const ConnectedAccountsSummary = (props: any) => {
  const { selectedAccounts, setCurrentStep } = props;

  // Group accounts by provider name
  const groupedByProvider = selectedAccounts.reduce((acc: Record<string, any>, item: { provider?: string; name: string; id: string; balance: { current: number } }) => {
    const provider = item.provider || "Unknown Provider";
    if (!acc[provider]) {
      acc[provider] = {
        institution: provider,
        icon: provider[0]?.toUpperCase() || "P",
        accounts: [],
      };
    }

    acc[provider].accounts.push({
      type: item.name,
      number: item.id.slice(-4), // Use last 4 characters of account ID as number
      balance: item.balance.current,
    });

    return acc;
  }, {});

  const accountsData = Object.values(groupedByProvider);

  return (
    <Card
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        marginTop: 20,
        padding: 24,
      }}
    >
      <Title level={4}>Connected Accounts Summary</Title>
      <Text type="secondary">
        Review your connected accounts and add any additional accounts to
        complete your financial picture.
      </Text>

      <Card
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          marginTop: 20,
          background: "#fafafa",
        }}
      >
        <Title level={5}>Connected Accounts ({accountsData.length})</Title>
        {accountsData.map((item: any, index: number) => (
          <div key={index} style={{ marginBottom: 20 }}>
            <Row align="middle">
              <Avatar
          shape="square"
          size={36}
          style={{
            backgroundColor: "#1677ff",
            fontWeight: "bold",
            marginRight: 10,
          }}
              >
          {item.icon}
              </Avatar>
              <Title level={5} style={{ marginBottom: 0, marginTop: 0 }}>
          {item.institution}
              </Title>
            </Row>

            <div style={{ marginLeft: 46, marginTop: 10 }}>
              {item.accounts.map((acc: any, idx: number) => (
          <Row key={idx} justify="space-between">
            <Col>
              <Text>
                {acc.type} (••••{acc.number})
              </Text>
            </Col>
            <Col>
              <Text style={{ color: acc.balance < 0 ? "red" : "black" }}>
                {acc.balance < 0 ? "-" : ""}$
                {Math.abs(acc.balance).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
                })}
              </Text>
            </Col>
          </Row>
              ))}
            </div>
            {index !== accountsData.length - 1 && <Divider />}
          </div>
        ))}
      </Card>

      <Row justify="space-between" style={{ marginTop: 40, padding: "0 20px" }}>
        <Button onClick={() => setCurrentStep(2)}>Back</Button>
        <Button
          type="primary"
          style={{ backgroundColor: "#0050ff" }}
          onClick={() => setCurrentStep(4)}
        >
          Next
        </Button>
      </Row>
    </Card>
  );
};

const FinanceBoardCompletedCard = () => {
  const router = useRouter();
  const username = localStorage.getItem("username");

  return (
    <Card
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        marginTop: 20,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Title level={4}>Finance Board Setup</Title>
      <Text type="secondary">
        Your Finance Board has been successfully set up! You can now view and
        manage your financial accounts in one place.
      </Text>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button
          type="primary"
          style={{
            marginTop: 20,
            backgroundColor: PRIMARY_COLOR,
            padding: "20px",
          }}
          onClick={() => router.push(`/${username}/finance`)}
        >
          Go to Finance Board
        </Button>
      </div>
    </Card>
  );
};
