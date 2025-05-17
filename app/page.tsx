import App from "@/components/App";
import { env } from "@/lib/env";
import { Metadata } from "next";

const appUrl = env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/fary-logo.jpg`,
  button: {
    title: "Learn Farcaster",
    action: {
      type: "launch_frame",
      name: "Fary Stories",
      url: `${appUrl}/`,
      splashImageUrl: `${appUrl}/fary-logo.jpg`,
      splashBackgroundColor: "#f7f7f7",
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Fary Stories",
    description: "A starter for Farcaster mini-apps",
    openGraph: {
      title: "Fary Stories",
      description:
        "Create, share, and discover engaging stories in the Farcaster ecosystem. Connect with storytellers and build your narrative.",
      images: [{ url: `${appUrl}/fary-logo.jpg` }],
      type: "website",
      url: appUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: "Fary Stories",
      description:
        "Create, share, and discover engaging stories in the Farcaster ecosystem. Connect with storytellers and build your narrative.",
      images: [`${appUrl}/fary-logo.jpg`],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return <App />;
}
