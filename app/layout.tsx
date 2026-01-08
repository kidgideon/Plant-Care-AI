import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "sonner";

export const metadata = {
  title: "PlantSight - Signup",
  description: "Signup to PlantSight to start monitoring your plants",
  icons: {
    icon: "/logo.png",
  },
};

interface SignupLayoutProps {
  children: ReactNode;
}

export default function SignupLayout({ children }: SignupLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" />
        <main style={{ width: "100%", minHeight: "100vh" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
