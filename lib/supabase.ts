import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      stories: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          wallet_address: string;
          type: "image" | "video";
          url: string;
          filter: string | null;
          text: string | null;
          text_position: Json | null;
          text_color: string | null;
          font_size: number | null;
          media_position: Json | null;
          media_scale: number | null;
          tags: string[] | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          wallet_address: string;
          type: "image" | "video";
          url: string;
          filter?: string | null;
          text?: string | null;
          text_position?: Json | null;
          text_color?: string | null;
          font_size?: number | null;
          media_position?: Json | null;
          media_scale?: number | null;
          tags?: string[] | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          wallet_address?: string;
          type?: "image" | "video";
          url?: string;
          filter?: string | null;
          text?: string | null;
          text_position?: Json | null;
          text_color?: string | null;
          font_size?: number | null;
          media_position?: Json | null;
          media_scale?: number | null;
          tags?: string[] | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
