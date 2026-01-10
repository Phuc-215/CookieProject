export interface Viewer {
  id: number;
  username: string;
  email?: string;
  avatar_url?: string | null;
  bio?: string | null;
}