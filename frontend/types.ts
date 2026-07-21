export interface Article {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  tag: string | null;
  cover_image_path: string | null;
  content_markdown_path: string | null;
  playlist_id: string | null;
  is_published: boolean;
  bg_color: string | null;
  text_color: string | null;
  photo_accent_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Track {
  id: string;
  playlist_id: string;
  title: string;
  artist: string;
  duration: string | null;
  order: number;
  audio_file_path?: string | null;
  created_at: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string | null;
  external_url?: string | null;
  created_at: string;
  updated_at: string;
  // Optional, client-side convenience fields
  coverImage?: string;
  tracks?: Track[];
}

export interface User {
  id: string;
  username: string;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface MusicSource {
  id: string;
  track_id: string;
  platform_id: string;
  url: string;
  created_at: string;
}

export interface Platform {
  id: string;
  name: string;
  icon_url: string | null;
  base_url: string | null;
}
