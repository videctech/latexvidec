import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Sparkles,
  Files,
  Search,
  MessageSquare,
  Moon,
  Sun,
  Book,
  Sigma,
  Plus,
  ArrowRight,
  Info
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

const SYMBOLS = {
  Greek: ['\\alpha', '\\beta', '\\gamma', '\\delta', '\\epsilon', '\\theta', '\\lambda', '\\pi', '\\sigma', '\\phi', '\\omega', '\\Omega'],
  Operators: ['\\sum', '\\int', '\\prod', '\\sqrt{x}', '\\frac{a}{b}', '\\lim_{x\\to\\infty}'],
  Relations: ['\\le', '\\ge', '\\in', '\\notin', '\\subset', '\\approx', '\\neq', '\\equiv'],
  Arrows: ['\\to', '\\Rightarrow', '\\leftrightarrow', '\\uparrow', '\\downarrow']
};

interface File {
  name: string;
  content: string;
  type: 'tex' | 'bib';
}

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>(() => {
    const saved = localStorage.getItem('lumina-files');
    if (saved) return JSON.parse(saved);
    return [
      { name: 'main.tex', content: TEMPLATES.report, type: 'tex' },
      { name: 'references.bib', content: '@article{lumina2026,\n  author = {Lumina Tech},\n  title = {The Future of LaTeX},\n  year = {2026}\n}', type: 'bib' }
    ];
  });

  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [logs, setLogs] = useState<string[]>(['Lumina Engine Initialized...', 'System Ready.']);
  const [sidebarTab, setSidebarTab] = useState<'files' | 'toolbox'>('files');

  const previewRef = useRef<HTMLDivElement>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('lumina-files', JSON.stringify(files));
  }, [files]);

  const updateActiveContent = (newContent: string) => {
    const updatedFiles = [...files];
    updatedFiles[activeFileIndex].content = newContent;
    setFiles(updatedFiles);

    if (Math.random() > 0.95) {
      setLogs(prev => [...prev.slice(-10), `Re-rendered at ${new Date().toLocaleTimeString()}`]);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(files[activeFileIndex].content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportPDF = async () => {
    if (!previewRef.current || isExporting) return;
    setIsExporting(true);
    setLogs(prev => [...prev, 'Starting PDF generation...']);
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
      pdf.save(`${files[activeFileIndex].name}.pdf`);
      setLogs(prev => [...prev, 'PDF Export Successful.']);
    } catch (e) {
      console.error(e);
      setLogs(prev => [...prev, 'PDF Export Failed: Internal Error']);
    } finally {
      setIsExporting(false);
    }
  };

  const insertSnippet = (snippet: string) => {
    updateActiveContent(files[activeFileIndex].content + snippet);
  };

  const addFile = () => {
    const name = prompt('File name:');
    if (name) {
      setFiles([...files, { name, content: '', type: name.endsWith('.bib') ? 'bib' : 'tex' }]);
    }
  };

  const deleteFile = (index: number) => {
    if (files.length === 1) return;
    if (confirm(`Delete ${files[index].name}?`)) {
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      setActiveFileIndex(0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`app-container ${isFullscreen ? 'fullscreen' : ''} theme-${theme}`}
    >
      <header className="glass">
        <div className="logo">
          <div className="logo-icon">
            <Zap size={24} fill="white" stroke="white" />
          </div>
          <div className="logo-text">
            <h1>Lumina<span>LaTeX</span></h1>
            <span className="version">Pro v2.0</span>
          </div>
        </div>

        <div className="header-actions">
          <div className="file-tabs">
            {files.map((file, i) => (
              <button
                key={file.name}
                className={`file-tab ${activeFileIndex === i ? 'active' : ''}`}
                onClick={() => setActiveFileIndex(i)}
              >
                {file.type === 'tex' ? <FileText size={12} /> : <Book size={12} />}
                {file.name}
              </button>
            ))}
            <button className="add-file-btn" onClick={addFile}><Plus size={14} /></button>
          </div>

          <div className="divider"></div>

          <button className="btn-secondary" onClick={handleCopy}>
            {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>

          <button className="btn-primary" onClick={handleExportPDF} disabled={isExporting}>
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span>PDF</span>
          </button>

          <div className="divider"></div>

          <button className="btn-icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button className="btn-icon" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </header>

      <main>
        {/* Left Vertical Nav */}
        <nav className="vertical-nav">
          <button className={sidebarTab === 'files' ? 'active' : ''} onClick={() => setSidebarTab('files')}>
            <Files size={20} />
          </button>
          <button className={sidebarTab === 'toolbox' ? 'active' : ''} onClick={() => setSidebarTab('toolbox')}>
            <Sigma size={20} />
          </button>
          <div className="spacer"></div>
          <button><Settings size={20} /></button>
          <button><HelpCircle size={20} /></button>
        </nav>

        {/* Sidebar */}
        <aside className="sidebar">
          {sidebarTab === 'files' ? (
            <div className="sidebar-section">
              <div className="sidebar-label">Project Files</div>
              <div className="file-list">
                {files.map((file, i) => (
                  <div key={file.name} className={`file-item ${activeFileIndex === i ? 'active' : ''}`}>
                    <div className="file-info" onClick={() => setActiveFileIndex(i)}>
                      {file.type === 'tex' ? <FileText size={14} /> : <Book size={14} />}
                      <span>{file.name}</span>
                    </div>
                    <button className="delete-file" onClick={() => deleteFile(i)}><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>

              <div className="sidebar-label" style={{ marginTop: '20px' }}>Templates</div>
              <div className="template-list">
                <button className="template-btn" onClick={() => updateActiveContent(TEMPLATES.basic)}><Layout size={14} /> Basic</button>
                <button className="template-btn" onClick={() => updateActiveContent(TEMPLATES.report)}><Layers size={14} /> Report</button>
              </div>
            </div>
          ) : (
            <div className="sidebar-section">
              <div className="sidebar-label">Toolbox</div>
              {Object.entries(SYMBOLS).map(([category, items]) => (
                <div key={category} className="symbol-category">
                  <div className="category-name">{category}</div>
                  <div className="symbol-grid">
                    {items.map(s => (
                      <button key={s} onClick={() => insertSnippet(s)} title={s}>
                        {s.startsWith('\\') ? (
                          <span dangerouslySetInnerHTML={{ __html: katex.renderToString(s, { throwOnError: false }) }} />
                        ) : s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Editor & Preview Panes */}
        <div className="split-view">
          <section className="pane">
            <div className="pane-header">
              <div className="pane-title"><Code2 size={16} /> Source Editor</div>
              <div className="pane-meta">
                <span>{files[activeFileIndex].content.length} characters</span>
              </div>
            </div>
            <div className="editor-wrapper">
              <Editor
                value={files[activeFileIndex].content}
                onValueChange={updateActiveContent}
                highlight={code => highlight(code, languages.latex, 'latex')}
                padding={25}
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 15,
                  minHeight: '100%',
                  color: 'inherit'
                }}
              />
            </div>
          </section>

          <section className="pane preview-pane" ref={previewRef}>
            <div className="pane-header">
              <div className="pane-title"><Files size={16} /> Document View</div>
              <div className="pane-controls">
                <span>Zoom: 100%</span>
              </div>
            </div>
            <div className="preview-container">
              <div className="paper">
                <LatexRenderer content={files[activeFileIndex].content} />
                {files.find(f => f.type === 'bib') && files[activeFileIndex].type === 'tex' && (
                  <div className="bib-section">
                    <h2 className="latex-h2">References</h2>
                    <div className="references">
                      {files.find(f => f.type === 'bib')?.content.split('\n').filter(l => l.includes('title')).map(ref => (
                        <div key={ref} className="ref-item">• {ref.replace(/.*title = \{(.*)\},/, '$1')}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Logs Panel */}
      <footer className="advanced-footer">
        <div className="log-panel">
          <div className="log-header">
            <Info size={12} /> Console Logs
          </div>
          <div className="log-entries">
            {logs.map((log, i) => <div key={i} className="log-entry">{'>'} {log}</div>)}
          </div>
        </div>
        <div className="footer-bar">
          <div className="f-left">
            <CheckCircle2 size={12} color="#22c55e" />
            <span>Project Valid</span>
            <span className="divider"></span>
            <span>UTF-8</span>
          </div>
          <div className="f-right">
            <span>KaTeX Engine: Enabled</span>
            <span className="divider"></span>
            <span>{files[activeFileIndex].name}</span>
          </div>
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
        .replace(/\\begin\{itemize\}/g, '<ul class="latex-ul">')
        .replace(/\\end\{itemize\}/g, '</ul>')
        .replace(/\\item (.*?)/g, '<li>$1</li>')
        .replace(/\n\n/g, '<br/><br/>');

      containerRef.current.innerHTML = html;
      renderMathInElement(containerRef.current);
    }
  }, [content]);

  return <div ref={containerRef} className="latex-document" />;
};

const renderMathInElement = (elem: HTMLElement) => {
  const text = elem.innerHTML;

  let newHtml = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
    try {
      return `<div class="math-block">${katex.renderToString(math, { displayMode: true, throwOnError: false })}</div>`;
    } catch { return `<span style="color: red">${math}</span>`; }
  });

  newHtml = newHtml.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      return `<div class="math-block">${katex.renderToString(math, { displayMode: true, throwOnError: false })}</div>`;
    } catch { return math; }
  });

  newHtml = newHtml.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
    try {
      return `<span class="math-inline">${katex.renderToString(math, { displayMode: false, throwOnError: false })}</span>`;
    } catch { return math; }
  });

  newHtml = newHtml.replace(/\$([\s\S]*?)\$/g, (_, math) => {
    try {
      return `<span class="math-inline">${katex.renderToString(math, { displayMode: false, throwOnError: false })}</span>`;
    } catch { return math; }
  });

  elem.innerHTML = newHtml;
};

export default App;
