import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import localFont from "next/font/local";
import "./globals.css";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      ><StackProvider app={stackServerApp}><StackTheme>
        {children}
      </StackTheme></StackProvider></body>
    </html>
  );
}
