"use client";
import { useSearchParams } from "next/navigation";
import MainLayout from "../components/mainLayout";

export default function ThemePreviewPage() {
  const searchParams = useSearchParams();

  const primaryColor = searchParams.get("primaryColor") || "#1890ff";
  const activeTextColor = searchParams.get("activeTextColor") || "#000";
  const sidebarBg = searchParams.get("sidebarBg") || "#ffffff";

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <MainLayout>
        <h2 style={{ color: primaryColor, marginBottom: 12 }}>
          Welcome to Your Theme
        </h2>
        <p style={{ color: activeTextColor }}>
          This is how your theme will look inside the full layout.
        </p>
      </MainLayout>
    </div>
  );
}
