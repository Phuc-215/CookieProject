import { useState } from 'react';
import { User, Settings, Lock, Globe} from 'lucide-react';
import { PixelButton } from '../components/PixelButton';
import { RecipeCard } from '../components/RecipeCard';
import { NavBar} from '../components/NavBar';
import {useNav} from "../hooks/useNav"
interface MyProfileProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const MY_USER = {
  username: 'YourUsername',
  avatar: null,
  followers: 234,
  following: 156,
  bio: 'Home baker exploring pixel-perfect recipes!',
};

const MY_RECIPES = [
  {
    id: '1',
    title: 'Classic Chocolate Chip',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBjaGlwJTIwY29va2llc3xlbnwxfHx8fDE3NjQyMDU4MzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    author: 'YourUsername',
    difficulty: 'Easy' as const,
    time: '30 min',
    likes: 245,
    isLiked: true,
    isSaved: false,
  },
  {
    id: '2',
    title: 'Glazed Donuts',
    image: 'https://images.unsplash.com/photo-1506224772180-d75b3efbe9be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb251dHMlMjBzcHJpbmtsZXN8ZW58MXx8fHwxNzY0MjI5NzM5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    author: 'YourUsername',
    difficulty: 'Medium' as const,
    time: '60 min',
    likes: 412,
    isLiked: false,
    isSaved: false,
  },
];

const DRAFT_RECIPES = [
  {
    id: 'draft-1',
    title: 'Matcha Cookies (Draft)',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRjaGElMjBjb29raWVzfGVufDF8fHx8MTczMzA2MDk3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    author: 'YourUsername',
    difficulty: 'Medium' as const,
    time: '45 min',
    likes: 0,
    isLiked: false,
    isSaved: false,
  },
];

const SAVED_RECIPES = [
  {
    id: '3',
    title: 'Rainbow Macarons',
    image: 'https://images.unsplash.com/photo-1580421383318-f87fc861a696?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWNhcm9ucyUyMGRlc3NlcnR8ZW58MXx8fHwxNzY0MjA1NTAzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    author: 'SweetChef',
    difficulty: 'Hard' as const,
    time: '120 min',
    likes: 523,
    isLiked: true,
    isSaved: true,
  },
  {
    id: '4',
    title: 'Fudgy Brownies',
    image: 'https://images.unsplash.com/photo-1617996884841-3949eaec3448?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm93bmllcyUyMGNob2NvbGF0ZXxlbnwxfHx8fDE3NjQyMjkxNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    author: 'ChocMaster',
    difficulty: 'Easy' as const,
    time: '35 min',
    likes: 678,
    isLiked: true,
    isSaved: true,
  },
  {
    id: '5',
    title: 'Pixel Perfect Cookie',
    image: 'https://images.unsplash.com/photo-1703118834585-67fd82bdefdd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXhlbCUyMGFydCUyMGNvb2tpZXN8ZW58MXx8fHwxNzY0MjI5NzM4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    author: 'PixelBaker',
    difficulty: 'Medium' as const,
    time: '50 min',
    likes: 891,
    isLiked: false,
    isSaved: true,
  },
];

export function MyProfile({ isLoggedIn, onLogout }: MyProfileProps) {
  const [activeTab, setActiveTab] = useState<'kitchen' | 'collections' | 'drafts'>('kitchen');
  const [collectionVisibility, setCollectionVisibility] = useState<'public' | 'private'>('public');
  const [myRecipes, setMyRecipes] = useState(MY_RECIPES);
  const [draftRecipes, setDraftRecipes] = useState(DRAFT_RECIPES);
  const nav = useNav();

  const handleDeleteRecipe = (id: string) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      setMyRecipes(myRecipes.filter(recipe => recipe.id !== id));
    }
  };

  const handleDeleteDraft = (id: string) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      setDraftRecipes(draftRecipes.filter(recipe => recipe.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-image)]">
      {/* Header */}
      <NavBar 
        isLoggedIn={isLoggedIn}
        onLogout={() => {}}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="pixel-card bg-white p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="w-32 h-32 bg-[#FF8FAB] pixel-border flex items-center justify-center shrink-0">
              <User className="w-16 h-16 text-[#5D4037]" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 
                className="text-2xl mb-4" 
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                {MY_USER.username}
              </h2>
              
              {/* Stats */}
              <div className="flex gap-6 mb-4">
                <div>
                  <div className="text-2xl mb-1">{MY_RECIPES.length}</div>
                  <div className="text-sm text-[#5D4037]/70 uppercase">Recipes</div>
                </div>
                <div>
                  <div className="text-2xl mb-1">{MY_USER.followers}</div>
                  <div className="text-sm text-[#5D4037]/70 uppercase">Followers</div>
                </div>
                <div>
                  <div className="text-2xl mb-1">{MY_USER.following}</div>
                  <div className="text-sm text-[#5D4037]/70 uppercase">Following</div>
                </div>
              </div>

              <p className="text-sm mb-6 max-w-lg">{MY_USER.bio}</p>

              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                <PixelButton 
                  variant="outline" 
                  size="md"
                  onClick={() => nav.editProfile()}
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Edit Profile
                </PixelButton>
                <PixelButton 
                  variant="primary" 
                  size="md"
                  onClick={() => nav.create()}
                >
                  + Create Recipe
                </PixelButton>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b-[3px] border-[#5D4037] overflow-x-auto">
            <button
              className={`px-6 py-3 pixel-border border-b-0 uppercase tracking-wide transition-colors whitespace-nowrap ${
                activeTab === 'kitchen'
                  ? 'bg-white -mb-[3px]'
                  : 'bg-[#FFF8E1] hover:bg-white/50'
              }`}
              onClick={() => setActiveTab('kitchen')}
              style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px' }}
            >
              My Kitchen
            </button>
            <button
              className={`px-6 py-3 pixel-border border-b-0 uppercase tracking-wide transition-colors whitespace-nowrap ${
                activeTab === 'collections'
                  ? 'bg-white -mb-[3px]'
                  : 'bg-[#FFF8E1] hover:bg-white/50'
              }`}
              onClick={() => setActiveTab('collections')}
              style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px' }}
            >
              Collections
            </button>
            <button
              className={`px-6 py-3 pixel-border border-b-0 uppercase tracking-wide transition-colors whitespace-nowrap ${
                activeTab === 'drafts'
                  ? 'bg-white -mb-[3px]'
                  : 'bg-[#FFF8E1] hover:bg-white/50'
              }`}
              onClick={() => setActiveTab('drafts')}
              style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px' }}
            >
              Drafts
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'kitchen' && (
          <>
            <div className="mb-6">
              <h3 className="text-sm mb-3 uppercase text-[#5D4037]/70">
                {myRecipes.length} recipes you've created
              </h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRecipes.map((recipe) => (
                <RecipeCard 
                  key={recipe.id} 
                  {...recipe}
                  onClick={() => nav.recipe(recipe.id)}
                  showDelete={true}
                  onDelete={handleDeleteRecipe}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 'collections' && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-sm uppercase text-[#5D4037]/70">
                {SAVED_RECIPES.length} recipes you've saved
              </h3>
              <div className="flex gap-2">
                <button
                  className={`px-4 py-2 pixel-border flex items-center gap-2 transition-colors ${
                    collectionVisibility === 'public' 
                      ? 'bg-[#4DB6AC]' 
                      : 'bg-white hover:bg-[#FFF8E1]'
                  }`}
                  onClick={() => setCollectionVisibility('public')}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">Public</span>
                </button>
                <button
                  className={`px-4 py-2 pixel-border flex items-center gap-2 transition-colors ${
                    collectionVisibility === 'private' 
                      ? 'bg-[#FF8FAB]' 
                      : 'bg-white hover:bg-[#FFF8E1]'
                  }`}
                  onClick={() => setCollectionVisibility('private')}
                >
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">Private</span>
                </button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SAVED_RECIPES.map((recipe) => (
                <RecipeCard 
                  key={recipe.id} 
                  {...recipe}
                  onClick={() => nav.recipe(recipe.id)}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 'drafts' && (
          <>
            <div className="mb-6">
              <h3 className="text-sm uppercase text-[#5D4037]/70">
                {draftRecipes.length} draft recipes
              </h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {draftRecipes.map((recipe) => (
                <RecipeCard 
                  key={recipe.id} 
                  {...recipe}
                  onClick={() => nav.create()}
                  showDelete={true}
                  onDelete={handleDeleteDraft}
                />
              ))}
            </div>
            {draftRecipes.length === 0 && (
              <div className="pixel-card bg-white p-12 text-center">
                <p className="text-[#5D4037]/50 mb-4">No draft recipes yet</p>
                <PixelButton 
                  variant="primary" 
                  size="md"
                  onClick={() => nav.create()}
                >
                  + Create Recipe
                </PixelButton>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}