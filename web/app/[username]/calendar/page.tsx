"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CalendarStepOne from "../../../pages/calendar/stepOne";
import CalendarStepTwo from "../../../pages/calendar/stepTwo";
import CalendarStepThree from "../../../pages/calendar/stepThree";
import CalendarStepFour from "../../../pages/calendar/stepFour";
import CalendarDashboard from "../../../pages/calendar/calendarDashboard";
import { getGoogleCalendarEvents } from "../../../services/google";
import DocklyLoader from "../../../utils/docklyLoader";

const Dashboard: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
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
    fetchEvents();
    const username = localStorage.getItem("username") || "";
    if (localStorage.getItem("calendar") === null) {
      router.push(`/${username}/calendar/setup`);
    }
  }, []);

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

  const fetchEvents = async () => {
    setLoading(true);
    const response = await getGoogleCalendarEvents({
    });
    const rawEvents = response.data.payload.events;
    if (rawEvents) {
      localStorage.setItem("calendar", "1");
      setStep(5);
    }
    setLoading(false);
  }

  if (loading) {
    return <DocklyLoader />
  }

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
