export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  is_verified?: boolean;
  avatar_url?: string | null;
  bio?: string | null;
}
