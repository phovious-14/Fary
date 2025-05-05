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
  version: "next",
  imageUrl: "https://dtech.vision/frame-thumbnail.png",
  button: {
    title: "Learn Farcaster",
    action: {
      type: "launch_frame",
      name: "dTech - Farcaster Boutique",
      url: "https://dtech.vision/farcaster/",
      splashImageUrl: "https://dtech.vision/icon.png",
      splashBackgroundColor: "#f7f7f7",
    },
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
