import { useState } from 'react';
import { PixelButton } from '../../components/PixelButton';
import { RecipeCard } from '../../components/RecipeCard';
import { CollectionCard } from "../../components/CollectionCard";
import { NavBar } from '../../components/NavBar';
import { useNav } from '../../hooks/useNav'; 
import { Headline } from './Headline'; 
import homefeed from "../../assets/homefeed.svg"; 

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

const MOCK_COLLECTIONS = [
  {
    id: "jar-1",
    title: "Chocolate Heaven",
    recipeCount: 14,
    coverImages: [
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600",
      "https://images.unsplash.com/photo-1617996884841-3949eaec3448?w=600",
      "https://images.unsplash.com/photo-1506224772180-d75b3efbe9be?w=600",
      "https://images.unsplash.com/photo-1580421383318-f87fc861a696?w=600",
    ],
  },
  {
    id: "jar-2",
    title: "Festive & Holiday Treats",
    recipeCount: 2,
    coverImages: [
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600",
      "https://images.unsplash.com/photo-1703118834585-67fd82bdefdd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXhlbCUyMGFydCUyMGNvb2tpZXN8ZW58MXx8fHwxNzY0MjI5NzM4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
  },
  {
    id: "jar-3",
    title: "Soft & Chewy Classics",
    recipeCount: 2,
    coverImages: [
      "https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=600",
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600",
    ],
  },
];

export function HomeFeed({ isLoggedIn = false, onLogout }: HomeFeedProps) {
  const [recipes] = useState(MOCK_RECIPES);
  const nav = useNav();

  const trendingMain = recipes[5];
  const trendingSide = recipes.slice(0, 3);
  
  return (
    <div className="min-h-screen bg-[var(--background-image)]">
      {/* Header */}
      <NavBar 
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
        notificationCount={3}
      />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="pixel-card bg-white p-8 md:p-12 text-center">
          <div className="inline-block w-32 h-32 relative mb-4">
              <img
                src={homefeed}
                alt="Baker Hamster"
                className="w-full h-full object-contain"
              />
            </div>
          <h2 
            className="text-2xl md:text-3xl mb-4 text-[var(--choco)]"
            style={{ fontFamily: "'Press Start 2P', cursive" }}
          >
            Digital Bakery
          </h2>

          <p className="text-lg mb-6 text-[var(--choco)] max-w-2xl mx-auto">
            Share your pixel-perfect recipes with the world. <br />
            Create, collect, and connect with bakers everywhere.
          </p>

          {isLoggedIn && (
            <PixelButton 
              variant="primary" 
              size="lg"
              onClick={() => nav.create()}
            >
              + Create Recipe
            </PixelButton>
          )}
        </div>
      </section>
      {/* TRENDING RECIPES */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <Headline>LATEST RECIPES</Headline>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — big card */}
          <div className="lg:col-span-2">
            <RecipeCard
              {...trendingMain}
              large
              onClick={() => nav.recipe(trendingMain.id)}
            />
          </div>

          {/* RIGHT — small cards */}
          <div className="flex flex-col gap-6 w-full">
            {trendingSide.map((r) => (
              <RecipeCard
                key={r.id}
                small
                {...r}
                onClick={() => nav.recipe(r.id)}
              />
            ))}
          </div>
        </div>
      </section>
      {/* POPULAR COOKIE JARS */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <Headline>POPULAR COOKIE JARS</Headline>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_COLLECTIONS.map((col) => (
          <CollectionCard
            key={col.id}
            id={col.id}
            title={col.title}
            recipeCount={col.recipeCount}
            coverImages={col.coverImages}
            ownerUsername="CookieMaster" // mock, sau này lấy từ API
            onClick={() => nav.collection(col.id)}
          />
        ))}
        </div>
      </section>

      {/* Recipe Feed */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <Headline>LATEST RECIPES</Headline>
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