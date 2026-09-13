import React, { useState } from 'react';
import {
  PenTool,
  Search,
  Sigma,
  LogOut,
  User,
  Plus,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Author } from '../types';

interface NavbarProps {
  currentUser: Author | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNewArticle: () => void;
  onRequestSignIn: () => void;
  onSignOut: () => void;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  searchQuery,
  onSearchChange,
  onNewArticle,
  onRequestSignIn,
  onSignOut,
  onGoHome,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#eff3f4] px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 rounded-xl bg-[#0f1419] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <span className="font-serif-editorial text-xl font-bold tracking-tight">∇</span>
          </div>
          <span className="font-serif-editorial text-2xl font-bold text-[#0f1419] tracking-tight">
            Gradient
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8b98a5] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search equations, proofs, machine learning..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#f7f9fa] hover:bg-[#f2f4f6] focus:bg-white text-[#0f1419] rounded-full border border-[#eff3f4] focus:border-[#0f1419] focus:outline-none transition-all placeholder:text-[#8b98a5]"
            />
          </div>
        </div>

        {/* Actions & Google Sign-In */}
        <div className="flex items-center gap-2.5">
          {/* Write / Post Article Button */}
          <button
            id="nav-write-article-btn"
            type="button"
            onClick={onNewArticle}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0f1419] hover:bg-[#272c30] rounded-full shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write Article</span>
          </button>

          {/* User Section / Google Sign-In */}
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-[#f7f9fa] transition-colors cursor-pointer border border-transparent hover:border-[#eff3f4]"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#eff3f4]"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xs font-semibold text-[#0f1419] hidden sm:inline max-w-[120px] truncate">
                  {currentUser.name}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#eff3f4] p-2 text-xs z-50 animate-in fade-in zoom-in-95">
                  <div className="p-3 border-b border-[#eff3f4] bg-[#f7f9fa] rounded-xl mb-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span className="font-semibold text-emerald-800">Google Verified</span>
                    </div>
                    <p className="font-bold text-[#0f1419] mt-1 truncate">{currentUser.name}</p>
                    <p className="text-[#536471] truncate">{currentUser.email}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onNewArticle();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-[#f7f9fa] text-[#0f1419] transition-colors cursor-pointer"
                  >
                    <PenTool className="w-3.5 h-3.5 text-[#0f1419]" />
                    <span>Create New Article</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSignOut();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="google-signin-nav-btn"
              type="button"
              onClick={onRequestSignIn}
              className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#f7f9fa] border border-[#eff3f4] text-[#0f1419] rounded-full text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
