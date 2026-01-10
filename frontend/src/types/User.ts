export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  is_verified?: boolean;
  avatar_url?: string;
  bio?: string | null;
  followers_count?: number;
  following_count?: number;
}

export interface UserLite {
  id: string;
  name: string;
  avatar?: string;
  isFollowing?: boolean;
}