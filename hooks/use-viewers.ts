import { useQuery } from "@tanstack/react-query";

interface Viewer {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
}

const fetchViewers = async (storyId: string) => {
  const response = await fetch(`/api/stories/${storyId}`);
  const data = await response.json();
  return data.viewers || [];
};

export function useViewers(storyId: string) {
  const {
    data: viewers,
    isLoading,
    error,
  } = useQuery<Viewer[]>({
    queryKey: ["viewers", storyId],
    queryFn: () => fetchViewers(storyId),
    enabled: !!storyId,
  });

  return { viewers, isLoading, error };
}
