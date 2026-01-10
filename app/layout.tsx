import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import { Montserrat } from "next/font/google";

// Load Montserrat from Google Fonts
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // regular, medium, bold
  variable: "--font-primary",
});

export const metadata = {
  title: "PlantSight - An Intelligent System for Crop Health Monitoring and Disease Detection ",
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
    <html lang="en" className={montserrat.variable}>
      <body>
        <Toaster position="top-right" />
        <main style={{ width: "100%", minHeight: "100vh" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
