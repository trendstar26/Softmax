// Client-side code runner for JavaScript/TypeScript and Python (via Pyodide lazy-load)

let pyodidePromise: Promise<any> | null = null;

async function getPyodide(): Promise<any> {
  if (pyodidePromise) return pyodidePromise;

  pyodidePromise = new Promise((resolve, reject) => {
    // Check if pyodide script is already present
    if ((window as any).loadPyodide) {
      (window as any).loadPyodide().then(resolve).catch(reject);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
    script.async = true;
    script.onload = async () => {
      try {
        const pyodide = await (window as any).loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
        });
        resolve(pyodide);
      } catch (err) {
        reject(err);
      }
    };
    script.onerror = () => reject(new Error('Failed to load Pyodide Python runtime'));
    document.head.appendChild(script);
  });

  return pyodidePromise;
}

export async function runCodeSnippet(
  code: string,
  language: string
): Promise<{ output: string; error?: string; durationMs: number }> {
  const startTime = performance.now();
  const normalizedLang = language.toLowerCase().trim();

  // JavaScript or TypeScript
  if (
    normalizedLang === 'javascript' ||
    normalizedLang === 'js' ||
    normalizedLang === 'typescript' ||
    normalizedLang === 'ts'
  ) {
    const logs: string[] = [];
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    try {
      console.log = (...args: any[]) => {
        logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
        originalLog(...args);
      };
      console.warn = (...args: any[]) => {
        logs.push('[WARN] ' + args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
        originalWarn(...args);
      };
      console.error = (...args: any[]) => {
        logs.push('[ERROR] ' + args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
        originalError(...args);
      };

      // Strip simple TypeScript type annotations if needed (e.g. `: number`, `: string`)
      let executableCode = code;
      if (normalizedLang.includes('ts')) {
        executableCode = executableCode
          .replace(/:\s*(number|string|boolean|any|void|unknown|never|object|[A-Z][a-zA-Z0-9_]*(\[\])?)\b/g, '')
          .replace(/as\s+[A-Za-z0-9_]+/g, '');
      }

      // Execute in an isolated function wrapper
      const fn = new Function(executableCode);
      const result = fn();

      const durationMs = Math.round(performance.now() - startTime);
      let finalOutput = logs.join('\n');
      if (result !== undefined) {
        const resultStr = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
        finalOutput = finalOutput ? `${finalOutput}\n→ Return: ${resultStr}` : `→ Return: ${resultStr}`;
      }

      return {
        output: finalOutput || '(Execution completed with no console output)',
        durationMs,
      };
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      return {
        output: logs.join('\n'),
        error: err?.message || String(err),
        durationMs,
      };
    } finally {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    }
  }

  // Python
  if (normalizedLang === 'python' || normalizedLang === 'py') {
    try {
      const pyodide = await getPyodide();
      
      // Redirect python stdout/stderr
      pyodide.runPython(`
import sys
import io
sys_stdout = sys.stdout
sys_stderr = sys.stderr
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
      `);

      let resultVal: any;
      try {
        resultVal = pyodide.runPython(code);
      } catch (execErr: any) {
        const stderr = pyodide.runPython('sys.stderr.getvalue()');
        pyodide.runPython('sys.stdout = sys_stdout; sys.stderr = sys_stderr');
        return {
          output: stderr || '',
          error: execErr?.message || String(execErr),
          durationMs: Math.round(performance.now() - startTime),
        };
      }

      const stdout = pyodide.runPython('sys.stdout.getvalue()');
      pyodide.runPython('sys.stdout = sys_stdout; sys.stderr = sys_stderr');

      let combinedOutput = stdout || '';
      if (resultVal !== undefined && resultVal !== null) {
        combinedOutput = combinedOutput ? `${combinedOutput}\n→ Result: ${resultVal}` : `→ Result: ${resultVal}`;
      }

      return {
        output: combinedOutput.trim() || '(Executed successfully with no print output)',
        durationMs: Math.round(performance.now() - startTime),
      };
    } catch (err: any) {
      return {
        output: '',
        error: `Python environment error: ${err?.message || err}`,
        durationMs: Math.round(performance.now() - startTime),
      };
    }
  }

  return {
    output: '',
    error: `In-browser runner supports JavaScript, TypeScript, and Python. (${language} can be viewed and copied above)`,
    durationMs: 0,
  };
}
