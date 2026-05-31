import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import InstallBanner from "@/components/InstallBanner";
import ToastContainer from "@/components/Toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ScanWise - AI Food Scanner",
  description:
    "Scan any food barcode and know what you're really eating. Get instant health scores, ingredient analysis, and AI-powered verdicts.",
  keywords: [
    "food scanner",
    "barcode scanner",
    "health score",
    "ingredient analysis",
    "nutrition facts",
    "AI food analysis",
  ],
  authors: [{ name: "ScanWise" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "ScanWise - AI Food Scanner",
    description:
      "Scan any food barcode and know what you're really eating",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ScanWise",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-dark-900 text-dark-50`}
      >
        {children}
        <ToastContainer />
        <InstallBanner />
      </body>
    </html>
  );
}
