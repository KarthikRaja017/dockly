"use client";
import BankConnectFlow from "./bankConnectFlow";
import MainLayout from "../components/mainLayout";
// import { InMemoryCache, QuilttProvider } from "@quiltt/react";
// import { ApolloClient, ApolloProvider } from "@apollo/client";

// Apollo Client setup
// const client = new ApolloClient({
//   uri: "https://api.quiltt.io/v1/graphql",
//   cache: new InMemoryCache(),
//   headers: {
//     Authorization: `Bearer qltt_04b9cfce7233a7d46d38f12d4d51e4b3497aa5e4e4c391741d3c7df0d775874b7dd8a0f2d`,
//   },
// });

const BankPage = () => {
  return (
    <MainLayout>
      <BankConnectFlow />
    </MainLayout>
  );
};

export default BankPage;
