
import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { StateProvider } from "./lib/state";
import AppClient from "./components/AppClient";

export const metadata: Metadata = {
  title: "Legally Legit AI | Intelligent Legal Safety, Simplified",
  description: "Protect your Australian small business with AI-powered legal tools. Generate contracts, get a free risk score & manage compliance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StateProvider>
          <AppClient>{children}</AppClient>
        </StateProvider>
      </body>
    </html>
  );
}