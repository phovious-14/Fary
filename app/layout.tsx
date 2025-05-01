import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CursorProvider } from "@/contexts/cursor-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StoryGram - Instagram-like Stories App",
  description: "Create and share stories with text and filters",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        <CursorProvider>
          <div className="flex justify-center items-center min-h-screen">
            {children}
          </div>
        </CursorProvider>
      </body>
    </html>
  );
}
