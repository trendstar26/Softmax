import React, { useState, useEffect } from 'react';
import { Article, Author, ViewMode } from './types';
import { INITIAL_ARTICLES } from './data/sampleArticles';
import { Navbar } from './components/Navbar';
import { ArticleFeed } from './components/ArticleFeed';
import { ArticleView } from './components/ArticleView';
import { ArticleEditor } from './components/ArticleEditor';
import { GoogleSignInModal } from './components/GoogleSignInModal';
import { CheckCircle2, Info } from 'lucide-react';

const STORAGE_KEY_ARTICLES = 'tech_journal_articles_v2';
const STORAGE_KEY_USER = 'tech_journal_user_v2';

export default function App() {
  // 1. Articles State with Local Storage Persistence
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ARTICLES);
      if (saved) {
        const parsed: Article[] = JSON.parse(saved);
        // Exclude all fake/sample demo articles
        const fakeIds = new Set([
          'gradient-boosting-mathematics',
          'transformer-attention-math',
          'fast-fourier-transform-derivation',
          'adam-optimizer-math-derivation',
        ]);
        const cleaned = parsed.filter(
          (a) => !fakeIds.has(a.id) && !a.author?.name?.toLowerCase().includes('vance')
        );
        localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(cleaned));
        return cleaned;
      }
    } catch (e) {
      console.error('Failed to load saved articles', e);
    }
    return INITIAL_ARTICLES;
  });

  // 2. User Authentication State with Local Storage
  const [currentUser, setCurrentUser] = useState<Author | null>(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.error('Failed to load saved user', e);
    }
    return null;
  });

  // 3. Navigation and Active Views
  const [viewMode, setViewMode] = useState<ViewMode>('feed');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // 4. Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // 5. Google Sign-In Modal
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save articles to local storage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
    } catch (e) {
      console.error('Failed to persist articles', e);
    }
  }, [articles]);

  // Save user to local storage whenever updated
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch (e) {
      console.error('Failed to persist user', e);
    }
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handlers
  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article);
    setViewMode('read');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewArticle = () => {
    setEditingArticle(null);
    setViewMode('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setViewMode('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveArticle = (articleToSave: Article, publish: boolean) => {
    setArticles((prev) => {
      const existsIndex = prev.findIndex((a) => a.id === articleToSave.id);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = articleToSave;
        return copy;
      }
      return [articleToSave, ...prev];
    });

    showToast(
      publish
        ? 'Article published successfully!'
        : 'Article draft saved to your workspace.'
    );

    setSelectedArticle(articleToSave);
    setViewMode('read');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLike = (articleId: string) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, likes: a.likes + 1 } : a))
    );
    if (selectedArticle && selectedArticle.id === articleId) {
      setSelectedArticle((prev) => (prev ? { ...prev, likes: prev.likes + 1 } : null));
    }
  };

  const handleSignInSuccess = (user: Author) => {
    setCurrentUser(user);
    showToast(`Signed in with Google as ${user.name}`);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    showToast('Signed out of Google account');
  };

  return (
    <div className="min-h-screen bg-[#f7f9fa] flex flex-col text-[#0f1419] selection:bg-[#eff3f4] selection:text-[#0f1419]">
      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f1419] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-medium animate-in slide-in-from-bottom-5 duration-200 border border-[#2f3336]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Primary Top Navbar (hidden in editor to allow maximum focus) */}
      {viewMode !== 'editor' && (
        <Navbar
          currentUser={currentUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewArticle={handleNewArticle}
          onRequestSignIn={() => setIsSignInModalOpen(true)}
          onSignOut={handleSignOut}
          onGoHome={() => {
            setViewMode('feed');
            setSelectedArticle(null);
          }}
        />
      )}

      {/* Main Views */}
      <div className="flex-1">
        {viewMode === 'feed' && (
          <ArticleFeed
            articles={articles}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            onSelectArticle={handleSelectArticle}
            onNewArticle={handleNewArticle}
            searchQuery={searchQuery}
          />
        )}

        {viewMode === 'read' && selectedArticle && (
          <ArticleView
            article={selectedArticle}
            currentUser={currentUser}
            onBack={() => {
              setViewMode('feed');
              setSelectedArticle(null);
            }}
            onEdit={handleEditArticle}
            onLike={handleLike}
          />
        )}

        {viewMode === 'editor' && (
          <ArticleEditor
            initialArticle={editingArticle}
            currentUser={currentUser}
            onSave={handleSaveArticle}
            onCancel={() => {
              if (selectedArticle) {
                setViewMode('read');
              } else {
                setViewMode('feed');
              }
            }}
            onRequestSignIn={() => setIsSignInModalOpen(true)}
          />
        )}
      </div>

      {/* Footer */}
      {viewMode !== 'editor' && (
        <footer className="border-t border-[#eff3f4] bg-white py-10 px-4 sm:px-8 mt-16 text-xs text-[#536471]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-serif-editorial text-lg font-bold text-[#0f1419]">
                ∇ Gradient
              </span>
              <span>—</span>
              <span>Mathematical Publishing &amp; Precision Research Drafting</span>
            </div>
            <p>© {new Date().getFullYear()} Gradient Publishing</p>
          </div>
        </footer>
      )}

      {/* Google Sign In Modal */}
      <GoogleSignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSuccess={handleSignInSuccess}
        suggestedEmail="tusharchannavat26@gmail.com"
      />
    </div>
  );
}
