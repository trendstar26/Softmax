import React from 'react';
import {
  Heart,
  ArrowRight,
  BookOpen,
  PenTool,
} from 'lucide-react';
import { Article } from '../types';

interface ArticleFeedProps {
  articles: Article[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  onSelectArticle: (article: Article) => void;
  onNewArticle: () => void;
  searchQuery: string;
}

export const ArticleFeed: React.FC<ArticleFeedProps> = ({
  articles,
  selectedTag,
  onSelectTag,
  onSelectArticle,
  onNewArticle,
  searchQuery,
}) => {
  // Extract unique tags from existing articles
  const allTags = Array.from(new Set(articles.flatMap((a) => a.tags)));

  // Filter articles by tag and search query
  const filteredArticles = articles.filter((article) => {
    const matchesTag = !selectedTag || article.tags.includes(selectedTag);
    const matchesSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const featuredArticle = filteredArticles.find((a) => a.featured) || filteredArticles[0];
  const regularArticles = filteredArticles.filter((a) => a.id !== featuredArticle?.id);

  if (articles.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16">
        <div className="text-center py-20 bg-white rounded-3xl border border-[#eff3f4] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#f7f9fa] border border-[#eff3f4] flex items-center justify-center mx-auto text-[#0f1419]">
            <PenTool className="w-6 h-6 text-[#0f1419]" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl font-serif-editorial font-bold text-[#0f1419]">
              No articles published yet
            </h2>
            <p className="text-xs text-[#536471] max-w-sm mx-auto leading-relaxed">
              Your published articles and drafts will appear here. Start writing your first piece.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={onNewArticle}
              className="px-6 py-2.5 bg-[#0f1419] hover:bg-[#272c30] text-white font-bold text-xs rounded-full shadow-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <PenTool className="w-4 h-4 text-white" />
              <span>Draft an Article</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Top Header Row with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[#eff3f4]">
        <div>
          <h1 className="text-2xl font-serif-editorial font-bold text-[#0f1419]">
            Articles
          </h1>
          <p className="text-xs text-[#536471]">
            {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
          </p>
        </div>

        <button
          type="button"
          onClick={onNewArticle}
          className="px-4 py-2 bg-[#0f1419] hover:bg-[#272c30] text-white font-bold text-xs rounded-full shadow-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <PenTool className="w-3.5 h-3.5 text-white" />
          <span>New Article</span>
        </button>
      </div>

      {/* Tag Filter Pills */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[#536471] font-bold uppercase tracking-wider text-[11px] mr-1">
            Topics:
          </span>
          <button
            type="button"
            onClick={() => onSelectTag(null)}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
              selectedTag === null
                ? 'bg-[#0f1419] text-white shadow-xs'
                : 'bg-white hover:bg-[#f7f9fa] text-[#536471] border border-[#eff3f4]'
            }`}
          >
            All ({articles.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectTag(tag)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-[#0f1419] text-white shadow-xs'
                  : 'bg-white hover:bg-[#f7f9fa] text-[#536471] border border-[#eff3f4]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Featured / Lead Article Card */}
      {featuredArticle && !searchQuery && selectedTag === null && (
        <div
          onClick={() => onSelectArticle(featuredArticle)}
          className="group cursor-pointer bg-white rounded-3xl border border-[#eff3f4] hover:border-[#cfd9de] p-7 sm:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition-all relative overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-[#f7f9fa] text-[#0f1419] border border-[#eff3f4] text-xs font-bold">
              Published Article
            </span>
            <span className="text-xs text-[#536471]">•</span>
            <span className="text-xs text-[#536471] font-medium">{featuredArticle.readingTimeMinutes} min read</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif-editorial font-bold text-[#0f1419] group-hover:text-[#1d9bf0] transition-colors mb-3 leading-snug tracking-tight">
            {featuredArticle.title}
          </h2>

          <p className="text-base text-[#536471] leading-relaxed mb-6 max-w-3xl line-clamp-2">
            {featuredArticle.subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#eff3f4] text-xs text-[#536471]">
            <div className="flex items-center gap-3">
              <img
                src={featuredArticle.author.avatarUrl}
                alt={featuredArticle.author.name}
                className="w-9 h-9 rounded-full object-cover border border-[#eff3f4]"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="font-bold text-[#0f1419]">{featuredArticle.author.name}</p>
                <p className="text-[11px] text-[#536471]">{featuredArticle.author.title || 'Author'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-rose-600 font-semibold">
                <Heart className="w-3.5 h-3.5 fill-rose-500" />
                <span>{featuredArticle.likes}</span>
              </div>
              <span className="flex items-center gap-1 font-bold text-[#0f1419] group-hover:translate-x-1 transition-transform">
                <span>Read Article</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Additional / Search / Filtered Articles Grid */}
      {(searchQuery || selectedTag || regularArticles.length > 0) && (
        <div className="space-y-4 pt-2">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#cfd9de] p-8 space-y-3">
              <BookOpen className="w-10 h-10 text-[#8b98a5] mx-auto" />
              <h4 className="font-bold text-[#0f1419]">No articles found</h4>
              <p className="text-xs text-[#536471] max-w-sm mx-auto">
                No articles matched your search query.
              </p>
              <button
                type="button"
                onClick={onNewArticle}
                className="px-4 py-2 bg-[#0f1419] text-white text-xs font-bold rounded-full hover:bg-[#272c30] transition-colors cursor-pointer"
              >
                Write an Article
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(searchQuery || selectedTag ? filteredArticles : regularArticles).map((article) => (
                <div
                  key={article.id}
                  onClick={() => onSelectArticle(article)}
                  className="group cursor-pointer bg-white rounded-2xl border border-[#eff3f4] hover:border-[#cfd9de] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {article.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f7f9fa] border border-[#eff3f4] text-[#536471]"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="text-xs text-[#8b98a5] ml-auto font-medium">
                        {article.readingTimeMinutes} min read
                      </span>
                    </div>

                    <h4 className="text-xl font-serif-editorial font-bold text-[#0f1419] group-hover:text-[#1d9bf0] transition-colors leading-snug mb-2">
                      {article.title}
                    </h4>

                    {article.subtitle && (
                      <p className="text-xs text-[#536471] leading-relaxed mb-4 line-clamp-2">
                        {article.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#eff3f4] flex items-center justify-between text-xs text-[#536471]">
                    <div className="flex items-center gap-2">
                      <img
                        src={article.author.avatarUrl}
                        alt={article.author.name}
                        className="w-6 h-6 rounded-full object-cover border border-[#eff3f4]"
                        referrerPolicy="no-referrer"
                      />
                      <span className="font-semibold text-[#0f1419] truncate max-w-[140px]">
                        {article.author.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-rose-600 font-semibold">
                        <Heart className="w-3 h-3 fill-rose-500" />
                        <span>{article.likes}</span>
                      </span>
                      <span className="text-[#0f1419] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
