"use client";
import { useEffect, useState } from "react";
import {
  Steps,
  Card,
  Input,
  Button,
  Typography,
  Divider,
  Result,
  Descriptions,
  message,
} from "antd";
import Link from "next/link";
import { bankSignin, bankSignup } from "../services/apiConfig";
import {
  ConnectorSDKCallbackMetadata,
  QuilttButton,
  useQuilttSession,
} from "@quiltt/react";
import { Account } from "../../src/generated/graphql";
import { gql, useQuery } from "@apollo/client";
import { AxiosResponse } from "axios";
const { Title, Text } = Typography;

const QUERY = gql`
  query Query {
    accounts {
      id
      name
      balance {
        current
      }
    }
  }
`;
interface LoginResponse {
  token: string;
  userId: number;
  expiresAt: string;
}
export default function BankConnectFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  console.log("🚀 ~ BankConnectFlow ~ currentStep:", currentStep);
  const [profileId, setProfileId] = useState("");
  const [emailId, setEmailId] = useState("");
  const [isNewAccount, setIsNewAccount] = useState(false);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [connectionId, setConnectionId] = useState<string>();
  //   const { data, loading } = useQuery(QUERY);
  const { session } = useQuilttSession();
  //   if (!session) {
  //     return null; // or a loading indicator
  //   }

  //   const { accounts } = data || {};
  //   useEffect(() => {
  //     setBankDetails(accounts);
  //   }, [accounts]);
  const { importSession } = useQuilttSession();

  const handleEmailSubmit = async () => {
    if (!emailId) {
      message.error("Please enter a valid Profile ID");
      return;
    }
    const response = await bankSignup({
      email: emailId,
    });
    // if (!response) {
    //   console.log("🚀 ~ handleEmailSubmit ~ response:", response)
    //   const errorData = await response;
    //   throw new Error(errorData || "Signup failed");
    // }

    const { token, userId, expiresAt } = response.data[0]  || {};
    console.log(
      "🚀 ~ handleEmailSubmit ~ token:",
      token,
      "userId:",
      userId,
      "expiresAt:",
      expiresAt
    );
    importSession(token);

    console.log("New user created:", userId);
    console.log("Session expires at:", expiresAt);
    setCurrentStep(1);
  };

  const handleProfileSubmit = async () => {
    if (!profileId) {
      message.error("Please enter a valid Profile ID");
      return;
    }
    const response = await bankSignin({ profileId: profileId });
    console.log("🚀 ~ handleProfileSubmit ~ response:", response)
    if (!response) {
      const errorData = await response;
      throw new Error(errorData || "Signup failed");
    }

    const { token, userId, expiresAt } = response.data[0] || {};
console.log("🚀 ~ handleEmailSubmit ~ token:", token, "userId:", userId, "expiresAt:", expiresAt);
    importSession(token);

    console.log("New user created:", userId);
    console.log("Session expires at:", expiresAt);
    setCurrentStep(1);
  };

  const handleConnectBank = async () => {
    // Simulate Quiltt Connect and fetch bank data
    try {
      // Normally here you trigger Quiltt Connect and get the data
      const mockBankDetails = {
        bankName: "MX Bank",
        accountNumber: "1234567890",
        balance: "$5000",
        accountType: "Checking",
      };
      setBankDetails(mockBankDetails);
      setCurrentStep(2);
    } catch (error) {
      message.error("Connection failed");
    }
  };
  const handleExitSuccess = (metadata: ConnectorSDKCallbackMetadata) => {
    setConnectionId(metadata?.connectionId);
    handleConnectBank();
    console.log("Successfully connected:", metadata.connectionId);
  };
  return (
    <div style={{ padding: 40, background: "#f0f2f5", minHeight: "100vh" }}>
      <Card
        style={{
          maxWidth: 600,
          margin: "0 auto",
          borderRadius: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Steps
          current={currentStep}
          style={{ marginBottom: 40 }}
          items={[
            { title: "Profile" },
            { title: "Connect Bank" },
            { title: "Bank Details" },
          ]}
        />

        {currentStep === 0 && !isNewAccount && (
          <div style={{ textAlign: "center" }}>
            <Title level={3}>Enter Your Profile ID</Title>
            <Input
              placeholder="Enter Profile ID"
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              style={{
                marginTop: 20,
                marginBottom: 20,
                height: 50,
                borderRadius: 10,
                fontSize: 16,
              }}
            />
            <Button
              type="primary"
              size="large"
              onClick={handleProfileSubmit}
              style={{
                width: "100%",
                borderRadius: 10,
                background: "#1890ff",
              }}
            >
              Continue
            </Button>
            <p className="text-center">
              Don't have an account?{" "}
              <Link href="" onClick={() => setIsNewAccount(true)}>
                Sign up
              </Link>
            </p>
          </div>
        )}
        {currentStep === 0 && isNewAccount && (
          <div style={{ textAlign: "center" }}>
            <Title level={3}>Enter Your Email ID</Title>
            <Input
              placeholder="Enter Email ID"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              style={{
                marginTop: 20,
                marginBottom: 20,
                height: 50,
                borderRadius: 10,
                fontSize: 16,
              }}
            />
            <Button
              type="primary"
              size="large"
              onClick={handleEmailSubmit}
              style={{
                width: "100%",
                borderRadius: 10,
                background: "#1890ff",
              }}
            >
              Continue
            </Button>
            <p className="text-center">
              Already have an account?{" "}
              <Link href="" onClick={() => setIsNewAccount(false)}>
                Sign In
              </Link>
            </p>
          </div>
        )}

        {currentStep === 1 && (
          <div style={{ textAlign: "center" }}>
            <Result
              icon={
                <img
                  src="https://img.icons8.com/ios-filled/100/link--v1.png"
                  width={80}
                  alt="connect"
                />
              }
              title="Ready to Connect!"
              subTitle="Click the button below to connect your bank using Quiltt."
              extra={
                <QuilttButton
                  connectorId={'lc9h19r4no'}
                  onExitSuccess={handleExitSuccess}
                  style={{
                    marginTop: 20,
                    borderRadius: 10,
                    background: "#52c41a",
                    padding: "20px",
                    cursor: "pointer",
                  }}
                >
                  Connect Account
                </QuilttButton>
              }
            />
          </div>
        )}

        {currentStep === 2 && bankDetails && (
          <div>
            <Title level={3} style={{ textAlign: "center" }}>
              Your Bank Details
            </Title>
            <Divider />
            <Descriptions
              bordered
              column={1}
              size="middle"
              style={{
                background: "#fafafa",
                borderRadius: 10,
                padding: 20,
              }}
            >
              <Descriptions.Item label="Bank Name">
                {bankDetails.bankName}
              </Descriptions.Item>
              <Descriptions.Item label="Account Number">
                {bankDetails.accountNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Balance">
                {bankDetails.balance}
              </Descriptions.Item>
              <Descriptions.Item label="Account Type">
                {bankDetails.accountType}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            {/* <Button
              type="default"
              block
              size="large"
              onClick={() => window.location.reload()}
              style={{
                borderRadius: 10,
                marginTop: 20,
              }}
            >
              Start Again
            </Button> */}
          </div>
        )}
      </Card>
    </div>
  );
}
