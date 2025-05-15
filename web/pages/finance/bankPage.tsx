"use client";
import FinanceTabs from "./organizer";
import AuthProvider from "../components/authProvider";

const BankPage = (props: any) => {
  const { bankDetails } = props;
  return <FinanceTabs bankDetails={bankDetails} />;
};

export default BankPage;
