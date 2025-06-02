"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Checkbox, Progress, List, Badge, Calendar } from "antd";
import axios from "axios";
import moment, { Moment } from "moment";
import CalendarStepOne from "../../../pages/calendar/stepOne";
import CalendarStepTwo from "../../../pages/calendar/stepTwo";
import CalendarStepThree from "../../../pages/calendar/stepThree";
import CalendarStepFour from "../../../pages/calendar/stepFour";
import CalendarDashboard from "../../../pages/calendar/calendarDashboard";

interface ToDoItem {
  task: string;
  priority: "High" | "Medium" | "Low";
  done: boolean;
}

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

const Dashboard: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>();
  const [selectedOptions, setSelectedOptions] = useState<{
    calendarEvents: boolean;
    reminders: boolean;
    recurringEvents: boolean;
  }>({
    calendarEvents: true,
    reminders: true,
    recurringEvents: true,
  });
  const [connectedCalendars, setConnectedCalendars] = useState<string[]>([]);
  console.log("🚀 ~ connectedCalendars:", connectedCalendars);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const calendarUser = localStorage.getItem("user");
    setUser(calendarUser);
    if (calendarUser) {
      setStep(4);
      localStorage.setItem("calendar", "1");
    }
  }, [user]);

  const router = useRouter();

  useEffect(() => {
    const username = localStorage.getItem("username") || "";
    if (localStorage.getItem("calendar") === null) {
      router.push(`/${username}/calendar/setup`);
    }
  }, []);

  const handlePin = () => {
    alert("Pinned to dashboard!");
  };

  const handleConnectMore = () => {
    setStep(1);
    setSelectedCalendars([]);
  };

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => setStep(5), 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div
      style={{
        padding: "24px",
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        margin: "70px 50px",
      }}
    >
      {step === 1 && (
        <CalendarStepOne
          setStep={setStep}
          selectedCalendars={selectedCalendars}
          setSelectedCalendars={setSelectedCalendars}
        />
      )}
      {step === 2 && (
        <CalendarStepTwo
          selectedCalendars={selectedCalendars}
          setSelectedOptions={setSelectedOptions}
          selectedOptions={selectedOptions}
          setStep={setStep}
        />
      )}
      {step === 3 && (
        <CalendarStepThree
          setStep={setStep}
          setConnectedCalendars={setConnectedCalendars}
          selectedCalendars={selectedCalendars}
        />
      )}
      {step === 4 && <CalendarStepFour selectedCalendars={selectedCalendars} />}
      {step === 5 && (
        <CalendarDashboard handleConnectMore={handleConnectMore} />
      )}
    </div>
  );
};

export default Dashboard;
