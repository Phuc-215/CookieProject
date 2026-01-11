import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Search, Bell, Plus, LogOut, UserCircle, X, History, Clock, Trash2 } from 'lucide-react';
import { PixelButton } from './PixelButton';
import { Avatar } from './Avatar';
import { useNav } from "@/hooks/useNav";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.svg";

interface NavBarProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
  title?: string;
  notificationCount?: number;
  showBackButton?: boolean; 
  onBack?: () => void;
  searchQuery?: string;
}

// --- MOCK DATA CHO GỢI Ý (Bạn có thể thay bằng API thật) ---
const MOCK_SUGGESTIONS = [
  "Chocolate Chip", "Oatmeal Raisin", "Macarons", "Cupcakes", "Brownies", "Vegan", "Keto", "Sugar Free", "Christmas Cookies"
];
const MOCK_HISTORY_INIT = ["Vegan Cookies", "Gluten Free", "Donuts"];

export function NavBar({ 
  isLoggedIn = false, 
  title = 'Cookie',
  notificationCount = 0,
  showBackButton = false,
  onBack
}: NavBarProps) {
  
  const [showDropdown, setShowDropdown] = useState(false); // User dropdown
  
  // --- SEARCH STATES ---
  const [localQuery, setLocalQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(MOCK_HISTORY_INIT);
  
  const dropdownRef = useRef<HTMLDivElement>(null);     // Ref cho User menu
  const searchContainerRef = useRef<HTMLDivElement>(null); // Ref cho Search bar
  
  const nav = useNav();
  const { logout, viewer } = useAuth();

  const handleBack = () => {
    if (onBack) onBack();
    else nav.back();
  }

  // Handle click outside (Đóng cả 2 loại dropdown)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Đóng User Dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      // Đóng Search Suggestions
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // --- SEARCH LOGIC ---
  const executeSearch = (term: string) => {
    if (!term.trim()) return;

    // 1. Lưu vào lịch sử (nếu chưa có)
    if (!searchHistory.includes(term)) {
      setSearchHistory([term, ...searchHistory].slice(0, 5)); // Giữ 5 cái mới nhất
    }
    
    // 2. Cập nhật UI
    setLocalQuery(term);
    setIsSearchFocused(false);
    
    // 3. Chuyển trang
    nav.search(term);
  };

  const removeHistoryItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation(); // Ngăn việc click xóa làm đóng dropdown
    setSearchHistory(prev => prev.filter(h => h !== item));
  };

  const filteredSuggestions = MOCK_SUGGESTIONS.filter(s => 
    s.toLowerCase().includes(localQuery.toLowerCase())
  ).slice(0, 5);

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

          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer shrink-0"
            onClick={nav.home}
          >
            <img src={logo} alt="Logo" className="w-12 h-12 mr-4" />
            <h1 className="text-xl sm:text-2xl text-[var(--foreground)] font-pixel hidden sm:block">
              {title}
            </h1>
          </div>

          {/* --- DESKTOP SEARCH BAR (CENTER) --- */}
          <div className="flex-1 max-w-xl mx-4 hidden md:block z-50" ref={searchContainerRef}>
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-2 pl-10 bg-[var(--cream)] pixel-border placeholder:text-[var(--foreground)]/50 font-vt outline-none focus:ring-2 ring-[var(--pink)]/50 transition-all"
                placeholder="Search recipes..."
                value={localQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setLocalQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") executeSearch(localQuery);
                }}
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
              
              {/* Nút X xóa text */}
              {localQuery && (
                <button 
                  onClick={() => { setLocalQuery(''); setIsSearchFocused(true); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              )}

              {/* --- DROPDOWN GỢI Ý --- */}
              {isSearchFocused && (
                <div className="absolute top-full left-0 w-full bg-white pixel-border border-t-0 shadow-lg mt-1 overflow-hidden animate-fade-in">
                  
                  {/* CASE 1: INPUT RỖNG -> HIỆN LỊCH SỬ */}
                  {!localQuery.trim() ? (
                    <div>
                      {searchHistory.length > 0 && (
                        <div className="bg-gray-50 px-4 py-2 border-b-2 border-dashed border-gray-200 flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-400 uppercase font-pixel flex items-center gap-2">
                            <History size={12}/> Recent
                          </span>
                          <button onClick={() => setSearchHistory([])} className="text-xs text-red-400 hover:text-red-600 font-pixel">
                            Clear all
                          </button>
                        </div>
                      )}
                      
                      {searchHistory.map((item, idx) => (
                        <div 
                          key={idx}
                          className="px-4 py-2 hover:bg-[#FFF8E1] cursor-pointer flex items-center justify-between group border-b border-gray-100 last:border-0"
                          onClick={() => executeSearch(item)}
                        >
                          <div className="flex items-center gap-3 text-[var(--foreground)] font-vt text-lg">
                            <Clock size={14} className="text-gray-400" />
                            {item}
                          </div>
                          <button 
                            onClick={(e) => removeHistoryItem(e, item)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 text-red-400 rounded transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* CASE 2: CÓ TEXT -> HIỆN GỢI Ý */
                    <div>
                      {filteredSuggestions.length > 0 ? filteredSuggestions.map((item, idx) => (
                        <div 
                          key={idx}
                          className="px-4 py-2 hover:bg-[#FFF8E1] cursor-pointer flex items-center gap-3 text-[var(--foreground)] font-vt text-lg border-b border-gray-100 last:border-0"
                          onClick={() => executeSearch(item)}
                        >
                          <Search size={14} className="text-gray-400" />
                          {/* Highlight phần text khớp (Optional simple highlight) */}
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
             {/* ... (Giữ nguyên phần nút Login/Notification/Profile cũ) ... */}
            <button 
              className="md:hidden p-2 hover:bg-[var(--cream)] transition-colors"
              onClick={() => nav.search(localQuery)}
              title="Search"
            >
              <Search className="w-5 h-5 text-[var(--foreground)]" />
            </button>

            {isLoggedIn ? (
              <>
                <button 
                  className="p-2 hover:bg-[var(--cream)] transition-colors"
                  onClick={nav.create}
                  title="Create Recipe"
                >
                  <Plus className="w-5 h-5 text-[var(--foreground)]" />
                </button>

                <button 
                  className="p-2 hover:bg-[var(--cream)] transition-colors relative"
                  onClick={nav.notifications}
                  title="Notifications"
                >
                  <Bell className="w-5 h-5 text-[var(--foreground)]" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--pink)] rounded-full"></span>
                  )}
                </button>

                <div className="relative" ref={dropdownRef}>
                  <button 
                    className="hover:bg-[var(--cream)] transition-colors"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <Avatar 
                      src={viewer?.avatar_url ?? undefined} 
                      alt={viewer?.username || 'User'} 
                      size={32}
                    />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white pixel-border shadow-pixel z-50">
                      <button
                        className="w-full px-4 py-3 text-left hover:bg-[var(--pink)]/30 transition-colors flex items-center gap-3 border-b-2 border-[var(--border)] font-vt"
                        onClick={() => { setShowDropdown(false); nav.me(); }}
                      >
                        <UserCircle className="w-5 h-5" />
                        <span>View Profile</span>
                      </button>

                      <button
                        className="w-full px-4 py-3 text-left hover:bg-[var(--pink)]/30 transition-colors flex items-center gap-3 font-vt"
                        onClick={async () => {
                          setShowDropdown(false);
                          await logout();
                          nav.login();
                        }}
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
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