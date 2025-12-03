import { useState } from 'react';
import { Search} from 'lucide-react';
import { PixelButton } from '../components/PixelButton';
import { RecipeCard } from '../components/RecipeCard';
import { NavBar } from '../components/NavBar';
import { useNav } from '../hooks/useNav'; 
interface HomeFeedProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const MOCK_RECIPES = [
  {
    id: '1',
    title: 'Classic Chocolate Chip',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBjaGlwJTIwY29va2llc3xlbnwxfHx8fDE3NjQyMDU4MzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    author: 'BakerBob',
    difficulty: 'Easy' as const,
    time: '30 min',
    likes: 245,
    isLiked: false,
    isSaved: false,
  },
  {
    id: '2',
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
    id: '3',
    title: 'Vanilla Cupcakes',
    image: 'https://images.unsplash.com/photo-1555526148-0fa555bb2e78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXBjYWtlcyUyMGNvbG9yZnVsfGVufDF8fHx8MTc2NDE4MTA1MHww&ixlib=rb-4.1.0&q=80&w=1080',
    author: 'CakeQueen',
    difficulty: 'Medium' as const,
    time: '45 min',
    likes: 387,
    isLiked: false,
    isSaved: false,
  },
  {
    id: '4',
    title: 'Glazed Donuts',
    image: 'https://images.unsplash.com/photo-1506224772180-d75b3efbe9be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb251dHMlMjBzcHJpbmtsZXN8ZW58MXx8fHwxNzY0MjI5NzM5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    author: 'DonutDave',
    difficulty: 'Medium' as const,
    time: '60 min',
    likes: 412,
    isLiked: false,
    isSaved: false,
  },
  {
    id: '5',
    title: 'Fudgy Brownies',
    image: 'https://images.unsplash.com/photo-1617996884841-3949eaec3448?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm93bmllcyUyMGNob2NvbGF0ZXxlbnwxfHx8fDE3NjQyMjkxNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    author: 'ChocMaster',
    difficulty: 'Easy' as const,
    time: '35 min',
    likes: 678,
    isLiked: true,
    isSaved: false,
  },
  {
    id: '6',
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

export function HomeFeed({ isLoggedIn = false, onLogout }: HomeFeedProps) {
  const [recipes] = useState(MOCK_RECIPES);
  const [searchQuery, setSearchQuery] = useState('');
  const nav = useNav(); 
  const handleSearchSubmit = () => {
    nav.search();
  };

  return (
    <div className="min-h-screen bg-[var(--background-image)]">
      {/* Header */}
      <NavBar 
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
        notificationCount={3}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="pixel-card bg-gradient-to-br from-[var(--pink)] to-[var(--mint)] p-8 md:p-12 text-center">
          <div className="mb-6">
            <div className="inline-block w-24 h-24 bg-[#FFF8F0] pixel-border relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl">🍪</div>
              </div>
            </div>
          </div>

          <h2 
            className="text-2xl md:text-3xl mb-4 text-[var(--choco)]"
            style={{ fontFamily: "'Press Start 2P', cursive" }}
          >
            Digital Bakery
          </h2>

          <p className="text-lg mb-6 text-[var(--choco)] max-w-2xl mx-auto">
            Share your pixel-perfect recipes with the world. Create, collect, and connect with bakers everywhere.
          </p>

          {isLoggedIn && (
            <PixelButton 
              variant="outline" 
              size="lg"
              onClick={() => nav.create()}
            >
              + Create Recipe
            </PixelButton>
          )}
        </div>
      </section>

      {/* Recipe Feed */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 
            className="text-lg" 
            style={{ fontFamily: "'Press Start 2P', cursive" }}
          >
            Latest Recipes
          </h2>

          <PixelButton 
            variant="outline" 
            size="sm"
            onClick={() => nav.search()}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Filter
          </PixelButton>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id}
              {...recipe}
              onClick={() => nav.recipe(recipe.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}