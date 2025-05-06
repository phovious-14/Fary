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
  imageUrl: "https://indigo-obedient-wombat-704.mypinata.cloud/files/bafkreibotb7d5rzs2tzdg5n3jilgk5wjsd5p642pscuokf53xq62gquxp4?X-Algorithm=PINATA1&X-Date=1746511473&X-Expires=30&X-Method=GET&X-Signature=81ee5bc58d7ad25344bafc0648dd46ee30bf3090d0871553626d22d157421cb6",
  button: {
    title: "Farcaster stories",
    action: {
      type: "launch_frame",
      name: "Fary Story",
      url: "https://fary-story.netlify.app/",
      splashImageUrl: "https://indigo-obedient-wombat-704.mypinata.cloud/files/bafkreibotb7d5rzs2tzdg5n3jilgk5wjsd5p642pscuokf53xq62gquxp4?X-Algorithm=PINATA1&X-Date=1746511473&X-Expires=30&X-Method=GET&X-Signature=81ee5bc58d7ad25344bafc0648dd46ee30bf3090d0871553626d22d157421cb6",
      splashBackgroundColor: "#f7f7f7",
    },
  },
};

export const metadata: Metadata = {
  title: "Fary Story",
  description: "Create and share stories on miniapp",
  generator: "Fary Story",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="fc:frame" content={JSON.stringify(frame)} />
      </head>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <Providers>
          <div className="flex justify-center items-center min-h-screen">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
