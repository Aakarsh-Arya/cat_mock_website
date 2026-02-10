import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import "katex/dist/katex.min.css";
import AuthenticatedOverlays from "@/components/AuthenticatedOverlays";
import TopProgressBar from "@/components/TopProgressBar";

export const metadata: Metadata = {
  title: "NEXAMS",
  description: "Practice CAT exams with adaptive testing and instant results on NEXAMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        {children}
        <AuthenticatedOverlays />
      </body>
    </html>
  );
}
