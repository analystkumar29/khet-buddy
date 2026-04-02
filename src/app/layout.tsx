import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegistration } from "@/components/shared/ServiceWorkerRegistration";
import "./globals.css";

export const metadata: Metadata = {
  title: "खेत बडी — KhetBuddy",
  description:
    "Smart farming app for apple ber farmers. AI disease detection, irrigation management, mandi prices. स्मार्ट खेती, बेहतर कमाई।",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "खेत बडी",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#166534",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col safe-top safe-bottom">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
