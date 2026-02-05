import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import AuthenticatedOverlays from "@/components/AuthenticatedOverlays";

export const metadata: Metadata = {
  title: "CAT Mock Test Platform",
  description: "Practice CAT exams with adaptive testing and instant results",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <AuthenticatedOverlays />
      </body>
    </html>
  );
}
