import { useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { ProfileRecipes } from '@/components/profile/ProfileRecipes';
import type { Recipe } from '@/types/Recipe';
import { useNav } from '@/hooks/useNav';

interface ProfilePageProps {
  viewer: {
    username: string | null; // null = guest
  };
  profileUser: {
    username: string;
    followers: number;
    following: number;
    bio: string;
  };
  recipes: Recipe[];
  drafts?: Recipe[];
  savedRecipes?: Recipe[];
  isLoggedIn: boolean;
  onLogout?: () => void;
}

export function ProfilePage({
  viewer,
  profileUser,
  recipes,
  drafts = [],
  savedRecipes = [],
  isLoggedIn,
  onLogout,
}: ProfilePageProps) {
  const nav = useNav();
  const isOwner = !!isLoggedIn && viewer?.username === profileUser.username;

  const [activeTab, setActiveTab] = useState<'recipes' | 'collections' | 'drafts'>(
    isOwner ? 'recipes' : 'recipes'
  );

  return (
    <div className="min-h-screen bg-[var(--background-image)]">
      <NavBar isLoggedIn={isLoggedIn} onLogout={onLogout} />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ProfileHeader
          user={{
            ...profileUser,
            recipes: recipes.length,
          }}
          isOwner={isOwner}
          onEditProfile={() => nav.editProfile()}
          onCreateRecipe={() => nav.create()}
        />
        <ProfileTabs
          isOwner={isOwner}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <ProfileRecipes
          tab={activeTab}
          isOwner={isOwner}
          recipes={recipes}
          drafts={drafts}
          savedRecipes={savedRecipes}
        />
      </div>
    </div>
  );
}
