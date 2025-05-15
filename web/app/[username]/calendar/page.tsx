"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ConnectCalendars = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedCalendar, setSelectedCalendar] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({
    calendarEvents: true,
    reminders: true,
    recurringEvents: true,
  });

  const calendarProviders = [
    "Google Calendar",
    "Apple Calendar",
    "Outlook Calendar",
    "Yahoo Calendar",
  ];

  const providerColors: { [key: string]: string } = {
    "Google Calendar": "#F3F4F6",
    "Apple Calendar": "#111827",
    "Outlook Calendar": "#2563EB",
    "Yahoo Calendar": "#8B5CF6",
  };

  const textColors: { [key: string]: string } = {
    "Google Calendar": "#DC2626",
    "Apple Calendar": "#FFFFFF",
    "Outlook Calendar": "#FFFFFF",
    "Yahoo Calendar": "#FFFFFF",
  };

  const handleCalendarSelect = (provider: string) => {
    setSelectedCalendar(provider);
  };

  const toggleOption = (option: keyof typeof selectedOptions) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleConnect = async () => {
    await new Promise((res) => setTimeout(res, 1000));
    setStep(4);
  };

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => {
        setStep(1);
        setSelectedCalendar("");
        setSelectedOptions({
          calendarEvents: true,
          reminders: true,
          recurringEvents: true,
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const containerStyle: React.CSSProperties = {
    padding: "24px",
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    margin: "80px 10px 10px 60px",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    // borderRadius: '15px',
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    padding: "24px",
    maxWidth: "600px",
    margin: "0 auto",
  };

  const buttonBase: React.CSSProperties = {
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    border: "none",
    cursor: "pointer",
  };

  const renderStep1 = () => (
    <div style={{ width: "100%" }}>
      <h2
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          color: "#2563eb",
          marginBottom: "4px",
        }}
      >
        Connect Calendars
      </h2>
      <p>
        Select the calendars you want to connect to Dockly. This helps organize
        all your events in one place
      </p>
      <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px" }}>
        Step 1 of 3
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {calendarProviders.map((provider) => {
          const isSelected = selectedCalendar === provider;
          return (
            <button
              key={provider}
              onClick={() => handleCalendarSelect(provider)}
              style={{
                borderRadius: "12px",
                padding: "16px",
                textAlign: "center",
                border: `1px solid ${isSelected ? "#2563eb" : "#d1d5db"}`,
                backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  margin: "0 auto 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "18px",
                  backgroundColor: providerColors[provider],
                  color: textColors[provider],
                }}
              >
                {provider[0]}
              </div>
              <div style={{ fontWeight: 500, color: "#111827" }}>
                {provider}
              </div>
              {isSelected && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#2563eb",
                    marginTop: "4px",
                  }}
                >
                  ✓ Selected
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div style={{ textAlign: "right" }}>
        <button
          onClick={() => setStep(2)}
          disabled={!selectedCalendar}
          style={{
            ...buttonBase,
            backgroundColor: selectedCalendar ? "#2563eb" : "#9ca3af",
            color: "#fff",
            cursor: selectedCalendar ? "pointer" : "not-allowed",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            margin: "0 auto 8px",
            backgroundColor: providerColors[selectedCalendar],
            color: textColors[selectedCalendar],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          {selectedCalendar[0]}
        </div>
        <h3 style={{ fontSize: "18px", fontWeight: "600" }}>
          {selectedCalendar}
        </h3>
        <p style={{ fontSize: "14px", color: "#6b7280" }}>
          Import options for {selectedCalendar}
        </p>
      </div>
      {[
        {
          key: "calendarEvents",
          label: "Calendar Events",
          desc: "Appointments, meetings, and events",
        },
        { key: "reminders", label: "Reminders", desc: "Tasks with deadlines" },
        {
          key: "recurringEvents",
          label: "Recurring Events",
          desc: "Weekly, monthly, or annual repeats",
        },
      ].map(({ key, label, desc }) => (
        <div
          key={key}
          onClick={() => toggleOption(key as keyof typeof selectedOptions)}
          style={{
            padding: "16px",
            borderRadius: "12px",
            border: `1px solid ${
              selectedOptions[key as keyof typeof selectedOptions]
                ? "#3b82f6"
                : "#d1d5db"
            }`,
            backgroundColor: selectedOptions[
              key as keyof typeof selectedOptions
            ]
              ? "#eff6ff"
              : "#ffffff",
            marginBottom: "12px",
            cursor: "pointer",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: "14px" }}>{label}</div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>{desc}</div>
        </div>
      ))}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "24px",
        }}
      >
        <button
          onClick={() => setStep(1)}
          style={{ ...buttonBase, background: "none", color: "#6b7280" }}
        >
          Back
        </button>
        <button
          onClick={() => setStep(3)}
          style={{ ...buttonBase, backgroundColor: "#2563eb", color: "#fff" }}
        >
          Next
        </button>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>
        Permissions
      </h3>
      <div
        style={{
          backgroundColor: "#f3f4f6",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #d1d5db",
          marginBottom: "12px",
        }}
      >
        <p style={{ fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>
          Sign in to authorize
        </p>
        <p style={{ fontSize: "12px", color: "#6b7280" }}>
          Allow Dockly access to {selectedCalendar}
        </p>
      </div>
      <ul
        style={{
          listStyle: "disc",
          backgroundColor: "#f3f4f6",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #d1d5db",
          fontSize: "14px",
          color: "#1f2937",
          marginBottom: "24px",
        }}
      >
        <li>Read calendar events and details</li>
        <li>Create new events and reminders</li>
        <li>Modify or delete events created by Dockly</li>
        <li style={{ color: "#ef4444", textDecoration: "line-through" }}>
          Can't delete non-Dockly events
        </li>
      </ul>
      {/* <ul>
        <li style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}> 
          Dockly syncs caledar dat securely and doesn't share your information withthird parties.You can disconnect calendars at any time.          </li>
      </ul> */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={() => setStep(2)}
          style={{ ...buttonBase, background: "none", color: "#6b7280" }}
        >
          Back
        </button>
        <button
          onClick={handleConnect}
          style={{ ...buttonBase, backgroundColor: "#2563eb", color: "#fff" }}
        >
          Connect
        </button>
      </div>
    </>
  );

  const renderStep4 = () => (
    <div
      style={{
        minHeight: "300px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "80px",
          height: "80px",
          backgroundColor: "#dcfce7",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          stroke="green"
          fill="none"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h3
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          color: "#111827",
          marginBottom: "4px",
        }}
      >
        Calendar Connected!
      </h3>
      <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
        Your calendars have been successfully connected to Dockly.
      </p>
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          backgroundColor: "#111827",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: "14px",
        }}
      >
        {selectedCalendar[0]}
      </div>
      {/* <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '12px' }}>Redirecting...</p> */}
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </div>
  );
};

export default ConnectCalendars;
