import React, { useState, useEffect, useRef } from 'react';
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
  Github,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './App.css';

const DEFAULT_LATEX = `\\section{LuminaLaTeX Deep Dive}

LuminaLaTeX is a high-performance, real-time LaTeX editor.

\\subsection{Equation of the Universe}
The Schrodinger Equation describes how the quantum state of a physical system changes with time.
\\[ i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\left[ -\\frac{\\hbar^2}{2m}\\nabla^2 + V(\\mathbf{r},t) \\right]\\Psi(\\mathbf{r},t) \\]

\\subsection{Matrices}
Complex data can be represented easily:
\\[ A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\]

\\subsection{Key Advancements}
\\begin{itemize}
  \\item \\textbf{Live PDF Export}: Export your rendered document instantly.
  \\item \\textbf{KaTeX Engine}: Desktop-grade math performance.
  \\item \\textbf{Smart Snippets}: One-tap symbol insertion.
\\end{itemize}

\\textit{Happy typesetting!}
`;

const App: React.FC = () => {
  const [latex, setLatex] = useState(DEFAULT_LATEX);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

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

  const handleExportPDF = async () => {
    if (!previewRef.current || isExporting) return;

    setIsExporting(true);
    try {
      const element = previewRef.current.querySelector('.preview-content') as HTMLElement;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('lumina-document.pdf');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF. Please try again.');
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
            {isCopied ? <><CheckCircle2 size={16} /> Copied</> : <><Copy size={16} /> Copy .tex</>}
          </button>
          <button className="btn-primary" onClick={handleExportPDF} disabled={isExporting}>
            {isExporting ? <><Loader2 size={16} className="animate-spin" /> Working...</> : <><Download size={16} /> Export PDF</>}
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
            <button onClick={() => insertSnippet('\\frac{a}{b}')} title="Fraction">
              <span className="latex-span">{'\\frac{a}{b}'}</span>
            </button>
            <button onClick={() => insertSnippet('\\sqrt{x}')} title="Square Root">
              <span className="latex-span">{'\\sqrt{x}'}</span>
            </button>
            <button onClick={() => insertSnippet('\\int_{a}^{b}')} title="Integral">
              <span className="latex-span">{'\\int'}</span>
            </button>
            <button onClick={() => insertSnippet('\\sum_{i=0}^{n}')} title="Sum">
              <span className="latex-span">{'\\sum'}</span>
            </button>
            <button onClick={() => insertSnippet('\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}')} title="Matrix">
              <span className="latex-span">{'[M]'}</span>
            </button>
            <button onClick={() => insertSnippet('\\infty')} title="Infinity">
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
        <section className="preview-pane glass" ref={previewRef}>
          <div className="pane-header">
            <div className="tab active">
              <Cpu size={14} /> Live Preview
            </div>
            <div className="preview-status">
              <div className="status-dot"></div> Live
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
          <span>Lines: {latex.split('\n').length}</span>
        </div>
        <div className="footer-right">
          <a href="#" className="footer-link"><HelpCircle size={14} /> Documentation</a>
          <a href="https://github.com/videctech/latexvidec" target="_blank" className="footer-link"><Github size={14} /> GitHub</a>
        </div>
      </footer>
    </motion.div>
  );
};

const LatexRenderer: React.FC<{ content: string }> = ({ content }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // 1. Convert structural LaTeX to HTML
      let html = content
        .replace(/\\section\{(.*?)\}/g, '<h1 class="latex-h1">$1</h1>')
        .replace(/\\subsection\{(.*?)\}/g, '<h2 class="latex-h2">$1</h2>')
        .replace(/\\textbf\{(.*?)\}/g, '<strong>$1</strong>')
        .replace(/\\textit\{(.*?)\}/g, '<em>$1</em>')
        .replace(/\\underline\{(.*?)\}/g, '<u>$1</u>')
        .replace(/\\begin\{itemize\}/g, '<ul class="latex-ul">')
        .replace(/\\end\{itemize\}/g, '</ul>')
        .replace(/\\item (.*?)/g, '<li>$1</li>')
        .replace(/\n\n/g, '<br/><br/>');

      containerRef.current.innerHTML = html;

      // 2. Render Math in Place
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
    } catch (e) {
      return `<span class="math-error">${math}</span>`;
    }
  });

  // Replace $$ ... $$ (Alternative Block Math)
  newHtml = newHtml.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      return `<div class="math-block">${katex.renderToString(math, { displayMode: true, throwOnError: false })}</div>`;
    } catch (e) {
      return `<span class="math-error">${math}</span>`;
    }
  });

  // Replace \( ... \) or $ ... $ (Inline Math)
  newHtml = newHtml.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
    try {
      return `<span class="math-inline">${katex.renderToString(math, { displayMode: false, throwOnError: false })}</span>`;
    } catch (e) {
      return `<span class="math-error">${math}</span>`;
    }
  });

  elem.innerHTML = newHtml;
};

export default App;
