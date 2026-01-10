import { useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { ProfileRecipes } from '@/components/profile/ProfileRecipes';
import { ProfileCollections } from '@/components/profile/ProfileCollections';

import type { Recipe } from '@/types/Recipe';
import type { Collection } from '@/types/Collection';

import { useNav } from '@/hooks/useNav';

interface ProfilePageProps {
  viewer: {
    username: string | null; // null = guest
    avatar_url?: string | null;
  };
  profileUser: {
    username: string;
    followers: number;
    following: number;
    bio: string;
    avatarUrl?: string | null;
  };
  recipes: Recipe[];
  drafts?: Recipe[];
  collections?: Collection[];
  isLoggedIn: boolean;
  onLogout?: () => void;
}

export function ProfilePage({
  viewer,
  profileUser,
  recipes: initialRecipes,
  drafts: initialDrafts = [],
  collections = [],
  isLoggedIn,
  onLogout,
}: ProfilePageProps) {
  const nav = useNav();
  const isOwner = !!isLoggedIn && viewer?.username === profileUser.username;

  const [recipes, setRecipes] = useState(initialRecipes);
  const [drafts, setDrafts] = useState(initialDrafts);

  const [activeTab, setActiveTab] = useState<
    'recipes' | 'collections' | 'drafts'
  >('recipes');

  const handleDeleteRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    setDrafts((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-[var(--background-image)]">
      <NavBar isLoggedIn={isLoggedIn} onLogout={onLogout} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <ProfileHeader
          user={{ ...profileUser, recipes: recipes.length, avatarUrl: profileUser.avatarUrl ?? (viewer as any)?.avatar_url ?? null }}
          isOwner={isOwner}
          onEditProfile={() => nav.editProfile()}
          onCreateRecipe={() => nav.create()}
        />

        <ProfileTabs
          isOwner={isOwner}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'collections' ? (
          <ProfileCollections
            collections={collections}
            isOwner={isOwner}
          />
        ) : (
          <ProfileRecipes
            tab={activeTab}
            isOwner={isOwner}
            recipes={recipes}
            drafts={drafts}
            onDeleteRecipe={handleDeleteRecipe}
          />
        )}
      </div>
    </div>
  );
}

