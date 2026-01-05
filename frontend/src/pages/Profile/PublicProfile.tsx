import { ProfilePage } from './ProfilePage';

const MOCK_USER = {
  username: 'BakerBob',
  followers: 234,
  following: 156,
  bio: 'Home baker exploring pixel-perfect recipes!',
};

const MOCK_USER_RECIPES = [
  {
    id: '1',
    title: 'Classic Chocolate Chip',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e',
    author: 'BakerBob',
    difficulty: 'Easy' as const,
    time: '30 min',
    likes: 245,
  },
  {
    id: '2',
    title: 'Glazed Donuts',
    image: 'https://images.unsplash.com/photo-1506224772180-d75b3efbe9be',
    author: 'BakerBob',
    difficulty: 'Medium' as const,
    time: '60 min',
    likes: 412,
  },
];

interface PublicProfileProps {
  isLoggedIn: boolean;
  onLogout?: () => void;
}

export function PublicProfile({ isLoggedIn, onLogout }: PublicProfileProps) {
  return (
    <ProfilePage
      viewer={{ username: null }}      // public = guest
      profileUser={MOCK_USER}
      recipes={MOCK_USER_RECIPES}
      isLoggedIn={isLoggedIn}
      onLogout={onLogout}
    />
  );
}