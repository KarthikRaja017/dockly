'use client'
import { Input } from "antd";
import { useEffect, useRef, useState } from "react";

type ContentCategory = {
  label: { name: string; title: string };
  children: { name: string; title: string }[];
};

export const Hubs: ContentCategory[] = [
  {
    label: { name: 'home', title: 'Home' },
    children: [
      { name: 'property-info', title: 'Property Information' },
      { name: 'mortgage-loans', title: 'Mortgage & Loans' },
      { name: 'home-maintenance', title: 'Home Maintenance' },
      { name: 'utilities', title: 'Utilities' },
      { name: 'insurance', title: 'Insurance' },
    ],
  },
  {
    label: { name: 'finance', title: 'Finance' },
    children: [],
  },
  {
    label: { name: 'family', title: 'Family' },
    children: [
      { name: 'familyMembers', title: 'Family Members & Pets' },
      { name: 'familyCalendar', title: 'Family Calendar' },
      { name: 'upcomingActivities', title: 'Upcoming Activities' },
      { name: 'familyNotesLists', title: 'Family Notes & Lists' },
      { name: 'familyTasksProjects', title: 'Family Tasks & Projects' },
      { name: 'guardiansEmergencyInfo', title: 'Guardians & Emergency Info' },
      { name: 'importantContacts', title: 'Important Contacts' }
    ]
  },
  {
    label: { name: 'health', title: 'Health' },
    children: [
      { name: 'health-info', title: 'Health Information' },
      { name: 'medical-records', title: 'Medical Records' },
      { name: 'emergency-contacts', title: 'Emergency Contacts' },
    ],
  },
];

export const DocklyLogo = () => {
  return (
    <div
      style={{
        flex: 1.1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#007B8F",
      }}
    >
      <img
        src="/logo.png"
        alt="Dockly Logo"
        style={{
          maxWidth: "60%",
          height: "auto",
        }}
      />
    </div>
  );
};

export const PRIMARY_COLOR = "#0033FF";
export const ACTIVE_BG_COLOR = "#92D3F5";
export const ACTIVE_TEXT_COLOR = PRIMARY_COLOR;
export const DEFAULT_TEXT_COLOR = "#343434";
export const SIDEBAR_BG = "#f9fafa";

export const LowercaseInput = (props: any) => {
  const { value, onChange, onKeyDown, style = {}, ...restProps } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.toLowerCase();
    inputValue = inputValue.replace(/\s+/g, "_");
    onChange?.(inputValue);
  };

  return (
    <Input
      {...restProps}
      value={value}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      style={{
        ...style,
        caretColor: "#000",
      }}
    />
  );
};

export const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 4 && hour < 12) {
    return "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  } else if (hour >= 17 && hour < 21) {
    return "Good Evening";
  } else {
    return "Good Night";
  }
};

export const capitalizeEachWord = (text: string): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function cleanProfilePictureUrl(url: string): string {
  if (typeof url !== "string") return "";
  const index = url.indexOf("=");
  return index !== -1 ? url.substring(0, index) : url;
}


export const useIsHovered = () => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return [ref, isHovered] as const;
};
