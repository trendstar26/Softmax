import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, Key, UserCheck, AlertCircle, Info } from 'lucide-react';
import { Author } from '../types';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: Author) => void;
  suggestedEmail?: string;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  suggestedEmail = 'tusharchannavat26@gmail.com',
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'oauth'>('quick');
  const [customName, setCustomName] = useState('Tushar Channavat');
  const [customEmail, setCustomEmail] = useState(suggestedEmail);
  const [customTitle, setCustomTitle] = useState('Research Engineer & Writer');
  const [clientId, setClientId] = useState(() => {
    return (
      (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
      localStorage.getItem('tech_journal_google_client_id') ||
      ''
    );
  });
  const [gsiLoaded, setGsiLoaded] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Check if Google Identity Services is available
  useEffect(() => {
    const checkGsi = () => {
      if ((window as any).google?.accounts?.id) {
        setGsiLoaded(true);
      }
    };
    checkGsi();
    const timer = setInterval(checkGsi, 500);
    return () => clearInterval(timer);
  }, []);

  // Initialize GSI if client id exists
  useEffect(() => {
    if (!isOpen || !clientId || !(window as any).google?.accounts?.id || !googleBtnRef.current) {
      return;
    }

    try {
      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response?.credential) {
            try {
              // Decode JWT payload
              const base64Url = response.credential.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const payload = JSON.parse(jsonPayload);

              const user: Author = {
                id: payload.sub || `google-${Date.now()}`,
                name: payload.name || 'Google User',
                email: payload.email || '',
                avatarUrl:
                  payload.picture ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.email || 'user'}`,
                title: 'Technical Author',
              };

              onSuccess(user);
              onClose();
            } catch (e) {
              console.error('Error parsing Google JWT', e);
            }
          }
        },
      });

      (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'signin_with',
        shape: 'rectangular',
      });
    } catch (err) {
      console.warn('Google GSI render error:', err);
    }
  }, [isOpen, clientId, gsiLoaded]);

  if (!isOpen) return null;

  const handleQuickSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;

    const user: Author = {
      id: `google-${Date.now()}`,
      name: customName.trim() || 'Google Author',
      email: customEmail.trim(),
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        customName || customEmail
      )}&backgroundColor=0284c7,0369a1,075985`,
      title: customTitle.trim() || 'Technical Author',
    };

    onSuccess(user);
    onClose();
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientId.trim()) {
      localStorage.setItem('tech_journal_google_client_id', clientId.trim());
      setActiveTab('oauth');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#e7e5e4] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Header with Google Logo */}
        <div className="flex items-center justify-between p-5 border-b border-[#f5f5f4] bg-[#fafaf9]">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <h3 className="font-semibold text-[#1c1917] text-base">Google Sign-In</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#78716c] hover:text-[#1c1917] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <p className="text-sm text-[#57534e] mb-4">
            Sign in with your Google account to post articles, save drafts, and share your technical research with equations and code.
          </p>

          {/* Tab Selector */}
          <div className="flex rounded-lg bg-[#f5f5f4] p-1 mb-5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('quick')}
              className={`flex-1 py-1.5 rounded-md transition-all ${
                activeTab === 'quick'
                  ? 'bg-white text-[#1c1917] shadow-xs'
                  : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              One-Click Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('oauth')}
              className={`flex-1 py-1.5 rounded-md transition-all ${
                activeTab === 'oauth'
                  ? 'bg-white text-[#1c1917] shadow-xs'
                  : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              Google OAuth Client
            </button>
          </div>

          {activeTab === 'quick' ? (
            <form onSubmit={handleQuickSignIn} className="space-y-4">
              <div className="p-3.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {customEmail[0]?.toUpperCase() || 'G'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-emerald-800">Detected Account</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-emerald-950 truncate">{customEmail}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44403c] mb-1">
                  Author Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#d6d3d1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
                  placeholder="Your display name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44403c] mb-1">
                  Google Email
                </label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#d6d3d1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
                  placeholder="e.g. your-name@gmail.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44403c] mb-1">
                  Role / Bio (Optional)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#d6d3d1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent"
                  placeholder="e.g. AI Researcher, Math Enthusiast"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#1c1917] hover:bg-[#292524] text-white font-medium text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Continue as {customName.split(' ')[0] || 'Author'}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 flex gap-2">
                <Info className="w-4 h-4 shrink-0 text-sky-600 mt-0.5" />
                <p>
                  To render the standard Google GSI button, provide your Google Cloud OAuth 2.0 Web Client ID.
                </p>
              </div>

              <form onSubmit={handleSaveClientId} className="space-y-2">
                <label className="block text-xs font-semibold text-[#44403c]">
                  Google Client ID (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="e.g. 123456...apps.googleusercontent.com"
                    className="flex-1 px-3 py-2 text-xs font-mono border border-[#d6d3d1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#f5f5f4] hover:bg-[#e7e5e4] text-[#1c1917] font-medium text-xs rounded-lg transition-colors border border-[#d6d3d1]"
                  >
                    Save
                  </button>
                </div>
              </form>

              {clientId ? (
                <div className="pt-2 flex flex-col items-center justify-center">
                  <div ref={googleBtnRef} className="min-h-[44px]" />
                </div>
              ) : (
                <div className="text-center p-4 border border-dashed border-[#d6d3d1] rounded-xl text-xs text-[#78716c]">
                  Enter a Client ID above, or switch to the <strong>One-Click Sign In</strong> tab for instant access.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
