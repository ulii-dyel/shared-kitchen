import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import CalendarWrapper from "@/components/calendar/CalendarWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Shared Kitchen",
  description: "Collaborative meal planning for couples - Plan meals, manage recipes, and shop together",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Shared Kitchen",
  },
  openGraph: {
    title: "The Shared Kitchen",
    description: "Collaborative meal planning for couples",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#e94560",
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
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <CalendarWrapper>
          <AppShell>
            {children}
          </AppShell>
        </CalendarWrapper>
      </body>
    </html>
  );
}
