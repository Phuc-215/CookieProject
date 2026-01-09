import { ProfilePage } from './ProfilePage';
import { MOCK_COLLECTIONS } from "@/mocks/mock_collection";
import { MOCK_RECIPES } from "@/mocks/mock_recipe";

const MOCK_USER = {
  username: 'BakerBob',
  followers: 234,
  following: 156,
  bio: 'Home baker exploring pixel-perfect recipes!',
};

interface PublicProfileProps {
  isLoggedIn: boolean;
  onLogout?: () => void;
}

export function PublicProfile({ isLoggedIn, onLogout }: PublicProfileProps) {
  return (
    <ProfilePage
      viewer={{ username: null }}      // public = guest
      profileUser={MOCK_USER}
      recipes={MOCK_RECIPES}
      collections={MOCK_COLLECTIONS}
      isLoggedIn={isLoggedIn}
      onLogout={onLogout}
    />
  );
}