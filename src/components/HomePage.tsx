import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, BookOpen, Compass, ArrowRight, Zap, Target } from 'lucide-react';
import { SAMPLE_PRESETS, Preset } from '../data/presets';
import { CreatePlanRequest } from '../types/studyPlan';

interface HomePageProps {
  onSubmit: (data: CreatePlanRequest) => void;
  isLoading: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({ onSubmit, isLoading }) => {
  const [subject, setSubject] = useState('DBMS');
  const [syllabus, setSyllabus] = useState(
    'Normalization, Functional Dependencies, 1NF, 2NF, 3NF, BCNF, Transactions.'
  );
  const [daysRemaining, setDaysRemaining] = useState<number>(2);
  const [dailyHours, setDailyHours] = useState<number>(3);
  const [agentGoal, setAgentGoal] = useState<string>('');
  const [showGoalInput, setShowGoalInput] = useState<boolean>(true);

  const handleApplyPreset = (preset: Preset) => {
    setSubject(preset.subject);
    setSyllabus(preset.syllabus);
    setDaysRemaining(preset.daysRemaining);
    setDailyHours(preset.dailyHours);
    setAgentGoal(preset.goal);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !syllabus.trim()) return;

    onSubmit({
      subject: subject.trim(),
      syllabus: syllabus.trim(),
      daysRemaining: Math.max(1, Number(daysRemaining) || 1),
      dailyHours: Math.max(0.5, Number(dailyHours) || 1),
      agentGoal: agentGoal.trim() || undefined,
    });
  };

  const totalCalculatedHours = Math.round(daysRemaining * dailyHours * 10) / 10;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Intro */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 mb-4 shadow-xs">
          <Zap className="w-3.5 h-3.5 text-indigo-600" />
          <span>Google Gemini AI Study Planner</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Turn Any Syllabus into a <span className="text-indigo-600">Realistic Exam Plan</span>
        </h1>
        <p className="mt-3 text-base text-slate-600 leading-relaxed">
          Paste your exam topics and available study time. Our AI Study Agent analyzes weightage, sequences your study blocks, and generates practice questions with revision checkpoints.
        </p>
      </div>

      {/* Quick Presets Bar for Instant 1-Click Testing */}
      <div className="mb-8 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Compass className="w-4 h-4 text-indigo-500" />
            <span>Try 1-Click Demo Presets</span>
          </div>
          <span className="text-xs text-slate-400">Click to auto-fill</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SAMPLE_PRESETS.map((preset) => {
            const isCurrent = subject === preset.subject;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 truncate">{preset.subject}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    {preset.daysRemaining}d
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">{preset.tag}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="space-y-6">
          {/* Subject Field */}
          <div>
            <label htmlFor="subject" className="block text-sm font-semibold text-slate-900 mb-1.5">
              Subject Name
            </label>
            <div className="relative">
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. DBMS, Operating Systems, Machine Learning"
                required
                className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Syllabus Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="syllabus" className="block text-sm font-semibold text-slate-900">
                Syllabus / Topics
              </label>
              <span className="text-xs text-slate-500 font-medium">
                Comma-separated or bullet list
              </span>
            </div>
            <textarea
              id="syllabus"
              rows={4}
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              placeholder="e.g. Normalization, Functional Dependencies, 1NF, 2NF, 3NF, BCNF, Transactions..."
              required
              className="w-full px-4 py-3 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900 placeholder:text-slate-400 leading-relaxed"
            />
          </div>

          {/* Time Constraints Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            {/* Days Remaining */}
            <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="daysRemaining" className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Days Remaining</span>
                </label>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                </span>
              </div>
              <input
                id="daysRemaining"
                type="number"
                min={1}
                max={60}
                value={daysRemaining}
                onChange={(e) => setDaysRemaining(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-semibold text-slate-900"
              />
              <div className="flex gap-1.5 mt-2.5">
                {[1, 2, 3, 5, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDaysRemaining(num)}
                    className={`flex-1 py-1 text-xs font-medium rounded-lg border transition-colors ${
                      daysRemaining === num
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {num}d
                  </button>
                ))}
              </div>
            </div>

            {/* Study Time Per Day */}
            <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="dailyHours" className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Daily Study Time</span>
                </label>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                  {dailyHours} {dailyHours === 1 ? 'hour' : 'hours'}/day
                </span>
              </div>
              <input
                id="dailyHours"
                type="number"
                step="0.5"
                min={0.5}
                max={16}
                value={dailyHours}
                onChange={(e) => setDailyHours(Math.max(0.5, parseFloat(e.target.value) || 1))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-semibold text-slate-900"
              />
              <div className="flex gap-1.5 mt-2.5">
                {[1, 2, 3, 4, 6].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setDailyHours(hrs)}
                    className={`flex-1 py-1 text-xs font-medium rounded-lg border transition-colors ${
                      dailyHours === hrs
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {hrs}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Calculation Summary Badge */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs sm:text-sm text-indigo-900">
            <span className="flex items-center gap-2 font-medium">
              <Target className="w-4 h-4 text-indigo-600" />
              <span>Total Available Study Budget</span>
            </span>
            <span className="font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
              {totalCalculatedHours} Hours ({Math.round(totalCalculatedHours * 60)} Minutes)
            </span>
          </div>

          {/* AI Study Agent Goal / Instructions (Agentic Feature) */}
          <div className="border border-indigo-100 rounded-2xl p-4 bg-gradient-to-r from-indigo-50/40 to-violet-50/40">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="agentGoal" className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Study Agent Goal (Optional)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowGoalInput(!showGoalInput)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                {showGoalInput ? 'Hide' : 'Show'}
              </button>
            </div>
            {showGoalInput && (
              <div className="space-y-2">
                <input
                  id="agentGoal"
                  type="text"
                  value={agentGoal}
                  onChange={(e) => setAgentGoal(e.target.value)}
                  placeholder="e.g. &quot;I have only 3 hours today. Prepare me for tomorrow's exam.&quot;"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 placeholder:text-slate-400"
                />
                <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-600">Quick prompts:</span>
                  <button
                    type="button"
                    onClick={() => setAgentGoal("I have only 3 hours today. Prepare me for tomorrow's exam.")}
                    className="px-2 py-0.5 bg-white rounded-md border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
                  >
                    "Prepare me for tomorrow's exam"
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgentGoal("Focus on passing score and highest mark questions.")}
                    className="px-2 py-0.5 bg-white rounded-md border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
                  >
                    "Focus on passing score"
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading || !subject.trim() || !syllabus.trim()}
            className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>AI Agent is analyzing syllabus & planning...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Create My Study Plan</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
