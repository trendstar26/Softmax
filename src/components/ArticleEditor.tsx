import React, { useState, useRef } from 'react';
import {
  Save,
  Send,
  Eye,
  Columns2,
  Edit3,
  Code2,
  Sigma,
  Table,
  List,
  ListOrdered,
  Quote,
  Sparkles,
  ArrowLeft,
  BookOpen,
  FileText,
  HelpCircle,
  Wand2,
  CheckCircle2,
  Bold,
  Italic,
  Strikethrough,
  Minus,
  Plus,
  Type,
  Code,
  Undo2,
  Redo2,
  Check,
  Highlighter,
} from 'lucide-react';
import { Article, Author } from '../types';
import { MathRenderer } from './MathRenderer';
import { EquationEditorModal } from './EquationEditorModal';
import { autoFixDocumentLatex } from '../utils/latexSanitizer';
import { handleSmartPasteText } from '../utils/smartPaste';

interface ArticleEditorProps {
  initialArticle?: Article | null;
  currentUser: Author | null;
  onSave: (article: Article, publish: boolean) => void;
  onCancel: () => void;
  onRequestSignIn: () => void;
}

const TEMPLATES = [
  {
    name: 'Transformer / ML Paper',
    content: `# Deep Learning Architecture & Mathematical Derivations

In this article, we formulate the objective function and backpropagation dynamics.

## 1. Loss Formulation & Regularization

Given input $x \\in \\mathbb{R}^d$ and target $y$, we minimize the regularized empirical risk:

$$\\mathcal{L}(\\theta) = \\frac{1}{N} \\sum_{i=1}^N \\ell(f_\\theta(x_i), y_i) + \\frac{\\lambda}{2} \\|\\theta\\|^2_2$$

The gradient with respect to parameter tensor $\\theta$ is given by:

$$\\nabla_\\theta \\mathcal{L} = \\frac{1}{N} \\sum_{i=1}^N \\nabla_\\theta \\ell(f_\\theta(x_i), y_i) + \\lambda \\theta$$

## 2. Matrix Formulation of Multi-Head Attention

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V$$

Where the key and query dimensions are $d_k$:

$$\\begin{pmatrix}
q_1 \\\\
q_2
\\end{pmatrix}
\\begin{pmatrix}
k_1 & k_2
\\end{pmatrix}
=
\\begin{pmatrix}
q_1 k_1 & q_1 k_2 \\\\
q_2 k_1 & q_2 k_2
\\end{pmatrix}$$

## 3. Implementation

\`\`\`python
def compute_loss(predictions, targets, weight_decay=1e-4):
    import numpy as np
    mse = np.mean((predictions - targets) ** 2)
    print(f"Computed MSE Loss: {mse:.4f}")
    return mse

compute_loss(np.array([1.2, 2.4, 3.1]), np.array([1.0, 2.5, 3.0]))
\`\`\`
`,
  },
  {
    name: 'Calculus & Proof',
    content: `# The Basel Problem: Summing the Reciprocal Squares

We evaluate the famous Euler summation:

$$\\sum_{n=1}^\\infty \\frac{1}{n^2} = \\frac{1}{1^2} + \\frac{1}{2^2} + \\frac{1}{3^2} + \\dots = \\frac{\\pi^2}{6}$$

## 1. Taylor Series Expansion of Sine

Recall the Taylor series for $\\sin(x)$:

$$\\sin(x) = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\frac{x^7}{7!} + \\dots$$

Dividing by $x$ for $x \\neq 0$:

$$\\frac{\\sin(x)}{x} = 1 - \\frac{x^2}{6} + \\frac{x^4}{120} - \\dots$$

## 2. Factorization via Roots

The roots of $\\frac{\\sin(x)}{x} = 0$ occur at $x = \\pm \\pi, \\pm 2\\pi, \\pm 3\\pi, \\dots$. Factoring as an infinite Weierstrass product:

$$\\frac{\\sin(x)}{x} = \\prod_{n=1}^\\infty \\left(1 - \\frac{x^2}{n^2 \\pi^2}\\right)$$

Equating the coefficient of $x^2$ on both representations gives Euler's monumental result:

$$-\\frac{1}{6} = -\\sum_{n=1}^\\infty \\frac{1}{n^2 \\pi^2} \\implies \\sum_{n=1}^\\infty \\frac{1}{n^2} = \\frac{\\pi^2}{6} \\approx 1.64493$$

\`\`\`javascript
let sum = 0;
for (let n = 1; n <= 10000; n++) {
  sum += 1 / (n * n);
}
console.log("Numerical partial sum (n=10000):", sum);
console.log("Theoretical value (pi^2 / 6):", (Math.PI * Math.PI) / 6);
\`\`\`
`,
  },
  {
    name: 'Algorithm Analysis & Code',
    content: `# Asymptotic Complexity of Binary Search & Recurrences

Binary search eliminates half the search space at each step.

## 1. The Divide-and-Conquer Recurrence

$$T(n) = T\\left(\\frac{n}{2}\\right) + \\mathcal{O}(1)$$

By the Master Theorem, with $a = 1, b = 2, c = 0$:

$$T(n) = \\Theta(\\log_2 n)$$

## 2. Runnable Implementation

\`\`\`typescript
function binarySearch(arr: number[], target: number): number {
  let low = 0;
  let high = arr.length - 1;
  let comparisons = 0;

  while (low <= high) {
    comparisons++;
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) {
      console.log(\`Found target \${target} at index \${mid} in \${comparisons} steps\`);
      return mid;
    } else if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return -1;
}

const numbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91, 105];
binarySearch(numbers, 56);
\`\`\`
`,
  },
];

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  initialArticle,
  currentUser,
  onSave,
  onCancel,
  onRequestSignIn,
}) => {
  const [title, setTitle] = useState(initialArticle?.title || '');
  const [subtitle, setSubtitle] = useState(initialArticle?.subtitle || '');
  const [tagsText, setTagsText] = useState(initialArticle?.tags?.join(', ') || 'Mathematics, Algorithms');
  const [content, setContent] = useState(
    initialArticle?.content || TEMPLATES[0].content
  );
  const [history, setHistory] = useState<string[]>([initialArticle?.content || TEMPLATES[0].content]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'split' | 'write' | 'preview'>('split');
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const [isEquationModalOpen, setIsEquationModalOpen] = useState(false);
  const [equationModalInitialText, setEquationModalInitialText] = useState('');
  const [equationModalMode, setEquationModalMode] = useState<'inline' | 'display'>('display');
  const [autoFixNotice, setAutoFixNotice] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(16);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Content updater that maintains undo/redo history
  const handleContentChange = (newVal: string) => {
    setContent(newVal);
    setHistory((prev) => {
      const currentBranch = prev.slice(0, historyIndex + 1);
      if (currentBranch[currentBranch.length - 1] !== newVal) {
        return [...currentBranch.slice(-40), newVal];
      }
      return currentBranch;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 40));
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevVal = history[historyIndex - 1];
      setHistoryIndex((prev) => prev - 1);
      setContent(prevVal);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextVal = history[historyIndex + 1];
      setHistoryIndex((prev) => prev + 1);
      setContent(nextVal);
    }
  };

  // Jump to edit any text/formula clicked in preview
  const handleJumpToEdit = (snippet: string) => {
    if (!snippet) return;
    const cleanSnippet = snippet.trim();
    const index = content.indexOf(cleanSnippet);

    if (viewMode === 'preview') {
      setViewMode('split');
    }

    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea && index !== -1) {
        textarea.focus();
        textarea.setSelectionRange(index, index + cleanSnippet.length);

        // Smooth scroll textarea to the target snippet
        const textBefore = content.substring(0, index);
        const linesBefore = textBefore.split('\n').length;
        const totalLines = Math.max(1, content.split('\n').length);
        const scrollFraction = linesBefore / totalLines;
        textarea.scrollTop = Math.max(0, scrollFraction * textarea.scrollHeight - 120);
      }
      setAutoFixNotice(`🎯 Focused selection in editor — you can edit now!`);
      setTimeout(() => setAutoFixNotice(null), 2500);
    }, 60);
  };

  // Helper to insert LaTeX or code into textarea at cursor position
  const insertText = (before: string, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = before + (selectedText || '') + after;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + (selectedText ? selectedText.length : 0)
      );
    }, 10);
  };

  // Google Docs style formatting helpers
  const wrapSelection = (before: string, after = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);

    if (!selected) {
      const placeholder =
        before === '**'
          ? 'bold text'
          : before === '*'
          ? 'italic text'
          : before === '=='
          ? 'highlighted text'
          : before === '~~'
          ? 'strikethrough text'
          : before === '`'
          ? 'code'
          : 'text';
      const replacement = before + placeholder + after;
      const newContent = content.substring(0, start) + replacement + content.substring(end);
      handleContentChange(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, start + before.length + placeholder.length);
      }, 10);
      return;
    }

    // Toggle off if already wrapped
    if (selected.startsWith(before) && selected.endsWith(after) && selected.length >= before.length + after.length) {
      const unwrapped = selected.slice(before.length, -after.length);
      const newContent = content.substring(0, start) + unwrapped + content.substring(end);
      handleContentChange(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + unwrapped.length);
      }, 10);
      return;
    }

    const replacement = before + selected + after;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    handleContentChange(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + replacement.length);
    }, 10);
  };

  // Smart paste handler: preserves rich text formatting (highlights, math, bold, lists) from clipboard
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const { text, wasFormattedHtml } = handleSmartPasteText(e);
    if (!text) return;

    e.preventDefault();
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newContent = content.substring(0, start) + text + content.substring(end);
    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 10);

    if (wasFormattedHtml) {
      setAutoFixNotice('✨ Smart paste: preserved highlights & formatting cleanly in document!');
      setTimeout(() => setAutoFixNotice(null), 3000);
    }
  };

  const applyHeading = (level: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const prevNewline = content.lastIndexOf('\n', start - 1);
    const lineStart = prevNewline === -1 ? 0 : prevNewline + 1;
    const nextNewline = content.indexOf('\n', start);
    const lineEnd = nextNewline === -1 ? content.length : nextNewline;
    const currentLine = content.substring(lineStart, lineEnd);

    const strippedLine = currentLine.replace(/^#{1,6}\s*/, '');
    let prefix = '';
    if (level === 1) prefix = '# ';
    else if (level === 2) prefix = '## ';
    else if (level === 3) prefix = '### ';

    const newLine = prefix + strippedLine;
    const newContent = content.substring(0, lineStart) + newLine + content.substring(lineEnd);
    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart + newLine.length, lineStart + newLine.length);
    }, 10);
  };

  const applyList = (type: 'bullet' | 'number' | 'quote') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const prevNewline = content.lastIndexOf('\n', start - 1);
    const lineStart = prevNewline === -1 ? 0 : prevNewline + 1;
    const nextNewline = content.indexOf('\n', start);
    const lineEnd = nextNewline === -1 ? content.length : nextNewline;
    const currentLine = content.substring(lineStart, lineEnd);

    let prefix = '- ';
    if (type === 'number') prefix = '1. ';
    else if (type === 'quote') prefix = '> ';

    const cleanLine = currentLine.replace(/^(\s*[-*+]|\s*\d+\.|\s*>)\s*/, '');
    const newLine = prefix + cleanLine;
    const newContent = content.substring(0, lineStart) + newLine + content.substring(lineEnd);
    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart + newLine.length, lineStart + newLine.length);
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        wrapSelection('**');
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        wrapSelection('*');
      } else if (e.key.toLowerCase() === 'h' && e.shiftKey) {
        e.preventDefault();
        wrapSelection('==');
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleOpenEquationModal('inline');
      }
    } else if (e.altKey && e.key.toLowerCase() === 'h') {
      e.preventDefault();
      wrapSelection('==');
    }
  };

  const changeFontSize = (delta: number) => {
    setFontSize((prev) => Math.min(28, Math.max(12, prev + delta)));
  };

  const getFontSizeClass = (size: number) => {
    switch (size) {
      case 12: return 'text-xs';
      case 13: return 'text-[13px]';
      case 14: return 'text-sm';
      case 15: return 'text-[15px]';
      case 16: return 'text-base';
      case 18: return 'text-lg';
      case 20: return 'text-xl';
      case 24: return 'text-2xl';
      case 28: return 'text-3xl';
      default: return 'text-base';
    }
  };

  const getFontFamilyClass = (family: 'sans' | 'serif' | 'mono') => {
    switch (family) {
      case 'serif': return 'font-serif-editorial';
      case 'mono': return 'font-mono';
      case 'sans':
      default:
        return 'font-sans';
    }
  };

  const handleOpenEquationModal = (mode: 'inline' | 'display' = 'display') => {
    const textarea = textareaRef.current;
    let initial = '';
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start !== end) {
        initial = content.substring(start, end);
      }
    }
    setEquationModalInitialText(initial);
    setEquationModalMode(mode);
    setIsEquationModalOpen(true);
  };

  const handleAutoFixDocument = () => {
    const result = autoFixDocumentLatex(content);
    if (result.fixesCount > 0) {
      setContent(result.text);
      setAutoFixNotice(`Auto-repaired ${result.fixesCount} equation delimiter issue(s) across your document!`);
      setTimeout(() => setAutoFixNotice(null), 4500);
    } else {
      setAutoFixNotice('All equations in the article are already valid and clean!');
      setTimeout(() => setAutoFixNotice(null), 3000);
    }
  };

  const handlePublishClick = () => {
    if (!title.trim()) {
      alert('Please enter an article title before publishing.');
      return;
    }

    if (!currentUser) {
      // Require Google Sign-In
      onRequestSignIn();
      return;
    }

    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const words = content.trim().split(/\s+/).length;
    const readingTimeMinutes = Math.max(1, Math.round(words / 200));

    const articleToSave: Article = {
      id: initialArticle?.id || `article-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      slug: (title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      content,
      tags: tags.length ? tags : ['Technology', 'Math'],
      author: currentUser,
      createdAt: initialArticle?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readingTimeMinutes,
      likes: initialArticle?.likes || 0,
      isPublished: true,
    };

    onSave(articleToSave, true);
  };

  const handleSaveDraft = () => {
    if (!title.trim()) {
      alert('Please enter an article title.');
      return;
    }

    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const words = content.trim().split(/\s+/).length;
    const readingTimeMinutes = Math.max(1, Math.round(words / 200));

    const author: Author = currentUser || {
      id: 'anonymous-author',
      name: 'Draft Author',
      email: 'draft@local',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=draft',
      title: 'Author',
    };

    const articleToSave: Article = {
      id: initialArticle?.id || `draft-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      slug: (title || 'draft').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      content,
      tags: tags.length ? tags : ['Draft'],
      author,
      createdAt: initialArticle?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readingTimeMinutes,
      likes: initialArticle?.likes || 0,
      isPublished: false,
    };

    onSave(articleToSave, false);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fa] flex flex-col">
      {/* Editor Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#eff3f4] px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 text-[#536471] hover:text-[#0f1419] hover:bg-[#f7f9fa] rounded-full transition-colors cursor-pointer"
              title="Return to Articles Feed"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <span className="font-serif-editorial text-xl font-bold text-[#0f1419] tracking-tight">
                {initialArticle ? 'Edit Article' : 'Draft New Article'}
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#f7f9fa] border border-[#eff3f4] text-[#536471] font-medium hidden sm:inline-block">
                ∇ Gradient Editor
              </span>
            </div>
          </div>

          {/* View Toggles & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Controls */}
            <div className="flex bg-[#f7f9fa] p-1 rounded-full text-xs font-medium border border-[#eff3f4]">
              <button
                type="button"
                onClick={() => setViewMode('write')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === 'write'
                    ? 'bg-white text-[#0f1419] shadow-xs font-bold'
                    : 'text-[#536471] hover:text-[#0f1419]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Write</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-white text-[#0f1419] shadow-xs font-bold'
                    : 'text-[#536471] hover:text-[#0f1419]'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  viewMode === 'preview'
                    ? 'bg-white text-[#0f1419] shadow-xs font-bold'
                    : 'text-[#536471] hover:text-[#0f1419]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </button>
            </div>

            {/* Save Draft */}
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#0f1419] bg-white border border-[#eff3f4] hover:bg-[#f7f9fa] rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-[#536471]" />
              <span className="hidden sm:inline">Save Draft</span>
            </button>

            {/* Publish Article Button */}
            <button
              id="publish-article-btn"
              type="button"
              onClick={handlePublishClick}
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#0f1419] hover:bg-[#272c30] rounded-full shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{currentUser ? 'Publish Article' : 'Sign In & Post'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Meta Information Inputs */}
      <section className="bg-white border-b border-[#eff3f4] px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto space-y-3">
          <input
            id="article-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article Title (e.g. Asymptotic Complexity and Fast Matrix Multiplication)"
            className="w-full text-2xl sm:text-3xl font-serif-editorial font-bold text-[#0f1419] placeholder:text-[#8b98a5] border-0 focus:outline-none focus:ring-0 bg-transparent tracking-tight"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Subtitle or abstract summary..."
              className="w-full text-sm text-[#536471] placeholder:text-[#8b98a5] border-0 focus:outline-none focus:ring-0 bg-transparent"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#536471] shrink-0 font-bold">Tags:</span>
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="Comma separated (e.g. Mathematics, Calculus, Optimization)"
                className="w-full text-xs text-[#0f1419] border border-[#eff3f4] rounded-full px-3 py-1.5 focus:outline-none focus:border-[#0f1419] bg-[#f7f9fa]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Writing & Formatting Toolbar */}
      <section className="sticky top-[61px] z-20 bg-white/95 backdrop-blur-md border-b border-[#eff3f4] px-4 sm:px-6 py-2 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            {/* Undo and Redo */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 bg-white hover:bg-[#f7f9fa] disabled:opacity-35 disabled:hover:bg-white border border-[#eff3f4] rounded-lg text-[#536471] hover:text-[#0f1419] transition-colors cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 bg-white hover:bg-[#f7f9fa] disabled:opacity-35 disabled:hover:bg-white border border-[#eff3f4] rounded-lg text-[#536471] hover:text-[#0f1419] transition-colors cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-[#eff3f4] mx-0.5" />

            {/* Style Selector */}
            <div className="flex items-center">
              <select
                aria-label="Text Style"
                onChange={(e) => {
                  const val = Number(e.target.value);
                  applyHeading(val);
                }}
                defaultValue="0"
                className="bg-white hover:bg-[#f7f9fa] text-[#0f1419] font-medium border border-[#eff3f4] rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#0f1419] cursor-pointer"
              >
                <option value="0">Normal text</option>
                <option value="1">Title / Heading 1</option>
                <option value="2">Heading 2</option>
                <option value="3">Heading 3</option>
              </select>
            </div>

            {/* Font Family Selector */}
            <div className="flex items-center">
              <select
                aria-label="Font Family"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value as any)}
                className="bg-white hover:bg-[#f7f9fa] text-[#0f1419] font-medium border border-[#eff3f4] rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#0f1419] cursor-pointer"
              >
                <option value="sans">Sans Serif (Clean)</option>
                <option value="serif">Serif (Editorial)</option>
                <option value="mono">Monospace (Code)</option>
              </select>
            </div>

            {/* Font Size Stepper & Dropdown */}
            <div className="flex items-center bg-white border border-[#eff3f4] rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => changeFontSize(-1)}
                className="px-1.5 py-1 text-[#536471] hover:bg-[#f7f9fa] hover:text-[#0f1419] transition-colors cursor-pointer border-r border-[#eff3f4]"
                title="Decrease font size"
              >
                <Minus className="w-3 h-3" />
              </button>
              <select
                aria-label="Font Size"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="px-2 py-1 text-xs font-semibold text-[#0f1419] bg-white focus:outline-none cursor-pointer text-center"
              >
                {[12, 13, 14, 15, 16, 18, 20, 24, 28].map((sz) => (
                  <option key={sz} value={sz}>
                    {sz}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => changeFontSize(1)}
                className="px-1.5 py-1 text-[#536471] hover:bg-[#f7f9fa] hover:text-[#0f1419] transition-colors cursor-pointer border-l border-[#eff3f4]"
                title="Increase font size"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="h-4 w-px bg-[#eff3f4] mx-0.5" />

            {/* Inline Formatting: Bold, Italic, Highlight, Strike, Inline Code */}
            <button
              type="button"
              onClick={() => wrapSelection('**')}
              className="px-2.5 py-1 bg-white hover:bg-[#f7f9fa] border border-[#eff3f4] rounded-lg text-[#0f1419] font-bold transition-colors cursor-pointer flex items-center gap-1"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('*')}
              className="px-2.5 py-1 bg-white hover:bg-[#f7f9fa] border border-[#eff3f4] rounded-lg text-[#0f1419] italic transition-colors cursor-pointer flex items-center gap-1"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('==')}
              className="px-2.5 py-1 bg-[#fef9c3] hover:bg-[#fef08a] border border-[#facc15] rounded-lg text-[#854d0e] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              title="Highlight text (==text==) (Ctrl+Shift+H or Alt+H)"
            >
              <Highlighter className="w-3.5 h-3.5 text-[#a16207]" />
              <span className="text-xs font-semibold">Highlight</span>
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('~~')}
              className="px-2 py-1 bg-white hover:bg-[#f7f9fa] border border-[#eff3f4] rounded-lg text-[#536471] hover:text-[#0f1419] transition-colors cursor-pointer"
              title="Strikethrough (~~text~~)"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('`')}
              className="px-2 py-1 bg-white hover:bg-[#f7f9fa] border border-[#eff3f4] rounded-lg text-[#536471] hover:text-[#0f1419] font-mono transition-colors cursor-pointer"
              title="Inline Code (`code`)"
            >
              <Code className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-[#eff3f4] mx-0.5" />

            {/* Lists & Quote */}
            <button
              type="button"
              onClick={() => applyList('bullet')}
              className="px-2 py-1 bg-white hover:bg-[#f7f9fa] border border-[#eff3f4] rounded-lg text-[#536471] hover:text-[#0f1419] transition-colors cursor-pointer"
              title="Bulleted list"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyList('number')}
              className="px-2 py-1 bg-white hover:bg-[#f7f9fa] border border-[#eff3f4] rounded-lg text-[#536471] hover:text-[#0f1419] transition-colors cursor-pointer"
              title="Numbered list"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyList('quote')}
              className="px-2 py-1 bg-white hover:bg-[#f7f9fa] border border-[#eff3f4] rounded-lg text-[#536471] hover:text-[#0f1419] transition-colors cursor-pointer"
              title="Quote block"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-[#eff3f4] mx-0.5" />

            {/* LaTeX Math */}
            <button
              type="button"
              onClick={() => handleOpenEquationModal('display')}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#0f1419] hover:bg-[#272c30] text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
              title="Insert Math Equation"
            >
              <Sigma className="w-3.5 h-3.5" />
              <span>Equation</span>
            </button>
            <button
              type="button"
              onClick={() => insertText('$', '$')}
              className="px-2 py-1 bg-white hover:bg-[#f7f9fa] border border-[#eff3f4] rounded-lg text-[#0f1419] font-mono cursor-pointer"
              title="Inline math: $x$"
            >
              $x$
            </button>
            <button
              type="button"
              onClick={() => insertText('$$\n', '\n$$')}
              className="px-2 py-1 bg-white hover:bg-[#f7f9fa] border border-[#eff3f4] rounded-lg text-[#0f1419] font-mono cursor-pointer"
              title="Centered display math: $$ ... $$"
            >
              $$ ... $$
            </button>
            <button
              type="button"
              onClick={() => insertText('\\boxed{', '}')}
              className="px-2 py-1 bg-white hover:bg-[#f7f9fa] border border-[#eff3f4] rounded-lg text-[#0f1419] font-mono cursor-pointer text-xs"
              title="Boxed formula: \boxed{E = mc^2}"
            >
              \boxed&#123;&#125;
            </button>
            <button
              type="button"
              onClick={handleAutoFixDocument}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#f7f9fa] hover:bg-[#eff3f4] text-[#0f1419] border border-[#eff3f4] rounded-lg font-medium transition-colors cursor-pointer"
              title="Check and auto-fix delimiter syntax"
            >
              <Wand2 className="w-3.5 h-3.5 text-[#536471]" />
              <span>Auto-Fix</span>
            </button>

            <div className="h-4 w-px bg-[#eff3f4] mx-0.5" />

            {/* Code Blocks */}
            <button
              type="button"
              onClick={() => insertText('```python\n', '\n```')}
              className="px-2.5 py-1 bg-white hover:bg-[#f7f9fa] border border-[#eff3f4] rounded-lg text-[#0f1419] font-mono text-[11px] cursor-pointer"
              title="Insert executable Python block"
            >
              Python
            </button>
            <button
              type="button"
              onClick={() => insertText('```typescript\n', '\n```')}
              className="px-2.5 py-1 bg-white hover:bg-[#f7f9fa] border border-[#eff3f4] rounded-lg text-[#0f1419] font-mono text-[11px] cursor-pointer"
              title="Insert executable TypeScript block"
            >
              TypeScript
            </button>
          </div>

          {/* Cheatsheet & Template selector */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowCheatsheet(!showCheatsheet)}
              className="flex items-center gap-1 text-[#536471] hover:text-[#0f1419] font-bold cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Guide</span>
            </button>
            <select
              onChange={(e) => {
                const selected = TEMPLATES.find((t) => t.name === e.target.value);
                if (selected && confirm('Replace current text with selected template?')) {
                  setContent(selected.content);
                }
              }}
              className="bg-white border border-[#eff3f4] text-[#0f1419] px-2.5 py-1 rounded-lg text-xs focus:outline-none focus:border-[#0f1419]"
              defaultValue=""
            >
              <option value="" disabled>
                Templates...
              </option>
              {TEMPLATES.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Auto-Fix Notification Toast Banner */}
      {autoFixNotice && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs text-emerald-900 flex items-center justify-between animate-in fade-in duration-150">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{autoFixNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setAutoFixNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 text-[11px] underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Cheatsheet Accordion */}
      {showCheatsheet && (
        <div className="bg-[#f7f9fa] border-b border-[#eff3f4] px-6 py-4 text-xs text-[#0f1419]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-bold text-[#0f1419] mb-1">Common Equations</p>
              <ul className="space-y-1 font-mono text-[11px] text-[#536471]">
                <li><code className="bg-white border border-[#eff3f4] px-1.5 py-0.5 rounded text-[#0f1419]">$E = mc^2$</code> → Inline math</li>
                <li><code className="bg-white border border-[#eff3f4] px-1.5 py-0.5 rounded text-[#0f1419]">{'$$\\int_0^\\infty e^{-x} dx = 1$$'}</code> → Display block</li>
                <li><code className="bg-white border border-[#eff3f4] px-1.5 py-0.5 rounded text-[#0f1419]">{'\\frac{a}{b}'}</code>, <code className="bg-white border border-[#eff3f4] px-1.5 py-0.5 rounded text-[#0f1419]">{'\\sqrt[n]{x}'}</code></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-[#0f1419] mb-1">Calculus &amp; Linear Algebra</p>
              <ul className="space-y-1 font-mono text-[11px] text-[#536471]">
                <li><code className="bg-white border border-[#eff3f4] px-1.5 py-0.5 rounded text-[#0f1419]">{'\\nabla_\\theta \\mathcal{L}'}</code> (Gradient)</li>
                <li><code className="bg-white border border-[#eff3f4] px-1.5 py-0.5 rounded text-[#0f1419]">{'\\sum_{i=1}^n x_i'}</code>, <code className="bg-white border border-[#eff3f4] px-1.5 py-0.5 rounded text-[#0f1419]">{'\\prod_{i=1}^n'}</code></li>
                <li><code className="bg-white border border-[#eff3f4] px-1.5 py-0.5 rounded text-[#0f1419]">\alpha, \beta, \gamma, \theta, \lambda, \sigma</code></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-[#0f1419] mb-1">Interactive Code Blocks</p>
              <p className="text-[#536471] text-[11px] leading-relaxed mb-1">
                Wrap code in <code className="bg-white border border-[#eff3f4] px-1.5 py-0.5 rounded text-[#0f1419]">```python</code>, <code className="bg-white border border-[#eff3f4] px-1.5 py-0.5 rounded text-[#0f1419]">```javascript</code>, or <code className="bg-white border border-[#eff3f4] px-1.5 py-0.5 rounded text-[#0f1419]">```typescript</code>.
                Execute code directly right inside the live article.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        {/* Page Mode (Write) */}
        {viewMode === 'write' && (
          <div className="flex-1 flex flex-col items-center bg-[#f7f9fa] rounded-3xl border border-[#eff3f4] p-4 sm:p-8 overflow-y-auto">
            {/* Matte Paper Canvas */}
            <div className="w-full max-w-4xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-[#eff3f4] rounded-3xl p-8 sm:p-14 min-h-[850px] flex flex-col">
              <div className="flex items-center justify-between text-xs text-[#536471] border-b border-[#eff3f4] pb-3 mb-4">
                <span className="flex items-center gap-1.5 font-bold text-[#0f1419]">
                  <FileText className="w-3.5 h-3.5 text-[#0f1419]" /> Draft Canvas
                </span>
                <span>
                  {content.trim().split(/\s+/).filter(Boolean).length} words • {fontSize}px font • Matte finish
                </span>
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="Type your article here... Write text normally, use Bold/Italic, or click Equation to add formulas."
                className={`flex-1 w-full border-0 focus:outline-none focus:ring-0 resize-none ${getFontFamilyClass(fontFamily)} ${getFontSizeClass(fontSize)} leading-relaxed text-[#0f1419] bg-white min-h-[680px]`}
              />
            </div>
          </div>
        )}

        {/* Split Mode: Left Editor + Right Live Math Preview with Click-To-Edit */}
        {viewMode === 'split' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Document Editor */}
            <div className="flex flex-col bg-white rounded-2xl border border-[#eff3f4] shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden h-full min-h-[650px]">
              <div className="px-4 py-2.5 bg-[#f7f9fa] border-b border-[#eff3f4] flex items-center justify-between text-xs text-[#536471]">
                <span className="flex items-center gap-1.5 font-bold text-[#0f1419]">
                  <Edit3 className="w-3.5 h-3.5 text-[#0f1419]" />
                  Draft Editor
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[#536471]">
                    Font: {fontSize}px • {fontFamily === 'serif' ? 'Serif' : fontFamily === 'mono' ? 'Mono' : 'Sans'}
                  </span>
                  <span className="font-semibold text-[#0f1419]">
                    {content.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="Write your article here... Use Bold (Ctrl+B), Italic (Ctrl+I), or the Equation button to add formulas."
                className={`flex-1 w-full p-6 sm:p-8 ${getFontFamilyClass(fontFamily)} ${getFontSizeClass(fontSize)} leading-relaxed text-[#0f1419] bg-white resize-none focus:outline-none focus:ring-0`}
              />
            </div>

            {/* Right: Live Rendered Math Preview with click-to-edit */}
            <div className="flex flex-col bg-white rounded-2xl border border-[#eff3f4] shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden h-full min-h-[650px]">
              <div className="px-4 py-2.5 bg-[#f7f9fa] border-b border-[#eff3f4] flex items-center justify-between text-xs text-[#536471]">
                <span className="font-bold text-[#0f1419]">
                  Preview
                </span>
                <span className="text-[#536471] bg-[#f7f9fa] border border-[#eff3f4] px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                  Click text or math to edit
                </span>
              </div>
              <div className={`flex-1 p-6 sm:p-8 overflow-y-auto max-h-[800px] bg-white ${getFontFamilyClass(fontFamily)} ${getFontSizeClass(fontSize)}`}>
                {title && (
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f1419] tracking-tight mb-2">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-base text-[#536471] mb-4 border-b border-[#eff3f4] pb-3">
                    {subtitle}
                  </p>
                )}
                <MathRenderer
                  content={content}
                  allowCodeExecution={true}
                  onSelectSection={handleJumpToEdit}
                />
              </div>
            </div>
          </div>
        )}

        {/* Full Preview Mode with Click-To-Edit */}
        {viewMode === 'preview' && (
          <div className="flex-1 flex flex-col items-center bg-[#f7f9fa] rounded-3xl border border-[#eff3f4] p-4 sm:p-8 overflow-y-auto">
            <div className="w-full max-w-4xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-[#eff3f4] rounded-3xl p-8 sm:p-14 min-h-[850px] flex flex-col">
              <div className="mb-6 flex items-center justify-between text-xs text-[#536471] border-b border-[#eff3f4] pb-3">
                <span className="font-bold text-[#0f1419]">
                  Preview
                </span>
                <span className="text-[#536471] bg-[#f7f9fa] border border-[#eff3f4] px-3 py-1 rounded-full text-xs font-medium">
                  Click any paragraph or formula to jump to editor
                </span>
              </div>
              {title && (
                <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0f1419] tracking-tight leading-[1.18] mb-3">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-lg sm:text-xl text-[#536471] mb-6 border-b border-[#eff3f4] pb-4">
                  {subtitle}
                </p>
              )}
              <MathRenderer
                content={content}
                allowCodeExecution={true}
                onSelectSection={handleJumpToEdit}
              />
            </div>
          </div>
        )}
      </main>

      {/* Google Docs Style Equation Builder Modal Extension */}
      <EquationEditorModal
        isOpen={isEquationModalOpen}
        initialEquation={equationModalInitialText}
        initialMode={equationModalMode}
        onClose={() => setIsEquationModalOpen(false)}
        onInsert={(eq) => insertText(eq)}
      />
    </div>
  );
};
