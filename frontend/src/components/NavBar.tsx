import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Search, Bell, User, Plus, LogOut, UserCircle } from 'lucide-react';
import { PixelButton } from './PixelButton';
import { useNav } from "../hooks/useNav";
import logo from "../assets/logo.svg";

interface NavBarProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
  title?: string;
  notificationCount?: number;
  showBackButton?: boolean; 
  onBack?: () => void;
  searchQuery?: string;
}

export function NavBar({ 
  isLoggedIn = false, 
  onLogout,
  title = 'Cookie',
  notificationCount = 0,
  showBackButton = false,
  onBack
}: NavBarProps) {
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [localQuery, setLocalQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const nav = useNav();

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
    else {
      nav.back();
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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
            <img 
              src={logo} 
              alt="Logo"
              className="w-12 h-12 mr-4"
            />

            <h1 
              className="text-xl sm:text-2xl text-[var(--foreground)] font-pixel"
            >
              {title}
            </h1>
          </div>

          {/* Desktop Search */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <input
                type="text"
                className="
                  w-full px-4 py-2 pl-10 
                  bg-[var(--cream)] 
                  pixel-border 
                  placeholder:text-[var(--foreground)]/50
                  font-vt
                "
                placeholder="Search recipes..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") nav.search(localQuery);
                }}
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Mobile Search */}
            <button 
              className="md:hidden p-2 hover:bg-[var(--cream)] transition-colors"
              onClick={() => nav.search(localQuery)}
              title="Search"
            >
              <Search className="w-5 h-5 text-[var(--foreground)]" />
            </button>

            {isLoggedIn ? (
              <>
                {/* Create */}
                <button 
                  className="p-2 hover:bg-[var(--cream)] transition-colors"
                  onClick={nav.create}
                  title="Create Recipe"
                >
                  <Plus className="w-5 h-5 text-[var(--foreground)]" />
                </button>

                {/* Notifications */}
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

                {/* Profile */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    className="p-2 hover:bg-[var(--cream)] transition-colors"
                    onClick={() => setShowDropdown(!showDropdown)}
                    title="Profile"
                  >
                    <div className="w-8 h-8 bg-[var(--mint)] pixel-border flex items-center justify-center">
                      <User className="w-5 h-5 text-[var(--foreground)]" />
                    </div>
                  </button>

                  {/* Dropdown */}
                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white pixel-border shadow-pixel z-50">
                      
                      <button
                        className="w-full px-4 py-3 text-left hover:bg-[var(--pink)]/30 transition-colors flex items-center gap-3 border-b-2 border-[var(--border)] font-vt"
                        onClick={() => {
                          setShowDropdown(false);
                          nav.me();
                        }}
                      >
                        <UserCircle className="w-5 h-5" />
                        <span>View Profile</span>
                      </button>

                      <button
                        className="w-full px-4 py-3 text-left hover:bg-[var(--pink)]/30 transition-colors flex items-center gap-3 font-vt"
                        onClick={() => {
                          setShowDropdown(false);
                          onLogout?.();
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
                <PixelButton variant="outline" size="sm" onClick={nav.login}>
                  Login
                </PixelButton>
                <PixelButton variant="primary" size="sm" onClick={nav.signup}>
                  Sign Up
                </PixelButton>
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}