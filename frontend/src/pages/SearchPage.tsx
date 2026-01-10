import React, { useState, useEffect } from 'react';
// Thay RotateCcw bằng RefreshCw
import { Search, X, RefreshCw } from 'lucide-react';
import { RecipeCard } from '../components/RecipeCard';
import { PixelButton } from '../components/PixelButton';
import { PixelInput } from '../components/PixelInput';
import { PixelTag } from '../components/PixelTag';
import { NavBar } from '../components/NavBar';
import { useNav } from '../hooks/useNav';
import { useSearchParams } from 'react-router-dom';
import { Pagination } from '../components/Pagination'; // 1. Import Pagination

interface SearchPageProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

// --- MOCK DATA (Dữ liệu giả lập) --
const MOCK_RECIPES = [
  // ... (Giữ nguyên dữ liệu của bạn)
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

interface Ingredient {
  id: string;
  name: string;
}

const CATEGORIES = ["Cookie", "Cheesecake", "Cupcakes & Muffins", "Tarts & Pies", "Brownies & Bars"];

// Số lượng item trên mỗi trang
const ITEMS_PER_PAGE = 6;

export function SearchPage({ isLoggedIn = false, onLogout }: SearchPageProps) {
  
  //Set ingredient cho filter
  const [filterIngredient, setFilterIngredient] = useState<Ingredient[]>([])
  const [ingredientInput, setIngredientInput] = useState("");
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  // 2. Thêm state trang hiện tại
  const [currentPage, setCurrentPage] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  let categoryParam = searchParams.get('category')
  
  let displayTitle = "All Recipes";
  if (searchQuery && categoryParam) {
    displayTitle = `"${searchQuery}"`;
  } else if (searchQuery) {
    displayTitle = `"${searchQuery}"`;
  } else if (categoryParam) {
    displayTitle = `"${categoryParam}"`;
  }

  const nav = useNav();
  const [recipes, setRecipes] = useState(MOCK_RECIPES);

  // --- LOGIC PHÂN TRANG (PAGINATION) ---
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentRecipes = recipes.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu khi chuyển trang
  };
  // -------------------------------------

  // HÀM 1: Chỉ xử lý khi bấm vào danh sách Category bên trái
  const handleCategoryClick = (cat: string) => {
    setCurrentPage(1); // Reset về trang 1
    const newParams = new URLSearchParams(searchParams);
    newParams.set('category', cat);
    setSearchParams(newParams);
  };

  // HÀM 2: Xử lý khi bấm nút FILTER màu hồng
  const handleApplyFilter = () => {
    setCurrentPage(1); // Reset về trang 1
    const newParams = new URLSearchParams(searchParams);
    
    if (filterIngredient.length > 0) {
      const ingString = filterIngredient.map(i => i.name).join(',');
      newParams.set('ingredients', ingString);
    } else {
      newParams.delete('ingredients');
    }

    newParams.set('difficulty', difficulty);
    setSearchParams(newParams);
  };

  const handleAddIngredient = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const exists = filterIngredient.some(
      item => item.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (!exists) {
      const newIng: Ingredient = {
        id: Date.now().toString() + Math.random(),
        name: trimmedName
      };
      setFilterIngredient([...filterIngredient, newIng]);
    }
    setIngredientInput("");
  };

  const handleRemoveIngredient = (idToRemove: string) => {
    setFilterIngredient(prev => prev.filter(ing => ing.id !== idToRemove));
  };

  const handleCategoryReset = () => {
    setCurrentPage(1); // Reset về trang 1
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('category'); 
    setSearchParams(newParams);   
  };

  const handleReset = () => {
    setCurrentPage(1); // Reset về trang 1
    setFilterIngredient([]);
    setDifficulty('Medium');
    setIngredientInput("");
  };

  return (
    <div className="min-h-screen bg-[var(--background-image)] pb-10">
      <NavBar
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
        notificationCount={1}
        showBackButton={true}
      />
      <div className="flex flex-col md:flex-row gap-5">
        
        {/* --- LEFT SIDEBAR (FILTERS & CATEGORY) --- */}
        <aside className="mt-5 ml-5 w-full md:w-1/4 min-w-[300px] flex flex-col gap-6">
          
          {/* FILTER BOX */}
          <div className="border-4 border-[#4A3B32] bg-white p-4 shadow-[4px_4px_0px_rgba(74,59,50,0.2)]">
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-gray-200 pb-2 font-vt323 text-[#4A3B32]">Filters</h2>
            
            {/* Include Ingredients */}
            <div className="mb-4">
              <label className="text-[15px] text-gray-500 mb-1 block uppercase font-vt323">Include Ingredients</label>
              <div className="flex gap-2 mb-2">
                <PixelInput
                  placeholder="Add an ingredient..."
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddIngredient(ingredientInput);
                    }
                  }}
                />
                <PixelButton variant="primary" size="sm" className="w-8 flex items-center justify-center"
                  onClick={() => handleAddIngredient(ingredientInput)}>+</PixelButton>
              </div>

              <div className="flex flex-col pixel-border p-2 bg-white min-h-[50px] max-h-[150px] overflow-y-auto">
                {filterIngredient.length === 0 ? (
                  <p className="flex-1 flex justify-center items-center text-sm text-[#5D4037]/50 text-center py-4">No ingredients added yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {filterIngredient.map((ingredient) => (
                      <PixelTag
                        key={ingredient.id}
                        label={ingredient.name}
                        variant="green"
                        removable
                        onRemove={() => handleRemoveIngredient(ingredient.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* QUICK ADD SECTION */}
            <div className="mb-6">
              <label className="text-[15px] uppercase text-gray-500 mb-1 block font-vt323">Quick Add:</label>
              <div className="flex flex-wrap gap-2">
                {['FLOUR', 'BUTTER', 'EGGS'].map(item => (
                  <button 
                    key={item} 
                    onClick={() => handleAddIngredient(item)}
                    className="font-vt323 text-xs border border-[#4A3B32] px-2 py-1 bg-white hover:bg-gray-100 transition-transform active:translate-y-1"
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="mb-6">
              <label className="text-[15px] uppercase text-gray-500 mb-1 block font-vt323">Difficulty</label>
              <div className="flex flex-col gap-2">
                  {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                    <button
                      key={level}
                      className={`flex-1 py-3 pixel-border text-sm uppercase transition-colors ${
                        difficulty === level
                          ? 'bg-[#5D4037] text-white'
                          : 'bg-white hover:bg-[#FFF8E1]'
                      }`}
                      onClick={() => setDifficulty(level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <PixelButton 
                  variant="pink" 
                  className="flex-1 flex items-center justify-center gap-2 font-bold"
                  onClick={handleApplyFilter}
                >
                  <Search size={16}/> FILTER
                </PixelButton>

                <PixelButton 
                  variant="secondary" 
                  className="w-10 flex items-center justify-center"
                  onClick={handleReset} 
                  title="Reset Filters"
                >
                  <RefreshCw 
                    size={16} 
                    className="text-[#4A3B32] min-w-[16px] min-h-[16px]" 
                  />
                </PixelButton>
            </div>
          </div>

          {/* CATEGORY BOX */}
          <div className="border-4 border-[#4A3B32] bg-white p-4 shadow-[4px_4px_0px_rgba(74,59,50,0.2)]">
            <div className="flex justify-between items-center mb-4 border-b-2 border-gray-200 pb-2">
               <h2 className="text-2xl font-bold font-vt323 text-[#4A3B32]">Category</h2>
               {categoryParam && (
                 <button 
                   onClick={handleCategoryReset}
                   className="text-xs text-red-500 hover:text-red-700 font-vt323 flex items-center gap-1 hover:underline"
                   title="Clear Category"
                 >
                   <RefreshCw size={12} /> Clear
                 </button>
               )}
            </div>

            <ul className="space-y-2 font-vt323">
              {CATEGORIES.map(cat => (
                <li 
                  key={cat} 
                  onClick={() => handleCategoryClick(cat)}
                  className={`cursor-pointer text-xl p-1 transition-colors ${
                    categoryParam === cat 
                      ? 'bg-[#FF99AA] border border-[#4A3B32] text-[#4A3B32]' 
                      : 'hover:text-[#FF99AA]'
                  }`}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* --- RIGHT CONTENT (RESULTS) --- */}
        <section className="flex-1 mr-5 flex flex-col min-h-[calc(100vh-140px)]">
          {/* Header Section */}
          <div className="mt-5 flex justify-between items-center mb-6 border-4 border-[#4A3B32] py-2 bg-[#FFF8E7] pixel-card">
            <div className="px-2">
              <h1 className="text-lg font-bold text-[#4A3B32] font-vt323">
                {displayTitle}
              </h1>
              {categoryParam && (
                <h2 className="text-[12px] text-[#4A3B32] font-vt323">
                  in {categoryParam}
                </h2>
              )}
            </div>
            <span className="text-sm font-vt323 text-[#4A3B32] mr-2">
              {recipes.length} recipes found
            </span>
          </div>

          {/* Content Logic */}
          {recipes.length > 0 ? (
            <>
              {/* 3. Render currentRecipes thay vì recipes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
                {currentRecipes.map(recipe => (
                  <RecipeCard 
                    key={recipe.id} 
                    title={recipe.title}
                    author={recipe.author}
                    image={recipe.image}
                    time={recipe.time}
                    difficulty={recipe.difficulty}
                    likes={recipe.likes}
                    onClick={() => nav.recipe(recipe.id)}
                  />
                ))}
              </div>

              {/* 4. Chèn component Pagination */}
              <Pagination 
                currentPage={currentPage}
                totalItems={recipes.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
                className="mt-auto pt-6"
              />
            </>
          ) : (
            <div className="border-4 border-[#4A3B32] bg-white w-full h-96 flex flex-col items-center justify-center p-8 text-center shadow-[4px_4px_0px_rgba(74,59,50,0.2)]">
                <div className="text-8xl mb-4 grayscale opacity-50">🐻</div> 
                <h2 className="text-3xl font-bold mb-2 font-vt323 text-[#4A3B32]">No recipes matched!</h2>
                <p className="text-gray-500 font-vt323 text-xl">But lots of tasty options are waiting for you!!!</p>
                <div className="mt-4">
                  <PixelButton variant="primary" onClick={() => setRecipes(MOCK_RECIPES)}>
                    Clear Filters
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