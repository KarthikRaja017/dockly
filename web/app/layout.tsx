// ✅ No "use client" here or in anything it imports
export const metadata = {
  title: "Dockly",
  description: "A simple and elegant way to manage your containers",
  icons: {
    icon: "/logoWhite.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
