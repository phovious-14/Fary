import { useMutation } from "@tanstack/react-query";

const addViewers = async ({
  storyId,
  fid,
}: {
  storyId: string;
  fid: string;
}) => {
  const response = await fetch(`/api/stories/update-viewrs?storyId=${storyId}&fid=${fid}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify({ storyId, fid }),
    }
  );
  const data = await response.json();
  return data;
};

export const useUpdateViewers = () => {
  const { mutate: updateViewers, error: updateError } = useMutation({
    mutationFn: addViewers,
  });

  return { updateViewers, updateError };
};
