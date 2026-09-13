import type React from 'react';

/**
 * Smart Paste Engine for Math & Code Editor.
 * Converts rich text HTML (from Google Docs, ChatGPT, Gemini, Word, Wikipedia, Notion)
 * into clean, formatted Markdown preserving:
 * - Highlights (<mark>, background-color) -> ==highlight==
 * - LaTeX math (KaTeX annotations, MathJax, $...$, \[...\], \begin{...})
 * - Formatting (Bold, Italic, Strikethrough, Code, Links)
 * - Structure (Headings, Lists, Blockquotes, Tables, Code Blocks)
 */

export function convertHtmlToMarkdown(html: string): string {
  if (!html || typeof html !== 'string') return '';

  try {
    if (typeof DOMParser !== 'undefined') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // 1. Process KaTeX / MathJax equations first before other processing
      // Extract LaTeX source from KaTeX annotations or data attributes
      const katexElements = doc.querySelectorAll('.katex, .katex-display, [data-katex]');
      katexElements.forEach((el) => {
        const annotation = el.querySelector('annotation[encoding="application/x-tex"]');
        const tex = annotation ? annotation.textContent : el.getAttribute('data-katex') || el.getAttribute('data-tex');
        if (tex) {
          const isDisplay = el.classList.contains('katex-display') || el.closest('.katex-display');
          const replacement = isDisplay ? `\n$$\n${tex.trim()}\n$$\n` : `$${tex.trim()}$`;
          const textNode = doc.createTextNode(replacement);
          el.parentNode?.replaceChild(textNode, el);
        }
      });

      // Process MathJax
      const mathjaxElements = doc.querySelectorAll('.MathJax, [data-mathml]');
      mathjaxElements.forEach((el) => {
        const tex = el.getAttribute('data-latex') || el.getAttribute('data-tex');
        if (tex) {
          const isDisplay = el.getAttribute('display') === 'true';
          const replacement = isDisplay ? `\n$$\n${tex.trim()}\n$$\n` : `$${tex.trim()}$`;
          const textNode = doc.createTextNode(replacement);
          el.parentNode?.replaceChild(textNode, el);
        }
      });

      // 2. Recursively convert DOM tree to Markdown
      const md = processNode(doc.body).trim();
      if (md) return md;
    }
    return regexFallbackHtmlToMarkdown(html);
  } catch {
    return regexFallbackHtmlToMarkdown(html);
  }
}

function regexFallbackHtmlToMarkdown(html: string): string {
  let md = html;
  // Mark / highlights
  md = md.replace(/<mark(?:\s+[^>]*)?>([\s\S]*?)<\/mark>/gi, '==$1==');
  md = md.replace(/<span[^>]*style="[^"]*background(?:-color)?:\s*(?!transparent|inherit)[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '==$1==');
  // Bold
  md = md.replace(/<(?:b|strong)>([\s\S]*?)<\/(?:b|strong)>/gi, '**$1**');
  // Italic
  md = md.replace(/<(?:i|em)>([\s\S]*?)<\/(?:i|em)>/gi, '*$1*');
  // Strike
  md = md.replace(/<(?:s|strike|del)>([\s\S]*?)<\/(?:s|strike|del)>/gi, '~~$1~~');
  // Code
  md = md.replace(/<code>([\s\S]*?)<\/code>/gi, '`$1`');
  // Headings
  md = md.replace(/<h1(?:\s+[^>]*)?>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n');
  md = md.replace(/<h2(?:\s+[^>]*)?>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n');
  md = md.replace(/<h3(?:\s+[^>]*)?>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n');
  // Paragraphs & br
  md = md.replace(/<p(?:\s+[^>]*)?>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  // Strip remaining tags
  md = md.replace(/<[^>]+>/g, '');
  return md.trim();
}

function processNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || '';
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const el = node as HTMLElement;
  const tagName = el.tagName.toLowerCase();

  // Child processing helper
  const getChildrenMarkdown = () => {
    let result = '';
    for (let i = 0; i < el.childNodes.length; i++) {
      result += processNode(el.childNodes[i]);
    }
    return result;
  };

  // 1. Highlight Detection: <mark>, background-color, or highlight classes
  const isMark = tagName === 'mark';
  const style = el.getAttribute('style') || '';
  const bgColor = el.style.backgroundColor || '';
  const hasBgColor =
    Boolean(bgColor && bgColor !== 'transparent' && bgColor !== 'inherit' && !bgColor.includes('rgba(0, 0, 0, 0)')) ||
    /background(?:-color)?:\s*(?!transparent|inherit|rgba\(0,\s*0,\s*0,\s*0\))([#a-zA-Z0-9(),\s]+)/i.test(style);
  const hasHighlightClass = el.className && typeof el.className === 'string' && /highlight|marker|selected-text/i.test(el.className);

  if (isMark || hasBgColor || hasHighlightClass) {
    const inner = getChildrenMarkdown().trim();
    if (inner) {
      return `==${inner}==`;
    }
  }

  // 2. Headers
  if (/^h[1-6]$/.test(tagName)) {
    const level = Number(tagName[1]);
    const hashes = '#'.repeat(level);
    const content = getChildrenMarkdown().trim();
    return `\n\n${hashes} ${content}\n\n`;
  }

  // 3. Paragraphs & Linebreaks
  if (tagName === 'p') {
    const content = getChildrenMarkdown().trim();
    return content ? `\n\n${content}\n\n` : '\n';
  }

  if (tagName === 'br') {
    return '\n';
  }

  if (tagName === 'hr') {
    return '\n\n---\n\n';
  }

  // 4. Blockquotes
  if (tagName === 'blockquote') {
    const content = getChildrenMarkdown().trim();
    return (
      '\n\n' +
      content
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n') +
      '\n\n'
    );
  }

  // 5. Code blocks (<pre><code> or <pre>)
  if (tagName === 'pre') {
    const codeEl = el.querySelector('code');
    const codeText = codeEl ? codeEl.textContent || '' : el.textContent || '';
    const classAttr = (codeEl ? codeEl.className : el.className) || '';
    const langMatch = classAttr.match(/language-([a-zA-Z0-9_-]+)/);
    const lang = langMatch ? langMatch[1] : '';
    return `\n\n\`\`\`${lang}\n${codeText.trim()}\n\`\`\`\n\n`;
  }

  // Inline Code
  if (tagName === 'code') {
    return `\`${el.textContent || ''}\``;
  }

  // 6. Bold
  const isBold =
    tagName === 'b' ||
    tagName === 'strong' ||
    el.style.fontWeight === 'bold' ||
    Number(el.style.fontWeight) >= 600 ||
    /font-weight:\s*(?:bold|[6-9]00)/i.test(style);

  if (isBold) {
    const content = getChildrenMarkdown().trim();
    return content ? `**${content}**` : '';
  }

  // 7. Italic
  const isItalic =
    tagName === 'i' ||
    tagName === 'em' ||
    el.style.fontStyle === 'italic' ||
    /font-style:\s*italic/i.test(style);

  if (isItalic) {
    const content = getChildrenMarkdown().trim();
    return content ? `*${content}*` : '';
  }

  // 8. Strikethrough
  const isStrike =
    tagName === 's' ||
    tagName === 'strike' ||
    tagName === 'del' ||
    /text-decoration(?:-line)?:\s*line-through/i.test(style);

  if (isStrike) {
    const content = getChildrenMarkdown().trim();
    return content ? `~~${content}~~` : '';
  }

  // 9. Links
  if (tagName === 'a') {
    const href = el.getAttribute('href') || '#';
    const content = getChildrenMarkdown().trim() || href;
    return `[${content}](${href})`;
  }

  // 10. Lists
  if (tagName === 'ul') {
    const items: string[] = [];
    el.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE && (child as HTMLElement).tagName.toLowerCase() === 'li') {
        items.push(`- ${processNode(child).trim()}`);
      }
    });
    return '\n\n' + items.join('\n') + '\n\n';
  }

  if (tagName === 'ol') {
    const items: string[] = [];
    let idx = 1;
    el.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE && (child as HTMLElement).tagName.toLowerCase() === 'li') {
        items.push(`${idx++}. ${processNode(child).trim()}`);
      }
    });
    return '\n\n' + items.join('\n') + '\n\n';
  }

  if (tagName === 'li') {
    return getChildrenMarkdown();
  }

  // 11. Tables
  if (tagName === 'table') {
    const rows: string[][] = [];
    const trElements = el.querySelectorAll('tr');
    trElements.forEach((tr) => {
      const cells: string[] = [];
      tr.querySelectorAll('th, td').forEach((cell) => {
        cells.push(processNode(cell).replace(/\|/g, '\\|').trim());
      });
      if (cells.length > 0) rows.push(cells);
    });

    if (rows.length > 0) {
      const header = `| ${rows[0].join(' | ')} |`;
      const divider = `| ${rows[0].map(() => '---').join(' | ')} |`;
      const body = rows
        .slice(1)
        .map((r) => `| ${r.join(' | ')} |`)
        .join('\n');
      return `\n\n${header}\n${divider}${body ? '\n' + body : ''}\n\n`;
    }
  }

  // 12. Default: process children
  return getChildrenMarkdown();
}

/**
 * Intelligent clipboard paste handler.
 * If HTML is available with formatting (highlights, bold, headers, math),
 * converts to Markdown. Otherwise cleans plain text delimiters.
 */
export function handleSmartPasteText(
  clipboardEvent: React.ClipboardEvent<HTMLTextAreaElement>
): { text: string; wasFormattedHtml: boolean } {
  const clipboardData = clipboardEvent.clipboardData;
  if (!clipboardData) {
    return { text: '', wasFormattedHtml: false };
  }

  const html = clipboardData.getData('text/html');
  const plain = clipboardData.getData('text/plain');

  // If HTML contains meaningful tags (highlight, bold, headings, math, lists)
  if (html && /<(mark|h[1-6]|b|strong|i|em|code|pre|ul|ol|table|blockquote|span[^>]+style)/i.test(html)) {
    const converted = convertHtmlToMarkdown(html);
    if (converted && converted.trim().length > 0) {
      // Normalize excessive consecutive newlines
      const cleaned = converted.replace(/\n{3,}/g, '\n\n');
      return { text: cleaned, wasFormattedHtml: true };
    }
  }

  // Otherwise return plain text with normalized unicode characters
  const normalizedPlain = plain
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\u00A0/g, ' ');

  return { text: normalizedPlain, wasFormattedHtml: false };
}
