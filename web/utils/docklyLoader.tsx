import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { PRIMARY_COLOR } from "../app/comman";

const DocklyLoader = (props: any) => {
  const { loading } = props;

  const gradientAnimation = {
    backgroundSize: "400% 400%",
    animation: "gradientFlow 15s ease infinite",
  };

  const styles = {
    keyframes: `
      @keyframes gradientFlow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.6; }
        100% { opacity: 1; }
      }
    `,
  };

  return (
    <>
      <style>{styles.keyframes}</style>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          color: "#fff",
          ...gradientAnimation,
        }}
      >
        <Spin
          indicator={
            <LoadingOutlined
              style={{ fontSize: 64, color: PRIMARY_COLOR }}
              spin
            />
          }
          size="large"
        />
      </div>
    </>
  );
};

export default DocklyLoader;
