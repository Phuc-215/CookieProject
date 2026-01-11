import { useState, useEffect } from 'react';
import { PixelButton } from '../../components/PixelButton';
import { useNavigate } from 'react-router-dom';
import { RecipeCard } from '../../components/RecipeCard';
import { CollectionCard } from "../../components/CollectionCard";
import { useNav } from '../../hooks/useNav'; 
import homefeed from "../../assets/homefeed.svg"; 
import { Star, Clock, Grid, ChevronLeft, ChevronRight, ArrowRight, Loader2 } from 'lucide-react';
import { searchApi } from '../../api/search.api';
import { getCategoriesListApi } from '../../api/category.api';
import { Category } from '../../types/Category';

interface HomeFeedProps {
  isLoggedIn?: boolean;
}

type TabType = 'trending' | 'collections' | 'latest';

const TABS: { id: TabType, label: string, icon: React.ReactNode }[] = [
  { id: 'trending', label: 'TRENDING', icon: <Star size={20} /> },
  { id: 'collections', label: 'COOKIE JARS', icon: <Grid size={20} /> },
  { id: 'latest', label: 'LATEST', icon: <Clock size={20} /> },
];

const CreatePostBar = () => {
  const nav = useNav(); 
  return (
    <div className="max-w-7xl my-[25px] mx-auto px-4 mb-8">
      <div className="bg-white border-4 border-[#4A3B32] p-4 flex items-center gap-4 shadow-[4px_4px_0px_rgba(74,59,50,0.2)]">
        <div className="w-12 h-12 shrink-0 bg-[#FF99AA] border-2 border-[#4A3B32] flex items-center justify-center overflow-hidden">
           <img src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=Felix`} alt="User Avatar" className="w-full h-full object-cover"/>
        </div>
        <div onClick={() => nav.create()} className="flex-1 bg-[#FFF8E7] hover:bg-[#FFE4C4] border-2 border-[#4A3B32] h-12 flex items-center px-4 cursor-pointer transition-colors group">
          <span className="font-vt323 text-xl text-[#4A3B32]/60 group-hover:text-[#4A3B32]">Wanna share a fantastic recipe of yours?</span>
        </div>
      </div>
    </div>
  );
};


// --- MOCK COLLECTIONS (Replace with API later) ---
const MOCK_COLLECTIONS = [
  {
    id: "jar-1",
    title: "Chocolate Heaven",
    recipeCount: 14,
    coverImages: ["https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600"],
  },
  {
    id: "jar-2",
    title: "Festive & Holiday Treats",
    recipeCount: 2,
    coverImages: ["https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600"],
  },
];

export function HomeFeed({ isLoggedIn = false}: HomeFeedProps) {
  const nav = useNav();
  const navigate = useNavigate();
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<TabType>('trending');
  
  // Category state - use category name as value
  const [selectedCategoryValue, setSelectedCategoryValue] = useState("All"); 
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Data States
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- FETCH CATEGORIES EFFECT ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategoriesListApi();
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // --- FETCH DATA EFFECT ---
  useEffect(() => {
    // Only fetch recipes if we are NOT in 'collections' tab
    if (activeTab === 'collections') return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Determine sort based on active tab
        const sortType = activeTab === 'trending' ? 'popular' : 'newest';
        
        // Prepare params
        const params = {
          page: 1,
          limit: activeTab === 'trending' ? 4 : 6, // Trending needs 4 (1 big + 3 small), Latest needs 6 grid
          sort: sortType,
          // Only send category if it's not "All" - use category name
          category: selectedCategoryValue !== "All" ? selectedCategoryValue : undefined,
        };

        const res = await searchApi(params);
        setRecipes(Array.isArray(res.data.results) ? res.data.results : []);
      } catch (error) {
        console.error("Failed to fetch home feed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab, selectedCategoryValue]); // Re-fetch when Tab or Category changes

  // --- PREPARE DATA FOR VIEW ---
  // For Trending: Split into Main (1st) and Side (Next 3)
  const trendingMain = recipes[0];
  const trendingSide = recipes.slice(1, 4);

  // --- LOGIC QUAY SỐ (DIAL) ---
  const getTabOrder = () => {
    const currentIndex = TABS.findIndex(t => t.id === activeTab);
    const prevIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    const nextIndex = (currentIndex + 1) % TABS.length;
    
    return {
      prev: TABS[prevIndex],
      current: TABS[currentIndex],
      next: TABS[nextIndex]
    };
  };

  const { prev, current, next } = getTabOrder();

  // --- HANDLE DISCOVER MORE ---
  const handleDiscoverMore = () => {
    const params = new URLSearchParams();

    // Use the SLUG value for URL
    if (selectedCategoryValue !== 'All') {
      params.set('category', selectedCategoryValue);
    }

    switch (activeTab) {
      case 'trending':
        params.set('sort', 'popular'); 
        break;
      case 'latest':
        params.set('sort', 'newest'); 
        break;
      case 'collections':
        params.set('type', 'collections'); 
        break;
    }

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
            <div className="absolute top-1/2 left-0 w-full h-1 bg-[#4A3B32]/60 -z-10 rounded-full"></div>
        </div>

        {/* === CATEGORY FILTER (Dynamic from API) === */}
        {activeTab !== "collections" && (
          <div className="relative border-b-2 border-[#4A3B32]/10 pb-6">
            {/* Gradient fade indicators for scroll hint */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#FFF8E1] to-transparent pointer-events-none z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#FFF8E1] to-transparent pointer-events-none z-10"></div>
            
            {/* Scrollable category container */}
            <div className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-4 md:px-0 md:justify-center">
                {/* "All" option */}
                <button
                    key="All"
                    onClick={() => setSelectedCategoryValue("All")}
                    className={`
                        px-3 py-1 font-vt323 text-lg border-2 whitespace-nowrap transition-all shrink-0
                        ${selectedCategoryValue === "All" 
                            ? 'bg-[#FF99AA] border-[#4A3B32] text-[#4A3B32] shadow-[2px_2px_0px_#4A3B32]' 
                            : 'bg-white border-[#4A3B32] text-[#4A3B32]/70 hover:bg-gray-50'
                        }
                    `}
                >
                    All
                </button>
                {/* Categories from API */}
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryValue(cat.name)}
                        className={`
                            px-3 py-1 font-vt323 text-lg border-2 whitespace-nowrap transition-all shrink-0
                            ${selectedCategoryValue === cat.name 
                                ? 'bg-[#FF99AA] border-[#4A3B32] text-[#4A3B32] shadow-[2px_2px_0px_#4A3B32]' 
                                : 'bg-white border-[#4A3B32] text-[#4A3B32]/70 hover:bg-gray-50'
                            }
                        `}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
          </div>
        )}

        {/* === CONTENT DISPLAY === */}
        <div className="min-h-[600px] relative mt-6">
            
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-10 h-10 animate-spin text-[#4A3B32]" />
                </div>
            ) : (
                <>
                    {/* VIEW 1: TRENDING */}
                    {activeTab === 'trending' && (
                        <div className="animate-fade-in space-y-6">
                            {recipes.length > 0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Main Hero Recipe */}
                                    {trendingMain && (
                                        <div className="lg:col-span-2">
                                            <RecipeCard 
                                                id={trendingMain.id}
                                                title={trendingMain.title}
                                                image={trendingMain.thumbnail_url}
                                                author={trendingMain.author}
                                                likes={trendingMain.likes_count}
                                                time={`${trendingMain.cook_time_min} min`}
                                                difficulty={trendingMain.difficulty}
                                                large 
                                                onClick={() => nav.recipe(trendingMain.id)} 
                                            />
                                        </div>
                                    )}
                                    {/* Side List */}
                                    <div className="flex flex-col gap-6 w-full">
                                        {trendingSide.map((r) => (
                                            <RecipeCard 
                                                key={r.id} 
                                                id={r.id}
                                                title={r.title}
                                                image={r.thumbnail_url}
                                                author={r.author}
                                                likes={r.likes_count}
                                                time={`${r.cook_time_min} min`}
                                                difficulty={r.difficulty}
                                                small 
                                                onClick={() => nav.recipe(r.id)} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 border-4 border-[#4A3B32] bg-white border-dashed opacity-70">
                                    <p className="font-vt323 text-2xl text-[#4A3B32]">No trending recipes found!</p>
                                </div>
                            )}
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
                            {recipes.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {recipes.map((r) => (
                                        <RecipeCard 
                                            key={r.id} 
                                            id={r.id}
                                            title={r.title}
                                            image={r.thumbnail_url}
                                            author={r.author}
                                            likes={r.likes_count}
                                            time={`${r.cook_time_min} min`}
                                            difficulty={r.difficulty}
                                            onClick={() => nav.recipe(r.id)} 
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border-4 border-[#4A3B32] bg-white border-dashed opacity-70">
                                    <p className="font-vt323 text-2xl text-[#4A3B32]">No recipes found!</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* DISCOVER MORE BUTTON */}
            {/* Sửa className: dùng py-12 (padding top & bottom đều nhau) và items-center */}
            <div className="relative py-12 flex justify-center items-center">
              
              {/* Line: Giữ nguyên absolute center */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-[#4A3B32]/60 -z-10 rounded-full -translate-y-1/2"></div>
              
              <PixelButton 
                variant="primary" 
                className="px-8 py-3 text-lg flex items-center gap-2 group shadow-[6px_6px_0px_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"
                onClick={handleDiscoverMore}
              >
                {activeTab === 'collections' ? 'Discover All Jars' : 'Discover More Recipes'}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </PixelButton>
            </div>
            
        </div>
      </section>
    </div>
  );
};