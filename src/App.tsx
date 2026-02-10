import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Github,
  CheckCircle2,
  Loader2,
  Layout,
  Code2,
  Layers,
  Sparkles
} from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Syntax Highlighting
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-latex';
import 'prismjs/themes/prism-tomorrow.css';

import './App.css';

const TEMPLATES = {
  basic: `\\section{Untitled Document}
\\subsection{Introduction}
Start typing your professional LaTeX content here.

\\[ E = mc^2 \\]`,
  report: `\\section{Technical Report 2026}
\\subsection{Abstract}
This report outlines the breakthrough in real-time typesetting using the LuminaLaTeX engine.

\\subsection{System Architecture}
\\begin{itemize}
  \\item High-speed KaTeX parsing
  \\item Virtual DOM Diffing
  \\item Asynchronous PDF Generation
\\end{itemize}

\\[ \\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t} \\]`,
  memo: `\\section{Internal Memorandum}
\\textbf{To:} Scientific Community \\\\
\\textbf{From:} Lumina Engineering \\\\
\\textbf{Subject:} Professional LaTeX Standards

\\subsection{Key Message}
The standard for online LaTeX editing has been elevated. 

\\textit{Signed, Engineering}`
};

const App: React.FC = () => {
  const [latex, setLatex] = useState(() => {
    const saved = localStorage.getItem('lumina-latex-content');
    return saved || TEMPLATES.basic;
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('lumina-latex-content', latex);
  }, [latex]);

  const handleCopy = () => {
    navigator.clipboard.writeText(latex);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportPDF = async () => {
    if (!previewRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const element = previewRef.current.querySelector('.paper') as HTMLElement;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('lumina-exports.pdf');
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const insertSnippet = (snippet: string) => {
    setLatex(prev => prev + snippet);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`app-container ${isFullscreen ? 'fullscreen' : ''}`}
    >
      <header>
        <div className="logo">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="logo-icon"
          >
            <Zap size={24} fill="white" stroke="white" />
          </motion.div>
          <h1>Lumina<span>LaTeX</span></h1>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={handleCopy}>
            {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            <span>{isCopied ? 'Copied' : 'Copy Code'}</span>
          </button>

          <button className="btn-primary" onClick={handleExportPDF} disabled={isExporting}>
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span>Export PDF</span>
          </button>

          <div className="divider"></div>

          <button className="btn-icon" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>

          <button className="btn-icon">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main>
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">Math Snippets</div>
            <div className="sidebar-grid">
              <button onClick={() => insertSnippet('\\frac{a}{b}')} title="Fraction">
                <Layout size={18} />
              </button>
              <button onClick={() => insertSnippet('\\sqrt{x}')} title="Root">
                <Sparkles size={18} />
              </button>
              <button onClick={() => insertSnippet('\\int_{a}^{b}')} title="Integral">
                <Layers size={18} />
              </button>
              <button onClick={() => insertSnippet('\\sum')} title="Sum">
                <Code2 size={18} />
              </button>
              <button onClick={() => insertSnippet('\\infty')} title="Infinity">
                <Cpu size={18} />
              </button>
              <button onClick={() => setLatex('')} title="Clear">
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Templates</div>
            <div className="template-list">
              <button className="template-btn" onClick={() => setLatex(TEMPLATES.basic)}>
                <FileText size={16} /> Basic Doc
              </button>
              <button className="template-btn" onClick={() => setLatex(TEMPLATES.report)}>
                <FileText size={16} /> Technical Report
              </button>
              <button className="template-btn" onClick={() => setLatex(TEMPLATES.memo)}>
                <FileText size={16} /> Scientific Memo
              </button>
            </div>
          </div>
        </aside>

        {/* Editor Pane */}
        <section className="pane">
          <div className="pane-header">
            <div className="pane-title">
              <Code2 size={16} className="text-secondary" />
              Source Editor
            </div>
            <div className="preview-status">
              <div className="status-dot"></div>
              <span>Auto-saving</span>
            </div>
          </div>
          <div className="editor-wrapper">
            <Editor
              value={latex}
              onValueChange={setLatex}
              highlight={code => highlight(code, languages.latex, 'latex')}
              padding={20}
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 16,
                minHeight: '100%',
                color: '#e2e8f0'
              }}
            />
          </div>
        </section>

        {/* Preview Pane */}
        <section className="pane preview-pane" ref={previewRef}>
          <div className="pane-header">
            <div className="pane-title">
              <FileText size={16} className="text-secondary" />
              Document Preview
            </div>
            <div className="preview-status">
              <span style={{ color: 'var(--text-muted)' }}>A4 Standard</span>
            </div>
          </div>
          <div className="preview-container">
            <div className="paper">
              <LatexRenderer content={latex} />
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-left">
          <span>Standardized: ISO/IEC 15444</span>
          <div className="divider"></div>
          <span>Symbols: {latex.length}</span>
        </div>
        <div className="footer-right">
          <a href="https://github.com/videctech/latexvidec" target="_blank" className="footer-link">
            <Github size={14} /> Open Source
          </a>
        </div>
      </footer>
    </motion.div>
  );
};

const LatexRenderer: React.FC<{ content: string }> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      let html = content
        .replace(/\\section\{(.*?)\}/g, '<h1 class="latex-h1">$1</h1>')
        .replace(/\\subsection\{(.*?)\}/g, '<h2 class="latex-h2">$1</h2>')
        .replace(/\\textbf\{(.*?)\}/g, '<strong>$1</strong>')
        .replace(/\\textit\{(.*?)\}/g, '<em>$1</em>')
        .replace(/\\underline\{(.*?)\}/g, '<u>$1</u>')
        .replace(/\\begin\{itemize\}/g, '<ul class="latex-ul" style="margin-left: 20px; margin-bottom: 20px;">')
        .replace(/\\end\{itemize\}/g, '</ul>')
        .replace(/\\item (.*?)/g, '<li style="margin-bottom: 8px;">$1</li>')
        .replace(/\n\n/g, '<br/><br/>');

      containerRef.current.innerHTML = html;
      renderMathInElement(containerRef.current);
    }
  }, [content]);

  return <div ref={containerRef} className="latex-document" />;
};

const renderMathInElement = (elem: HTMLElement) => {
  const text = elem.innerHTML;

  // Replace \[ ... \] (Block Math)
  let newHtml = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
    try {
      return `<div class="math-block">${katex.renderToString(math, { displayMode: true, throwOnError: false })}</div>`;
    } catch {
      return `<span style="color: red">${math}</span>`;
    }
  });

  // Inline Math \( ... \) or $ ... $
  newHtml = newHtml.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
    try {
      return `<span class="math-inline">${katex.renderToString(math, { displayMode: false, throwOnError: false })}</span>`;
    } catch {
      return `<span style="color: red">${math}</span>`;
    }
  });

  // Basic Matrix/Environment support
  newHtml = newHtml.replace(/\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/g, (_, math) => {
    try {
      return katex.renderToString(`\\begin{pmatrix}${math}\\end{pmatrix}`, { displayMode: true, throwOnError: false });
    } catch {
      return math;
    }
  });

  elem.innerHTML = newHtml;
};

export default App;
