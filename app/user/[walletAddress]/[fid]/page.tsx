import UserStoriesPage from "./UserStory";

export default function UserPage({
  params,
}: {
  params: { walletAddress: string; fid: string };
}) {
  return <UserStoriesPage walletAddress={params.walletAddress} fid={params.fid} />;
}
