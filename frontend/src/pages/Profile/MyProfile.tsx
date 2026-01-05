import { ProfilePage } from './ProfilePage';

const MY_USER = {
  username: 'YourUsername',
  followers: 234,
  following: 156,
  bio: 'Home baker exploring pixel-perfect recipes!',
};

const MY_RECIPES = [
  {
    id: '1',
    title: 'Classic Chocolate Chip',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e',
    author: 'YourUsername',
    difficulty: 'Easy' as const,
    time: '30 min',
    likes: 245,
  },
  {
    id: '2',
    title: 'Glazed Donuts',
    image: 'https://images.unsplash.com/photo-1506224772180-d75b3efbe9be',
    author: 'YourUsername',
    difficulty: 'Medium' as const,
    time: '60 min',
    likes: 412,
  },
];

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

const MY_COLLECTIONS = [
  {
    id: 'c1',
    title: 'Weekend Baking',
    recipeCount: 5,
    coverImages: [
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e',
      'https://images.unsplash.com/photo-1506224772180-d75b3efbe9be',
    ],
  },
];

interface MyProfileProps {
  isLoggedIn: boolean;
  onLogout?: () => void;
}

export function MyProfile({ isLoggedIn, onLogout }: MyProfileProps) {
  return (
    <ProfilePage
      viewer={{ username: 'YourUsername' }}
      profileUser={MY_USER}
      recipes={MY_RECIPES}
      drafts={DRAFT_RECIPES}
      collections={MY_COLLECTIONS}
      isLoggedIn={isLoggedIn}
      onLogout={onLogout}
    />
  );
}
