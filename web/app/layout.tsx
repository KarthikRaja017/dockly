import AuthProvider from "./components/authProvider";

export const metadata = {
  title: 'Dockly',
  description: 'A simple and elegant way to manage your containers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider> 
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
