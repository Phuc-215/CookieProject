import { useState } from 'react';
import { PixelButton } from '../../components/PixelButton';
import { useNavigate } from 'react-router-dom';
import { RecipeCard } from '../../components/RecipeCard';
import { CollectionCard } from "../../components/CollectionCard";
import { useNav } from '../../hooks/useNav'; 
import { Headline } from './Headline'; 
import homefeed from "../../assets/homefeed.svg"; 
import { Image, Video, Smile, Star, Clock, Grid, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface HomeFeedProps {
  isLoggedIn?: boolean;
}

// --- MOCK DATA ---
const MOCK_RECIPES = [
  { id: '1', title: 'Classic Chocolate Chip', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBjaGlwJTIwY29va2llc3xlbnwxfHx8fDE3NjQyMDU4MzN8MA&ixlib=rb-4.1.0&q=80&w=1080', author: 'BakerBob', difficulty: 'Easy' as const, time: '30 min', likes: 245, isLiked: false, isSaved: false, category: "Cookies" },
  { id: '2', title: 'Rainbow Macarons', image: 'https://images.unsplash.com/photo-1580421383318-f87fc861a696?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWNhcm9ucyUyMGRlc3NlcnR8ZW58MXx8fHwxNzY0MjA1NTAzfDA&ixlib=rb-4.1.0&q=80&w=1080', author: 'SweetChef', difficulty: 'Hard' as const, time: '120 min', likes: 523, isLiked: true, isSaved: true, category: "Cookies" },
  { id: '3', title: 'Vanilla Cupcakes', image: 'https://images.unsplash.com/photo-1555526148-0fa555bb2e78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXBjYWtlcyUyMGNvbG9yZnVsfGVufDF8fHx8MTc2NDE4MTA1MHww&ixlib=rb-4.1.0&q=80&w=1080', author: 'CakeQueen', difficulty: 'Medium' as const, time: '45 min', likes: 387, isLiked: false, isSaved: false, category: "Cupcakes & Muffins" },
  { id: '4', title: 'Glazed Donuts', image: 'https://images.unsplash.com/photo-1506224772180-d75b3efbe9be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb251dHMlMjBzcHJpbmtsZXN8ZW58MXx8fHwxNzY0MjI5NzM5fDA&ixlib=rb-4.1.0&q=80&w=1080', author: 'DonutDave', difficulty: 'Medium' as const, time: '60 min', likes: 412, isLiked: false, isSaved: false, category: "Brownies & Bars" },
  { id: '5', title: 'Fudgy Brownies', image: 'https://images.unsplash.com/photo-1617996884841-3949eaec3448?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm93bmllcyUyMGNob2NvbGF0ZXxlbnwxfHx8fDE3NjQyMjkxNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080', author: 'ChocMaster', difficulty: 'Easy' as const, time: '35 min', likes: 678, isLiked: true, isSaved: false, category: "Brownies & Bars" },
  { id: '6', title: 'Pixel Perfect Cookie', image: 'https://images.unsplash.com/photo-1703118834585-67fd82bdefdd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXhlbCUyMGFydCUyMGNvb2tpZXN8ZW58MXx8fHwxNzY0MjI5NzM4fDA&ixlib=rb-4.1.0&q=80&w=1080', author: 'PixelBaker', difficulty: 'Medium' as const, time: '50 min', likes: 891, isLiked: false, isSaved: true, category: "Cookies" },
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

export function HomeFeed({ isLoggedIn = false}: HomeFeedProps) {
  const [recipes] = useState(MOCK_RECIPES);
  const nav = useNav();
  const navigate = useNavigate(); // 2. Khởi tạo hook navigate
  
  // State quản lý tab
  const [activeTab, setActiveTab] = useState<TabType>('trending');
  const [selectedCategory, setSelectedCategory] = useState("All");

  const trendingMain = recipes[5];
  const trendingSide = recipes.slice(0, 3);
  const filteredRecipes = selectedCategory === "All" ? recipes : recipes.filter(r => r.category === selectedCategory);
  
  // --- LOGIC QUAY SỐ (DIAL) ---
  // Tìm ra thứ tự 3 mục dựa trên tab đang chọn
  const getTabOrder = () => {
    const currentIndex = TABS.findIndex(t => t.id === activeTab);
    const prevIndex = (currentIndex - 1 + TABS.length) % TABS.length; // Quay lùi
    const nextIndex = (currentIndex + 1) % TABS.length; // Quay tới
    
    return {
      prev: TABS[prevIndex],
      current: TABS[currentIndex],
      next: TABS[nextIndex]
    };
  };

  const { prev, current, next } = getTabOrder();

  // 3. HÀM XỬ LÝ SỰ KIỆN NÚT DISCOVER MORE
  const handleDiscoverMore = () => {
    const params = new URLSearchParams();

    // A. Xử lý Filter Category (Ưu tiên cao nhất: Luôn thêm nếu đang chọn)
    if (selectedCategory !== 'All') {
      params.set('category', selectedCategory);
    }

    // B. Xử lý theo Tab đang active
    switch (activeTab) {
      case 'trending':
        // Trending -> Lọc theo lượt thích
        params.set('sort', 'likes'); 
        break;

      case 'latest':
        // Recent/Latest -> Lọc theo thời gian mới nhất
        params.set('sort', 'newest'); 
        break;

      case 'collections':
        // Cookie Jar -> Lọc theo loại Collections
        params.set('type', 'collections'); 
        break;
    }

    // Chuyển hướng sang trang Search kèm params đã tạo
    // Ví dụ URL tạo ra: /search?category=Cookies&sort=likes
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background-image)]">
      {/* Hero Section */}
      {!isLoggedIn && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="pixel-card bg-white p-8 md:p-8 text-center flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="w-32 h-32 relative shrink-0">
              <img src={homefeed} alt="Baker Hamster" className="w-full h-full object-contain" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl mb-2 text-[var(--choco)]" style={{ fontFamily: "'Press Start 2P', cursive" }}>Digital Bakery</h2>
              <p className="text-lg text-[var(--choco)] font-vt323">Share your pixel-perfect recipes with the world.</p>
            </div>
          </div>
        </section>
      )}

      {isLoggedIn && <CreatePostBar/>}

      <section className="max-w-7xl mx-auto px-4">
        
        {/* === BỘ CHỌN QUAY SỐ (ROTARY DIAL) === */}
        <div className="relative mb-8">
            <div className="flex items-center justify-center gap-4 md:gap-8 h-24">
                
                {/* 1. NÚT TRÁI (Previous) */}
                <button 
                    onClick={() => setActiveTab(prev.id)}
                    className="group flex items-center gap-2 px-6 py-3 bg-white border-4 border-[#4A3B32]/60 text-[#4A3B32]/50 font-vt323 text-xl transition-all transform scale-90 hover:scale-95 hover:border-[#4A3B32] hover:text-[#4A3B32] hover:shadow-[4px_4px_0px_rgba(74,59,50,0.2)]"
                >
                    <ChevronLeft size={16} />
                    <span className="hidden md:inline">{prev.label}</span>
                    <span className="md:hidden">{/* Icon only on mobile if needed */}</span>
                </button>

                {/* 2. NÚT GIỮA (Active - To nhất) */}
                <div className="z-10 transform scale-110">
                    <div className="flex items-center gap-3 px-8 py-4 bg-[#FF99AA] border-4 border-[#4A3B32] text-[#4A3B32] font-vt323 text-2xl font-bold shadow-[6px_6px_0px_#4A3B32]">
                        {current.icon}
                        {current.label}
                    </div>
                </div>

                {/* 3. NÚT PHẢI (Next) */}
                <button 
                    onClick={() => setActiveTab(next.id)}
                    className="group flex items-center gap-2 px-6 py-3 bg-white border-4 border-[#4A3B32]/60 text-[#4A3B32]/50 font-vt323 text-xl transition-all transform scale-90 hover:scale-95 hover:border-[#4A3B32] hover:text-[#4A3B32] hover:shadow-[4px_4px_0px_rgba(74,59,50,0.2)]"
                >
                    <span className="hidden md:inline">{next.label}</span>
                    <ChevronRight size={16} />
                </button>

            </div>
            
            {/* Đường kẻ trang trí nối các nút */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-[#4A3B32]/60 -z-10 rounded-full"></div>
        </div>

        {/* === KHUNG HIỂN THỊ NỘI DUNG (Dựa trên Active Tab) === */}
        {activeTab !== "collections" && (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide md:justify-center border-b-2 border-[#4A3B32]/10 pb-6">
                {FILTER_CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`
                            px-3 py-1 font-vt323 text-lg border-2 whitespace-nowrap transition-all
                            ${selectedCategory === cat 
                                ? 'bg-[#FF99AA] border-[#4A3B32] text-[#4A3B32] shadow-[2px_2px_0px_#4A3B32]' 
                                : 'bg-white border-[#4A3B32] text-[#4A3B32]/70 hover:bg-gray-50'
                            }
                        `}
                    >
                        {cat}
                    </button>
                ))}
            </div>
          
        )}
        <div className="min-h-[600px] relative">
            {/* Category Filter */}
            
            {/* VIEW 1: TRENDING */}
            {activeTab === 'trending' && (
                <div className="animate-fade-in space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <RecipeCard {...trendingMain} large onClick={() => nav.recipe(trendingMain.id)} />
                        </div>
                        <div className="flex flex-col gap-6 w-full">
                            {trendingSide.map((r) => (
                                <RecipeCard key={r.id} small {...r} onClick={() => nav.recipe(r.id)} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW 2: COLLECTIONS */}
            {activeTab === 'collections' && (
                <div className="animate-fade-in space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {MOCK_COLLECTIONS.map((col) => (
                            <CollectionCard
                                key={col.id}
                                title={col.title}
                                recipeCount={col.recipeCount}
                                coverImages={col.coverImages}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* VIEW 3: LATEST */}
            {activeTab === 'latest' && (
                <div className="animate-fade-in space-y-6">
                    

                    {/* Grid */}
                    {filteredRecipes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredRecipes.map((recipe) => (
                                <RecipeCard key={recipe.id} {...recipe} onClick={() => nav.recipe(recipe.id)} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-4 border-[#4A3B32] bg-white border-dashed opacity-70">
                            <p className="font-vt323 text-2xl text-[#4A3B32]">No recipes found in {selectedCategory} yet!</p>
                        </div>
                    )}
                </div>
            )}

            {/* 4. NÚT DISCOVER MORE (Mới thêm vào đây) */}
            <div className="relative mt-5 flex justify-center">
              <PixelButton 
                variant="primary" 
                className="px-8 py-3 text-lg flex items-center gap-2 group shadow-[6px_6px_0px_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"
                onClick={handleDiscoverMore}
              >
                {/* Text thay đổi linh hoạt */}
                {activeTab === 'collections' ? 'Discover All Jars' : 'Discover More Recipes'}
                
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </PixelButton>
              <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-[#4A3B32]/60 -z-10 rounded-full"></div>
            </div>
            
        </div>
      </section>
    </div>
  );
}