import katex from 'katex';

/**
 * Strips accidental wrapper delimiters ($$, \[, \], \(, \)) and normalizes
 * common characters pasted from Google Docs, ChatGPT, Word, or PDFs.
 */
export function cleanLatex(raw: string): string {
  if (!raw) return '';

  let tex = raw.trim();

  // 1. Normalize unicode characters commonly pasted from rich text editors
  tex = tex
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ') // Non-breaking spaces
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[\u2212\u2013\u2014]/g, '-') // Unicode minus, en-dash, em-dash to hyphen
    .replace(/\u2026/g, '\\ldots ') // Unicode ellipsis … to \ldots
    .replace(/\u00D7/g, '\\times ') // Unicode × to \times
    .replace(/\u00F7/g, '\\div '); // Unicode ÷ to \div

  // 2. Loop to strip any outer stacked delimiters (e.g. $$\[ or $$\( or \[$$)
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 5) {
    iterations++;
    const prev = tex;

    // Strip leading delimiters
    tex = tex
      .replace(/^(\$\$|\$|\\\[|\\\()(\s*)/, '')
      .replace(/^(\\\[|\\\()(\s*)/, '');

    // Strip trailing delimiters
    tex = tex
      .replace(/(\s*)(\$\$|\$|\\\]|\\\)|\\\$\$\))$/, '')
      .replace(/(\s*)(\\\]|\\\))$/, '');

    changed = prev !== tex;
  }

  // 3. Clean up any remaining leading \[ or \( or trailing \] or \)
  tex = tex.trim();
  if (tex.startsWith('\\[') && tex.endsWith('\\]')) {
    tex = tex.slice(2, -2).trim();
  }
  if (tex.startsWith('\\(') && tex.endsWith('\\)')) {
    tex = tex.slice(2, -2).trim();
  }

  // 4. Balance unclosed curly braces if simple omission occurred
  let openBraces = 0;
  for (let i = 0; i < tex.length; i++) {
    if (tex[i] === '{' && (i === 0 || tex[i - 1] !== '\\')) openBraces++;
    if (tex[i] === '}' && (i === 0 || tex[i - 1] !== '\\')) openBraces--;
  }
  if (openBraces > 0 && openBraces < 5) {
    tex += '}'.repeat(openBraces);
  }

  return tex.trim();
}

/**
 * Validates whether a LaTeX string renders successfully in KaTeX.
 */
export function validateEquation(
  rawTex: string,
  displayMode = false
): { valid: boolean; error: string | null; cleaned: string } {
  const cleaned = cleanLatex(rawTex);

  if (!cleaned) {
    return { valid: false, error: 'Equation is empty', cleaned: '' };
  }

  try {
    katex.renderToString(cleaned, {
      displayMode,
      throwOnError: true,
      strict: false,
    });
    return { valid: true, error: null, cleaned };
  } catch (err: any) {
    let msg = err?.message || 'Invalid LaTeX syntax';
    // Make error messages user-friendly
    if (msg.includes("Can't use function '\['")) {
      msg = "Nested '\[' found inside math mode. Remove '\[' around equation.";
    } else if (msg.includes("Can't use function '\('")) {
      msg = "Nested '\(' found inside math mode. Remove '\(' around equation.";
    } else if (msg.includes('Expected group after')) {
      msg = 'Missing argument or unclosed brace { ... }';
    }
    return { valid: false, error: msg, cleaned };
  }
}

/**
 * Scans an entire document and fixes all common delimiter anomalies:
 * - $$\[ ... \]$$ -> $$ ... $$
 * - $$\( ... \)$$ -> $$ ... $$
 * - Standalone \[ ... \] -> $$ ... $$
 * - Standalone \( ... \) -> $ ... $
 * - $\( ... \)$ -> $ ... $
 * - Malformed delimiters like $$\(x\$$)
 */
export function autoFixDocumentLatex(text: string): {
  text: string;
  fixesCount: number;
  details: string[];
} {
  let modified = text;
  let fixesCount = 0;
  const details: string[] = [];

  // 1. Fix nested $$\[ ... \]$$ -> $$\n...\n$$
  const nestedBlockRegex = /\$\$[ \t]*\\\[([\s\S]*?)\\\][ \t]*\$\$/g;
  if (nestedBlockRegex.test(modified)) {
    modified = modified.replace(nestedBlockRegex, (_, body) => {
      fixesCount++;
      return `$$\n${cleanLatex(body)}\n$$`;
    });
    details.push('Fixed nested $$\[ ... \]$$ block delimiters');
  }

  // 2. Fix nested $$\( ... \)$$ -> $$\n...\n$$
  const nestedParenRegex = /\$\$[ \t]*\\\(([\s\S]*?)\\\)[ \t]*\$\$/g;
  if (nestedParenRegex.test(modified)) {
    modified = modified.replace(nestedParenRegex, (_, body) => {
      fixesCount++;
      return `$$\n${cleanLatex(body)}\n$$`;
    });
    details.push('Fixed nested $$\( ... \)$$ block delimiters');
  }

  // 3. Fix malformed $$\( ... \$$) or $$\( ... \)$$
  const malformedParenRegex = /\$\$[ \t]*\\\(([\s\S]*?)\\\$\$[ \t]*\)/g;
  if (malformedParenRegex.test(modified)) {
    modified = modified.replace(malformedParenRegex, (_, body) => {
      fixesCount++;
      return `$${cleanLatex(body)}$`;
    });
    details.push('Fixed malformed $$\(...\\$$) delimiters');
  }

  // 4. Fix standalone \[ ... \] (standard LaTeX display equation) -> $$ ... $$
  const standaloneDisplayRegex = /(^|[^\\])\\\[([\s\S]*?)\\\]/g;
  if (standaloneDisplayRegex.test(modified)) {
    modified = modified.replace(standaloneDisplayRegex, (match, prefix, body) => {
      // Don't replace if it's already inside $$
      if (match.includes('$$')) return match;
      fixesCount++;
      const cleanedBody = cleanLatex(body);
      return `${prefix}\n$$\n${cleanedBody}\n$$\n`;
    });
    details.push('Converted standalone \\[ ... \\] to $$ ... $$ display blocks');
  }

  // 5. Fix standalone \( ... \) (standard LaTeX inline equation) -> $ ... $
  const standaloneInlineRegex = /(^|[^\\])\\\(([\s\S]*?)\\\)/g;
  if (standaloneInlineRegex.test(modified)) {
    modified = modified.replace(standaloneInlineRegex, (match, prefix, body) => {
      if (match.includes('$$')) return match;
      fixesCount++;
      const cleanedBody = cleanLatex(body);
      return `${prefix}$${cleanedBody}$`;
    });
    details.push('Converted standard \\( ... \\) to $ ... $ inline math');
  }

  // 6. Fix $\( ... \)$ -> $ ... $
  const mixedInlineRegex = /\$[ \t]*\\\(([\s\S]*?)\\\)[ \t]*\$/g;
  if (mixedInlineRegex.test(modified)) {
    modified = modified.replace(mixedInlineRegex, (_, body) => {
      fixesCount++;
      return `$${cleanLatex(body)}$`;
    });
    details.push('Fixed redundant $\\( ... \\)$ inline delimiters');
  }

  // 7. Fix $$(x)$$ on a single line that should be $x$
  const singleDollarBlock = /\$\$([a-zA-Z0-9_\\^+\-=(),\s]{1,15})\$\$/g;
  // If user used $$ for short inline variables e.g. for an input $$\(x_i\)$$:
  // (Notice how the above steps 2 & 3 already address $$\(x_i\)$$)

  return {
    text: modified,
    fixesCount,
    details,
  };
}
