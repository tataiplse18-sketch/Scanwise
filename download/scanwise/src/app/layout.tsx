import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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
  openGraph: {
    title: "ScanWise - AI Food Scanner",
    description:
      "Scan any food barcode and know what you're really eating",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-dark-900 text-dark-50`}
      >
        {children}
      </body>
    </html>
  );
}
