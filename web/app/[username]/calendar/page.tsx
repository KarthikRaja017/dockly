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
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#fff",
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
    <>
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
    </>
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
      <p style={{ fontSize: "14px", color: "#111827", marginBottom: "16px" }}>
        Dockly needs the following permissions to connect and sync your
        calendars.
      </p>
      <div
        style={{
          backgroundColor: "#f9fafb",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "2px solid #d1d5db",
          }}
        ></div>
        <p style={{ fontSize: "14px", color: "#111827" }}>
          <span style={{ fontWeight: 500 }}>
            You'll be redirected to sign in
          </span>
          <br />
          <span style={{ color: "#6b7280" }}>
            For each selected calendar, you'll need to sign in and authorize
            Dockly.
          </span>
        </p>
      </div>
      <div
        style={{
          backgroundColor: "#f9fafb",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          marginBottom: "16px",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#111827",
            marginBottom: "8px",
          }}
        >
          Dockly will be able to:
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              stroke="#22c55e"
              fill="none"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span style={{ fontSize: "14px", color: "#111827" }}>
              Read calendar events and details
            </span>
          </li>
          <li
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              stroke="#22c55e"
              fill="none"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span style={{ fontSize: "14px", color: "#111827" }}>
              Create new events and reminders in Dockly
            </span>
          </li>
          <li
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              stroke="#22c55e"
              fill="none"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span style={{ fontSize: "14px", color: "#111827" }}>
              Modify or delete events created by Dockly
            </span>
          </li>
          <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              stroke="#ef4444"
              fill="none"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span style={{ fontSize: "14px", color: "#111827" }}>
              Cannot modify or delete events created outside of Dockly
            </span>
          </li>
        </ul>
      </div>
      <div
        style={{
          backgroundColor: "#f9fafb",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          marginBottom: "24px",
        }}
      >
        <p style={{ fontSize: "14px", color: "#111827" }}>
          <span style={{ fontWeight: 500 }}>Data & Privacy</span>
          <br />
          <span style={{ color: "#6b7280" }}>
            Dockly syncs calendar data securely and doesn't share your
            information with third parties. You can disconnect calendars at any
            time.
          </span>
        </p>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={() => setStep(2)}
          style={{
            ...buttonBase,
            background: "none",
            color: "#6b7280",
            border: "1px solid #d1d5db",
          }}
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
    </div>
  );

  return (
    <div style={{ margin: "80px 10px 10px 60px" }}>
      <div style={containerStyle}>
        <div style={cardStyle}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>
      </div>
    </div>
  );
};

export default ConnectCalendars;
