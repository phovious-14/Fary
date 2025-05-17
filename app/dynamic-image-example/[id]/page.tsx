import App from "@/components/App";
import { env } from "@/lib/env";
import { Metadata } from "next";

const appUrl = env.NEXT_PUBLIC_URL;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {

  const imageUrl = new URL(`${appUrl}/api/og/example`);

  const frame = {
    version: "next",
    imageUrl: imageUrl.toString(),
    button: {
      title: "Launch App",
      action: {
        type: "launch_frame",
        name: "Launch App",
        url: appUrl,
        splashImageUrl: `${appUrl}/fary-logo.jpg`,
        splashBackgroundColor: "#f7f7f7",
      },
    },
  };

  return {
    title: "Fary Stories",
    openGraph: {
      title: "Fary Stories",
      description: "Create, share, and discover engaging stories in the Farcaster ecosystem. Connect with storytellers and build your narrative.",
      images: [{ url: imageUrl.toString() }],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default async function StreakFlex() {
  return <App />;
}
