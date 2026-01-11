import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Bookmark, Clock, Users, ChefHat, Share2, Link2, Copy, Check, Loader2 } from 'lucide-react';

import { useNav } from '../hooks/useNav';
import { AddToCollectionModal } from "@/components/modals/AddToCollectionModal";
import { getDetailApi, likeRecipeApi, unlikeRecipeApi } from '@/api/recipe.api';
import { CommentSection } from '../components/CommentSection'; 

// --- Backend Response Interface ---
interface BackendRecipeData {
  id: number;
  title: string;
  description?: string;
  thumbnail_url?: string;
  author_id?: number;
  user_id?: number;
  author_name?: string;
  author_avatar?: string | null;
  difficulty?: string;
  cook_time_min?: number;
  servings?: number;
  likes_count?: number;
  is_liked?: boolean;
  is_saved?: boolean;
  ingredients?: Array<{ name: string; amount: number; unit: string }>;
  steps?: Array<{ step_number: number; description: string; image_urls?: string[] }>;
}

// --- UI Interface (Existing, matches your JSX) ---
interface RecipeData {
  id: string;
  title: string;
  description: string;
  image: string;
  author: {
    id: string;
    username: string;
    avatar?: string | null;
  };
  difficulty: string;
  cookTime: string;
  servings: string;
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  ingredients: string[]; // UI expects array of strings
  steps: string[];       // UI expects array of strings
}

interface RecipeDetailProps {
  isLoggedIn?: boolean;
  currentUserData?: { id: string; name: string; avatar: string } | null;
}

export function RecipeDetail({ isLoggedIn = false }: RecipeDetailProps) {
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const nav = useNav();

  // Data States
  const [recipe, setRecipe] = useState<RecipeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interaction States
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likes, setLikes] = useState(0);
  
  const [showAddToJar, setShowAddToJar] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    if (!id) return;

    const fetchRecipe = async () => {
      try {
        setIsLoading(true);
        // fetch raw data
        const response = await getDetailApi(id);
        const raw = response.data.data as unknown as BackendRecipeData; // Access the inner data from controller response

        // --- MAPPING LOGIC (Backend -> Frontend Adapter) ---
        const mappedRecipe: RecipeData = {
          id: raw.id.toString(),
          title: raw.title,
          description: raw.description || "",
          image: raw.thumbnail_url || "https://via.placeholder.com/800x400?text=No+Image",
          author: {
            id: raw.author_id?.toString() || raw.user_id?.toString() || "",
            username: raw.author_name || "Unknown",
            avatar: raw.author_avatar
          },
          difficulty: raw.difficulty || "Medium",
          cookTime: raw.cook_time_min ? `${raw.cook_time_min} min` : "N/A",
          servings: raw.servings ? `${raw.servings} ppl` : "N/A",
          likes: raw.likes_count || 0,
          isLiked: raw.is_liked || false,
          isSaved: raw.is_saved || false,
          
          // Flatten Ingredients Object Array -> String Array for UI
          ingredients: raw.ingredients 
            ? raw.ingredients.map(i => `${i.amount || ''} ${i.unit || ''} ${i.name}`.trim()) 
            : [],
            
          // Flatten Steps Object Array -> String Array for UI
          steps: raw.steps 
            ? raw.steps.map(s => s.description) 
            : [],
            
        };
        
        setRecipe(mappedRecipe);
        
        // Sync interaction state
        setLikes(mappedRecipe.likes);
        setIsLiked(mappedRecipe.isLiked);
        setIsSaved(mappedRecipe.isSaved);
        
      } catch (err) {
        console.error("Failed to fetch recipe:", err);
        setError("Failed to load recipe.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  // --- HANDLERS ---
  const handleLike = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // Optimistic Update
    const previousLiked = isLiked;
    const previousCount = likes;
    
    setIsLiked(!previousLiked);
    setLikes(previousLiked ? previousCount - 1 : previousCount + 1);

    try {
      if (previousLiked) {
        await unlikeRecipeApi(id!);
      } else {
        await likeRecipeApi(id!);
      }
    } catch (err) {
      // Revert on error
      console.error("Like failed", err);
      setIsLiked(previousLiked);
      setLikes(previousCount);
    }
  };
  
  const handleBookmark = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    // We open the modal, the modal handles the actual API call to save to a specific jar
    setShowAddToJar(true);
  };

  const toggleStep = (index: number) => {
    if (checkedSteps.includes(index)) {
      setCheckedSteps(checkedSteps.filter(i => i !== index));
    } else {
      setCheckedSteps([...checkedSteps, index]);
    }
  };

  const handleCopyLink = () => {
    const recipeUrl = window.location.href;
    navigator.clipboard.writeText(recipeUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    console.log(`Sharing to ${platform}`);
    setShowShareMenu(false);
  };
  
  const handleLoginRedirect = () => {
    navigate('/login');
  };
  const user = JSON.parse(localStorage.getItem("user") || '{}');
  console.log("User from localStorage:", user);
  const currentUserData = {
    id: user.id || '',
    name: user?.username || 'Guest',
    avatar: user?.avatar_url || '',
  };
  console.log("Current User Data:", currentUserData);
  const activeUser = isLoggedIn ? currentUserData : null;

  // --- RENDER: LOADING STATE ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background-image)] flex items-center justify-center">
        <div className="bg-white p-8 pixel-card flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#5D4037]" />
            <p className="font-vt323 text-xl">Loading Recipe...</p>
        </div>
      </div>
    );
  }

  // --- RENDER: ERROR STATE ---
  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-[var(--background-image)] flex items-center justify-center">
        <div className="bg-white p-8 pixel-card text-center">
            <h2 className="font-pixel text-xl mb-4 text-red-500">Error</h2>
            <p className="font-vt323 text-lg">{error || "Recipe not found"}</p>
            <button onClick={() => nav.home()} className="mt-4 text-blue-500 hover:underline font-vt323">
                Go Home
            </button>
        </div>
      </div>
    );
  }

  // --- RENDER: SUCCESS STATE (UI Unchanged) ---
  return (
    <div className="min-h-screen bg-[var(--background-image)]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* === HERO IMAGE SECTION === */}
        <div className="pixel-card bg-white p-0 mb-8 overflow-hidden">
          <div className="relative aspect-video md:aspect-[2.5/1]">
            <img 
              src={recipe.image} 
              alt={recipe.title} 
              className="w-full h-full object-cover"
            />
            {/* Floating Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-3 z-10">
              <button
                className={`w-12 h-12 pixel-border flex items-center justify-center backdrop-blur-sm transition-colors ${
                  isLiked ? 'bg-[#FF8FAB]' : 'bg-white/90 hover:bg-white'
                }`}
                onClick={handleLike}
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-[#5D4037]' : ''}`} />
              </button>
              <button
                className={`w-12 h-12 pixel-border flex items-center justify-center backdrop-blur-sm transition-colors ${
                  isSaved ? 'bg-[#4DB6AC]' : 'bg-white/90 hover:bg-white'
                }`}
                onClick={handleBookmark}
              >
                <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-[#5D4037]' : ''}`} />
              </button>
              
              <div className="relative">
                <button
                  className="w-12 h-12 pixel-border flex items-center justify-center backdrop-blur-sm bg-white/90 hover:bg-white transition-colors"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                >
                  <Share2 className="w-6 h-6" />
                </button>
                
                {showShareMenu && (
                  <div className="absolute top-14 right-0 bg-white pixel-border shadow-lg w-40 animate-fade-in z-20">
                    <button className="w-full text-left flex items-center gap-2 px-4 py-3 hover:bg-[#FFF8E1] transition-colors border-b-2 border-dashed border-[#4A3B32]/10" onClick={() => handleShare('Facebook')}>
                      <Link2 className="w-4 h-4" /> Facebook
                    </button>
                    <button className="w-full text-left flex items-center gap-2 px-4 py-3 hover:bg-[#FFF8E1] transition-colors border-b-2 border-dashed border-[#4A3B32]/10" onClick={() => handleShare('Twitter')}>
                      <Link2 className="w-4 h-4" /> Twitter
                    </button>
                    <button className="w-full text-left flex items-center gap-2 px-4 py-3 hover:bg-[#FFF8E1] transition-colors" onClick={handleCopyLink}>
                      {linkCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />} 
                      {linkCopied ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 border-t-[3px] border-[#5D4037]">
            <h1 
              className="text-2xl md:text-3xl mb-4 leading-tight text-[#4A3B32]" 
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              {recipe?.title}
            </h1>

            {/* Author */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <button 
                  className="inline-flex items-center gap-3 group"
                  onClick ={() => nav.profile(recipe?.author.id)}
                >
                  <div className="w-10 h-10 bg-[#4DB6AC] border-2 border-[#4A3B32] flex items-center justify-center overflow-hidden">
                    <img src={recipe?.author?.avatar || undefined} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-vt323 text-lg uppercase group-hover:underline decoration-2 underline-offset-4">
                    by {recipe?.author?.username}
                  </span>
                </button>

            </div>

            <p className="text-lg font-vt323 mb-8 leading-relaxed text-gray-700 bg-[#FFF8E1] p-4 border-2 border-[#4A3B32]/20 border-dashed">
                {recipe?.description}
            </p>

            {/* Meta Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center p-3 border-2 border-[#4A3B32] bg-[#F5F5F5]">
                <ChefHat className="w-6 h-6 mb-1 text-[#4A3B32]" />
                <span className="text-xs uppercase text-gray-500 font-bold">Difficulty</span>
                <span className="text-sm font-vt323 text-lg">{recipe.difficulty}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 border-2 border-[#4A3B32] bg-[#F5F5F5]">
                <Clock className="w-6 h-6 mb-1 text-[#4A3B32]" />
                <span className="text-xs uppercase text-gray-500 font-bold">Cook Time</span>
                <span className="text-sm font-vt323 text-lg">{recipe.cookTime}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 border-2 border-[#4A3B32] bg-[#F5F5F5]">
                <Users className="w-6 h-6 mb-1 text-[#4A3B32]" />
                <span className="text-xs uppercase text-gray-500 font-bold">Servings</span>
                <span className="text-sm font-vt323 text-lg">{recipe.servings}</span>
              </div>
            </div>
          </div>
        </div>

        {/* === MAIN CONTENT GRID === */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT COL: Ingredients */}
          <div className="lg:col-span-1">
            <div className="pixel-card bg-white p-6 sticky top-24">
              <h2 
                className="text-lg mb-6 text-[#4A3B32] border-b-4 border-[#FF99AA] pb-2 inline-block" 
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                Ingredients
              </h2>
              <ul className="space-y-4">
                {recipe?.ingredients?.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3 text-base font-vt323 text-lg hover:bg-gray-50 p-1 rounded transition-colors">
                    <span className="w-2 h-2 bg-[#FF99AA] border border-[#4A3B32] mt-2 shrink-0"></span>
                    <span className="text-gray-800">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT COL: Instructions & Comments */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* INSTRUCTIONS */}
            <div className="pixel-card bg-white p-6 md:p-8">
              <h2 
                className="text-lg mb-8 text-[#4A3B32] border-b-4 border-[#4DB6AC] pb-2 inline-block" 
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                Instructions
              </h2>
              <div className="space-y-6">
                {recipe?.steps?.map((step, index) => (
                  <div 
                    key={index} 
                    className={`
                        relative flex gap-4 p-5 border-2 transition-all cursor-pointer group
                        ${checkedSteps.includes(index) 
                            ? 'bg-[#E0F2F1] border-[#4DB6AC] opacity-70' 
                            : 'bg-white border-[#4A3B32]/20 hover:border-[#4A3B32] hover:shadow-[4px_4px_0_rgba(74,59,50,0.1)]'
                        }
                    `}
                    onClick={() => toggleStep(index)}
                  >
                    {/* Step Number */}
                    <div className={`
                        w-8 h-8 flex items-center justify-center font-vt323 text-xl font-bold shrink-0 border-2 transition-colors
                        ${checkedSteps.includes(index) 
                            ? 'bg-[#4DB6AC] border-[#4DB6AC] text-white' 
                            : 'bg-[#FFF8E1] border-[#4A3B32] text-[#4A3B32]'
                        }
                    `}>
                      {checkedSteps.includes(index) ? '✓' : index + 1}
                    </div>
                    
                    {/* Step Text */}
                    <p className={`font-vt323 text-xl leading-relaxed ${checkedSteps.includes(index) ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* COMMENTS SECTION */}
            <div className="pixel-card bg-white p-6 md:p-8">
               <CommentSection 
                 recipeId={id || '1'} 
                 currentUser={activeUser} 
                 onLoginClick={handleLoginRedirect}
               />
            </div>

          </div>
        </div>
        
        {/* ===== Add To Jar Modal ===== */}
        {showAddToJar && recipe && (
          <AddToCollectionModal
            onClose={() => setShowAddToJar(false)}
            onAdd={(jarId) => {
              console.log('Add recipe', recipe.id, 'to jar', jarId);
              setIsSaved(true);
              setShowAddToJar(false);
            }}
          />
        )}
      </div>
    </div>
  );
}