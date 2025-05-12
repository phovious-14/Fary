"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Search,
  Home as HomeIcon,
  PlusSquare,
  LogOut,
  LogIn,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SearchSheet } from "@/components/search-sheet";
import { sdk } from "@farcaster/frame-sdk";
import type { Context } from "@farcaster/frame-core";
import { useUserStory } from "@/hooks/backend-hook/user-story";
import { Story, StoryGroup } from "@/types/story";
import { useSignIn } from "@/hooks/use-sign-in";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useFollowing } from "@/hooks/useFollowing";

const walletAddress = "0x971B8F673637858A7481104Ed72B044c56Bd64A2";

// Dummy stories for demonstration
const dummyStories: StoryGroup[] = [
  {
    wallet_address: "0x1234...5678",
    stories: [
      {
        id: "1",
        created_at: new Date().toISOString(),
        user_id: "user1",
        wallet_address: "0x1234...5678",
        type: "image",
        url: "https://picsum.photos/800/600?random=1",
        filter: null,
        text: "First story",
        text_position: null,
        text_color: null,
        font_size: 16,
        media_position: null,
        media_scale: null,
        tags: null,
      },
    ],
  },
  {
    wallet_address: "0x2345...6789",
    stories: [
      {
        id: "2",
        created_at: new Date().toISOString(),
        user_id: "user2",
        wallet_address: "0x2345...6789",
        type: "image",
        url: "https://picsum.photos/800/600?random=2",
        filter: null,
        text: "Second story",
        text_position: null,
        text_color: null,
        font_size: 16,
        media_position: null,
        media_scale: null,
        tags: null,
      },
    ],
  },
  {
    wallet_address: "0x3456...7890",
    stories: [
      {
        id: "3",
        created_at: new Date().toISOString(),
        user_id: "user3",
        wallet_address: "0x3456...7890",
        type: "image",
        url: "https://picsum.photos/800/600?random=3",
        filter: null,
        text: "Third story",
        text_position: null,
        text_color: null,
        font_size: 16,
        media_position: null,
        media_scale: null,
        tags: null,
      },
    ],
  },
  {
    wallet_address: "0x4567...8901",
    stories: [
      {
        id: "4",
        created_at: new Date().toISOString(),
        user_id: "user4",
        wallet_address: "0x4567...8901",
        type: "image",
        url: "https://picsum.photos/800/600?random=4",
        filter: null,
        text: "Fourth story",
        text_position: null,
        text_color: null,
        font_size: 16,
        media_position: null,
        media_scale: null,
        tags: null,
      },
    ],
  },
  {
    wallet_address: "0x5678...9012",
    stories: [
      {
        id: "5",
        created_at: new Date().toISOString(),
        user_id: "user5",
        wallet_address: "0x5678...9012",
        type: "image",
        url: "https://picsum.photos/800/600?random=5",
        filter: null,
        text: "Fifth story",
        text_position: null,
        text_color: null,
        font_size: 16,
        media_position: null,
        media_scale: null,
        tags: null,
      },
    ],
  },
  {
    wallet_address: "0x6789...0123",
    stories: [
      {
        id: "6",
        created_at: new Date().toISOString(),
        user_id: "user6",
        wallet_address: "0x6789...0123",
        type: "image",
        url: "https://picsum.photos/800/600?random=6",
        filter: null,
        text: "Sixth story",
        text_position: null,
        text_color: null,
        font_size: 16,
        media_position: null,
        media_scale: null,
        tags: null,
      },
    ],
  },
];

// Helper function to generate random grid spans
const getRandomGridSpan = () => {
  const spans = [1, 2];
  return {
    row: spans[Math.floor(Math.random() * spans.length)],
    col: spans[Math.floor(Math.random() * spans.length)],
  };
};

export default function Home() {
  const { theme, setTheme } = useTheme();
  const { signIn, isLoading, isSignedIn, user, signOut } = useSignIn({
    autoSignIn: true,
  });
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const { allUserStories, isLoadingAllUserStories, errorAllUserStories } =
    useUserStory(walletAddress);
  const { following, isLoadingFollowing, errorFollowing } = useFollowing(
    Number(user?.fid) || 0
  );

  const [isInitialAuthCheck, setIsInitialAuthCheck] = useState(true);

  useEffect(() => {
    // Set dark theme by default
    setTheme("dark");
  }, [setTheme]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialAuthCheck(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const isStoryExpired = (story: Story) => {
    const storyDate = new Date(story.created_at);
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return now.getTime() - storyDate.getTime() > oneDayInMs;
  };

  const filteredUserStories = useMemo(() => {
    if (!allUserStories) return [];
    return allUserStories;
  }, [allUserStories]);

  useEffect(() => {
    const load = async () => {
      setContext(await sdk.context);
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  const gridItems = useMemo(() => {
    // Combine real and dummy stories
    const allStories = [...(filteredUserStories || []), ...dummyStories];

    return allStories.map((userStory: StoryGroup) => {
      const { row, col } = getRandomGridSpan();
      return {
        id: userStory.wallet_address,
        src: userStory.stories[0]?.url || "/fary-logo.jpg",
        alt: `Story by ${userStory.wallet_address}`,
        rowSpan: row,
        colSpan: col,
        type: userStory.stories[0]?.type,
        timestamp: new Date(
          userStory.stories[0]?.created_at || Date.now()
        ).toLocaleDateString(),
      };
    });
  }, [filteredUserStories]);

  const mergedGridItems = useMemo(() => {
    if (!following || !gridItems) return [];

    console.log("following", following);

    return gridItems
      .map((item) => {
        const followingUser = following.find(
          (data: {
            user?: {
              verified_addresses?: {
                primary?: {
                  eth_address?: string;
                };
              };
            };
          }) => {
            return (
              data?.user?.verified_addresses?.primary?.eth_address?.toLowerCase() ===
              item.id.toLowerCase() ||
              user?.verified_addresses?.primary?.eth_address?.toLowerCase() ===
              item.id.toLowerCase()
            );
          }
        );

        // Only return items that have a matching following user
        if (followingUser) {
          return {
            ...item,
            followingUser,
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null); // Filter out null items
  }, [following, gridItems]);

  console.log("Merged Grid Items:", mergedGridItems);

  return (
    <main className="mx-auto min-h-screen max-w-[390px] border-x border-border bg-background text-foreground">
      <Card className="border-none rounded-none bg-background/50 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-border/50">
          {isInitialAuthCheck ? (
            <div className="flex flex-col items-center space-y-4 w-full">
              <Skeleton className="w-20 h-20 rounded-full bg-muted/20" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-4 w-3/4 mx-auto bg-muted/20" />
                <Skeleton className="h-3 w-1/2 mx-auto bg-muted/20" />
              </div>
            </div>
          ) : isSignedIn && user ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center space-y-4 w-full relative"
            >
              {/* Background Logo */}
              <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-50">
                <Image
                  src="/fary-logo.jpg"
                  alt="Background Logo"
                  className="w-full h-full object-cover blur-sm"
                  width={400}
                  height={400}
                  priority
                />
              </div>
              <div className="relative">
                <Image
                  src={user.pfp_url}
                  alt="Profile"
                  className="w-20 h-20 rounded-full ring-2 ring-primary/50"
                  width={80}
                  height={80}
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background" />
              </div>
              <div className="text-center pb-4">
                <h2 className="font-semibold text-lg text-foreground">
                  {user.display_name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  @{user.username}
                </p>
              </div>
              <Button
                onClick={() => signOut()}
                disabled={isLoading}
                variant="default"
                className="rounded-xl p-2 px-3 hover:opacity-100 hover:bg-gray-400 bg-gray-400 opacity-50 absolute top-1 right-2 mb-4"
              >
                <LogOut className="w-5 h-5 text-black" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <Button
                onClick={() => signIn()}
                disabled={isLoading}
                variant="default"
                className="rounded-xl p-2 px-3 hover:opacity-100 hover:bg-gray-400 bg-gray-400 opacity-50 absolute top-1 right-2 mb-4"
              >
                <LogIn className="w-5 h-5 text-black" />
              </Button>
            </motion.div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Stories</h2>
            <Link
              href="/create"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="text-sm">Create</span>
            </Link>
          </div>

          {isLoadingAllUserStories ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="w-full aspect-square rounded-lg bg-muted/20" />
                  <Skeleton className="h-4 w-3/4 bg-muted/20" />
                </div>
              ))}
            </div>
          ) : mergedGridItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 auto-rows-[200px]">
              {mergedGridItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "relative rounded-lg overflow-hidden cursor-pointer group bg-card/50 backdrop-blur-sm",
                    item.rowSpan === 2 && "row-span-2",
                    item.colSpan === 2 && "col-span-2"
                  )}
                  onClick={() => (window.location.href = `/user/${item.id}`)}
                >
                  {item.type === "image" ? (
                      <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <video
                      src={item.src}
                      className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-sm font-medium">
                      {item.id.slice(0, 6)}...{item.id.slice(-4)}
                    </p>
                    <p className="text-xs text-white/80 mt-1">
                      {item.timestamp}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted/50 flex items-center justify-center mb-4">
                <PlusCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-foreground">
                No stories yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first story to get started
              </p>
              <Link href="/create">
                <Button className="bg-primary/90 hover:bg-primary">
                  Create Story
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Card>
    </main>
  );
}
