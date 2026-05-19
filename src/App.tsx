/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as pdfjs from 'pdfjs-dist';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowLeft, 
  Upload, 
  Book as BookIcon, 
  Settings as SettingsIcon,
  ChevronRight,
  Filter,
  Languages,
  Maximize2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  List,
  Pencil,
  Save
} from 'lucide-react';
import { PRELOADED_BOOKS, Book } from './data/books';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.7.284/build/pdf.worker.mjs`;
  
  // Add global error logging to help debug "Uncaught" errors
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('GLOBAL ERROR:', { message, source, lineno, colno, error });
    return false;
  };

  window.onunhandledrejection = function(event) {
    console.error('UNHANDLED REJECTION:', event.reason);
  };
}

type View = 'LIBRARY' | 'READER';

interface Chapter {
  id: string;
  title: string;
  wordIndex: number;
}

// --- Subcomponents ---

interface RecordCardProps {
  book: Book;
  onClick: () => void | Promise<void>;
  onEdit?: (book: Book) => void;
  key?: string | number;
}

function RecordCard({ book, onClick, onEdit }: RecordCardProps) {
  const subjects = book.subjects?.slice(0, 2) || [];
  const displaySynopsis = book.synopsis || book.description || 'No synopsis available.';

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-pointer flex flex-col gap-4 bg-md-surface-variant/20 p-3 rounded-3xl border border-md-outline/5 hover:bg-md-primary/5 hover:border-md-primary/20 transition-all relative"
    >
      <div 
        onClick={onClick}
        className="aspect-[3/4] rounded-2xl overflow-hidden bg-md-surface-variant relative shadow-md group-hover:shadow-xl transition-all border border-md-outline/10"
      >
        {book.coverImage ? (
          <img 
            src={book.coverImage} 
            alt={book.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-md-primary/20 to-md-secondary/20 flex flex-col items-center justify-center p-4 text-center">
             <div className="text-4xl opacity-10 mb-2">
                {book.isCustom ? <Upload size={48} /> : <BookIcon size={48} />}
             </div>
             <span className="text-xs font-display font-medium text-md-on-surface/50 line-clamp-3">
               {book.title}
             </span>
          </div>
        )}
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-md-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-md-primary text-md-on-primary rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
            <Play size={24} fill="currentColor" />
          </div>
        </div>

        {/* Edit Button if applicable */}
        {onEdit && book.isCustom && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(book);
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-md-surface/80 backdrop-blur-md rounded-full flex items-center justify-center text-md-primary shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-md-primary hover:text-md-on-primary z-10"
          >
            <Pencil size={14} />
          </button>
        )}

        {/* Progress bar if partial */}
        {book.progress > 0 && (
           <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
             <div 
               className="h-full bg-md-primary transition-all duration-500" 
               style={{ width: `${Math.min(100, (book.progress / (book.content.split(/\s+/).length || 1)) * 100)}%` }}
             />
           </div>
        )}

        <div className="absolute top-3 left-3 bg-md-surface/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-md-on-surface uppercase tracking-wider border border-md-outline/10 group-hover:bg-md-primary group-hover:text-md-on-primary transition-colors">
          {book.language?.slice(0, 3).toUpperCase() || 'NEW'}
        </div>
      </div>
      
      <div 
        onClick={onClick}
        className="px-1 flex flex-col gap-1.5 min-h-[100px]"
      >
        <div>
          <h3 className="font-display font-bold text-sm leading-tight text-md-on-surface group-hover:text-md-primary transition-colors line-clamp-1">
            {book.title}
          </h3>
          <p className="text-[10px] text-md-on-surface-variant font-medium uppercase tracking-wider mt-0.5 line-clamp-1 opacity-70">
            {book.author}
          </p>
        </div>

        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {subjects.map((s: string, i: number) => (
              <span key={i} className="text-[8px] bg-md-primary/10 text-md-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tight truncate max-w-full">
                {s.split('--')[0].split(' - ')[0].trim()}
              </span>
            ))}
          </div>
        )}

        <p className="text-[10px] text-md-on-surface-variant leading-relaxed line-clamp-2 opacity-60 italic">
          {displaySynopsis}
        </p>

        {(book.publicationYear || book.isCustom) && (
          <div className="mt-auto pt-2 flex justify-between items-center border-t border-md-outline/5">
             <span className="text-[9px] font-mono text-md-on-surface-variant/40">
                {book.publicationYear ? `Published ${book.publicationYear}` : 'Public Domain'}
             </span>
             {book.isCustom && <span className="text-[9px] bg-md-secondary/10 text-md-secondary px-1.5 rounded-sm font-bold uppercase tracking-tighter">Uploaded</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// --- Metadata Editor Component ---

interface MetadataEditorProps {
  book: Book;
  onSave: (updated: Book) => void;
  onCancel: () => void;
}

function MetadataEditor({ book, onSave, onCancel }: MetadataEditorProps) {
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    subjects: book.subjects?.join(', ') || '',
    publicationYear: book.publicationYear?.toString() || '',
    synopsis: book.synopsis || book.description || ''
  });

  const handleSave = () => {
    onSave({
      ...book,
      title: formData.title,
      author: formData.author,
      subjects: formData.subjects.split(',').map(s => s.trim()).filter(Boolean),
      publicationYear: formData.publicationYear ? parseInt(formData.publicationYear) : undefined,
      synopsis: formData.synopsis
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-md-surface w-full max-w-lg rounded-[2rem] shadow-2xl p-8 border border-md-outline/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-display font-bold">Metadata Editor</h3>
            <p className="text-[10px] text-md-primary font-black uppercase tracking-widest mt-1">Refine track details</p>
          </div>
          <button 
            onClick={onCancel}
            className="w-10 h-10 rounded-full hover:bg-md-surface-variant flex items-center justify-center text-md-on-surface-variant"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant ml-3">Track Title</label>
            <input 
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-md-surface-variant/50 border border-transparent focus:border-md-primary rounded-2xl px-4 py-3 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant ml-3">Artist / Author</label>
            <input 
              value={formData.author} 
              onChange={e => setFormData({ ...formData, author: e.target.value })}
              className="w-full bg-md-surface-variant/50 border border-transparent focus:border-md-primary rounded-2xl px-4 py-3 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant ml-3">Genres (Comma separated)</label>
              <input 
                value={formData.subjects} 
                onChange={e => setFormData({ ...formData, subjects: e.target.value })}
                className="w-full bg-md-surface-variant/50 border border-transparent focus:border-md-primary rounded-2xl px-4 py-3 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant ml-3">Year</label>
              <input 
                type="number"
                value={formData.publicationYear} 
                onChange={e => setFormData({ ...formData, publicationYear: e.target.value })}
                className="w-full bg-md-surface-variant/50 border border-transparent focus:border-md-primary rounded-2xl px-4 py-3 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant ml-3">Synopsis</label>
            <textarea 
              rows={3}
              value={formData.synopsis} 
              onChange={e => setFormData({ ...formData, synopsis: e.target.value })}
              className="w-full bg-md-surface-variant/50 border border-transparent focus:border-md-primary rounded-2xl px-4 py-3 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button 
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-2xl border border-md-outline/20 font-bold text-sm hover:bg-md-surface-variant transition-all"
          >
            Discard
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 px-6 py-3 rounded-2xl bg-md-primary text-md-on-primary font-bold text-sm shadow-lg shadow-md-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Save Metadata
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      setHasError(true);
      setErrorMsg(event.message || 'An unexpected error occurred');
    };
    window.addEventListener('error', handleGlobalError);
    return () => window.removeEventListener('error', handleGlobalError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-md-surface text-md-on-surface flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-display font-medium mb-4">Something went wrong</h1>
        <p className="text-md-on-surface-variant mb-8 max-w-md">{errorMsg}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-md-primary text-md-on-primary font-medium rounded-full hover:opacity-90 transition-all shadow-lg"
        >
          Reload Application
        </button>
      </div>
    );
  }

  return <AppContent />;
}

function AppContent() {
  // --- Global State ---
  const [view, setView] = useState<View>('LIBRARY');
  const [books, setBooks] = useState<Book[]>([]);
  const [apiBooks, setApiBooks] = useState<any[]>([]);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);
  const [languageFilter, setLanguageFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- Pause Triggers Settings ---
  const [pauseTriggers, setPauseTriggers] = useState({
    lineBreaks: true,
    periods: true,
    questionMarks: true,
    headers: true
  });

  // --- Upload State ---
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });
  
  // --- Reader Settings ---
  const [wpm, setWpm] = useState(300);
  const [fontSize, setFontSize] = useState(72);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isTOCOpen, setIsTOCOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // --- Refs ---
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view === 'READER') {
        if (e.key.toLowerCase() === 'f') setIsFocusMode(prev => !prev);
        if (e.code === 'Space') {
          e.preventDefault();
          setIsPlaying(prev => !prev);
        }
        if (e.key === 'Escape' && isFocusMode) setIsFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, isFocusMode]);

  // --- Initialization ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem('swiftread_books');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const merged = PRELOADED_BOOKS.map(pb => {
            const s = parsed.find((b: Book) => b.id === pb.id);
            return s ? { ...pb, progress: s.progress } : pb;
          });
          const custom = parsed.filter((b: Book) => b.isCustom);
          setBooks([...merged, ...custom]);
        } else {
          setBooks(PRELOADED_BOOKS);
        }
      } else {
        setBooks(PRELOADED_BOOKS);
      }
    } catch (e) {
      console.error('Failed to load books from localStorage', e);
      setBooks(PRELOADED_BOOKS);
    }

    try {
      const savedSettings = localStorage.getItem('swiftread_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.pauseTriggers) setPauseTriggers(parsed.pauseTriggers);
        if (parsed.wpm) setWpm(parsed.wpm);
        if (parsed.fontSize) setFontSize(parsed.fontSize);
      }
    } catch (e) {
      console.error('Failed to load settings from localStorage', e);
    }
  }, []);

  // --- Persistence ---
  useEffect(() => {
    if (books.length > 0) {
      localStorage.setItem('swiftread_books', JSON.stringify(books));
    }
  }, [books]);

  useEffect(() => {
    localStorage.setItem('swiftread_settings', JSON.stringify({
      pauseTriggers,
      wpm,
      fontSize
    }));
  }, [pauseTriggers, wpm, fontSize]);

  const fetchApiBooks = async () => {
    setIsApiLoading(true);
    try {
      let url = 'https://gutendex.com/books/';
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (languageFilter !== 'All') {
        params.append('languages', languageFilter.toLowerCase());
      } else if (!searchQuery) {
        // If no search and no language, just get popular ones
        params.append('sort', 'popular');
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Gutendex error: ${response.status}`);
      }
      const data = await response.json();
      setApiBooks(data.results || []);
    } catch (error) {
      console.error('Failed to fetch from Gutendex:', error);
    } finally {
      setIsApiLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApiBooks();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, languageFilter]);

  const currentBook = useMemo(() => 
    books.find(b => b.id === currentBookId), 
    [books, currentBookId]
  );

  const words = useMemo(() => {
    if (!currentBook) return [];
    const contentWithMarkers = currentBook.content.replace(/\n\s*\n/g, ' ##PAUSE## ');
    return contentWithMarkers.split(/\s+/).filter(w => w.length > 0);
  }, [currentBook]);

  const chapters = useMemo<Chapter[]>(() => {
    if (!currentBook || words.length === 0) return [];
    
    const chapterList: Chapter[] = [];
    const chapterPatterns = [
      /^(CHAPTER|CAPÍTULO|LIVRE|SECCIÓN|PART|PARTE|CHAPTER|BOOK)\s+([IVXLCDM\d]+)/i,
      /^[IVXLCDM]+\.$/i,
      /^(\d+)\.\s+(\w+)/i
    ];

    let lastPauseIndex = -1;
    
    // We look for chapters at the beginning of segments (after a ##PAUSE## or at start)
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word === '##PAUSE##') {
        lastPauseIndex = i;
        continue;
      }

      // If we are at the start of a "block" (word after a pause)
      if (i === 0 || words[i-1] === '##PAUSE##') {
        const lineStart = words.slice(i, i + 5).join(' ');
        
        for (const pattern of chapterPatterns) {
          const match = lineStart.match(pattern);
          if (match) {
            const title = match[0].trim().toUpperCase();
            // Avoid duplicates at close proximity
            if (chapterList.length === 0 || i - chapterList[chapterList.length - 1].wordIndex > 50) {
              chapterList.push({
                id: `chapter-${i}`,
                title: title,
                wordIndex: i
              });
              break;
            }
          }
        }
      }
    }

    return chapterList;
  }, [currentBook, words]);

  const currentChapter = useMemo(() => {
    if (chapters.length === 0) return null;
    let found = chapters[0];
    for (const ch of chapters) {
      if (ch.wordIndex <= currentIndex) {
        found = ch;
      } else {
        break;
      }
    }
    return found;
  }, [chapters, currentIndex]);

  const filteredBooks = useMemo(() => {
    // We only filter local books here. API books are handled separately.
    return books.filter(book => {
      // Local documents don't really use language filter for Gutendex logic, 
      // but we filter them if they are uploaded or preloaded.
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;

      const matchesTitle = book.title.toLowerCase().includes(query);
      const matchesAuthor = book.author.toLowerCase().includes(query);

      return matchesTitle || matchesAuthor;
    });
  }, [books, searchQuery]);

  const languages = [
    { label: 'All', value: 'All' },
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' },
    { label: 'Italian', value: 'it' },
    { label: 'Portuguese', value: 'pt' }
  ];

  // --- Actions ---
  const openBookFromApi = async (gutendexBook: any) => {
    // Check if we already have this book in our local list (e.g. from a previous fetch/session)
    const existing = books.find(b => b.id === `guten-${gutendexBook.id}`);
    if (existing) {
      openBook(existing.id);
      return;
    }

    setIsContentLoading(true);
    try {
      // Find a suitable text/plain format
      const formats = gutendexBook.formats || {};
      const textUrl = formats['text/plain; charset=utf-8'] || 
                      formats['text/plain; charset=us-ascii'] || 
                      formats['text/plain'] ||
                      (Object.keys(formats).find(f => f.startsWith('text/plain')) && formats[Object.keys(formats).find(f => f.startsWith('text/plain'))!]) ||
                      formats['text/html'] || 
                      Object.values(formats).find((v: any) => typeof v === 'string' && v.endsWith('.txt'));

      if (!textUrl) {
        throw new Error('No readable text format found for this book.');
      }

      const proxyUrl = `/api/proxy?url=${encodeURIComponent(textUrl as string)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        let errMsg = `Failed to fetch book content (${response.status})`;
        try {
          const errData = await response.json();
          if (errData.error) errMsg = errData.error;
        } catch (e) { /* ignore json parse error */ }
        throw new Error(errMsg);
      }
      
      const content = await response.text();

      const author = gutendexBook.authors?.[0]?.name || 'Unknown Author';
      const newBook: Book = {
        id: `guten-${gutendexBook.id}`,
        title: gutendexBook.title || 'Untitled',
        author: author,
        language: gutendexBook.languages?.[0] || 'Unknown',
        content: content,
        progress: 0,
        coverImage: formats['image/jpeg'] || formats['image/png'],
        subjects: gutendexBook.subjects || [],
        synopsis: (gutendexBook.subjects?.[0] || 'Classic literature from the public domain.')
      };

      setBooks(prev => [...prev, newBook]);
      setCurrentBookId(newBook.id);
      setCurrentIndex(0);
      setView('READER');
      setIsPlaying(false);
    } catch (error) {
      console.error('Failed to load book content:', error);
      setUploadStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to fetch book content.' 
      });
    } finally {
      setIsContentLoading(false);
    }
  };

  const openBook = (id: string) => {
    const book = books.find(b => b.id === id);
    if (book) {
      setCurrentBookId(id);
      let startIdx = book.progress || 0;
      setCurrentIndex(startIdx);
      setView('READER');
      setIsPlaying(false);
    }
  };

  const closeReader = () => {
    if (currentBookId) {
      setBooks(prev => prev.map(b => 
        b.id === currentBookId ? { ...b, progress: currentIndex } : b
      ));
    }
    setView('LIBRARY');
    setIsPlaying(false);
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }
    
    return fullText;
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      let content = '';
      if (file.name.endsWith('.pdf')) {
        content = await extractTextFromPDF(file);
      } else if (file.name.endsWith('.txt')) {
        content = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsText(file);
        });
      } else {
        throw new Error('Unsupported file type. Please upload .txt or .pdf files.');
      }

      if (!content || content.trim().length === 0) {
        throw new Error('The file appears to be empty or could not be read.');
      }

      const newBook: Book = {
        id: `custom-${Date.now()}`,
        title: file.name.replace(/\.(txt|pdf)$/, ''),
        author: 'Uploaded Document',
        language: 'Custom',
        content,
        progress: 0,
        isCustom: true,
        subjects: ['Document'],
        synopsis: 'A user-uploaded document ready for speed reading.',
        publicationYear: new Date().getFullYear()
      };

      setBooks(prev => [...prev, newBook]);
      setUploadStatus({ type: 'success', message: `"${file.name}" uploaded successfully!` });
      
      // Auto-clear success message after 3s
      setTimeout(() => setUploadStatus(prev => prev.type === 'success' ? { type: null, message: '' } : prev), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to process the file.' 
      });
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  // --- RSVP Loop ---
  useEffect(() => {
    if (isPlaying && currentIndex < words.length) {
      const interval = 60000 / wpm;
      
      timerRef.current = setTimeout(() => {
        const nextIndex = currentIndex + 1;
        
        if (nextIndex < words.length) {
          const nextWord = words[nextIndex];
          const nextWordUpper = nextWord.toUpperCase();
          const currentWord = words[currentIndex];
          
          const isHeader = pauseTriggers.headers && (nextWordUpper === 'CHAPTER' || nextWordUpper === 'LIVRE' || nextWordUpper === 'CAPÍTULO');
          const isPauseMarker = nextWord === '##PAUSE##';
          const isPeriod = pauseTriggers.periods && (currentWord.endsWith('.') || currentWord.endsWith('!'));
          const isQuestion = pauseTriggers.questionMarks && currentWord.endsWith('?');

          // Always skip markers if lineBreaks is disabled
          if (isPauseMarker && !pauseTriggers.lineBreaks) {
            setCurrentIndex(nextIndex + 1);
            return;
          }

          if (isHeader || (isPauseMarker && pauseTriggers.lineBreaks) || isPeriod || isQuestion) {
            setIsPlaying(false);
            if (isPauseMarker) {
              setCurrentIndex(nextIndex + 1);
              return;
            }
          }
        }

        setCurrentIndex(nextIndex);
      }, interval);
    } else if (currentIndex >= words.length) {
      setIsPlaying(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentIndex, words, wpm]);

  // --- Pivot Logic ---
  const renderWord = (word: string) => {
    if (!word) return null;
    
    let pivotIndex = Math.floor((word.length - 1) / 2);
    if (word.length >= 2 && word.length <= 5) pivotIndex = 1;
    else if (word.length >= 6 && word.length <= 9) pivotIndex = 2;
    else if (word.length >= 10 && word.length <= 13) pivotIndex = 3;
    else if (word.length >= 14) pivotIndex = 4;

    const left = word.substring(0, pivotIndex);
    const pivot = word.substring(pivotIndex, pivotIndex + 1);
    const right = word.substring(pivotIndex + 1);

    return (
      <div 
        className="grid grid-cols-[1fr_2ch_1fr] items-center font-mono font-bold tracking-tight h-80 w-full max-w-5xl relative" 
        style={{ fontSize: `${fontSize}px` }}
      >
        {/* Word Background Glow */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-32 bg-[#fe7f2d]/5 blur-3xl rounded-full pointer-events-none" />
        
        {/* Left segment - right aligned */}
        <div className="flex justify-end pr-[0.1ch] z-10">
          <span className="text-white opacity-80 whitespace-pre">{left}</span>
        </div>
        
        {/* Pivot segment - center aligned in its own column */}
        <div className="flex justify-center text-[#fe7f2d] bg-[#fe7f2d]/10 rounded-sm relative z-10 drop-shadow-[0_0_12px_rgba(254,127,45,0.4)]">
          {pivot}
          {/* Internal Focus Guides for extra precision */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-px h-12 bg-[#fe7f2d] shadow-[0_0_12px_rgba(254,127,45,0.8)]"></div>
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-px h-12 bg-[#fe7f2d] shadow-[0_0_12px_rgba(254,127,45,0.8)]"></div>
        </div>
        
        {/* Right segment - left aligned */}
        <div className="flex justify-start pl-[0.1ch] z-10">
          <span className="text-white opacity-80 whitespace-pre">{right}</span>
        </div>
      </div>
    );
  };

  const rewind = () => {
    setCurrentIndex(prev => Math.max(0, prev - 15));
  };

  return (
    <div id="app-root" className="min-h-screen bg-md-surface text-md-on-surface font-sans selection:bg-md-primary/30 flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {view === 'LIBRARY' ? (
          <motion.div
            key="library"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col overflow-hidden relative"
          >
            {/* M3 Style Jukebox Header */}
            <header className="h-20 shrink-0 flex items-center justify-between px-6 md:px-12 border-b border-md-outline/10 bg-md-surface/80 backdrop-blur-md sticky top-0 z-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-md-primary rounded-xl flex items-center justify-center text-md-on-primary shadow-inner shadow-black/20">
                  <Play size={24} fill="currentColor" />
                </div>
                <div>
                  <h1 className="text-xl font-display font-bold tracking-tight">SONIC<span className="text-md-primary font-light">READER</span></h1>
                  <p className="text-[10px] uppercase tracking-widest text-md-on-surface-variant font-bold">Jukebox Edition</p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-4">
                <div className="relative group hidden sm:block">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant" />
                  <input 
                    type="text"
                    placeholder="Search your records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-md-surface-variant/50 border border-transparent focus:border-md-primary rounded-full py-2 pl-12 pr-4 text-sm w-64 md:w-80 outline-none transition-all placeholder:text-md-on-surface-variant/50"
                  />
                </div>

                <button 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isSettingsOpen ? 'bg-md-primary-container text-md-on-primary-container' : 'text-md-on-surface-variant hover:bg-md-surface-variant'}`}
                >
                  <SettingsIcon size={20} />
                </button>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto scrollbar-hide px-6 md:px-12 py-8">
              {/* Upload FAB - Material 3 Style */}
              <label className="fixed bottom-8 right-8 z-[60] group cursor-pointer">
                <input type="file" accept=".txt,.pdf" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
                <div className="flex items-center gap-3 bg-md-primary-container text-md-on-primary-container px-4 h-14 rounded-2xl shadow-xl hover:shadow-2xl transition-all group-hover:scale-105 active:scale-95 border border-white/10">
                  {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                  <span className="font-bold text-sm uppercase tracking-wider pr-2">Add Track</span>
                </div>
              </label>

              <div className="max-w-7xl mx-auto space-y-12 pb-24">
                {/* Discovery Section */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-display font-medium">Public Records</h2>
                    <div className="flex items-center gap-2 p-1 bg-md-surface-variant/30 rounded-full">
                      {languages.map(lang => (
                        <button
                          key={lang.value}
                          onClick={() => setLanguageFilter(lang.value)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                            languageFilter === lang.value 
                              ? 'bg-md-primary text-md-on-primary' 
                              : 'text-md-on-surface-variant hover:text-md-on-surface'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {isApiLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="aspect-[3/4] bg-md-surface-variant/20 animate-pulse rounded-2xl" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {apiBooks.map(gb => (
                        <RecordCard 
                          key={gb.id} 
                          book={{
                            id: `guten-${gb.id}`,
                            title: gb.title,
                            author: gb.authors?.[0]?.name || 'Unknown',
                            coverImage: gb.formats?.['image/jpeg'] || gb.formats?.['image/png'],
                            language: gb.languages?.[0] || 'en',
                            subjects: gb.subjects || [],
                            synopsis: gb.subjects?.[0] || 'Classic public domain literature.',
                            content: '',
                            progress: 0
                          }} 
                          onClick={() => openBookFromApi(gb)}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* My Library Section */}
                <section>
                  <div className="flex items-center justify-between mb-6 border-t border-md-outline/10 pt-12">
                    <h2 className="text-2xl font-display font-medium">My Collection</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {filteredBooks.map(book => (
                      <RecordCard 
                        key={book.id} 
                        book={book} 
                        onClick={() => openBook(book.id)} 
                        onEdit={setEditingBook}
                      />
                    ))}
                  </div>
                </section>
              </div>
            </main>
          </motion.div>
        ) : (
          <motion.div
            key="reader"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-0 bg-md-surface z-[100] flex flex-col overflow-hidden"
          >
            {/* Jukebox Playback Stage */}
            <div className={`flex-1 flex flex-col relative transition-all duration-700 ${isFocusMode ? 'bg-black' : 'bg-gradient-to-b from-md-surface to-md-surface-variant/20'}`}>
              
              {/* Top Controls */}
              <nav className={`h-20 shrink-0 flex items-center justify-between px-6 md:px-12 z-20 ${isFocusMode ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-500`}>
                <button 
                  onClick={closeReader}
                  className="w-12 h-12 rounded-full hover:bg-md-surface-variant flex items-center justify-center text-md-on-surface transition-all active:scale-95"
                >
                  <ArrowLeft size={24} />
                </button>
                
                <div className="flex flex-col items-center max-w-[50vw]">
                  <span className="text-[10px] text-md-primary font-bold uppercase tracking-widest mb-1">Now Playing</span>
                  <h2 className="text-sm font-display font-bold truncate w-full text-center">{currentBook?.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                     onClick={() => setIsTOCOpen(true)}
                     className="w-12 h-12 rounded-full hover:bg-md-surface-variant flex items-center justify-center text-md-on-surface transition-all"
                     title="Tracklist"
                  >
                    <List size={20} />
                  </button>
                  <button 
                     onClick={() => setIsFocusMode(!isFocusMode)}
                     className="w-12 h-12 rounded-full hover:bg-md-surface-variant flex items-center justify-center text-md-on-surface transition-all"
                  >
                    <Maximize2 size={20} />
                  </button>
                </div>
              </nav>
              <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
                {/* Visual Record / Spinner background element */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                   <div className="w-[80vh] h-[80vh] rounded-full border border-md-primary/5 absolute animate-[spin_20s_linear_infinite]" />
                   <div className="w-[60vh] h-[60vh] rounded-full border border-md-primary/10 absolute animate-[spin_15s_linear_infinite]" />
                   <div className="w-[40vh] h-[40vh] rounded-full border border-md-primary/20 absolute animate-[spin_10s_linear_infinite]" />
                </div>

                {/* The RSVP Display */}
                <div 
                  className="relative z-10 w-full max-w-5xl flex items-center justify-center cursor-pointer select-none"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {renderWord(words[currentIndex])}
                </div>

                {/* Context Subtitle */}
                {!isFocusMode && (
                   <div className="absolute bottom-32 text-center text-md-on-surface-variant/40 italic font-serif text-sm max-w-lg">
                      ... {words.slice(Math.max(0, currentIndex - 1), currentIndex).join(' ')} <span className="text-md-primary font-bold">{words[currentIndex]}</span> {words.slice(currentIndex + 1, currentIndex + 2).join(' ')} ...
                   </div>
                )}

                {/* Progress Indicator */}
                {!isFocusMode && (
                  <div className="mt-20 flex flex-col items-center gap-4">
                    <div className="text-[10px] text-md-on-surface-variant font-bold uppercase tracking-[0.2em] opacity-40">
                      {currentChapter ? currentChapter.title : 'Intro'}
                    </div>
                    <div className="w-64 h-1.5 bg-md-surface-variant/30 rounded-full overflow-hidden relative border border-white/5">
                      <motion.div 
                        className="absolute inset-y-0 left-0 bg-md-primary"
                        animate={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Chapter Drawer (Tracklist) */}
              <AnimatePresence>
                {isTOCOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsTOCOpen(false)}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />
                    <motion.div
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-md-surface z-50 shadow-2xl flex flex-col border-l border-md-outline/10"
                    >
                      <div className="p-8 flex items-center justify-between border-b border-md-outline/10">
                        <div>
                          <h3 className="text-xl font-display font-bold">Tracklist</h3>
                          <p className="text-[10px] text-md-primary font-black uppercase tracking-widest mt-1">Book Sections</p>
                        </div>
                        <button 
                          onClick={() => setIsTOCOpen(false)}
                          className="w-10 h-10 rounded-full hover:bg-md-surface-variant flex items-center justify-center text-md-on-surface/60"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto py-4">
                        {chapters.length > 0 ? (
                          <div className="px-4 space-y-1">
                            {chapters.map((ch, idx) => (
                              <button
                                key={ch.id}
                                onClick={() => {
                                  setCurrentIndex(ch.wordIndex);
                                  setIsTOCOpen(false);
                                  setIsPlaying(false);
                                }}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group ${
                                  currentChapter?.id === ch.id 
                                    ? 'bg-md-primary text-md-on-primary' 
                                    : 'hover:bg-md-surface-variant/50 text-md-on-surface'
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-[10px] shrink-0 ${
                                  currentChapter?.id === ch.id ? 'bg-white/20' : 'bg-md-surface-variant text-md-on-surface-variant'
                                }`}>
                                  {(idx + 1).toString().padStart(2, '0')}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-sm truncate uppercase tracking-tight">{ch.title}</div>
                                  <div className={`text-[10px] mt-0.5 opacity-60 font-medium ${currentChapter?.id === ch.id ? 'text-white' : 'text-md-on-surface-variant'}`}>
                                    {Math.round((ch.wordIndex / words.length) * 100)}% through
                                  </div>
                                </div>
                                {currentChapter?.id === ch.id && (
                                  <motion.div layoutId="active-indicator" className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-40">
                            <List size={40} className="mb-4" />
                            <p className="text-sm font-medium">No chapters detected in this track.</p>
                          </div>
                        )}
                      </div>

                      <div className="p-6 bg-md-surface-variant/10 border-t border-md-outline/10">
                         <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-md-on-surface-variant/50">
                            <span>Total Sections</span>
                            <span>{chapters.length} Tracks</span>
                         </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

            {/* Footer - Robust Responsive Grid */}
              {/* Playback Controls (Deck) */}
              <footer className={`h-40 shrink-0 bg-md-surface/80 backdrop-blur-xl border-t border-md-outline/10 z-20 flex flex-col ${isFocusMode ? 'opacity-0 pointer-events-none translate-y-20' : 'opacity-100 translate-y-0'} transition-all duration-500`}>
                <div className="flex-1 flex items-center justify-center gap-12 max-w-7xl mx-auto w-full px-6">
                  
                  {/* Tempo Control */}
                  <div className="hidden md:flex flex-col gap-2 w-48">
                    <div className="flex justify-between text-[10px] font-bold text-md-on-surface-variant uppercase tracking-widest">
                      <span>Tempo</span>
                      <span className="text-md-primary">{wpm} WPM</span>
                    </div>
                    <input 
                      type="range" min="100" max="1000" step="25"
                      value={wpm} onChange={(e) => setWpm(parseInt(e.target.value))}
                      className="accent-md-primary h-1.5 bg-md-surface-variant rounded-full appearance-none outline-none"
                    />
                  </div>

                  {/* Main Playback Controls */}
                  <div className="flex items-center gap-8">
                    <button 
                      onClick={rewind}
                      className="w-12 h-12 rounded-full border border-md-outline/20 hover:bg-md-primary/10 flex items-center justify-center text-md-on-surface transition-all active:scale-90"
                    >
                      <RotateCcw size={20} />
                    </button>

                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-20 h-20 bg-md-primary text-md-on-primary rounded-[2rem] flex items-center justify-center shadow-xl shadow-md-primary/20 hover:shadow-md-primary/40 transition-all active:scale-95"
                    >
                      {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
                    </button>

                    <button 
                      onClick={() => { setCurrentIndex(0); setIsPlaying(false); }}
                      className="w-12 h-12 rounded-full border border-md-outline/20 hover:bg-md-primary/10 flex items-center justify-center text-md-on-surface transition-all active:scale-90"
                    >
                      <RotateCcw size={20} className="scale-x-[-1]" />
                    </button>
                  </div>

                  {/* Size Control */}
                  <div className="hidden md:flex flex-col gap-2 w-48">
                    <div className="flex justify-between text-[10px] font-bold text-md-on-surface-variant uppercase tracking-widest">
                      <span>Visual Scale</span>
                      <span className="text-md-primary">{fontSize}px</span>
                    </div>
                    <div className="flex bg-md-surface-variant/30 rounded-full p-1 border border-md-outline/5">
                      {[48, 72, 96, 120].map(size => (
                        <button
                          key={size}
                          onClick={() => setFontSize(size)}
                          className={`flex-1 py-1 rounded-full text-[10px] font-bold transition-all ${fontSize === size ? 'bg-md-primary text-md-on-primary shadow-sm' : 'text-md-on-surface-variant'}`}
                        >
                          {size === 48 ? 'XS' : size === 72 ? 'S' : size === 96 ? 'M' : 'L'}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
                
                {/* Visual timeline */}
                <div className="h-1 w-full bg-md-surface-variant/20 relative cursor-pointer group" onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const ratio = x / rect.width;
                  setCurrentIndex(Math.floor(ratio * words.length));
                }}>
                  <div className="absolute inset-y-0 left-0 bg-md-primary/50 group-hover:bg-md-primary transition-colors" style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }} />
                </div>
              </footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingBook && (
          <MetadataEditor 
            book={editingBook} 
            onSave={(updated) => {
              setBooks(prev => prev.map(b => b.id === updated.id ? updated : b));
              setEditingBook(null);
            }} 
            onCancel={() => setEditingBook(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[70]"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-md-surface rounded-[2.5rem] shadow-2xl p-8 z-[80] border border-md-outline/10"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-display font-medium">Equalizer</h3>
                  <p className="text-[10px] text-md-primary font-black uppercase tracking-widest mt-1">Reader Settings</p>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-md-surface-variant flex items-center justify-center text-md-on-surface-variant"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant">Default Text Size</label>
                    <span className="text-lg font-mono font-bold">{fontSize}px</span>
                  </div>
                  <input 
                    type="range" min="32" max="120" step="4" 
                    value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full accent-md-primary"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-md-on-surface-variant">Intelligent Pauses</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'periods', label: 'Periods' },
                      { id: 'questionMarks', label: 'Questions' },
                      { id: 'lineBreaks', label: 'Breaks' },
                      { id: 'headers', label: 'Chapters' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setPauseTriggers(prev => ({ ...prev, [opt.id]: !prev[opt.id as keyof typeof prev] }))}
                        className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
                          pauseTriggers[opt.id as keyof typeof pauseTriggers] 
                            ? 'bg-md-primary/10 border-md-primary text-md-primary' 
                            : 'bg-md-surface-variant/30 border-transparent text-md-on-surface-variant'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(uploadStatus.type || isContentLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
              isContentLoading 
                ? 'bg-md-surface/90 border-md-primary text-md-on-surface'
                : uploadStatus.type === 'success' 
                  ? 'bg-green-500/90 border-green-400 text-white' 
                  : 'bg-red-500/90 border-red-400 text-white'
            }`}
          >
            {isContentLoading ? <Loader2 size={18} className="animate-spin text-md-primary" /> : uploadStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-xs font-bold uppercase tracking-wider">
              {isContentLoading ? 'Threading the spool...' : uploadStatus.message}
            </span>
            {!isContentLoading && (
              <button 
                onClick={() => setUploadStatus({ type: null, message: '' })}
                className="ml-2 hover:opacity-70"
              >
                <X size={14} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
