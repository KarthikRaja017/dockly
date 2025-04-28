"use client";
import { QuilttButton } from "@quiltt/react";
import { useEffect, useState } from "react";
const AUTH_HEADER =
  "Basic YXBpXzEyempoOEI5VXh1ZHBiUnlvcDF1MzE6cWx0dF8wNGI5Y2ZjZTcyMzNhN2Q0NmQzOGYxMmQ0ZDUxZTRiMzQ5N2FhNWU0ZTRjMzkxNzQxZDNjN2RmMGQ3NzU4NzRiN2RkOGEwZjJk";
const ConnectButton = () => {
  const [bankDetails, setBankDetails] = useState(null);
  const [connectionId, setConnectionId] = useState("");
  console.log("🚀 ~ ConnectButton ~ connectionId:", connectionId)

  const fetchBankDetails = async (connectionId) => {
    try {
      // Make an API call to fetch bank details using the connectionId
      const response = await fetch(
        `https://api.quiltt.io/v1/connections/${connectionId}/bank-details`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${AUTH_HEADER}`, // Provide the correct AUTH_HEADER
            "Content-Type": "application/json",
          },
        }
      );

      console.log("🚀 ~ fetchBankDetails ~ response:", response)
      if (response.ok) {
        const data = await response.json();
        console.log("🚀 ~ fetchBankDetails ~ data:", data);
        setBankDetails(data); // Set the bank details in the state
      } else {
        console.error("Error fetching bank details", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching bank details", error);
    }
  };
  useEffect(() => {
    fetchBankDetails(connectionId);
  }, []);
  return (
    <div>
      <QuilttButton
        connectorId="lc9h19r4no"
        onExitSuccess={(metadata) => {
          console.log("Profile Created: ", metadata.connectionId);
          setConnectionId(metadata.connectionId);
          fetchBankDetails(metadata.connectionId); // Fetch bank details after profile creation
        }}
      >
        Connect
      </QuilttButton>

      {/* Display the bank details if they are available */}
      {bankDetails && (
        <div>
          <h3>Bank Details:</h3>
          <pre>{JSON.stringify(bankDetails, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ConnectButton;
