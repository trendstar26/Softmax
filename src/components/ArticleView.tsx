import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Heart,
  Share2,
  Clock,
  Calendar,
  Tag,
  Edit2,
  Download,
  Check,
  Bookmark,
  User,
  ShieldCheck,
} from 'lucide-react';
import { Article, Author } from '../types';
import { MathRenderer } from './MathRenderer';

interface ArticleViewProps {
  article: Article;
  currentUser: Author | null;
  onBack: () => void;
  onEdit: (article: Article) => void;
  onLike: (articleId: string) => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  article,
  currentUser,
  onBack,
  onEdit,
  onLike,
}) => {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  // Extract table of contents headings
  useEffect(() => {
    const lines = article.content.split('\n');
    const list: { id: string; text: string; level: number }[] = [];
    lines.forEach((line) => {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        list.push({ id, text, level });
      }
    });
    setHeadings(list);
  }, [article.content]);

  // Track active scroll heading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0% -60% 0%' }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([article.content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${article.slug || 'article'}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAuthor = currentUser && (currentUser.email === article.author.email || currentUser.id === article.author.id);

  return (
    <div className="min-h-screen bg-[#f7f9fa]">
      {/* Top Reading Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#eff3f4] px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-[#536471] hover:text-[#0f1419] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Articles</span>
          </button>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onLike(article.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-50 hover:text-rose-600 text-[#0f1419] rounded-full border border-[#eff3f4] text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              title="Applaud / Like"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>{article.likes}</span>
            </button>

            <button
              type="button"
              onClick={() => setBookmarked(!bookmarked)}
              className={`p-2 rounded-full border border-[#eff3f4] text-xs transition-colors cursor-pointer shadow-2xs ${
                bookmarked ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-[#0f1419] hover:bg-[#eff3f4]'
              }`}
              title="Bookmark article"
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#eff3f4] text-[#0f1419] rounded-full border border-[#eff3f4] text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              title="Share article link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#eff3f4] text-[#0f1419] rounded-full border border-[#eff3f4] text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              title="Download raw Markdown + LaTeX"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export .md</span>
            </button>

            <button
              type="button"
              onClick={() => onEdit(article)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0f1419] hover:bg-[#272c30] text-white rounded-full text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="Edit this article in Google Docs style editor"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Article</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area with Table of Contents on Wide Screens */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Article Main Reading Column */}
          <article className="lg:col-span-8 bg-white p-6 sm:p-12 rounded-3xl border border-[#eff3f4] shadow-xs">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#eff3f4] hover:bg-[#e1e8ed] text-[#0f1419] transition-colors"
                >
                  <Tag className="w-3 h-3 text-[#536471]" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0f1419] tracking-tight leading-[1.15] mb-3">
              {article.title}
            </h1>

            {/* Subtitle */}
            {article.subtitle && (
              <p className="text-lg sm:text-xl text-[#536471] font-normal leading-relaxed mb-6 border-b border-[#eff3f4] pb-6">
                {article.subtitle}
              </p>
            )}

            {/* Author Meta Card */}
            <div className="flex items-center justify-between border-y border-[#eff3f4] py-4 mb-8 text-xs text-[#536471]">
              <div className="flex items-center gap-3">
                <img
                  src={article.author.avatarUrl}
                  alt={article.author.name}
                  className="w-11 h-11 rounded-full object-cover border border-[#eff3f4]"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#0f1419] text-sm">{article.author.name}</span>
                    <span className="inline-flex items-center text-[10px] text-[#1d9bf0] bg-[#1d9bf0]/10 px-1.5 py-0.5 rounded-full font-bold">
                      <ShieldCheck className="w-3 h-3 mr-0.5" /> Verified Author
                    </span>
                  </div>
                  <p className="text-[#536471]">{article.author.title || 'Technical Author'}</p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="flex items-center gap-1 justify-end font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(article.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1 justify-end font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{article.readingTimeMinutes} min read</span>
                </div>
              </div>
            </div>

            {/* Rendered Body with LaTeX & Interactive Code Blocks */}
            <MathRenderer content={article.content} allowCodeExecution={true} />

            {/* Article Footer & Author Bio */}
            <div className="mt-14 pt-8 border-t border-[#eff3f4]">
              <div className="bg-[#f7f9fa] p-6 rounded-2xl border border-[#eff3f4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={article.author.avatarUrl}
                    alt={article.author.name}
                    className="w-14 h-14 rounded-full object-cover border border-[#eff3f4]"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-[#0f1419] text-base">{article.author.name}</h4>
                    <p className="text-xs text-[#536471]">{article.author.title || 'Contributing Technical Author'}</p>
                    <p className="text-xs text-[#536471] mt-1">{article.author.email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onLike(article.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-rose-50 text-[#0f1419] hover:text-rose-600 rounded-full border border-[#eff3f4] text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>Applaud article ({article.likes})</span>
                </button>
              </div>
            </div>
          </article>

          {/* Sticky Sidebar (Table of Contents & Math Info) */}
          <aside className="lg:col-span-4 hidden lg:block space-y-6">
            <div className="sticky top-20 space-y-6">
              {/* Table of Contents */}
              {headings.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-[#eff3f4] shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#536471] mb-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1d9bf0]" />
                    Table of Contents
                  </h3>
                  <nav className="space-y-2 text-xs">
                    {headings.map((h) => (
                      <a
                        key={h.id}
                        href={`#${h.id}`}
                        className={`block py-1 transition-colors ${
                          h.level === 1
                            ? 'font-bold text-[#0f1419]'
                            : h.level === 2
                            ? 'pl-3 text-[#536471]'
                            : 'pl-6 text-[#536471]'
                        } ${
                          activeHeadingId === h.id
                            ? 'text-[#1d9bf0] font-bold underline'
                            : 'hover:text-[#1d9bf0]'
                        }`}
                      >
                        {h.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
