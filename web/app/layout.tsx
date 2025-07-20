import AuthProvider from "../pages/components/authProvider";
import DocklyLoader from "../utils/docklyLoader";
import { LoadingProvider } from "./loadingContext";

export const metadata = {
  title: "Dockly",
  description: "A simple and elegant way to manage your containers",
  icons: {
    icon: "/dockly-header.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LoadingProvider>
          <DocklyLoader />
          <AuthProvider>
            {children}
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}