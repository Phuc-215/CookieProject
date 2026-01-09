import { ProfilePage } from './ProfilePage';
import { MOCK_COLLECTIONS } from "@/mocks/mock_collection";
import { MOCK_RECIPES } from "@/mocks/mock_recipe";

const MY_USER = {
  username: 'YourUsername',
  followers: 234,
  following: 156,
  bio: 'Home baker exploring pixel-perfect recipes!',
};

const DRAFT_RECIPES = [
  {
    id: 'draft-1',
    title: 'Matcha Cookies (Draft)',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8',
    author: 'YourUsername',
    difficulty: 'Medium' as const,
    time: '45 min',
    likes: 0,
  },
];

interface Viewer {
  username: string;
}
interface MyProfileProps {
  isLoggedIn: boolean;
  viewer: Viewer | null;
  onLogout: () => void;
}

export function MyProfile({ isLoggedIn, onLogout }: MyProfileProps) {
  return (
    <ProfilePage
      viewer={{ username: 'YourUsername' }}
      profileUser={MY_USER}
      recipes={MOCK_RECIPES}
      drafts={DRAFT_RECIPES}
      collections={MOCK_COLLECTIONS}
      isLoggedIn={isLoggedIn}
      onLogout={onLogout}
    />
  );
}
