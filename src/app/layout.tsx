import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { neobrutalism } from "@clerk/themes";
import 'clerk-themez/themes/whitegrain.css';
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "DocOCR.AI - Intelligent Document Analysis",
  description: "Transform your documents with AI-powered OCR and analysis. Extract insights, summarize content, and more.",
  keywords: "OCR, document analysis, AI, machine learning, text extraction",
  authors: [{ name: "Ali Hamza Kamboh", url: "https://alihamzakamboh.com" }],
  openGraph: {
    title: "DocOCR.AI - Intelligent Document Analysis",
    description: "Transform your documents with AI-powered OCR",
    url: "https://doc-ocr.ai",
    siteName: "DocOCR.AI",
    images: [
      {
        url: "https://doc-ocr.vercel.app/banner.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DocOCR.AI - Intelligent Document Analysis",
    description: "Transform your documents with AI-powered OCR and analysis.",
    images: ["https://doc-ocr.vercel.app/banner.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  themeColor: "#ffffff",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DocOCR.AI",
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: neobrutalism,
        variables: { colorPrimary: "#fa0053" },
      }}
    >
      <html lang="en">
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="DocOCR.AI" />
          <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
