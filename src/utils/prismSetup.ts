import Prism from 'prismjs';

// Order of language imports is critical in Prism:
// 1. Core clike must be imported before languages derived from it
import 'prismjs/components/prism-clike';

// 2. JavaScript must be loaded before TypeScript & JSX
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';

// 3. C must be loaded before C++
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';

// 4. Standalone and other language syntaxes
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-latex';

export function highlightCode(code: string, language: string): string {
  const normalized = (language || 'text').toLowerCase().trim();
  const grammar =
    Prism.languages[normalized] ||
    (normalized === 'js' ? Prism.languages.javascript : null) ||
    (normalized === 'ts' ? Prism.languages.typescript : null) ||
    (normalized === 'py' ? Prism.languages.python : null) ||
    Prism.languages.javascript ||
    Prism.languages.clike;

  if (grammar) {
    try {
      return Prism.highlight(code, grammar, normalized);
    } catch {
      // Fallback
    }
  }

  // Safe HTML escape if grammar not found
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default Prism;
