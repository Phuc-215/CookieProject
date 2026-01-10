import { useState } from 'react';
import { Heart, Bookmark, Clock, Users, ChefHat, Share2, Link2, Copy, Check } from 'lucide-react';
import { PixelTag } from '../components/PixelTag';
import { NavBar } from '../components/NavBar';
import { useNav } from '../hooks/useNav';
import { useParams, useNavigate } from 'react-router-dom';
import { CommentSection } from '../components/CommentSection'; // Import component CommentSection

interface RecipeDetailProps {
  isLoggedIn: boolean;
  onLogout: () => void;
  currentUserData?: { id: string; name: string; avatar: string };
}

// --- MOCK RECIPE DATA ---
const RECIPE = {
  id: '1',
  title: 'Classic Chocolate Chip Cookies',
  description: 'The ultimate chocolate chip cookie recipe! Crispy edges, chewy centers, and loaded with melty chocolate chips. Perfect for any occasion.',
  image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=1080',
  author: {
    username: 'BakerBob',
    avatar: null,
  },
  difficulty: 'Easy',
  prepTime: '15 min',
  cookTime: '12 min',
  servings: '24 cookies',
  likes: 245,
  isLiked: false,
  isSaved: false,
  ingredients: [
    '2 1/4 cups all-purpose flour',
    '1 tsp baking soda',
    '1 tsp salt',
    '1 cup (2 sticks) butter, softened',
    '3/4 cup granulated sugar',
    '3/4 cup packed brown sugar',
    '2 large eggs',
    '2 tsp vanilla extract',
    '2 cups chocolate chips',
  ],
  steps: [
    'Preheat oven to 375°F (190°C).',
    'In a small bowl, combine flour, baking soda, and salt. Set aside.',
    'In a large bowl, beat butter, granulated sugar, and brown sugar until creamy.',
    'Add eggs and vanilla extract to butter mixture. Beat well.',
    'Gradually blend in flour mixture.',
    'Stir in chocolate chips.',
    'Drop rounded tablespoons of dough onto ungreased cookie sheets.',
    'Bake for 9-11 minutes or until golden brown.',
    'Cool on baking sheet for 2 minutes, then remove to wire rack.',
  ],
  tags: ['Cookies', 'Chocolate', 'Dessert', 'American'],
};

export function RecipeDetail({ isLoggedIn = false, onLogout, currentUserData }: RecipeDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const nav = useNav();

  // State
  const [isLiked, setIsLiked] = useState(RECIPE.isLiked);
  const [isSaved, setIsSaved] = useState(RECIPE.isSaved);
  const [likes, setLikes] = useState(RECIPE.likes);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Handlers
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const toggleStep = (index: number) => {
    if (checkedSteps.includes(index)) {
      setCheckedSteps(checkedSteps.filter(i => i !== index));
    } else {
      setCheckedSteps([...checkedSteps, index]);
    }
  };

  const handleCopyLink = () => {
    const recipeUrl = window.location.href; // Lấy URL thật của trang hiện tại
    navigator.clipboard.writeText(recipeUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    console.log(`Sharing to ${platform}`);
    setShowShareMenu(false);
  };
  
  // Hàm chuyển hướng khi user chưa login mà muốn comment
  const handleLoginRedirect = () => {
    navigate('/login');
  };

  // Xác định user hiện tại để truyền vào CommentSection
  // (Nếu isLoggedIn = false thì currentUser = null)
  const activeUser = isLoggedIn && currentUserData ? currentUserData : null;

  return (
    <div className="min-h-screen bg-[var(--background-image)] pb-12">
      {/* Header */}
      <NavBar
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
        notificationCount={1}
        showBackButton={true}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* === HERO IMAGE SECTION === */}
        <div className="pixel-card bg-white p-0 mb-8 overflow-hidden">
          <div className="relative aspect-video md:aspect-[2.5/1]"> {/* Chỉnh lại tỉ lệ ảnh cho đỡ cao */}
            <img 
              src={RECIPE.image} 
              alt={RECIPE.title} 
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
                onClick={() => setIsSaved(!isSaved)}
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
                  <div className="absolute top-14 right-0 bg-white pixel-border shadow-lg w-40 animate-fade-in">
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
              {RECIPE.title}
            </h1>

            {/* Author */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <button 
                  className="inline-flex items-center gap-3 group"
                  onClick ={() => nav.profile(RECIPE.author.username)}
                >
                  <div className="w-10 h-10 bg-[#4DB6AC] border-2 border-[#4A3B32] flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${RECIPE.author.username}`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-vt323 text-lg uppercase group-hover:underline decoration-2 underline-offset-4">
                    by {RECIPE.author.username}
                  </span>
                </button>

                 {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {RECIPE.tags.map((tag) => (
                    <PixelTag key={tag} label={tag} />
                  ))}
                </div>
            </div>

            <p className="text-lg font-vt323 mb-8 leading-relaxed text-gray-700 bg-[#FFF8E1] p-4 border-2 border-[#4A3B32]/20 border-dashed">
                {RECIPE.description}
            </p>

            {/* Meta Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center justify-center p-3 border-2 border-[#4A3B32] bg-[#F5F5F5]">
                <ChefHat className="w-6 h-6 mb-1 text-[#4A3B32]" />
                <span className="text-xs uppercase text-gray-500 font-bold">Difficulty</span>
                <span className="text-sm font-vt323 text-lg">{RECIPE.difficulty}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 border-2 border-[#4A3B32] bg-[#F5F5F5]">
                <Clock className="w-6 h-6 mb-1 text-[#4A3B32]" />
                <span className="text-xs uppercase text-gray-500 font-bold">Prep Time</span>
                <span className="text-sm font-vt323 text-lg">{RECIPE.prepTime}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 border-2 border-[#4A3B32] bg-[#F5F5F5]">
                <Clock className="w-6 h-6 mb-1 text-[#4A3B32]" />
                <span className="text-xs uppercase text-gray-500 font-bold">Cook Time</span>
                <span className="text-sm font-vt323 text-lg">{RECIPE.cookTime}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 border-2 border-[#4A3B32] bg-[#F5F5F5]">
                <Users className="w-6 h-6 mb-1 text-[#4A3B32]" />
                <span className="text-xs uppercase text-gray-500 font-bold">Servings</span>
                <span className="text-sm font-vt323 text-lg">{RECIPE.servings}</span>
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
                {RECIPE.ingredients.map((ingredient, index) => (
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
                {RECIPE.steps.map((step, index) => (
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

            {/* COMMENTS SECTION (NEW) */}
            <div className="pixel-card bg-white p-6 md:p-8">
               <CommentSection 
                 recipeId={id || '1'} 
                 currentUser={activeUser} // Truyền user thực tế hoặc null
                 onLoginClick={handleLoginRedirect}
               />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}