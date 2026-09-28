import React from 'react';
import { BookOpen, Sparkles, RotateCcw, MessageSquare } from 'lucide-react';

interface HeaderProps {
  currentPage: 'home' | 'plan';
  onReset?: () => void;
  subject?: string;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onReset, subject }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div 
          onClick={onReset}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-lg">AI Study Planner</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Smart exam prep planner & study agent</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentPage === 'plan' && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              title="Create another plan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{subject ? `New Plan (${subject})` : 'New Plan'}</span>
            </button>
          )}

          <button
            onClick={() => window.openN8nChat?.()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200 cursor-pointer shadow-xs"
            title="Chat with Nathan (n8n AI Assistant)"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Ask n8n Assistant</span>
            <span className="sm:hidden">Chat</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Agent Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};
