import React from "react";
import { DocklyLogo } from "../comman";
import SignInForm from "../forms/signInForm";
import RootLayout from "../layout";

const AuthLayout = (props: any) => {
  const { formComponent: FormComponent = SignInForm } = props;
  return (
    <RootLayout>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          height: "100%",
          width: "100%",
          backgroundColor: "#ffffff",
        }}
      >
        <DocklyLogo />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "20px",
            marginLeft: 20,
          }}
        >
          <FormComponent />
        </div>
      </div>
    </RootLayout>
  );
};
export default AuthLayout;
