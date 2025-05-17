import { useQuery } from "@tanstack/react-query";

const getFollowers = async (fid: number) => {
  const options = {
    method: "GET",
    headers: {
      "x-neynar-experimental": "false",
      "x-api-key": "A245EBF6-D0B1-441C-B316-22606F5562CD",
    },
  };

  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/followers?fid=${fid}&limit=25`,
    options
  );

  return (await response.json()).users.map((user: any) => user.fid);
};

export const useFollowers = (fid: number) => {
  const {
    data: followers,
    isLoading: isLoadingFollowers,
    error: errorFollowers,
  } = useQuery({
    queryKey: ["followers", fid],
    queryFn: () => getFollowers(fid),
  });

  return { followers, isLoadingFollowers, errorFollowers };
};
