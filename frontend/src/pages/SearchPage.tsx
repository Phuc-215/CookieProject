import React, { useState, useEffect } from 'react';
import { Search, X, RefreshCw, ChevronDown, LayoutGrid, FileText, Ban } from 'lucide-react';
import { RecipeCard } from '../components/RecipeCard';
import { CollectionCard } from '../components/CollectionCard';
import { PixelButton } from '../components/PixelButton';
import { PixelInput } from '../components/PixelInput';
import { PixelTag } from '../components/PixelTag';
import { useNav } from '../hooks/useNav';
import { useSearchParams } from 'react-router-dom';
import { Pagination } from '../components/Pagination';

import { searchApi } from '../api/search.api';

interface SearchPageProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

// --- MOCK DATA (Có thêm trường ingredients để test lọc) ---
const MOCK_RECIPES = [
  {
    id: '1', title: 'Classic Chocolate Chip',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=1080',
    author: 'BakerBob', difficulty: 'Easy' as const, time: '30 min', likes: 245, category: 'Cookie',
    isLiked: false, isSaved: false, date: '2023-12-01',
    ingredients: ['Flour', 'Sugar', 'Chocolate', 'Butter', 'Eggs'] // Có trứng
  },
  {
    id: '2', title: 'Rainbow Macarons',
    image: 'https://images.unsplash.com/photo-1580421383318-f87fc861a696?w=1080',
    author: 'SweetChef', difficulty: 'Hard' as const, time: '120 min', likes: 523, category: 'Cookie',
    isLiked: true, isSaved: true, date: '2024-01-15',
    ingredients: ['Almond Flour', 'Sugar', 'Egg Whites', 'Food Coloring']
  },
  {
    id: '3', title: 'Vanilla Cupcakes',
    image: 'https://images.unsplash.com/photo-1555526148-0fa555bb2e78?w=1080',
    author: 'CakeQueen', difficulty: 'Medium' as const, time: '45 min', likes: 387, category: 'Cupcakes & Muffins',
    isLiked: false, isSaved: false, date: '2023-11-20',
    ingredients: ['Flour', 'Sugar', 'Butter', 'Milk', 'Vanilla', 'Eggs']
  },
  {
    id: '4', title: 'Glazed Donuts',
    image: 'https://images.unsplash.com/photo-1506224772180-d75b3efbe9be?w=1080',
    author: 'DonutDave', difficulty: 'Medium' as const, time: '60 min', likes: 412, category: 'Brownies & Bars',
    isLiked: false, isSaved: false, date: '2024-02-01',
    ingredients: ['Flour', 'Yeast', 'Sugar', 'Milk', 'Oil'] // Không trứng
  },
  {
    id: '5', title: 'Vegan Brownies', // Ví dụ món Vegan
    image: 'https://images.unsplash.com/photo-1617996884841-3949eaec3448?w=1080',
    author: 'ChocMaster', difficulty: 'Easy' as const, time: '35 min', likes: 678, category: 'Brownies & Bars',
    isLiked: true, isSaved: false, date: '2024-01-05',
    ingredients: ['Cocoa Powder', 'Oil', 'Sugar', 'Flour', 'Walnuts'] // Không trứng, không bơ
  },
  {
    id: '6', title: 'Pixel Perfect Cookie',
    image: 'https://images.unsplash.com/photo-1703118834585-67fd82bdefdd?w=1080',
    author: 'PixelBaker', difficulty: 'Medium' as const, time: '50 min', likes: 891, category: 'Cookie',
    isLiked: false, isSaved: true, date: '2024-02-10',
    ingredients: ['Magic Dust', 'Flour', 'Sugar', 'Love']
  },
];

const MOCK_COLLECTIONS = [
  { id: "jar-1", title: "Chocolate Heaven", recipeCount: 14, coverImages: ["https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600"] },
  { id: "jar-2", title: "Festive & Holiday Treats", recipeCount: 2, coverImages: ["https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600"] },
  { id: "jar-3", title: "Soft & Chewy Classics", recipeCount: 2, coverImages: ["https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=600"] },
];

interface Ingredient {
  id: string;
  name: string;
}

const CATEGORIES = ["Cookie", "Cheesecake", "Cupcakes & Muffins", "Tarts & Pies", "Brownies & Bars"];
const ITEMS_PER_PAGE = 6;

export function SearchPage({ isLoggedIn = false, onLogout }: SearchPageProps) {
  
  // --- REAL DATA STATE ---
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // --- LOCAL STATE (Cho UI nhập liệu) ---
  const [filterIngredient, setFilterIngredient] = useState<Ingredient[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  // State cho phần EXCLUDE (Loại trừ)
  const [excludeIngredient, setExcludeIngredient] = useState<Ingredient[]>([]);
  const [excludeInput, setExcludeInput] = useState("");

  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [currentPage, setCurrentPage] = useState(1);

  // --- URL PARAMS (Nguồn sự thật) ---
  const [searchParams, setSearchParams] = useSearchParams();
  
  const searchQuery = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category');
  const sortParam = searchParams.get('sort') || 'newest'; 
  const typeParam = searchParams.get('type') || 'recipes';
  const difficultyParam = searchParams.get('difficulty');
  
  const ingredientsParam = searchParams.get('ingredients'); // Include
  const excludedParam = searchParams.get('excluded');       // Exclude (Lấy từ URL)
  
  const pageParam = parseInt(searchParams.get('page') || '1');

  const nav = useNav();

  // --- FETCH DATA FROM API ---
  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const apiParams = {
          title: searchQuery || '',
          ingredients_included: ingredientsParam ? ingredientsParam.split(',').map(i => i.trim()) : [],
          ingredients_excluded: excludedParam ? excludedParam.split(',').map(i => i.trim()) : [],
          difficulty: difficultyParam ? difficultyParam.toLowerCase() : '',
          category: categoryParam || '',
          sort: sortParam || 'newest',
          page: pageParam,
          limit: ITEMS_PER_PAGE,
          userId: localStorage.getItem('userId') || null,
        };

        console.log('Fetching search results with params:', apiParams);
        
        const response = await searchApi(apiParams);

        console.log('Search results:', response.data);
        
        // Update state with real data
        setRecipes(response.data.results || []);
        setTotalRecipes(response.data.meta?.totalRecipes || 0);
        setTotalPages(response.data.meta?.totalPages || 0);
        
      } catch (error) {
        console.error('Error fetching search results:', error);
        setRecipes([]);
        setTotalRecipes(0);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery, ingredientsParam, excludedParam, difficultyParam, categoryParam, sortParam, pageParam]);

  // --- 1. SYNC URL -> LOCAL UI STATE (Khi reload trang) ---
  useEffect(() => {
    // Sync Page
    setCurrentPage(pageParam);

    // Sync Difficulty
    if (difficultyParam) setDifficulty(difficultyParam as 'Easy' | 'Medium' | 'Hard');
    else setDifficulty('Medium');

    // Sync Include Ingredients
    if (ingredientsParam) {
      setFilterIngredient(ingredientsParam.split(',').map((name, i) => ({ id: `inc-${i}`, name: name.trim() })));
    } else {
      setFilterIngredient([]);
    }

    // Sync Exclude Ingredients (QUAN TRỌNG: Đọc từ URL đổ vào State)
    if (excludedParam) {
      setExcludeIngredient(excludedParam.split(',').map((name, i) => ({ id: `exc-${i}`, name: name.trim() })));
    } else {
      setExcludeIngredient([]);
    }

  }, [difficultyParam, ingredientsParam, excludedParam, pageParam]); 

  // --- PAGINATION & VIEW TYPE ---
  const filteredCollections = MOCK_COLLECTIONS.filter(col => {
     if (searchQuery && !col.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
     return true;
  });

  const isViewRecipes = typeParam === 'recipes';
  const totalItems = isViewRecipes ? totalRecipes : filteredCollections.length;
  
  const currentRecipes = recipes; // Data is already paginated from backend

  // --- HELPERS CẬP NHẬT URL ---
  const updateParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) newParams.delete(key);
      else newParams.set(key, value);
    });
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    updateParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSort: string) => updateParams({ sort: newSort, page: '1' });
  // const handleTypeChange = (newType: string) => updateParams({ type: newType, page: '1', category: null });
  const handleCategoryClick = (cat: string) => updateParams({ category: cat, type: 'recipes', page: '1' });
  const handleCategoryReset = () => updateParams({ category: null, page: '1' });

  // Add/Remove Local State (Include)
  const handleAddInclude = (name: string) => {
    const val = name.trim();
    if (!val) return;
    if (!filterIngredient.some(i => i.name.toLowerCase() === val.toLowerCase())) {
        setFilterIngredient([...filterIngredient, { id: Date.now().toString(), name: val }]);
    }
    setIngredientInput("");
  };
  const handleRemoveInclude = (id: string) => setFilterIngredient(prev => prev.filter(i => i.id !== id));

  // Add/Remove Local State (Exclude)
  const handleAddExclude = (name: string) => {
    const val = name.trim();
    if (!val) return;
    if (!excludeIngredient.some(i => i.name.toLowerCase() === val.toLowerCase())) {
        setExcludeIngredient([...excludeIngredient, { id: Date.now().toString(), name: val }]);
    }
    setExcludeInput("");
  };
  const handleRemoveExclude = (id: string) => setExcludeIngredient(prev => prev.filter(i => i.id !== id));


  // NÚT APPLY FILTER: Đẩy state lên URL
  const handleApplyFilter = () => {
    const ingString = filterIngredient.length > 0 ? filterIngredient.map(i => i.name).join(',') : null;
    
    // Chuyển danh sách Exclude thành chuỗi ngăn cách bởi dấu phẩy
    const excString = excludeIngredient.length > 0 ? excludeIngredient.map(i => i.name).join(',') : null;
    
    updateParams({
      ingredients: ingString,
      excluded: excString, // Đẩy tham số excluded lên URL
      difficulty: difficulty,
      page: '1'
    });
  };

  // NÚT RESET
  const handleReset = () => {
    setFilterIngredient([]);
    setExcludeIngredient([]); // Reset local
    setDifficulty('Medium');
    setIngredientInput("");
    setExcludeInput("");
    
    updateParams({
      ingredients: null,
      excluded: null, // Xóa tham số excluded trên URL
      difficulty: null,
      page: '1'
    });
  };

  let displayTitle = isViewRecipes ? "Recipes" : "Cookie Jars";
  if (searchQuery) displayTitle = `"${searchQuery}"`;
  else if (categoryParam && isViewRecipes) displayTitle = categoryParam;

  return (
    <div className="min-h-screen bg-[var(--background-image)] pb-10">
      
      <div className="flex flex-col md:flex-row gap-5">
        
        {/* --- LEFT SIDEBAR (FILTERS) --- */}
        <aside className="mt-5 ml-5 w-full md:w-1/4 min-w-[300px] flex flex-col gap-6">
          
          {isViewRecipes ? (
             <div className="border-4 border-[#4A3B32] bg-white p-4 shadow-[4px_4px_0px_rgba(74,59,50,0.2)]">
                <h2 className="text-2xl font-bold mb-4 border-b-2 border-gray-200 pb-2 font-vt323 text-[#4A3B32]">Filters</h2>
                
                {/* --- SECTION: INCLUDE INGREDIENTS --- */}
                <div className="mb-6">
                  <label className="text-[15px] text-gray-500 mb-1 block uppercase font-vt323">Include Ingredients</label>
                  <div className="flex gap-2 mb-2">
                    <PixelInput
                      placeholder="Add..."
                      value={ingredientInput}
                      onChange={(e) => setIngredientInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddInclude(ingredientInput)}
                    />
                    <PixelButton variant="primary" size="sm" className="w-8 flex items-center justify-center" onClick={() => handleAddInclude(ingredientInput)}>+</PixelButton>
                  </div>
                  <div className="flex flex-col pixel-border p-2 bg-white min-h-[50px] max-h-[100px] overflow-y-auto">
                    {filterIngredient.length === 0 ? <p className="text-center text-sm text-gray-400 py-2">None</p> : (
                       <div className="flex flex-wrap gap-2">{filterIngredient.map(i => <PixelTag key={i.id} label={i.name} variant="green" removable onRemove={() => handleRemoveInclude(i.id)} />)}</div>
                    )}
                  </div>
                </div>

                {/* --- SECTION: EXCLUDE INGREDIENTS (Có icon Cấm) --- */}
                <div className="mb-6">
                  <label className="text-[15px] text-red-500 mb-1 block uppercase font-vt323 flex items-center gap-2">
                    <Ban size={14} /> Exclude Ingredients
                  </label>
                  <div className="flex gap-2 mb-2">
                    <PixelInput
                      placeholder="No nuts..."
                      value={excludeInput}
                      onChange={(e) => setExcludeInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddExclude(excludeInput)}
                      className="border-red-200 focus:shadow-[0_0_0_3px_#FECACA]" // Style màu đỏ nhạt để cảnh báo
                    />
                    <PixelButton variant="pink" size="sm" className="w-8 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-800 border-red-800" onClick={() => handleAddExclude(excludeInput)}>-</PixelButton>
                  </div>
                  {/* Container màu đỏ nhạt */}
                  <div className="flex flex-col pixel-border p-2 bg-[#FFF5F5] min-h-[50px] max-h-[100px] overflow-y-auto border-red-200">
                    {excludeIngredient.length === 0 ? <p className="text-center text-sm text-red-300 py-2">None</p> : (
                       <div className="flex flex-wrap gap-2">{excludeIngredient.map(i => <PixelTag key={i.id} label={i.name} variant="pink" removable onRemove={() => handleRemoveExclude(i.id)} />)}</div>
                    )}
                  </div>
                </div>

                {/* Quick Add (Only for Include) */}
                <div className="mb-6">
                   <label className="text-[15px] uppercase text-gray-500 mb-1 block font-vt323">Quick Add (Include):</label>
                   <div className="flex flex-wrap gap-2">
                      {['FLOUR', 'BUTTER', 'EGGS'].map(item => (
                        <button key={item} onClick={() => handleAddInclude(item)} className="font-vt323 text-xs border border-[#4A3B32] px-2 py-1 bg-white hover:bg-gray-100 transition-transform active:translate-y-1">+ {item}</button>
                      ))}
                   </div>
                </div>

                {/* Difficulty */}
                <div className="mb-6">
                  <label className="text-[15px] uppercase text-gray-500 mb-1 block font-vt323">Difficulty</label>
                  <div className="flex flex-col gap-2">
                    {(['Easy', 'Medium', 'Hard'] as const).map(level => (
                        <button key={level} onClick={() => setDifficulty(level)} className={`flex-1 py-3 pixel-border text-sm uppercase transition-colors ${difficulty === level ? 'bg-[#5D4037] text-white' : 'bg-white hover:bg-[#FFF8E1]'}`}>{level}</button>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <PixelButton variant="pink" className="flex-1 flex items-center justify-center gap-2 font-bold" onClick={handleApplyFilter}><Search size={16}/> FILTER</PixelButton>
                    <PixelButton variant="secondary" className="w-10 flex items-center justify-center" onClick={handleReset} title="Reset"><RefreshCw size={16} className="text-[#4A3B32] min-w-[16px]"/></PixelButton>
                </div>
             </div>
          ) : (
             <div className="border-4 border-[#4A3B32] bg-white p-4 shadow-[4px_4px_0px_rgba(74,59,50,0.2)] opacity-70">
                <h2 className="text-xl font-bold font-vt323 text-[#4A3B32] text-center">Collection Filters</h2>
                <p className="text-center font-vt323 mt-4 text-[#4A3B32]">Filters are only available for recipes.</p>
             </div>
          )}

          {/* CATEGORY BOX */}
          <div className="border-4 border-[#4A3B32] bg-white p-4 shadow-[4px_4px_0px_rgba(74,59,50,0.2)]">
            <div className="flex justify-between items-center mb-4 border-b-2 border-gray-200 pb-2">
               <h2 className="text-2xl font-bold font-vt323 text-[#4A3B32]">Category</h2>
               {categoryParam && (
                 <button onClick={handleCategoryReset} className="text-xs text-red-500 hover:text-red-700 font-vt323 flex items-center gap-1 hover:underline"><RefreshCw size={12} /> Clear</button>
               )}
            </div>
            <ul className="space-y-2 font-vt323">
              {CATEGORIES.map(cat => (
                <li key={cat} onClick={() => handleCategoryClick(cat)} className={`cursor-pointer text-xl p-1 transition-colors ${categoryParam === cat && isViewRecipes ? 'bg-[#FF99AA] border border-[#4A3B32] text-[#4A3B32]' : 'hover:text-[#FF99AA]'}`}>{cat}</li>
              ))}
            </ul>
          </div>
        </aside>

        {/* --- RIGHT CONTENT --- */}
        <section className="flex-1 mr-5 flex flex-col min-h-[calc(100vh-140px)]">
          
          {/* HEADER: Title & Type Switcher */}
          <div className="mt-5 mb-6 flex flex-col gap-4">
             
             {/* 1. TYPE TABS */}
             {/* <div className="flex gap-0 border-b-4 border-[#4A3B32]">
                <button 
                  onClick={() => handleTypeChange('recipes')}
                  className={`px-6 py-2 font-vt323 text-xl flex items-center gap-2 transition-all ${typeParam === 'recipes' ? 'bg-[#FF99AA] text-[#4A3B32] border-t-4 border-x-4 border-[#4A3B32] -mb-1 pb-3' : 'bg-[#FFF8E7] text-[#4A3B32]/60 hover:bg-[#ffe4c4]'}`}
                >
                  <FileText size={20}/> RECIPES
                </button>
                <button 
                  onClick={() => handleTypeChange('collections')}
                  className={`px-6 py-2 font-vt323 text-xl flex items-center gap-2 transition-all ${typeParam === 'collections' ? 'bg-[#FF99AA] text-[#4A3B32] border-t-4 border-x-4 border-[#4A3B32] -mb-1 pb-3' : 'bg-[#FFF8E7] text-[#4A3B32]/60 hover:bg-[#ffe4c4]'}`}
                >
                  <LayoutGrid size={20}/> COOKIE JARS
                </button>
             </div> */}

             {/* 2. Controls Row */}
             <div className="flex flex-col md:flex-row justify-between items-end md:items-center border-4 border-[#4A3B32] py-2 bg-[#FFF8E7] pixel-card w-full">
                <div className="px-4 py-2">
                  <h1 className="text-lg font-bold text-[#4A3B32] font-vt323">{displayTitle}</h1>
                  {categoryParam && isViewRecipes && <h2 className="text-[12px] text-[#4A3B32] font-vt323">in {categoryParam}</h2>}
                </div>

                <div className="flex items-center gap-4 px-4 py-2">
                   {/* SORT DROPDOWN */}
                   <div className="flex items-center gap-2 font-vt323 text-[#4A3B32]">
                      <span className="uppercase text-sm">Sort by:</span>
                      <div className="relative">
                        <select 
                          value={sortParam}
                          onChange={(e) => handleSortChange(e.target.value)}
                          className="appearance-none bg-white border-2 border-[#4A3B32] px-3 py-1 pr-8 focus:outline-none cursor-pointer text-sm"
                        >
                          <option value="newest">Newest</option>
                          <option value="oldest">Oldest</option>
                          <option value="likes">Most Popular</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[#4A3B32]" />
                      </div>
                   </div>

                   <span className="text-sm font-vt323 text-[#4A3B32] border-l-2 border-[#4A3B32]/20 pl-4">
                     {totalItems} results
                   </span>
                </div>
             </div>
          </div>

          {/* CONTENT GRID */}
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="font-vt323 text-2xl text-[#4A3B32] animate-pulse">Loading recipes...</div>
            </div>
          ) : totalItems > 0 ? (
            <>
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 ${isViewRecipes ? 'gap-6' : 'gap-6'} mb-8`}>
                
                {isViewRecipes && currentRecipes.map(recipe => (
                  <RecipeCard
                    key={recipe.id}
                    id={recipe.id.toString()}
                    title={recipe.title} 
                    author={recipe.author || 'Unknown Chef'} 
                    image={recipe.thumbnail_url || 'https://via.placeholder.com/600'}
                    time={`${recipe.cook_time_min || 0} min`} 
                    difficulty={recipe.difficulty} 
                    isSaved={recipe.in_user_collections || false}
                    likes={recipe.likes_count || 0}
                    isLiked={recipe.user_liked || false}
                    onClick={() => nav.recipe(recipe.id.toString())}
                  />
                ))}

              </div>

              <Pagination 
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
                className="mt-auto pt-6"
              />
            </>
          ) : (
            <div className="border-4 border-[#4A3B32] bg-white w-full h-96 flex flex-col items-center justify-center p-8 text-center shadow-[4px_4px_0px_rgba(74,59,50,0.2)] mt-auto mb-auto">
                <div className="text-8xl mb-4 grayscale opacity-50">🐻</div> 
                <h2 className="text-3xl font-bold mb-2 font-vt323 text-[#4A3B32]">No results found!</h2>
                <p className="text-gray-500 font-vt323 text-xl">Try changing your filters or search term.</p>
                <div className="mt-4">
                  <PixelButton variant="primary" onClick={handleReset}>
                    Clear All
                  </PixelButton>
                </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default SearchPage;