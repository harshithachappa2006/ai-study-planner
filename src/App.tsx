import React, { useState } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { StudyPlanPage } from './components/StudyPlanPage';
import { LoadingOverlay } from './components/LoadingOverlay';
import { N8nChatWidget } from './components/N8nChatWidget';
import { StudyPlanResponse, CreatePlanRequest, AdjustPlanRequest } from './types/studyPlan';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [page, setPage] = useState<'home' | 'plan'>('home');
  const [currentPlan, setCurrentPlan] = useState<StudyPlanResponse | null>(null);
  const [originalSyllabus, setOriginalSyllabus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAdjusting, setIsAdjusting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle plan creation
  const handleCreatePlan = async (data: CreatePlanRequest) => {
    setIsLoading(true);
    setErrorMessage(null);
    setOriginalSyllabus(data.syllabus);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${response.status}`);
      }

      const plan: StudyPlanResponse = await response.json();
      setCurrentPlan(plan);
      setPage('plan');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Failed to create study plan:', err);
      setErrorMessage(
        err?.message || 'Failed to generate study plan. Please verify the syllabus and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle plan adaptation / adjustment
  const handleAdjustPlan = async (data: AdjustPlanRequest) => {
    setIsAdjusting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/adjust-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${response.status}`);
      }

      const updatedPlan: StudyPlanResponse = await response.json();
      setCurrentPlan(updatedPlan);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Failed to adjust plan:', err);
      setErrorMessage(
        err?.message || 'Failed to reorganize plan with AI agent. Please try again.'
      );
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleReset = () => {
    setPage('home');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      <Header
        currentPage={page}
        onReset={handleReset}
        subject={currentPlan?.subject}
      />

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto px-4 mt-4 w-full">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Action failed</span>
                <span>{errorMessage}</span>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 underline shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Router */}
      <main className="flex-1 pb-16">
        {page === 'home' || !currentPlan ? (
          <HomePage onSubmit={handleCreatePlan} isLoading={isLoading} />
        ) : (
          <StudyPlanPage
            plan={currentPlan}
            originalSyllabus={originalSyllabus}
            onBack={() => setPage('home')}
            onAdjustPlan={handleAdjustPlan}
            isAdjusting={isAdjusting}
          />
        )}
      </main>

      {/* Interactive Loading Overlays */}
      {isLoading && <LoadingOverlay isAdjusting={false} />}
      {isAdjusting && <LoadingOverlay isAdjusting={true} />}

      {/* n8n Live Chatbot Integration */}
      <N8nChatWidget />

      {/* Clean Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} AI Study Planner • Powered by Google Gemini AI</p>
          <p className="text-slate-400">Built for fast, stress-free student exam preparation</p>
        </div>
      </footer>
    </div>
  );
}
