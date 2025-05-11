export type Story = {
  id: string;
  created_at: string;
  user_id: string;
  wallet_address: string;
  type: "image" | "video";
  url: string;
  filter: string | null;
  text: string | null;
  text_position: {
    x: number;
    y: number;
  } | null;
  text_color: string | null;
  font_size: number;
  media_position: {
    x: number;
    y: number;
  } | null;
  media_scale: number | null;
  tags: string[] | null;
};

export type StoryGroup = {
  wallet_address: string;
  stories: Story[];
};

export type StoryResponse = StoryGroup[];
