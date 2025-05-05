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
  imageUrl:
    "https://indigo-obedient-wombat-704.mypinata.cloud/ipfs/bafybeiguatbnjg445ifurpz7qx3sbs6mrkwoxtvbw37lqgmhl5gxk66nma?pinataGatewayToken=XQCvKAb1nnK46myuHqSdmMfHkXY_2MEx7FqJlrjfV-UAYEgkbIZr2iclDCtf5PY4", // Replace with your actual OG image URL
  button: {
    title: "📸 View Story",
    action: {
      type: "launch_frame",
      url: "https://fary-story.netlify.app/", // Replace with your actual domain
      name: "StoryGram",
      splashImageUrl:
        "https://indigo-obedient-wombat-704.mypinata.cloud/ipfs/bafybeiguatbnjg445ifurpz7qx3sbs6mrkwoxtvbw37lqgmhl5gxk66nma?pinataGatewayToken=XQCvKAb1nnK46myuHqSdmMfHkXY_2MEx7FqJlrjfV-UAYEgkbIZr2iclDCtf5PY4", // Replace with your actual logo URL
      splashBackgroundColor: "#f5f0ec",
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
    <html lang="en">
      <head>
        <meta name="fc:frame" content={JSON.stringify(frame)} />
      </head>
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        {/* <CursorProvider> */}
        <Providers>
          <div className="flex justify-center items-center min-h-screen">
            {children}
          </div>
        </Providers>
        {/* </CursorProvider> */}
      </body>
    </html>
  );
}
