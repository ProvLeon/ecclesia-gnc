import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ToastContainer } from "@/components/Toast/ToastContainer";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SkipLink } from "@/components/SkipLink";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ecclesia GNC",
  description: "Good News Center - Church Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SkipLink />
        <ErrorBoundary>
          <NotificationProvider>
            {children}
            <ToastContainer />
            <Toaster />
          </NotificationProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
