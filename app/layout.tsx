import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/lib/supabase/auth-context";

export const metadata: Metadata = {
  title: "ResumeForge — AI-Powered Resume Optimization",
  description: "Transform your resume with AI-powered optimization. 7-stage pipeline with anti-hallucination, ATS scoring, and ATS-safe PDF/DOCX export.",
  keywords: ["resume", "AI resume", "ATS optimization", "cover letter", "job application", "resume builder"],
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "ResumeForge — AI-Powered Resume Optimization",
    description: "Transform your resume with a 7-stage AI pipeline. Anti-hallucination enforcement, ATS scoring, and ATS-safe export.",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://resumeforge.com",
    siteName: "ResumeForge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeForge — AI-Powered Resume Optimization",
    description: "Transform your resume with a 7-stage AI pipeline. Anti-hallucination enforcement, ATS scoring, and ATS-safe export.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#111111",
              border: "1px solid #1f1f1f",
              color: "#fafafa",
              fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
