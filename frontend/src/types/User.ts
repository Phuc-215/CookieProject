export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  is_verified?: boolean;
  avatar_url?: string;
  bio?: string | null;
}

export interface UserLite {
  id: string;
  name: string;
  avatar?: string;
}