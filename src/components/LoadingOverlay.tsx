import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, CheckCircle2 } from 'lucide-react';

interface LoadingOverlayProps {
  isAdjusting?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isAdjusting = false }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = isAdjusting
    ? [
        'Analyzing new time constraint & agent goal...',
        'Re-prioritizing highest-yield topics...',
        'Balancing minute allocations per session...',
        'Updating practice questions & revision checklist...',
      ]
    : [
        'Parsing syllabus modules and topics...',
        'Evaluating exam weightage and prerequisites...',
        'Allocating precise study time blocks...',
        'Drafting 2-mark & 5-mark practice questions...',
        'Assembling revision checklist...',
      ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 mx-auto flex items-center justify-center text-indigo-600 relative">
          <Brain className="w-8 h-8 animate-pulse text-indigo-600" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-white animate-ping" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            {isAdjusting ? 'AI Study Agent is Adapting Plan' : 'AI Study Agent is Planning'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Using Google Gemini 3.8 Flash to structure your study strategy
          </p>
        </div>

        {/* Step-by-step progress */}
        <div className="space-y-2.5 text-left bg-slate-50 border border-slate-100 p-4 rounded-2xl">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                className={`flex items-center gap-2.5 text-xs transition-colors ${
                  isCompleted
                    ? 'text-emerald-700 font-semibold'
                    : isCurrent
                    ? 'text-indigo-700 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
                <span>{step}</span>
              </div>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          Optimizing for maximum marks and practical pacing
        </div>
      </div>
    </div>
  );
};
