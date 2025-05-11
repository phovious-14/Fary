import { Story } from "@/app/create/page";
import { useQuery } from "@tanstack/react-query";
import { StoryResponse } from "@/types/story";

export const getStoriesByWalletAddress = async (walletAddress: string): Promise<StoryResponse> => {
  const res = await fetch(`/api/stories?wallet_address=${walletAddress}`);
  return res.json();
};

export const getAllUserStories = async (): Promise<StoryResponse> => {
  const res = await fetch("/api/stories");
  const data = await res.json();
  return data;
};

export const createUserStory = async (story: any) => {
  const res = await fetch("/api/stories", {
    method: "POST",
    body: JSON.stringify(story),
  });
  return res.json();
};

export const useUserStory = (walletAddress: string) => {
  const {
    data: userStories,
    isLoading: isLoadingUserStories,
    error: errorUserStories,
  } = useQuery({
    queryKey: ["user-story"],
    queryFn: () => getStoriesByWalletAddress(walletAddress),
    enabled: !!walletAddress,
  });

  const {
    data: allUserStories,
    isLoading: isLoadingAllUserStories,
    error: errorAllUserStories,
  } = useQuery({
    queryKey: ["all-user-stories"],
    queryFn: getAllUserStories,
  });

  return {
    userStories,
    isLoadingUserStories,
    errorUserStories,
    allUserStories,
    isLoadingAllUserStories,
    errorAllUserStories,
  };
};
