import React from "react";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "DevClash | AI Autonomous Blockchain Platform",
  description: "Experience the next generation of autonomous blockchain agents with DevClash. Secure, efficient, and intelligent.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
