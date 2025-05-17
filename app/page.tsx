import App from "@/components/App";
import { env } from "@/lib/env";
import { Metadata } from "next";

const appUrl = env.NEXT_PUBLIC_URL;

const frame = {
  version: "1",
  image: `${appUrl}/fary-logo.jpg`,
  buttons: [
    {
      label: "Launch App",
      action: "post_redirect",
      target: appUrl,
    },
  ],
  post_url: `${appUrl}/api/frame`,
  input: {
    text: "Enter your story...",
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
