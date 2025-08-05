// 'use client';
// import React from "react";
// import { Spin } from "antd";
// import { LoadingOutlined } from "@ant-design/icons";
// import { PRIMARY_COLOR } from "../app/comman";
// import { useGlobalLoading } from "../app/loadingContext";

// const DocklyLoader = (props: any) => {
//   const { loading } = useGlobalLoading();

//   return loading ? (
//     <div
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         height: "100vh",
//         width: "100vw",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         zIndex: 10000,
//         backgroundColor: "#ffffff", // <- white background
//       }}
//     >
//       <Spin
//         indicator={
//           <LoadingOutlined
//             style={{ fontSize: 64, color: PRIMARY_COLOR }}
//             spin
//           />
//         }
//         size="large"
//       />
//     </div>
//   ) : null;
// };

// export default DocklyLoader;
'use client';
import React, { useEffect } from "react";
import { useGlobalLoading } from "../app/loadingContext";

const LOADER_IMAGE_URL = "/dockly-logo.png";

const DocklyLoader = () => {
  const { loading } = useGlobalLoading();

  // Hide body scroll when loading
  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [loading]);

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
        backgroundColor: "#ffffff",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Logo */}
      <div className="logo-container">
        <img
          src={LOADER_IMAGE_URL}
          alt="Dockly Logo"
          className="logo-collapsed"
          style={{ width: 270, transition: "all 0.3s ease-in-out" }}
        />
      </div>

      {/* Loading text */}
      <div className="loading-text">
        <span>Loading</span>
        <div className="loading-dots-text">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      </div>

      <style jsx>{`
        .logo-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-collapsed {
          animation: logo-rotate 8s linear infinite;
        }

        .loading-text {
          display: flex;
          align-items: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 18px;
          font-weight: 500;
          color: #6b7280;
          letter-spacing: 0.5px;
          margin-top: -24px;
        }

        .loading-dots-text {
          display: flex;
          margin-left: 4px;
        }

        .loading-dots-text span {
          animation: textDots 1.5s ease-in-out infinite;
        }

        .loading-dots-text span:nth-child(1) {
          animation-delay: 0s;
        }

        .loading-dots-text span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .loading-dots-text span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes logo-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes textDots {
          0%, 20% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
          100% {
            opacity: 0.2;
            transform: scale(1);
          }
        }

        @media (max-width: 768px) {
          .logo-collapsed {
            width: 120px;
            height: 120px;
          }

          .loading-text {
            font-size: 16px;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        div[style*="position: fixed"] {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  ) : null;
};

export default DocklyLoader;

