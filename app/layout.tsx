import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
} from '@clerk/nextjs'
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RiseBar - Aplikasi Pemantau Gula Darah Modern",
  description: "RiseBar adalah aplikasi pemantau gula darah modern yang membantu Anda mengelola kesehatan dengan mudah dan akurat. Dilengkapi dengan fitur analisis data, pengingat, dan pemantauan real-time.",
  keywords: "Pemantau gula darah, aplikasi kesehatan, diabetes, monitoring kesehatan, RiseBar, gula darah, healthcare app",
  authors: [{ name: "RiseBar Team" }],
  creator: "RiseBar",
  publisher: "RiseBar",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://risebar.netlify.app",
    siteName: "RiseBar",
    title: "RiseBar - Aplikasi Pemantau Gula Darah Modern",
    description: "Pantau kesehatan Anda dengan mudah menggunakan RiseBar. Aplikasi modern untuk monitoring gula darah dengan fitur lengkap.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "RiseBar App Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RiseBar - Aplikasi Pemantau Gula Darah Modern",
    description: "Pantau kesehatan Anda dengan mudah menggunakan RiseBar. Aplikasi modern untuk monitoring gula darah.",
    images: ["/images/twitter-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="id">
      <head>
        <link rel="canonical" href="https://risebar.netlify.app" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#22c55e" />
        
        <meta name="application-name" content="RiseBar" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RiseBar" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
