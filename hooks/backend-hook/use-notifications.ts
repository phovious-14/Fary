import { env } from "@/lib/env";
import { useMutation } from "@tanstack/react-query";

type SendNotificationRequest = {
  fid: string[];
  title: string;
  body: string;
  target_url: string;
};

const sendNotification = async (notification: SendNotificationRequest) => {
  const options = {
    method: "POST",
    headers: {
      "x-api-key": "A245EBF6-D0B1-441C-B316-22606F5562CD",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(notification),
  };

  const response = await fetch(
    "https://api.neynar.com/v2/farcaster/frame/notifications",
    options
  );

  return response.json();
};

export const useNotifications = () => {
  const { mutate: sendNotif, error } = useMutation({
    mutationFn: (notification: SendNotificationRequest) =>
      sendNotification(notification),
  });

  return { sendNotif, error };
};
