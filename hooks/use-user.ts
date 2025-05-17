"use server";

import { env } from "@/lib/env";
import { useQuery } from "@tanstack/react-query";

const fetchUserByFid = async (fid: string) => {
  const options = {
    method: "GET",
    headers: { "x-api-key": env.NEYNAR_API_KEY },
  };

  const res = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
    options
  );
  const data = await res.json();
  return data.users[0];
};

export function useUser(fid: string) {
  const {
    data: user,
    isLoading: isLoadingUser,
    error: errorUser,
  } = useQuery({
    queryKey: ["user", fid],
    queryFn: () => fetchUserByFid(fid),
  });

  return { user, isLoadingUser, errorUser };
}
