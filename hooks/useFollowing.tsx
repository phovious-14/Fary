import { useQuery } from "@tanstack/react-query";

const getFollowing = async (fid: number) => {
  const options = {
    method: "GET",
    headers: {
      "x-neynar-experimental": "false",
      "x-api-key": "A245EBF6-D0B1-441C-B316-22606F5562CD",
    },
  };

  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=100`,
    options
  );

  return (await response.json()).users;
};

export const useFollowing = (fid: number) => {
  const {
    data: following,
    isLoading: isLoadingFollowing,
    error: errorFollowing,
  } = useQuery({
    queryKey: ["following", fid],
    queryFn: () => getFollowing(fid),
  });

  return { following, isLoadingFollowing, errorFollowing };
};
