import React, { useState } from 'react';
import katex from 'katex';
import { Play, Check, Copy, AlertCircle, Terminal, Sparkles, Wand2 } from 'lucide-react';
import { runCodeSnippet } from '../utils/codeRunner';
import { highlightCode } from '../utils/prismSetup';
import { cleanLatex } from '../utils/latexSanitizer';

interface MathRendererProps {
  content: string;
  allowCodeExecution?: boolean;
  onSelectSection?: (snippet: string) => void;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  allowCodeExecution = true,
  onSelectSection,
}) => {
  // Parse markdown into tokens (code blocks, math blocks, paragraphs, headers, tables)
  const tokens = parseMarkdownAndMath(content);

  return (
    <div className="math-markdown-article space-y-2 text-[#202124] text-[16px] leading-[1.65]">
      {tokens.map((token, idx) => {
        if (token.type === 'code') {
          return (
            <CodeBlockViewer
              key={idx}
              language={token.language || 'text'}
              code={token.content}
              allowExecution={allowCodeExecution}
            />
          );
        }

        if (token.type === 'math_block') {
          return (
            <MathDisplayBlock
              key={idx}
              tex={token.content}
              onClick={onSelectSection ? () => onSelectSection(token.content) : undefined}
            />
          );
        }

        if (token.type === 'heading') {
          const headingStyles = {
            1: 'text-2xl sm:text-3xl font-extrabold text-[#0f1419] mt-8 mb-3 tracking-tight border-b border-[#eff3f4] pb-2.5',
            2: 'text-xl sm:text-2xl font-bold text-[#0f1419] mt-7 mb-2.5 tracking-tight',
            3: 'text-lg sm:text-xl font-bold text-[#0f1419] mt-5 mb-2 tracking-tight',
            4: 'text-base font-semibold text-[#536471] mt-4 mb-1.5',
          }[token.level] || 'text-base font-semibold text-[#536471] mt-4 mb-1.5';

          const handleClick = onSelectSection ? () => onSelectSection(token.content) : undefined;

          if (token.level === 1) {
            return (
              <h1
                id={token.id}
                key={idx}
                className={`${headingStyles} ${handleClick ? 'cursor-pointer hover:bg-sky-50/40 rounded px-1 -mx-1' : ''}`}
                onClick={handleClick}
                title={handleClick ? 'Click to edit heading' : undefined}
              >
                <InlineContent text={token.content} />
              </h1>
            );
          }
          if (token.level === 2) {
            return (
              <h2
                id={token.id}
                key={idx}
                className={`${headingStyles} ${handleClick ? 'cursor-pointer hover:bg-sky-50/40 rounded px-1 -mx-1' : ''}`}
                onClick={handleClick}
                title={handleClick ? 'Click to edit heading' : undefined}
              >
                <InlineContent text={token.content} />
              </h2>
            );
          }
          if (token.level === 3) {
            return (
              <h3
                id={token.id}
                key={idx}
                className={`${headingStyles} ${handleClick ? 'cursor-pointer hover:bg-sky-50/40 rounded px-1 -mx-1' : ''}`}
                onClick={handleClick}
                title={handleClick ? 'Click to edit heading' : undefined}
              >
                <InlineContent text={token.content} />
              </h3>
            );
          }
          return (
            <h4
              id={token.id}
              key={idx}
              className={`${headingStyles} ${handleClick ? 'cursor-pointer hover:bg-sky-50/40 rounded px-1 -mx-1' : ''}`}
              onClick={handleClick}
              title={handleClick ? 'Click to edit heading' : undefined}
            >
              <InlineContent text={token.content} />
            </h4>
          );
        }

        if (token.type === 'blockquote') {
          return (
            <blockquote
              key={idx}
              onClick={onSelectSection ? () => onSelectSection(token.content) : undefined}
              className={`border-l-4 border-[#1d9bf0] pl-4 py-2.5 my-3.5 italic text-[#0f1419] bg-[#f7f9fa] rounded-r-xl border-y border-r border-[#eff3f4] ${
                onSelectSection ? 'cursor-pointer hover:bg-[#f2f5f7]' : ''
              }`}
            >
              <InlineContent text={token.content} />
            </blockquote>
          );
        }

        if (token.type === 'table') {
          return <TableViewer key={idx} rows={token.rows || []} />;
        }

        if (token.type === 'list') {
          return (
            <ul key={idx} className="list-disc pl-6 space-y-1.5 my-2.5 text-[#0f1419]">
              {token.items?.map((item, itemIdx) => (
                <li
                  key={itemIdx}
                  onClick={onSelectSection ? () => onSelectSection(item) : undefined}
                  className={onSelectSection ? 'cursor-pointer hover:bg-sky-50/30 rounded px-1 -mx-1' : ''}
                >
                  <InlineContent text={item} />
                </li>
              ))}
            </ul>
          );
        }

        if (token.type === 'ordered_list') {
          return (
            <ol key={idx} className="list-decimal pl-6 space-y-1.5 my-2.5 text-[#0f1419]">
              {token.items?.map((item, itemIdx) => (
                <li
                  key={itemIdx}
                  onClick={onSelectSection ? () => onSelectSection(item) : undefined}
                  className={onSelectSection ? 'cursor-pointer hover:bg-sky-50/30 rounded px-1 -mx-1' : ''}
                >
                  <InlineContent text={item} />
                </li>
              ))}
            </ol>
          );
        }

        if (token.type === 'hr') {
          return <hr key={idx} className="my-6 border-[#eff3f4]" />;
        }

        if (token.type === 'empty_line') {
          return <div key={idx} className="h-4 sm:h-5 select-none pointer-events-none" aria-hidden="true" />;
        }

        // Default: paragraph with newline preservation (Google Docs / Twitter Article style)
        const handleParaClick = onSelectSection ? () => onSelectSection(token.content) : undefined;
        return (
          <p
            key={idx}
            onClick={handleParaClick}
            className={`my-2 text-[#0f1419] text-[16px] sm:text-[17px] leading-[1.7] whitespace-pre-wrap break-words ${
              handleParaClick ? 'cursor-pointer hover:bg-sky-50/40 rounded px-1 -mx-1 transition-colors' : ''
            }`}
            title={handleParaClick ? 'Click to jump to this paragraph in editor' : undefined}
          >
            <InlineContent text={token.content} />
          </p>
        );
      })}
    </div>
  );
};

// Component for display equations $$ ... $$ - Clean, simple, bold matte layout (unboxed by default, boxed only if \boxed{} is used)
const MathDisplayBlock: React.FC<{ tex: string; onClick?: () => void }> = ({ tex, onClick }) => {
  const sanitizedTex = cleanLatex(tex);
  let renderedHtml = '';

  try {
    renderedHtml = katex.renderToString(sanitizedTex, {
      displayMode: true,
      throwOnError: false,
      strict: false,
    });
  } catch {
    renderedHtml = '';
  }

  return (
    <div
      onClick={onClick}
      className={`group relative my-3 sm:my-5 overflow-x-auto text-center py-1 select-text ${
        onClick ? 'cursor-pointer hover:bg-black/[0.02] rounded-lg px-2 transition-colors' : ''
      }`}
      title={onClick ? 'Click to edit this equation in editor' : undefined}
    >
      <div
        className="math-equation-display text-[#0f1419] font-bold leading-normal inline-block max-w-full"
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
      {onClick && (
        <span className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium text-[#536471] bg-white border border-[#eff3f4] px-1.5 py-0.5 rounded shadow-2xs">
          Edit
        </span>
      )}
    </div>
  );
};

// Component for rendering inline text with $...$ math, links, bold, code
export const InlineContent: React.FC<{ text: string }> = ({ text }) => {
  const parts = parseInlineElements(text);

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === 'inline_math') {
          const sanitized = cleanLatex(part.content);
          try {
            const html = katex.renderToString(sanitized, {
              displayMode: false,
              throwOnError: false,
              strict: false,
            });
            return (
              <span
                key={index}
                className="inline-math px-0.5 align-baseline font-bold text-[#0f1419] select-text"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return (
              <span key={index} className="inline px-0.5 font-bold italic text-[#0f1419]">
                {sanitized}
              </span>
            );
          }
        }

        if (part.type === 'code') {
          return (
            <code
              key={index}
              className="font-mono-code text-[14px] bg-[#f7f9fa] border border-[#eff3f4] text-[#e0245e] px-1.5 py-0.5 rounded"
            >
              {part.content}
            </code>
          );
        }

        if (part.type === 'bold') {
          return <strong key={index} className="font-bold text-[#0f1419]">{part.content}</strong>;
        }

        if (part.type === 'italic') {
          return <em key={index} className="italic text-[#0f1419]">{part.content}</em>;
        }

        if (part.type === 'highlight') {
          return (
            <mark key={index} className="article-highlight">
              {part.content}
            </mark>
          );
        }

        if (part.type === 'strike') {
          return (
            <span key={index} className="line-through text-[#536471]">
              {part.content}
            </span>
          );
        }

        if (part.type === 'underline') {
          return (
            <span key={index} className="underline underline-offset-2 text-[#0f1419]">
              {part.content}
            </span>
          );
        }

        if (part.type === 'link') {
          return (
            <a
              key={index}
              href={part.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1d9bf0] hover:underline decoration-[#1d9bf0] font-medium"
            >
              {part.content}
            </a>
          );
        }

        return <React.Fragment key={index}>{part.content}</React.Fragment>;
      })}
    </>
  );
};

// Interactive Code Block Component with Syntax Highlighting & Runner
const CodeBlockViewer: React.FC<{
  language: string;
  code: string;
  allowExecution: boolean;
}> = ({ language, code, allowExecution }) => {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<{
    output: string;
    error?: string;
    durationMs: number;
  } | null>(null);
  const [showConsole, setShowConsole] = useState(false);

  const canExecute =
    allowExecution &&
    ['javascript', 'js', 'typescript', 'ts', 'python', 'py'].includes(
      language.toLowerCase()
    );

  // Syntax highlight code safely
  const highlighted = highlightCode(code, language);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setShowConsole(true);
    try {
      const result = await runCodeSnippet(code, language);
      setRunResult(result);
    } catch (err: any) {
      setRunResult({
        output: '',
        error: err?.message || 'Error executing code',
        durationMs: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="my-6 rounded-xl border border-[#292524] bg-[#1c1917] overflow-hidden text-neutral-100 shadow-sm">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#292524]/90 border-b border-[#44403c] text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#ef4444]/80" />
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#eab308]/80" />
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#22c55e]/80" />
          <span className="font-mono text-neutral-400 uppercase tracking-wider font-semibold ml-2 text-[11px]">
            {language}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {canExecute && (
            <button
              id={`run-code-${language}`}
              type="button"
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-medium text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : 'fill-white'}`} />
              <span>{isRunning ? 'Running...' : 'Run Code'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md text-xs transition-colors cursor-pointer"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto text-[14px] leading-relaxed font-mono">
        <pre className="!bg-transparent !p-0 !m-0">
          <code
            className={`language-${language}`}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>

      {/* Output Console (if run or toggled) */}
      {showConsole && (
        <div className="border-t border-[#44403c] bg-[#171513] p-4 text-xs font-mono">
          <div className="flex items-center justify-between text-neutral-400 mb-2 border-b border-neutral-800 pb-1.5">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Terminal className="w-3.5 h-3.5" />
              Execution Output {runResult ? `(${runResult.durationMs}ms)` : ''}
            </span>
            <button
              type="button"
              onClick={() => setShowConsole(false)}
              className="text-neutral-500 hover:text-neutral-300"
            >
              Close Console
            </button>
          </div>

          {isRunning ? (
            <div className="py-3 text-neutral-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Executing {language} code snippet...
            </div>
          ) : runResult?.error ? (
            <div className="text-rose-400 whitespace-pre-wrap py-1">
              {runResult.error}
            </div>
          ) : (
            <div className="text-neutral-200 whitespace-pre-wrap py-1 max-h-60 overflow-y-auto">
              {runResult?.output || '(Done, no stdout)'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Table Viewer
const TableViewer: React.FC<{ rows: string[][] }> = ({ rows }) => {
  if (!rows || rows.length === 0) return null;
  const header = rows[0];
  const bodyRows = rows.slice(1);

  return (
    <div className="overflow-x-auto my-6 border border-[#e7e5e4] rounded-xl shadow-xs">
      <table className="w-full text-left border-collapse text-sm">
        <thead className="bg-[#f5f5f4] border-b border-[#e7e5e4]">
          <tr>
            {header.map((col, idx) => (
              <th key={idx} className="p-3 font-semibold text-[#1c1917]">
                <InlineContent text={col.trim()} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f5f5f4] bg-white">
          {bodyRows.map((row, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-[#fafaf9]">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="p-3 text-[#292524]">
                  <InlineContent text={cell.trim()} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Helper: Markdown parser supporting code blocks, math blocks, headings, lists, tables
function parseMarkdownAndMath(content: string) {
  const lines = content.split(/\r?\n/);
  const tokens: any[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 1. Code block ```lang
    if (line.trim().startsWith('```')) {
      const language = line.trim().slice(3).trim() || 'text';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      tokens.push({
        type: 'code',
        language,
        content: codeLines.join('\n'),
      });
      continue;
    }

    // 2. Math block $$ ... $$
    if (line.trim().startsWith('$$')) {
      const remainingLine = line.trim().slice(2).trim();
      // check if on same line e.g. $$ E = mc^2 $$
      if (remainingLine.endsWith('$$') && remainingLine.length > 2) {
        const tex = cleanLatex(remainingLine.slice(0, -2).trim());
        tokens.push({ type: 'math_block', content: tex });
        i++;
        continue;
      }

      // Multi-line math block
      const mathLines: string[] = [];
      if (remainingLine) mathLines.push(remainingLine);
      i++;
      while (i < lines.length && !lines[i].trim().endsWith('$$')) {
        mathLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        const endLine = lines[i].trim().replace(/\$\$$/, '');
        if (endLine) mathLines.push(endLine);
        i++;
      }
      tokens.push({
        type: 'math_block',
        content: cleanLatex(mathLines.join('\n')),
      });
      continue;
    }

    // 2b. Standard LaTeX display block \[ ... \]
    if (line.trim().startsWith('\\[')) {
      const remainingLine = line.trim().slice(2).trim();
      if (remainingLine.endsWith('\\]') && remainingLine.length > 2) {
        const tex = cleanLatex(remainingLine.slice(0, -2).trim());
        tokens.push({ type: 'math_block', content: tex });
        i++;
        continue;
      }

      const mathLines: string[] = [];
      if (remainingLine) mathLines.push(remainingLine);
      i++;
      while (i < lines.length && !lines[i].trim().endsWith('\\]')) {
        mathLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        const endLine = lines[i].trim().replace(/\\\]$/, '');
        if (endLine) mathLines.push(endLine);
        i++;
      }
      tokens.push({
        type: 'math_block',
        content: cleanLatex(mathLines.join('\n')),
      });
      continue;
    }

    // 2c. Standard LaTeX environments: \begin{equation|align|gather|pmatrix|bmatrix}
    if (/^\\begin\{(equation\*?|align\*?|gather\*?|pmatrix|bmatrix|matrix|cases)\}/.test(line.trim())) {
      const match = line.trim().match(/^\\begin\{([^}]+)\}/);
      const env = match ? match[1] : '';
      const endPattern = `\\end{${env}}`;
      const mathLines: string[] = [line];
      i++;
      while (i < lines.length && !lines[i].includes(endPattern)) {
        mathLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        mathLines.push(lines[i]);
        i++;
      }
      tokens.push({
        type: 'math_block',
        content: cleanLatex(mathLines.join('\n')),
      });
      continue;
    }

    // 2d. Standalone single-line math equation: $...$ on its own line
    // e.g. $y_i = 80$ or $F_0(x)= \arg\min_\gamma \sum_{i=1}^{n}L(y_i,\gamma)$
    const singleDollarMatch = line.trim().match(/^\$([^\$]+)\$$/);
    if (singleDollarMatch) {
      const tex = cleanLatex(singleDollarMatch[1].trim());
      tokens.push({ type: 'math_block', content: tex });
      i++;
      continue;
    }

    // 2e. Standalone \boxed{...} or \fbox{...} on its own line
    // e.g. \boxed{F_m(x) = F_{m-1}(x) + \gamma_m h_m(x)} or \boxed{-\frac{\partial L}{\partial F}}
    if (line.trim().startsWith('\\boxed{') || line.trim().startsWith('\\fbox{')) {
      const tex = cleanLatex(line.trim());
      tokens.push({ type: 'math_block', content: tex });
      i++;
      continue;
    }

    // 3. Headings #, ##, ###, ####
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      tokens.push({
        type: 'heading',
        level,
        content: text,
        id,
      });
      i++;
      continue;
    }

    // 4. Blockquote >
    if (line.startsWith('>')) {
      const quoteLines: string[] = [line.replace(/^>\s?/, '')];
      i++;
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      tokens.push({
        type: 'blockquote',
        content: quoteLines.join('\n'),
      });
      continue;
    }

    // 5. Horizontal rule --- or ***
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      tokens.push({ type: 'hr' });
      i++;
      continue;
    }

    // 6. Tables | col1 | col2 |
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableRows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const curLine = lines[i].trim();
        // skip separator line |---|---|
        if (!/^[\|\s\-:]+$/.test(curLine)) {
          const cells = curLine
            .slice(1, -1)
            .split('|')
            .map((c) => c.trim());
          tableRows.push(cells);
        }
        i++;
      }
      tokens.push({
        type: 'table',
        rows: tableRows,
      });
      continue;
    }

    // 7. Unordered list - or *
    if (/^\s*[\-\*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[\-\*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[\-\*]\s+/, ''));
        i++;
      }
      tokens.push({
        type: 'list',
        items,
      });
      continue;
    }

    // 8. Ordered list 1.
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      tokens.push({
        type: 'ordered_list',
        items,
      });
      continue;
    }

    // Empty line(s) - preserve exact vertical spacing like normal texting / document editing
    if (!line.trim()) {
      tokens.push({ type: 'empty_line' });
      i++;
      continue;
    }

    // Paragraph - preserve newlines like Google Docs / normal texting
    const paraLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('$$') &&
      !lines[i].trim().startsWith('\\[') &&
      !lines[i].trim().startsWith('\\begin') &&
      !lines[i].trim().startsWith('\\boxed{') &&
      !lines[i].trim().startsWith('\\fbox{') &&
      !/^\$([^\$]+)\$$/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith('>') &&
      !lines[i].trim().startsWith('|') &&
      !/^(\*\*\*|---|___)$/.test(lines[i].trim()) &&
      !/^\s*[\-\*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }

    tokens.push({
      type: 'paragraph',
      content: paraLines.join('\n'),
    });
  }

  return tokens;
}

// Parser for inline elements ($math$, `code`, **bold**, *italic*, ==highlight==, ~~strike~~, [link](url))
function parseInlineElements(text: string) {
  const parts: any[] = [];
  let remaining = text;

  // Regex to match:
  // 1. Nested/malformed $$\(...\)$$ or $$\(...\$$)
  // 2. Double dollar inline math $$...$$
  // 3. LaTeX inline math \(...\)
  // 4. LaTeX display math inside paragraph \[...\]
  // 5. Standard inline math $...$
  // 6. Code `...`
  // 7. Bold **...**
  // 8. Italic *...*
  // 9. Highlight ==...==
  // 10. Highlight <mark>...</mark>
  // 11. Strikethrough ~~...~~
  // 12. Underline <u>...</u>
  // 13. Link [...](...)
  const regex = /(\$\$\\?\(([\s\S]*?)\\?\)\$\$)|(\$\$([^\$]+)\$\$)|(\\\(([\s\S]*?)\\\))|(\\\[([\s\S]*?)\\\])|(\$([^\$]+)\$)|(`([^`]+)`)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(==([^=]+)==)|(<mark(?:\s+[^>]*)?>([\s\S]*?)<\/mark>)|(~~([^~]+)~~)|(<u>([\s\S]*?)<\/u>)|(\[([^\]]+)\]\(([^)]+)\))/;

  while (remaining) {
    const match = regex.exec(remaining);
    if (!match) {
      parts.push({ type: 'text', content: remaining });
      break;
    }

    const matchIndex = match.index;
    if (matchIndex > 0) {
      parts.push({ type: 'text', content: remaining.slice(0, matchIndex) });
    }

    // 1. Nested/malformed $$\(...)$$
    if (match[1]) {
      parts.push({ type: 'inline_math', content: cleanLatex(match[2]) });
    }
    // 2. Double dollar inline $$...$$
    else if (match[3]) {
      parts.push({ type: 'inline_math', content: cleanLatex(match[4]) });
    }
    // 3. Standard LaTeX \(...\)
    else if (match[5]) {
      parts.push({ type: 'inline_math', content: cleanLatex(match[6]) });
    }
    // 4. Standard LaTeX \[...\] inside text
    else if (match[7]) {
      parts.push({ type: 'inline_math', content: cleanLatex(match[8]) });
    }
    // 5. Standard inline $...$
    else if (match[9]) {
      parts.push({ type: 'inline_math', content: cleanLatex(match[10]) });
    }
    // 6. Code `...`
    else if (match[11]) {
      parts.push({ type: 'code', content: match[12] });
    }
    // 7. Bold **...**
    else if (match[13]) {
      parts.push({ type: 'bold', content: match[14] });
    }
    // 8. Italic *...*
    else if (match[15]) {
      parts.push({ type: 'italic', content: match[16] });
    }
    // 9. Highlight ==...==
    else if (match[17]) {
      parts.push({ type: 'highlight', content: match[18] });
    }
    // 10. Highlight <mark>...</mark>
    else if (match[19]) {
      parts.push({ type: 'highlight', content: match[20] });
    }
    // 11. Strikethrough ~~...~~
    else if (match[21]) {
      parts.push({ type: 'strike', content: match[22] });
    }
    // 12. Underline <u>...</u>
    else if (match[23]) {
      parts.push({ type: 'underline', content: match[24] });
    }
    // 13. Link [text](url)
    else if (match[25]) {
      parts.push({ type: 'link', content: match[26], url: match[27] });
    }

    remaining = remaining.slice(matchIndex + match[0].length);
  }

  return parts;
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
