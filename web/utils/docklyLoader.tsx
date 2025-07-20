'use client';
import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { PRIMARY_COLOR } from "../app/comman";
import { useGlobalLoading } from "../app/loadingContext";

const DocklyLoader = (props: any) => {
  const { loading } = useGlobalLoading();

  return loading ? (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        backgroundColor: "#ffffff", // <- white background
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
  ) : null;
};

export default DocklyLoader;
