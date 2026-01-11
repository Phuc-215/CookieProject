import React, { useState, useEffect, useRef } from 'react';
import { Search, X, RefreshCw, ChevronDown, Ban, Check, Loader2 } from 'lucide-react'; // Thêm Loader2
import { RecipeCard } from '../components/RecipeCard';
import { CollectionCard } from '../components/CollectionCard';
import { PixelButton } from '../components/PixelButton';
import { PixelInput } from '../components/PixelInput';
import { PixelTag } from '../components/PixelTag';
import { NavBar } from '../components/NavBar'; // Nhớ import NavBar nếu cần
import { useNav } from '../hooks/useNav';
import { useSearchParams } from 'react-router-dom';
import { Pagination } from '../components/Pagination';

import { searchApi } from '../api/search.api';
import { getIngredients } from '../api/search.api';
import { getCategoriesListApi } from '../api/category.api';
import { Category } from '../types/Category';

interface SearchPageProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const ITEMS_PER_PAGE = 6;

interface Ingredient {
  id: string | number;
  name: string;
}

export function SearchPage({ isLoggedIn = false, onLogout }: SearchPageProps) {
  
  // --- STATE ---
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRecipes, setTotalRecipes] = useState(0);

  // --- INGREDIENTS DATA ---
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [ingredientsLoading, setIngredientsLoading] = useState(true); // Loading state cho list ingredients

  // --- CATEGORIES DATA ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // --- FILTER STATE ---
  const [filterIngredient, setFilterIngredient] = useState<Ingredient[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [showIncludeSuggestions, setShowIncludeSuggestions] = useState(false);

  const [excludeIngredient, setExcludeIngredient] = useState<Ingredient[]>([]);
  const [excludeInput, setExcludeInput] = useState("");
  const [showExcludeSuggestions, setShowExcludeSuggestions] = useState(false);

  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [currentPage, setCurrentPage] = useState(1);

  // --- URL PARAMS ---
  const [searchParams, setSearchParams] = useSearchParams();
  
  const searchQuery = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category');
  const sortParam = searchParams.get('sort') || 'newest'; 
  const difficultyParam = searchParams.get('difficulty');
  const ingredientsParam = searchParams.get('ingredients');
  const excludedParam = searchParams.get('excluded');
  const pageParam = parseInt(searchParams.get('page') || '1');

  const nav = useNav();
  const includeRef = useRef<HTMLDivElement>(null);
  const excludeRef = useRef<HTMLDivElement>(null);

  // --- 1. FETCH INGREDIENTS ON MOUNT ---
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const res = await getIngredients();
        const data = res.data.data || res.data || []; 
        
        // console.log("Ingredients loaded from DB:", data); // <--- KIỂM TRA DÒNG NÀY TRÊN CONSOLE
        
        setAvailableIngredients(data);
      } catch (error) {
        console.error("Failed to load ingredients list", error);
      } finally {
        setIngredientsLoading(false);
      }
    };
    fetchIngredients();
  }, []);

  // --- FETCH CATEGORIES ON MOUNT ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategoriesListApi();
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // --- CLICK OUTSIDE TO CLOSE DROPDOWN ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (includeRef.current && !includeRef.current.contains(event.target as Node)) {
        setShowIncludeSuggestions(false);
      }
      if (excludeRef.current && !excludeRef.current.contains(event.target as Node)) {
        setShowExcludeSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- SEARCH API ---
  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const apiParams = {
          title: searchQuery || '',
          // QUAN TRỌNG: trim() để xóa khoảng trắng thừa từ URL (vd: "sugar, eggs")
          ingredients_included: ingredientsParam ? ingredientsParam.split(',').map(i => i.trim()).filter(i => i) : [],
          ingredients_excluded: excludedParam ? excludedParam.split(',').map(i => i.trim()).filter(i => i) : [],
          difficulty: difficultyParam ? difficultyParam.toLowerCase() : '',
          category: categoryParam || '',
          sort: sortParam || 'newest',
          page: pageParam,
          limit: ITEMS_PER_PAGE,
          userId: localStorage.getItem('userId') || null,
        };
        const response = await searchApi(apiParams);
        setRecipes(response.data.results || []);
        setTotalRecipes(response.data.meta?.totalRecipes || 0);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSearchResults();
  }, [searchQuery, ingredientsParam, excludedParam, difficultyParam, categoryParam, sortParam, pageParam]);

  // --- SYNC URL -> LOCAL STATE ---
  useEffect(() => {
    setCurrentPage(pageParam);
    if (difficultyParam) setDifficulty(difficultyParam as 'Easy' | 'Medium' | 'Hard');
    else setDifficulty('Medium');

    // Sync Include
    if (ingredientsParam) {
      setFilterIngredient(ingredientsParam.split(',').map((name, i) => ({ 
        id: `url-inc-${i}`, // ID giả cho URL params
        name: name.trim() 
      })));
    } else {
      setFilterIngredient([]);
    }

    // Sync Exclude
    if (excludedParam) {
      setExcludeIngredient(excludedParam.split(',').map((name, i) => ({ 
        id: `url-exc-${i}`, 
        name: name.trim() 
      })));
    } else {
      setExcludeIngredient([]);
    }
  }, [difficultyParam, ingredientsParam, excludedParam, pageParam]);

  // --- URL UPDATERS ---
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
  const handleCategoryClick = (cat: string) => updateParams({ category: cat, type: 'recipes', page: '1' });
  const handleCategoryReset = () => updateParams({ category: null, page: '1' });

  // === LOGIC THÊM NGUYÊN LIỆU (STRICT MODE) ===

  const getSuggestions = (input: string, currentList: Ingredient[]) => {
    // if (!input.trim()) return [];
    // LOGIC MỚI: Nếu input rỗng, vẫn trả về danh sách (lọc bỏ những món đã chọn)
    const normalizedInput = input.trim().toLowerCase();
    
    return availableIngredients
      .filter(item => {
        // Lọc theo tên (nếu có input)
        const matchesName = item.name.toLowerCase().includes(normalizedInput);
        // Lọc bỏ những món đã được chọn rồi
        const isNotSelected = !currentList.some(selected => selected.name.toLowerCase() === item.name.toLowerCase());
        
        // Nếu không nhập gì -> Luôn đúng (matchesName = true với chuỗi rỗng) -> Trả về danh sách mặc định
        return matchesName && isNotSelected;
      })
      .slice(0, 10); // Lấy 10 gợi ý đầu tiên (tăng lên nếu muốn hiện nhiều hơn)
  };

  const addInclude = (ingredient: Ingredient) => {
    if (!filterIngredient.some(i => i.name.toLowerCase() === ingredient.name.toLowerCase())) {
      setFilterIngredient([...filterIngredient, ingredient]);
    }
    setIngredientInput("");
    setShowIncludeSuggestions(false);
  };

  const handleManualAddInclude = () => {
    // Chỉ cho phép nếu khớp chính xác với DB
    const match = availableIngredients.find(i => i.name.toLowerCase() === ingredientInput.trim().toLowerCase());
    if (match) {
      addInclude(match);
    } else {
      // Có thể thay bằng Toast notification
      alert("Please select an ingredient from the list!"); 
    }
  };

  const addExclude = (ingredient: Ingredient) => {
    if (!excludeIngredient.some(i => i.name.toLowerCase() === ingredient.name.toLowerCase())) {
      setExcludeIngredient([...excludeIngredient, ingredient]);
    }
    setExcludeInput("");
    setShowExcludeSuggestions(false);
  };

  const handleManualAddExclude = () => {
    const match = availableIngredients.find(i => i.name.toLowerCase() === excludeInput.trim().toLowerCase());
    if (match) addExclude(match);
    else alert("Please select an ingredient from the list!");
  };

  const handleApplyFilter = () => {
    const ingString = filterIngredient.length > 0 ? filterIngredient.map(i => i.name).join(',') : null;
    const excString = excludeIngredient.length > 0 ? excludeIngredient.map(i => i.name).join(',') : null;
    updateParams({
      ingredients: ingString,
      excluded: excString,
      difficulty: difficulty,
      page: '1'
    });
  };

  const handleReset = () => {
    setFilterIngredient([]);
    setExcludeIngredient([]);
    setDifficulty('Medium');
    setIngredientInput("");
    setExcludeInput("");
    updateParams({ ingredients: null, excluded: null, difficulty: null, page: '1' });
  };

  // --- RENDER VARS ---
  let displayTitle = "Recipes";
  if (searchQuery) displayTitle = `"${searchQuery}"`;
  else if (categoryParam) displayTitle = categoryParam;

  const includeSuggestions = getSuggestions(ingredientInput, filterIngredient);
  const excludeSuggestions = getSuggestions(excludeInput, excludeIngredient);

  return (
    <div className="min-h-screen bg-[var(--background-image)] pb-10">
      
      {/* Cần NavBar ở đây nếu không có Layout chung */}
      {/* <NavBar isLoggedIn={isLoggedIn} onLogout={onLogout} ... /> */}

      <div className="flex flex-col md:flex-row gap-5 px-4 pt-5 max-w-7xl mx-auto">
        
        {/* FILTERS SIDEBAR */}
        <aside className="w-full md:w-1/4 min-w-[300px] flex flex-col gap-6">
          <div className="border-4 border-[#4A3B32] bg-white p-4 shadow-[4px_4px_0px_rgba(74,59,50,0.2)]">
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-gray-200 pb-2 font-vt323 text-[#4A3B32]">Filters</h2>
            
            {/* INCLUDE */}
            <div className="mb-6 relative" ref={includeRef}>
              <label className="text-[15px] text-gray-500 mb-1 block uppercase font-vt323">Include Ingredients</label>
              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                    <PixelInput
                    placeholder={ingredientsLoading ? "Loading..." : "Type to search..."}
                    value={ingredientInput}
                    disabled={ingredientsLoading}
                    onChange={(e) => {
                        setIngredientInput(e.target.value);
                        setShowIncludeSuggestions(true);
                    }}
                    onFocus={() => setShowIncludeSuggestions(true)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualAddInclude()}
                    />
                    {ingredientsLoading && <Loader2 className="absolute right-2 top-2 animate-spin w-4 h-4 text-gray-400"/>}
                </div>
                <PixelButton variant="primary" size="sm" className="w-8 flex items-center justify-center" onClick={handleManualAddInclude}>+</PixelButton>
              </div>
              
              {/* Dropdown */}
              {showIncludeSuggestions && includeSuggestions.length > 0 && (
                <ul className="absolute top-[75px] left-0 w-full bg-white border-2 border-[#4A3B32] shadow-lg z-20 max-h-40 overflow-y-auto">
                  {includeSuggestions.map((ing) => (
                    <li 
                      key={ing.id} 
                      className="px-3 py-2 hover:bg-[#FFF8E1] cursor-pointer font-vt323 text-lg border-b border-gray-100 last:border-0 flex items-center justify-between group"
                      onClick={() => addInclude(ing)}
                    >
                      <span>{ing.name}</span>
                      <span className="opacity-0 group-hover:opacity-100 text-[#4A3B32] text-xs">+ Add</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Tags */}
              <div className="flex flex-col pixel-border p-2 bg-white min-h-[50px] max-h-[100px] overflow-y-auto">
                {filterIngredient.length === 0 ? <p className="text-center text-sm text-gray-400 py-2">None</p> : (
                   <div className="flex flex-wrap gap-2">
                     {filterIngredient.map((i, idx) => (
                       <PixelTag key={idx} label={i.name} variant="green" removable onRemove={() => setFilterIngredient(p => p.filter(x => x.name !== i.name))} />
                     ))}
                   </div>
                )}
              </div>
            </div>

            {/* EXCLUDE */}
            <div className="mb-6 relative" ref={excludeRef}>
              <label className="text-[15px] text-red-500 mb-1 block uppercase font-vt323 flex items-center gap-2">
                <Ban size={14} /> Exclude Ingredients
              </label>
              <div className="flex gap-2 mb-2">
                <PixelInput
                  placeholder="Type to search..."
                  value={excludeInput}
                  disabled={ingredientsLoading}
                  onChange={(e) => {
                    setExcludeInput(e.target.value);
                    setShowExcludeSuggestions(true);
                  }}
                  onFocus={() => setShowExcludeSuggestions(true)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualAddExclude()}
                  className="border-red-200 focus:shadow-[0_0_0_3px_#FECACA]"
                />
                <PixelButton variant="pink" size="sm" className="w-8 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-800 border-red-800" onClick={handleManualAddExclude}>-</PixelButton>
              </div>

              {/* Dropdown */}
              {showExcludeSuggestions && excludeSuggestions.length > 0 && (
                <ul className="absolute top-[75px] left-0 w-full bg-white border-2 border-red-200 shadow-lg z-20 max-h-40 overflow-y-auto">
                  {excludeSuggestions.map((ing) => (
                    <li 
                      key={ing.id} 
                      className="px-3 py-2 hover:bg-red-50 cursor-pointer font-vt323 text-lg border-b border-gray-100 last:border-0 text-red-800 flex items-center justify-between group"
                      onClick={() => addExclude(ing)}
                    >
                      <span>{ing.name}</span>
                      <span className="opacity-0 group-hover:opacity-100 text-red-500 text-xs">Exclude</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-col pixel-border p-2 bg-[#FFF5F5] min-h-[50px] max-h-[100px] overflow-y-auto border-red-200">
                {excludeIngredient.length === 0 ? <p className="text-center text-sm text-red-300 py-2">None</p> : (
                   <div className="flex flex-wrap gap-2">
                     {excludeIngredient.map((i, idx) => (
                       <PixelTag key={idx} label={i.name} variant="pink" removable onRemove={() => setExcludeIngredient(p => p.filter(x => x.name !== i.name))} />
                     ))}
                   </div>
                )}
              </div>
            </div>

            {/* QUICK ADD (Strict Mode) */}
            <div className="mb-6">
                <label className="text-[15px] uppercase text-gray-500 mb-1 block font-vt323">Quick Add:</label>
                <div className="flex flex-wrap gap-2">
                  {['Flour', 'Butter', 'Eggs', 'Sugar'].map(item => (
                    <button 
                      key={item} 
                      onClick={() => {
                        const match = availableIngredients.find(ai => ai.name.toLowerCase() === item.toLowerCase());
                        if(match) addInclude(match);
                        else alert(`"${item}" not found in database!`);
                      }} 
                      className="font-vt323 text-xs border border-[#4A3B32] px-2 py-1 bg-white hover:bg-gray-100 transition-transform active:translate-y-1"
                    >
                      + {item}
                    </button>
                  ))}
                </div>
            </div>

            {/* DIFFICULTY */}
            <div className="mb-6">
              <label className="text-[15px] uppercase text-gray-500 mb-1 block font-vt323">Difficulty</label>
              <div className="flex flex-col gap-2">
                {(['Easy', 'Medium', 'Hard'] as const).map(level => (
                  <button key={level} onClick={() => setDifficulty(level)} className={`flex-1 py-3 pixel-border text-sm uppercase transition-colors ${difficulty === level ? 'bg-[#5D4037] text-white' : 'bg-white hover:bg-[#FFF8E1]'}`}>{level}</button>
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-2">
                <PixelButton variant="pink" className="flex-1 flex items-center justify-center gap-2 font-bold" onClick={handleApplyFilter}><Search size={16}/> FILTER</PixelButton>
                <PixelButton variant="secondary" className="w-10 flex items-center justify-center" onClick={handleReset} title="Reset"><RefreshCw size={16} className="text-[#4A3B32] min-w-[16px]"/></PixelButton>
            </div>
          </div>

          {/* CATEGORY LIST */}
          <div className="border-4 border-[#4A3B32] bg-white p-4 shadow-[4px_4px_0px_rgba(74,59,50,0.2)]">
            <div className="flex justify-between items-center mb-4 border-b-2 border-gray-200 pb-2">
               <h2 className="text-2xl font-bold font-vt323 text-[#4A3B32]">Category</h2>
               {categoryParam && <button onClick={handleCategoryReset} className="text-xs text-red-500 hover:text-red-700 font-vt323 flex items-center gap-1 hover:underline"><RefreshCw size={12} /> Clear</button>}
            </div>
            {categoriesLoading ? (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-[#4A3B32]" />
              </div>
            ) : (
              <ul className="space-y-2 font-vt323">
                {categories.map(cat => (
                  <li 
                    key={cat.id} 
                    onClick={() => handleCategoryClick(cat.name)} 
                    className={`cursor-pointer text-xl p-1 transition-colors ${categoryParam === cat.name ? 'bg-[#FF99AA] border border-[#4A3B32] text-[#4A3B32]' : 'hover:text-[#FF99AA]'}`}
                  >
                    {cat.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* RESULTS SECTION */}
        <section className="flex-1 flex flex-col min-h-[calc(100vh-140px)]">
          <div className="mb-6 flex flex-col gap-4">
             <div className="flex flex-col md:flex-row justify-between items-end md:items-center border-4 border-[#4A3B32] py-2 bg-[#FFF8E7] pixel-card w-full">
                <div className="px-4 py-2">
                  <h1 className="text-lg font-bold text-[#4A3B32] font-vt323">{displayTitle}</h1>
                  {categoryParam && <h2 className="text-[12px] text-[#4A3B32] font-vt323">in {categoryParam}</h2>}
                </div>
                <div className="flex items-center gap-4 px-4 py-2">
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
                   <span className="text-sm font-vt323 text-[#4A3B32] border-l-2 border-[#4A3B32]/20 pl-4">{totalRecipes} results</span>
                </div>
             </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="font-vt323 text-2xl text-[#4A3B32] animate-pulse">Loading recipes...</div>
            </div>
          ) : totalRecipes > 0 ? (
            <>
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8`}>
                {recipes.map(recipe => (
                  <RecipeCard
                    key={recipe.id}
                    id={recipe.id.toString()}
                    title={recipe.title} 
                    author={recipe.author || 'Unknown Chef'} 
                    image={recipe.thumbnail_url || 'https://via.placeholder.com/600'}
                    time={`${recipe.cook_time_min || 0} min`} 
                    difficulty={recipe.difficulty} 
                    // FIX: Robust check for isSaved
                    isSaved={recipe.is_saved || recipe.in_user_collections || recipe.isSaved || false}
                    likes={recipe.likes_count || 0}
                    // FIX: Robust check for isLiked (Backends often send is_liked or user_liked)
                    isLiked={recipe.is_liked || recipe.user_liked || recipe.isLiked || false}
                    onClick={() => nav.recipe(recipe.id.toString())}
                  />
                ))}
              </div>
              <Pagination 
                currentPage={currentPage}
                totalItems={totalRecipes}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
                className="mt-auto pt-6"
              />
            </>
          ) : (
            // Empty State
            <div className="border-4 border-[#4A3B32] bg-white w-full h-96 flex flex-col items-center justify-center p-8 text-center shadow-[4px_4px_0px_rgba(74,59,50,0.2)] mt-auto mb-auto">
                <div className="text-8xl mb-4 grayscale opacity-50">🐻</div> 
                <h2 className="text-3xl font-bold mb-2 font-vt323 text-[#4A3B32]">No results found!</h2>
                <PixelButton variant="primary" onClick={handleReset} className="mt-4">Clear All</PixelButton>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SearchPage;