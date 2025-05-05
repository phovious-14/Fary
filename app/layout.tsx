import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import { CursorProvider } from "@/contexts/cursor-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "../provider/config";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

// Farcaster frame configuration
const frame = {
  version: "vNext",
  image: "https://fary-story.netlify.app/og.png",
  buttons: [
    {
      label: "📸 View Story",
      action: "link",
      target: "https://fary-story.netlify.app/",
    },
  ],
  post_url: "https://fary-story.netlify.app/api/frame",
  input: {
    text: "Enter your story text",
  },
};

export const metadata: Metadata = {
  title: "StoryGram - Instagram-like Stories App",
  description: "Create and share stories with text and filters",
  generator: "v0.dev",
  other: {
    "fc:frame": JSON.stringify(frame),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <head>
        <meta name="fc:frame" content={JSON.stringify(frame)} />
      </head>
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        <Providers>
          <div className="flex justify-center items-center min-h-screen">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
