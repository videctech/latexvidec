import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Copy,
  Trash2,
  Settings,
  HelpCircle,
  Cpu,
  Zap,
  Maximize2,
  Minimize2,
  Github
} from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './App.css';

const DEFAULT_LATEX = `\\section{Welcome to LuminaLaTeX}

LuminaLaTeX is a high-performance, real-time LaTeX editor.

\\subsection{Mathematics}
You can write complex equations like the Schrodinger Equation:
\\[ i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\left[ -\\frac{\\hbar^2}{2m}\\nabla^2 + V(\\mathbf{r},t) \\right]\\Psi(\\mathbf{r},t) \\]

Or Euler's identity:
\\[ e^{i\\pi} + 1 = 0 \\]

\\subsection{Formatting}
\\textbf{Bold text}, \\textit{Italic text}, and \\underline{underlined text}.

\\begin{itemize}
  \\item Instant Live Preview
  \\item Glassmorphism UI
  \\item High Performance KaTeX Rendering
\\end{itemize}`;

const App: React.FC = () => {
  const [latex, setLatex] = useState(DEFAULT_LATEX);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(latex);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the editor?')) {
      setLatex('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`app-container ${isFullscreen ? 'fullscreen' : ''}`}
    >
      {/* Header */}
      <header className="glass">
        <div className="logo">
          <div className="logo-icon">
            <Zap size={20} fill="var(--accent-primary)" stroke="var(--accent-primary)" />
          </div>
          <h1>Lumina<span>LaTeX</span></h1>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={handleCopy}>
            {isCopied ? 'Copied!' : <><Copy size={16} /> Copy .tex</>}
          </button>
          <button className="btn-primary">
            <Download size={16} /> Export PDF
          </button>
          <div className="divider"></div>
          <button className="btn-icon" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button className="btn-icon">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Sidebar/Snippets */}
        <aside className="snippets-sidebar glass">
          <div className="sidebar-title">Snippets</div>
          <div className="snippet-group">
            <button onClick={() => setLatex(l => l + '\\frac{a}{b}')} title="Fraction">
              <span className="latex-span">{'\\frac{a}{b}'}</span>
            </button>
            <button onClick={() => setLatex(l => l + '\\sqrt{x}')} title="Square Root">
              <span className="latex-span">{'\\sqrt{x}'}</span>
            </button>
            <button onClick={() => setLatex(l => l + '\\int_{a}^{b} f(x) dx')} title="Integral">
              <span className="latex-span">{'\\int'}</span>
            </button>
            <button onClick={() => setLatex(l => l + '\\sum_{i=1}^{n}')} title="Sum">
              <span className="latex-span">{'\\sum'}</span>
            </button>
            <button onClick={() => setLatex(l => l + '\\infty')} title="Infinity">
              <span className="latex-span">{'\\infty'}</span>
            </button>
          </div>
        </aside>

        {/* Editor Side */}
        <section className="editor-pane">
          <div className="pane-header">
            <div className="tab active">
              <FileText size={14} /> main.tex
            </div>
            <button className="btn-icon-sm" onClick={handleClear} title="Clear Editor">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="editor-content">
            <textarea
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              placeholder="Enter LaTeX here..."
              spellCheck={false}
            />
          </div>
        </section>

        {/* Preview Side */}
        <section className="preview-pane glass">
          <div className="pane-header">
            <div className="tab active">
              <Cpu size={14} /> Live Preview
            </div>
            <div className="preview-status">
              <div className="status-dot"></div> Rendered
            </div>
          </div>
          <div className="preview-content">
            <LatexRenderer content={latex} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="glass">
        <div className="footer-left">
          <span>Engine: KaTeX 0.16.28</span>
          <div className="divider"></div>
          <span>Lines: {latex.split('\\n').length}</span>
        </div>
        <div className="footer-right">
          <a href="#" className="footer-link"><HelpCircle size={14} /> Documentation</a>
          <a href="#" className="footer-link"><Github size={14} /> GitHub</a>
        </div>
      </footer>
    </motion.div>
  );
};

const LatexRenderer: React.FC<{ content: string }> = ({ content }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Process the text to find math blocks
      // For this demo, we'll use a simple regex approach to render both inline and display math
      // Note: Real LaTeX engines are much more complex, but KaTeX is great for math.
      // We will render the whole content as HTML and then find parts to render with KaTeX.

      let html = content
        .replace(/\\section\{(.*?)\}/g, '<h1 class="latex-h1">$1</h1>')
        .replace(/\\subsection\{(.*?)\}/g, '<h2 class="latex-h2">$2</h2>')
        .replace(/\\textbf\{(.*?)\}/g, '<strong>$1</strong>')
        .replace(/\\textit\{(.*?)\}/g, '<em>$1</em>')
        .replace(/\\underline\{(.*?)\}/g, '<u>$1</u>')
        .replace(/\\begin\{itemize\}/g, '<ul class="latex-ul">')
        .replace(/\\end\{itemize\}/g, '</ul>')
        .replace(/\\item (.*?)/g, '<li>$1</li>')
        .replace(/\n\n/g, '<br/><br/>');

      containerRef.current.innerHTML = html;

      // Render Display Math: \[ ... \] or $$ ... $$
      const displayMathRegex = /\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$/g;
      let displayMatch;
      while ((displayMatch = displayMathRegex.exec(content)) !== null) {
        const math = displayMatch[1] || displayMatch[2];
        try {
          katex.renderToString(math, { displayMode: true, throwOnError: false });
        } catch (e) {
          console.error(e);
        }
      }

      // Inline Math: $ ... $ or \( ... \)
      // This is harder to do with simple innerHTML replacement without breaking HTML tags.
      // A better way is to use a library like `remark-math` or similar, 
      // but I'll implement a custom "render-in-place" for the demo.

      renderMathInElement(containerRef.current);
    }
  }, [content]);

  return <div ref={containerRef} className="latex-document" />;
};

// Helper to render math in an element using KaTeX auto-render logic (simplified)
const renderMathInElement = (elem: HTMLElement) => {
  // A simple implementation of auto-render
  const text = elem.innerHTML;

  // Replace \[ ... \] with placeholders
  let newHtml = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
    try {
      return `<div class="math-block">${katex.renderToString(math, { displayMode: true })}</div>`;
    } catch (e) {
      return `<span class="math-error">${math}</span>`;
    }
  });

  // Replace \( ... \) or $ ... $ with placeholders
  // Note: $...$ is tricky because of currency. We'll stick to \( ... \) for reliable demo.
  newHtml = newHtml.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
    try {
      return `<span class="math-inline">${katex.renderToString(math, { displayMode: false })}</span>`;
    } catch (e) {
      return `<span class="math-error">${math}</span>`;
    }
  });

  elem.innerHTML = newHtml;
};

export default App;
