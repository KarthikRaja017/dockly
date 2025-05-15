import React from "react";
import { DocklyLogo } from "../../app/comman";
import SignInForm from "../forms/signInForm";
import RootLayout from "../../app/layout";

const AuthLayout = (props: any) => {
  const { formComponent: FormComponent = SignInForm } = props;
  return (
    <>
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
    </>
  );
};
export default AuthLayout;
