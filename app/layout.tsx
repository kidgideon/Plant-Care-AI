import "./globals.css"; 
import { ReactNode } from "react";
import Head from "next/head";
import { Toaster } from "sonner"; // import toaster

export const metadata = {
  title: "PlantSight - Signup",
  description: "Signup to PlantSight to start monitoring your plants",
};

interface SignupLayoutProps {
  children: ReactNode;
}

export default function SignupLayout({ children }: SignupLayoutProps) {
  return (
    <>
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="icon" type="image/png" href="/logo.png" />
      </Head>

      {/* Toaster for showing toast messages */}
      <Toaster position="top-right" />

      <main style={{ width: "100%", height: "100vh" }}>
        {children}
      </main>
    </>
  );
}
