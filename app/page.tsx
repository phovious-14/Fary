"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { getAllUserStories, Story, UserStories } from "@/lib/stories";
import { useEffect, useState } from "react";
import { SearchSheet } from "@/components/search-sheet";
import { sdk } from "@farcaster/frame-sdk";
import ConnectButton from "@/components/ConnectButton";
import type { Context } from '@farcaster/frame-core';

export default function Home() {
  const [userStories, setUserStories] = useState<UserStories[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();

  // Function to check if a story is expired (older than 1 day)
  const isStoryExpired = (story: Story) => {
    const storyDate = new Date(story.createdAt);
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return now.getTime() - storyDate.getTime() > oneDayInMs;
  };

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

  useEffect(() => {
    // Only run on client side
    const loadStories = () => {
      try {
        const allUserStories = getAllUserStories();
        // Filter out users with all expired stories
        const validUserStories = allUserStories.filter(
          (userStory: UserStories) =>
            userStory.stories.some((story: Story) => !isStoryExpired(story))
        );
        setUserStories(validUserStories);
      } catch (error) {
        console.error("Error loading stories:", error);
        setUserStories([]);
      }
    };

    loadStories();
  }, []);

  return (
    <main className="mx-auto h-screen max-w-[390px] border-x border-gray-200 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between py-4 px-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">StoryGram</h1>
        <ConnectButton />
        <button
          onClick={() => setSearchOpen(true)}
          className="p-2 rounded-full hover:bg-slate-100"
        >
          <Search className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Stories Row */}
      <div className="flex overflow-x-auto gap-4 p-4 no-scrollbar">
        <Link
          href="/create"
          className="flex flex-col items-center min-w-[72px]"
        >
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center mb-1">
            <PlusCircle className="w-8 h-8 text-slate-400" />
          </div>
          <span className="text-xs text-slate-600">Create</span>
        </Link>

        {userStories.map((userStory) => (
          <Link
            href={`/user/${userStory.userId}`}
            key={userStory.userId}
            className="flex flex-col items-center min-w-[72px]"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 p-[2px]">
              <div className="w-full h-full rounded-full overflow-hidden">
                {userStory.stories.length > 0 ? (
                  userStory.stories[0].type === "image" ? (
                    <img
                      src={userStory.stories[0].url}
                      alt="Story preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={userStory.stories[0].url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                    <span className="text-slate-400 text-xs">No stories</span>
                  </div>
                )}
              </div>
            </div>
            <span className="text-xs mt-1 text-slate-600">
              User {userStory.userId}
            </span>
            {userStory.stories.length > 1 && (
              <span className="text-xs text-slate-500">
                +{userStory.stories.length - 1} more
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 pb-16">
          {userStories.map((userStory) => (
            <div
              key={userStory.userId}
              className="border-b border-slate-200 pb-4"
            >
              <div className="p-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img
                    src={`/placeholder.svg?height=32&width=32&text=U${userStory.userId}`}
                    alt={`User ${userStory.userId} profile`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-medium text-slate-900">
                  User {userStory.userId}
                </span>
              </div>
              {userStory.stories.length > 0 ? (
                userStory.stories.map((story) => (
                  <div key={story.id}>
                    {story.type === "image" ? (
                      <img
                        src={story.url}
                        alt="Story"
                        className="w-full aspect-square object-contain"
                      />
                    ) : (
                      <video
                        src={story.url}
                        className="w-full aspect-square object-contain"
                        style={{ objectFit: "contain" }}
                        controls
                        muted
                      />
                    )}
                    <div className="p-3">
                      <div className="flex gap-4 mb-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto text-slate-600 hover:text-rose-500"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-heart"
                          >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto text-slate-600 hover:text-slate-900"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-message-circle"
                          >
                            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto text-slate-600 hover:text-slate-900"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-send"
                          >
                            <path d="m22 2-7 20-4-9-9-4Z" />
                            <path d="M22 2 11 13" />
                          </svg>
                        </Button>
                      </div>
                      {story.text && (
                        <p className="text-sm text-slate-700">
                          <span className="font-medium text-slate-900">
                            User {userStory.userId}
                          </span>{" "}
                          {story.text}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-500">
                  No stories yet
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3 px-6 max-w-[390px] mx-auto">
        <div className="flex justify-around">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-home"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-search"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Button>
          <Link href="/create">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-slate-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-plus-square"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M8 12h8" />
                <path d="M12 8v8" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Sheet */}
      <SearchSheet open={searchOpen} onOpenChange={setSearchOpen} />
    </main>
  );
}
