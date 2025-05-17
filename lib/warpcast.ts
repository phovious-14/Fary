import { env } from "@/lib/env";

/**
 * Get the farcaster manifest for the frame, generate yours from Warpcast Mobile
 *  On your phone to Settings > Developer > Domains > insert website hostname > Generate domain manifest
 * @returns The farcaster manifest for the frame
 */
export async function getFarcasterManifest() {
  let frameName = "Fary Stories";
  let noindex = false;
  const appUrl = env.NEXT_PUBLIC_URL;
  if (appUrl.includes("localhost")) {
    frameName += " Local";
    noindex = true;
  } else if (appUrl.includes("ngrok")) {
    frameName += " NGROK";
    noindex = true;
  } else if (appUrl.includes("https://dev.")) {
    frameName += " Dev";
    noindex = true;
  }
  return {
    accountAssociation: {
      header: env.NEXT_PUBLIC_FARCASTER_HEADER,
      payload: env.NEXT_PUBLIC_FARCASTER_PAYLOAD,
      signature: env.NEXT_PUBLIC_FARCASTER_SIGNATURE,
    },
    frame: {
      version: "1",
      name: frameName,
      iconUrl: `${appUrl}/fary-logo.jpg`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/fary-logo.jpg`,
      buttonTitle: `Launch App`,
      splashImageUrl: `${appUrl}/fary-logo.jpg`,
      splashBackgroundColor: "#FFFFFF",
      webhookUrl: `${appUrl}/api/webhook`,
      // Metadata https://github.com/farcasterxyz/miniapps/discussions/191
      subtitle: "Share and discover stories", // 30 characters, no emojis or special characters, short description under app name
      description:
        "Create, share, and discover engaging stories in the Farcaster ecosystem. Connect with storytellers and build your narrative.", // 170 characters, no emojis or special characters, promotional message displayed on Mini App Page
      primaryCategory: "social",
      tags: ["stories", "social", "content", "community"], // up to 5 tags, filtering/search tags
      tagline: "Your stories, your voice", // 30 characters, marketing tagline should be punchy and descriptive
      ogTitle: `Fary Stories`, // 30 characters, app name + short tag, Title case, no emojis
      ogDescription:
        "Create and share your stories with the Farcaster community", // 100 characters, summarize core benefits in 1-2 lines
      screenshotUrls: [
        // 1284 x 2778, visual previews of the app, max 3 screenshots
        `${appUrl}/fary-logo.jpg`,
      ],
      heroImageUrl: `${appUrl}/fary-logo.jpg`, // 1200 x 630px (1.91:1), promotional display image on top of the mini app store
      ogImageUrl: `${appUrl}/fary-logo.jpg`, // 1200 x 630px (1.91:1), promotional image, same as app hero image
      noindex: noindex,
    },
  };
}
