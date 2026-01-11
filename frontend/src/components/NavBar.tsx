import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Search, Bell, Plus, LogOut, UserCircle, X, History, Clock, Trash2 } from 'lucide-react';
import { PixelButton } from './PixelButton';
import { Avatar } from './Avatar';
import { useNav } from "@/hooks/useNav";
import { useAuth } from "@/contexts/AuthContext";
import { getSearchSuggestionsApi, getSearchHistoryApi, clearSearchHistoryApi, deleteSearchHistoryItemApi } from '@/api/search.api';
import logo from "@/assets/logo.svg";

interface NavBarProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
  title?: string;
  notificationCount?: number;
  showBackButton?: boolean; 
  onBack?: () => void;
}

// Interface for History Items from DB
interface SearchHistoryItem {
  id: number;
  query_text: string;
}

export function NavBar({ 
  isLoggedIn = false, 
  title = 'Cookie',
  notificationCount = 0,
  showBackButton = false,
  onBack
}: NavBarProps) {
  
  const [showDropdown, setShowDropdown] = useState(false);
  
  // --- SEARCH STATES ---
  const [localQuery, setLocalQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Store History (Objects with ID)
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  // Store Suggestions (Strings) - MUST be state to trigger re-render
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Ref for Debouncing
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);     
  const searchContainerRef = useRef<HTMLDivElement>(null); 
  
  const nav = useNav();
  const { logout, viewer } = useAuth();

  const handleBack = () => {
    if (onBack) onBack();
    else nav.back();
  }

  // --- FETCH HISTORY ---
  const fetchHistory = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await getSearchHistoryApi();
      setSearchHistory(res.data.data);
    } catch (err) {
      console.error("Failed to fetch search history", err);
    }
  };

  // --- INPUT HANDLER (DEBOUNCED) ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalQuery(val);
    setIsSearchFocused(true);

    // 1. Clear previous timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // 2. If empty, clear suggestions and show history (if logged in)
    if (!val.trim()) {
      setSuggestions([]);
      if (isLoggedIn) fetchHistory();
      return;
    }

    // 3. Set new timer (300ms)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await getSearchSuggestionsApi(val);
        console.log('Suggestions fetched:', res.data.data);
        setSuggestions(res.data.data); 
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
      }
    }, 300);
  };

  // Initial fetch
  useEffect(() => {
    fetchHistory();
  }, [isLoggedIn]);

  // Handle click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // --- ACTIONS ---
  const executeSearch = (term: string) => {
    if (!term.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current); // Cancel pending suggest
    
    setLocalQuery(term);
    setIsSearchFocused(false);
    nav.search(term);
  };

  const handleClearAllHistory = async () => {
    try {
      await clearSearchHistoryApi();
      setSearchHistory([]);
    } catch (err) {
      console.error("Failed to clear search history", err);
    }
  };

  const removeHistoryItem = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); 
    try {
      setSearchHistory(prev => prev.filter(h => h.id !== id));
      await deleteSearchHistoryItemApi(id);
    } catch (err) {
      console.error("Failed to delete item", err);
    }
  };

  return (
    <header className="border-b-[3px] border-[var(--border)] bg-[white] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        
        <div className="flex items-center justify-between gap-4">
          {showBackButton && 
            (<button 
              className="p-2 hover:bg-[var(--cream)] transition-colors" 
              onClick={handleBack}>
                <ArrowLeft className="w-5 h-5" />
            </button>)
          }

          <div 
            className="flex items-center cursor-pointer shrink-0"
            onClick={nav.home}
          >
            <img src={logo} alt="Logo" className="w-12 h-12 mr-4" />
            <h1 className="text-xl sm:text-2xl text-[var(--foreground)] font-pixel hidden sm:block">
              {title}
            </h1>
          </div>

          {/* --- SEARCH BAR --- */}
          <div className="flex-1 max-w-xl mx-4 hidden md:block z-50" ref={searchContainerRef}>
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-2 pl-10 bg-[var(--cream)] pixel-border placeholder:text-[var(--foreground)]/50 font-vt outline-none focus:ring-2 ring-[var(--pink)]/50 transition-all"
                placeholder="Search recipes..."
                value={localQuery}
                onFocus={() => {
                  setIsSearchFocused(true);
                  if (!localQuery) fetchHistory();
                }}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") executeSearch(localQuery);
                }}
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
              
              {localQuery && (
                <button 
                  onClick={() => { setLocalQuery(''); setSuggestions([]); fetchHistory(); setIsSearchFocused(true); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              )}

              {/* --- DROPDOWN --- */}
              {isSearchFocused && (
                <div className="absolute top-full left-0 w-full bg-white pixel-border border-t-0 shadow-lg mt-1 overflow-hidden animate-fade-in">
                  
                  {/* CASE 1: INPUT EMPTY -> HISTORY */}
                  {!localQuery.trim() ? (
                    <div>
                      {searchHistory.length > 0 ? (
                        <>
                          <div className="bg-gray-50 px-4 py-2 border-b-2 border-dashed border-gray-200 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400 uppercase font-pixel flex items-center gap-2">
                              <History size={12}/> Recent
                            </span>
                            <button onClick={handleClearAllHistory} className="text-xs text-red-400 hover:text-red-600 font-pixel">
                              Clear all
                            </button>
                          </div>
                          
                          {searchHistory.map((item) => (
                            <div 
                              key={item.id}
                              className="px-4 py-2 hover:bg-[#FFF8E1] cursor-pointer flex items-center justify-between group border-b border-gray-100 last:border-0"
                              onClick={() => executeSearch(item.query_text)}
                            >
                              <div className="flex items-center gap-3 text-[var(--foreground)] font-vt text-lg">
                                <Clock size={14} className="text-gray-400" />
                                {item.query_text}
                              </div>
                              <button 
                                onClick={(e) => removeHistoryItem(e, item.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 text-red-400 rounded transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="p-3 text-center text-gray-400 font-vt italic">
                           {isLoggedIn ? 'No recent searches' : 'Login to see history'}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* CASE 2: HAS INPUT -> SUGGESTIONS */
                    <div>
                      {suggestions.length > 0 ? suggestions.map((item, idx) => (
                        <div 
                          key={idx}
                          className="px-4 py-2 hover:bg-[#FFF8E1] cursor-pointer flex items-center gap-3 text-[var(--foreground)] font-vt text-lg border-b border-gray-100 last:border-0"
                          onClick={() => executeSearch(item)}
                        >
                          <Search size={14} className="text-gray-400" />
                          <span>{item}</span>
                        </div>
                      )) : (
                        <div className="p-3 text-center text-gray-400 font-vt italic">
                          No suggestions found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
             {/* ... (Keep existing User/Login buttons same as before) ... */}
             {isLoggedIn ? (
              <>
                <button className="p-2 hover:bg-[var(--cream)]" onClick={nav.create}><Plus className="w-5 h-5"/></button>
                <button className="p-2 hover:bg-[var(--cream)] relative" onClick={nav.notifications}>
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--pink)] rounded-full"></span>}
                </button>
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setShowDropdown(!showDropdown)}>
                    <Avatar src={viewer?.avatar_url ?? undefined} alt={viewer?.username || 'User'} size={32} />
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white pixel-border shadow-pixel z-50">
                      <button className="w-full px-4 py-3 text-left hover:bg-[var(--pink)]/30 flex items-center gap-3 font-vt" onClick={() => { setShowDropdown(false); nav.me(); }}>
                        <UserCircle className="w-5 h-5" /> Profile
                      </button>
                      <button className="w-full px-4 py-3 text-left hover:bg-[var(--pink)]/30 flex items-center gap-3 font-vt" onClick={async () => { setShowDropdown(false); await logout(); nav.login(); }}>
                        <LogOut className="w-5 h-5" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <PixelButton variant="outline" size="sm" onClick={nav.login}>Login</PixelButton>
                <PixelButton variant="primary" size="sm" onClick={nav.signup}>Sign Up</PixelButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}