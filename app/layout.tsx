import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavigationProvider } from "@/components/navigation-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LeadPilot AI — Production-Ready Multi-Tenant SaaS Platform",
  description: "AI-Powered Real Estate Lead Qualification & Follow-up Automation Platform",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavigationProvider>
          {children}
        </NavigationProvider>
      </body>
    </html>
  );
}
