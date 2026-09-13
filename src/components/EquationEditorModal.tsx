import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Check,
  AlertCircle,
  Wand2,
  Copy,
  Plus,
  HelpCircle,
  Sigma,
} from 'lucide-react';
import { cleanLatex, validateEquation } from '../utils/latexSanitizer';
import katex from 'katex';

interface EquationEditorModalProps {
  isOpen: boolean;
  initialEquation?: string;
  initialMode?: 'inline' | 'display';
  onClose: () => void;
  onInsert: (formattedEquation: string) => void;
}

export const EquationEditorModal: React.FC<EquationEditorModalProps> = ({
  isOpen,
  initialEquation = '',
  initialMode = 'display',
  onClose,
  onInsert,
}) => {
  const [equationText, setEquationText] = useState(initialEquation);
  const [mode, setMode] = useState<'inline' | 'display'>(initialMode);
  const [activeTab, setActiveTab] = useState<'symbols' | 'structures' | 'calculus' | 'matrices' | 'templates'>('structures');
  const [autoCleanNotice, setAutoCleanNotice] = useState<string | null>(null);

  // Sync initial equation when opening
  useEffect(() => {
    if (isOpen) {
      setEquationText(initialEquation);
      setMode(initialMode);
      setAutoCleanNotice(null);
    }
  }, [isOpen, initialEquation, initialMode]);

  if (!isOpen) return null;

  // Validation
  const validation = validateEquation(equationText, mode === 'display');

  // Auto-clean handler
  const handleAutoClean = () => {
    const cleaned = cleanLatex(equationText);
    if (cleaned !== equationText) {
      setEquationText(cleaned);
      setAutoCleanNotice('Delimiters and formatting repaired successfully!');
      setTimeout(() => setAutoCleanNotice(null), 3000);
    } else {
      setAutoCleanNotice('Equation already has clean LaTeX formatting.');
      setTimeout(() => setAutoCleanNotice(null), 2500);
    }
  };

  const handleInsert = () => {
    const cleaned = cleanLatex(equationText);
    if (!cleaned) return;

    if (mode === 'display') {
      onInsert(`$$\n${cleaned}\n$$`);
    } else {
      onInsert(`$${cleaned}$`);
    }
    onClose();
  };

  const appendSymbol = (snippet: string) => {
    setEquationText((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${snippet}` : snippet;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e7e5e4] w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#eff3f4] flex items-center justify-between bg-[#f7f9fa]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0f1419] text-white flex items-center justify-center">
              <Sigma className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0f1419]">
                  Gradient Equation Builder
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#eff3f4] text-[#0f1419] px-2 py-0.5 rounded-full">
                  KaTeX
                </span>
              </div>
              <p className="text-xs text-[#536471]">
                Compose and verify mathematical equations with clean typography before inserting
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#536471] hover:text-[#0f1419] hover:bg-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Format Mode Toggle (Inline vs Display) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#44403c]">Equation Type:</span>
              <div className="flex bg-[#f5f5f4] p-1 rounded-xl text-xs font-medium border border-[#e7e5e4]">
                <button
                  type="button"
                  onClick={() => setMode('display')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    mode === 'display'
                      ? 'bg-white text-[#1c1917] shadow-xs font-semibold'
                      : 'text-[#78716c] hover:text-[#1c1917]'
                  }`}
                >
                  Centered Block ($$ ... $$)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('inline')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    mode === 'inline'
                      ? 'bg-white text-[#1c1917] shadow-xs font-semibold'
                      : 'text-[#78716c] hover:text-[#1c1917]'
                  }`}
                >
                  Inline Math ($ ... $)
                </button>
              </div>
            </div>

            {/* Auto-Clean Action */}
            <button
              type="button"
              onClick={handleAutoClean}
              className="text-xs font-medium text-[#0284c7] hover:text-[#0369a1] bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Fix nested brackets like \[...\], $$\(...\), and normalize syntax"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Auto-Fix Delimiters</span>
            </button>
          </div>

          {/* Toast / Notice if auto-cleaned */}
          {autoCleanNotice && (
            <div className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-xl flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{autoCleanNotice}</span>
            </div>
          )}

          {/* Live Rendered Preview Box */}
          <div className="border border-[#e7e5e4] rounded-2xl bg-[#fafaf9] p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-[#78716c] mb-2 border-b border-[#e7e5e4] pb-2">
              <span className="font-semibold flex items-center gap-1.5 text-[#1c1917]">
                <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
                Live Rendered Math
              </span>
              {validation.valid ? (
                <span className="flex items-center gap-1 text-emerald-700 text-[11px] font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" /> Valid LaTeX
                </span>
              ) : equationText.trim() ? (
                <span className="flex items-center gap-1 text-rose-700 text-[11px] font-semibold bg-rose-100/80 px-2 py-0.5 rounded-full">
                  <AlertCircle className="w-3 h-3" /> Syntax Issue
                </span>
              ) : null}
            </div>

            {validation.valid ? (
              <div
                className="py-4 text-center overflow-x-auto text-lg select-text"
                dangerouslySetInnerHTML={{
                  __html: katex.renderToString(validation.cleaned, {
                    displayMode: mode === 'display',
                    throwOnError: false,
                  }),
                }}
              />
            ) : equationText.trim() ? (
              <div className="py-3 px-4 bg-rose-50/70 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">LaTeX Formatting Issue Detected</p>
                  <p className="text-rose-600 mt-0.5">{validation.error}</p>
                  <p className="text-[11px] text-rose-500 mt-1">
                    Tip: Click <strong>"Auto-Fix Delimiters"</strong> above to strip extra brackets or mismatched quotes.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#a8a29e] italic">
                Type an equation below or select mathematical symbols from the toolbar to preview here.
              </div>
            )}
          </div>

          {/* Raw Equation Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#44403c] flex items-center justify-between">
              <span>LaTeX Expression</span>
              <span className="text-[11px] text-[#78716c] font-normal">
                No need to type $$ or \[ wrappers — we handle them for you!
              </span>
            </label>
            <textarea
              value={equationText}
              onChange={(e) => setEquationText(e.target.value)}
              placeholder="e.g. (x_1, y_1), (x_2, y_2), \ldots, (x_n, y_n) or \hat{y}_i = F(x_i)"
              rows={3}
              className="w-full font-mono text-xs text-[#1c1917] bg-white border border-[#d6d3d1] focus:border-[#0284c7] rounded-xl p-3 focus:outline-none transition-all shadow-2xs"
            />
          </div>

          {/* Quick Insert Symbols & Palettes */}
          <div className="border border-[#e7e5e4] rounded-2xl p-4 bg-white space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#f5f5f4] pb-2 text-xs overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('structures')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === 'structures'
                    ? 'bg-[#1c1917] text-white'
                    : 'text-[#57534e] hover:bg-[#f5f5f4]'
                }`}
              >
                Fractions &amp; Roots
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('calculus')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === 'calculus'
                    ? 'bg-[#1c1917] text-white'
                    : 'text-[#57534e] hover:bg-[#f5f5f4]'
                }`}
              >
                Calculus &amp; Sums
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('symbols')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === 'symbols'
                    ? 'bg-[#1c1917] text-white'
                    : 'text-[#57534e] hover:bg-[#f5f5f4]'
                }`}
              >
                Greek Letters
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('matrices')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === 'matrices'
                    ? 'bg-[#1c1917] text-white'
                    : 'text-[#57534e] hover:bg-[#f5f5f4]'
                }`}
              >
                Linear Algebra
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('templates')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === 'templates'
                    ? 'bg-[#1c1917] text-white'
                    : 'text-[#57534e] hover:bg-[#f5f5f4]'
                }`}
              >
                Common Models
              </button>
            </div>

            {/* Tab: Structures (Fractions, Roots, Scripts) */}
            {activeTab === 'structures' && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs font-mono">
                {[
                  { label: '\\frac{a}{b}', code: '\\frac{a}{b}' },
                  { label: '\\sqrt{x}', code: '\\sqrt{x}' },
                  { label: '\\sqrt[n]{x}', code: '\\sqrt[n]{x}' },
                  { label: 'x_i', code: 'x_i' },
                  { label: 'x^2', code: 'x^2' },
                  { label: '\\hat{y}', code: '\\hat{y}' },
                  { label: '\\bar{x}', code: '\\bar{x}' },
                  { label: '\\vec{v}', code: '\\vec{v}' },
                  { label: '\\dots', code: '\\ldots' },
                  { label: '\\pm', code: '\\pm' },
                  { label: '\\times', code: '\\times' },
                  { label: '\\approx', code: '\\approx' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => appendSymbol(item.code)}
                    className="p-2 border border-[#e7e5e4] hover:border-[#cbd5e1] hover:bg-[#f5f5f4] rounded-lg text-center cursor-pointer transition-colors text-[#292524]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* Tab: Calculus */}
            {activeTab === 'calculus' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                {[
                  { label: 'Definite Integral', code: '\\int_{a}^{b} f(x)\\,dx' },
                  { label: 'Summation', code: '\\sum_{i=1}^{n} x_i' },
                  { label: 'Product', code: '\\prod_{i=1}^{n} x_i' },
                  { label: 'Limit', code: '\\lim_{x \\to 0} f(x)' },
                  { label: 'Partial Derivative', code: '\\frac{\\partial y}{\\partial x}' },
                  { label: 'Gradient', code: '\\nabla f(x)' },
                  { label: 'Infinity', code: '\\infty' },
                  { label: 'Expectation', code: '\\mathbb{E}[X]' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => appendSymbol(item.code)}
                    className="p-2 border border-[#e7e5e4] hover:border-[#cbd5e1] hover:bg-[#f5f5f4] rounded-lg text-left cursor-pointer transition-colors text-[#292524]"
                  >
                    <div className="font-sans text-[11px] text-[#78716c]">{item.label}</div>
                    <div className="truncate text-sky-800 font-semibold">{item.code}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Tab: Greek Letters */}
            {activeTab === 'symbols' && (
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-xs font-mono">
                {[
                  { sym: 'α', code: '\\alpha' },
                  { sym: 'β', code: '\\beta' },
                  { sym: 'γ', code: '\\gamma' },
                  { sym: 'θ', code: '\\theta' },
                  { sym: 'λ', code: '\\lambda' },
                  { sym: 'μ', code: '\\mu' },
                  { sym: 'σ', code: '\\sigma' },
                  { sym: 'ω', code: '\\omega' },
                  { sym: 'Δ', code: '\\Delta' },
                  { sym: 'Θ', code: '\\Theta' },
                  { sym: 'Σ', code: '\\Sigma' },
                  { sym: 'Ω', code: '\\Omega' },
                  { sym: 'ε', code: '\\epsilon' },
                  { sym: 'η', code: '\\eta' },
                  { sym: 'π', code: '\\pi' },
                  { sym: 'ρ', code: '\\rho' },
                ].map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => appendSymbol(item.code)}
                    className="p-1.5 border border-[#e7e5e4] hover:bg-[#f5f5f4] rounded-lg text-center cursor-pointer transition-colors"
                    title={item.code}
                  >
                    <span className="font-serif-editorial text-sm font-bold">{item.sym}</span>
                    <span className="block text-[10px] text-[#a8a29e] truncate">{item.code}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Tab: Linear Algebra & Matrices */}
            {activeTab === 'matrices' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                {[
                  {
                    label: '2x2 Matrix (Parentheses)',
                    code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
                  },
                  {
                    label: '2x2 Matrix (Brackets)',
                    code: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}',
                  },
                  {
                    label: 'Column Vector',
                    code: '\\begin{pmatrix} x_1 \\\\ x_2 \\\\ \\vdots \\\\ x_n \\end{pmatrix}',
                  },
                  { label: 'Dot Product', code: '\\mathbf{u} \\cdot \\mathbf{v}' },
                  { label: 'Norm', code: '\\|\\mathbf{x}\\|_2' },
                  { label: 'Transpose', code: '\\mathbf{A}^T' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => appendSymbol(item.code)}
                    className="p-2 border border-[#e7e5e4] hover:bg-[#f5f5f4] rounded-lg text-left cursor-pointer transition-colors"
                  >
                    <div className="font-sans text-[11px] text-[#78716c]">{item.label}</div>
                    <div className="truncate text-sky-800 font-semibold">{item.code}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Tab: Common Machine Learning / Math Models */}
            {activeTab === 'templates' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {[
                  {
                    name: 'Training Dataset Pairs',
                    desc: '(x_1, y_1), (x_2, y_2), ..., (x_n, y_n)',
                    code: '(x_1, y_1), (x_2, y_2), \\dots, (x_n, y_n)',
                  },
                  {
                    name: 'Model Prediction Function',
                    desc: '\\hat{y}_i = F(x_i)',
                    code: '\\hat{y}_i = F(x_i)',
                  },
                  {
                    name: 'Mean Squared Error Loss',
                    desc: 'L = 1/n \\sum (y_i - \\hat{y}_i)^2',
                    code: '\\mathcal{L}_{MSE} = \\frac{1}{n} \\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2',
                  },
                  {
                    name: 'Gradient Descent Step',
                    desc: '\\theta_{t+1} = \\theta_t - \\eta \\nabla L',
                    code: '\\theta_{t+1} = \\theta_t - \\eta \\nabla_\\theta \\mathcal{L}(\\theta_t)',
                  },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setEquationText(item.code)}
                    className="p-2.5 border border-[#e7e5e4] hover:border-sky-300 hover:bg-sky-50/50 rounded-xl text-left cursor-pointer transition-all"
                  >
                    <div className="font-sans font-semibold text-[#1c1917]">{item.name}</div>
                    <div className="text-[11px] text-[#78716c] font-mono mt-0.5 truncate">{item.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#e7e5e4] bg-[#fafaf9] flex items-center justify-between">
          <div className="text-xs text-[#78716c]">
            Mode: <strong className="text-[#1c1917]">{mode === 'display' ? 'Display Block ($$...$$)' : 'Inline ($...$)'}</strong>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#57534e] hover:text-[#1c1917] hover:bg-[#f5f5f4] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!validation.valid}
              onClick={handleInsert}
              className={`px-5 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                validation.valid
                  ? 'bg-[#1c1917] hover:bg-[#292524] text-white'
                  : 'bg-[#e7e5e4] text-[#a8a29e] cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Insert into Article</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
