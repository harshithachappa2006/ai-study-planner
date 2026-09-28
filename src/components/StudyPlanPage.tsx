import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowLeft,
  Printer,
  Copy,
  Check,
  Star,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Brain,
  Sliders,
  TrendingUp,
  BookOpen,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { StudyPlanResponse, AdjustPlanRequest } from '../types/studyPlan';

interface StudyPlanPageProps {
  plan: StudyPlanResponse;
  originalSyllabus: string;
  onBack: () => void;
  onAdjustPlan: (data: AdjustPlanRequest) => void;
  isAdjusting: boolean;
}

export const StudyPlanPage: React.FC<StudyPlanPageProps> = ({
  plan,
  originalSyllabus,
  onBack,
  onAdjustPlan,
  isAdjusting,
}) => {
  // Checklist local completed state
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  // Expandable answers in practice questions
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});
  // Questions filter: all, 2, 5
  const [marksFilter, setMarksFilter] = useState<'all' | '2' | '5'>('all');
  // Copied state
  const [isCopied, setIsCopied] = useState(false);
  // Active day tab
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Adjust Plan section state
  const [newTimeHours, setNewTimeHours] = useState<number>(
    plan.dailyStudyHours === 3 ? 1 : Math.max(0.5, plan.dailyStudyHours - 1)
  );
  const [agentGoalInput, setAgentGoalInput] = useState<string>('');
  const [showAdjustDrawer, setShowAdjustDrawer] = useState<boolean>(false);

  // Toggle checklist item
  const toggleChecklist = (id: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle all checklist items
  const toggleAllChecklist = () => {
    const total = plan.revisionChecklist.length;
    const completedCount = Object.values(completedItems).filter(Boolean).length;
    if (completedCount === total) {
      setCompletedItems({});
    } else {
      const all: Record<string, boolean> = {};
      plan.revisionChecklist.forEach((item) => {
        all[item.id] = true;
      });
      setCompletedItems(all);
    }
  };

  const toggleQuestion = (index: number) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Revision progress calculation
  const totalChecklist = plan.revisionChecklist.length;
  const completedCount = plan.revisionChecklist.filter((item) => completedItems[item.id]).length;
  const progressPercent = totalChecklist > 0 ? Math.round((completedCount / totalChecklist) * 100) : 0;

  // Filtered practice questions
  const filteredQuestions = plan.practiceQuestions.filter((q) => {
    if (marksFilter === '2') return q.marks === 2;
    if (marksFilter === '5') return q.marks === 5;
    return true;
  });

  // Handle plan adjustment
  const handleTriggerAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    onAdjustPlan({
      subject: plan.subject,
      syllabus: originalSyllabus,
      previousPlan: plan,
      newDailyHours: Number(newTimeHours),
      newDaysRemaining: plan.daysRemaining,
      agentGoal: agentGoalInput.trim() || undefined,
    });
  };

  // Copy plan to clipboard
  const handleCopyPlan = () => {
    const lines: string[] = [];
    lines.push(`📚 STUDY PLAN: ${plan.subject.toUpperCase()}`);
    lines.push(`Days: ${plan.daysRemaining} | Daily Time: ${plan.dailyStudyHours}h | Total: ${plan.totalStudyHours}h\n`);

    lines.push(`STRATEGY REASONING:\n${plan.strategyReasoning}\n`);

    lines.push(`SCHEDULE:`);
    plan.studySchedule.forEach((day) => {
      lines.push(`\n${day.dayTitle} (${day.totalMinutes} min):`);
      day.blocks.forEach((b) => {
        lines.push(`  - ${b.topic} — ${b.durationMinutes} min [${b.activityType.toUpperCase()}]: ${b.focusSummary}`);
      });
    });

    lines.push(`\n⭐ IMPORTANT TOPICS:`);
    plan.importantTopics.forEach((t) => {
      lines.push(`  - ${t.topic} (${t.importanceTier}): ${t.reason}`);
    });

    lines.push(`\n✍️ PRACTICE QUESTIONS:`);
    plan.practiceQuestions.forEach((q, idx) => {
      lines.push(`  Q${idx + 1} (${q.marks} Marks) [${q.topic}]: ${q.question}`);
      lines.push(`     Answer: ${q.modelAnswer}`);
    });

    lines.push(`\n📋 REVISION CHECKLIST:`);
    plan.revisionChecklist.forEach((item) => {
      lines.push(`  [ ] ${item.topic}${item.subtopic ? ` - ${item.subtopic}` : ''}`);
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      {/* Top Bar Actions & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Syllabus & Inputs</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyPlan}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? 'Copied Plan!' : 'Copy Plan'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {plan.subject}
              </h1>
              {plan.adaptedFromPrevious ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <Zap className="w-3.5 h-3.5" />
                  Agent Adapted Plan
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Study Plan Active
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 max-w-2xl">{plan.summary}</p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 border border-slate-200/80 p-2 sm:p-2.5 rounded-2xl">
            <div className="text-center px-2 sm:px-3">
              <div className="text-[10px] uppercase font-bold text-slate-400">Days</div>
              <div className="text-base sm:text-lg font-extrabold text-slate-900">{plan.daysRemaining}d</div>
            </div>
            <div className="w-px h-7 bg-slate-200" />
            <div className="text-center px-2 sm:px-3">
              <div className="text-[10px] uppercase font-bold text-slate-400">Daily</div>
              <div className="text-base sm:text-lg font-extrabold text-indigo-600">{plan.dailyStudyHours}h</div>
            </div>
            <div className="w-px h-7 bg-slate-200" />
            <div className="text-center px-2 sm:px-3">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total</div>
              <div className="text-base sm:text-lg font-extrabold text-slate-900">{plan.totalStudyHours}h</div>
            </div>
          </div>
        </div>

        {/* AI Study Agent Strategy Callout */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-indigo-50/40 to-slate-50 border border-indigo-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5">
              <Brain className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                  AI Study Agent Strategy
                </span>
                {plan.lastAdjustedGoal && (
                  <span className="text-[11px] font-medium text-slate-500 italic truncate">
                    Goal: &quot;{plan.lastAdjustedGoal}&quot;
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {plan.strategyReasoning}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* AGENTIC FEATURE: "Adjust My Plan" Section (Prompt requirement) */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-b from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-indigo-700/50 no-print">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Sliders className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">Adjust My Plan (AI Study Agent)</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Agentic Adaptation
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Change your available time (e.g. 3 hrs → 1 hr) or set an emergency cram goal. The AI Agent will automatically reorganize topics!
              </p>
            </div>
          </div>

          {/* Quick toggle if collapsed */}
          <button
            type="button"
            onClick={() => setShowAdjustDrawer(!showAdjustDrawer)}
            className="sm:hidden text-xs text-indigo-200 underline"
          >
            {showAdjustDrawer ? 'Hide Controls' : 'Show Controls'}
          </button>
        </div>

        <form onSubmit={handleTriggerAdjustment} className={`space-y-4 ${showAdjustDrawer ? 'block' : 'block'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* New Study Time Input */}
            <div className="sm:col-span-5 bg-white/10 border border-white/15 rounded-2xl p-3.5 backdrop-blur-xs">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-indigo-100 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-300" />
                  <span>New Available Time Per Day</span>
                </label>
                <span className="text-xs font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30">
                  {newTimeHours} {newTimeHours === 1 ? 'Hour' : 'Hours'}/day
                </span>
              </div>

              <div className="flex items-center gap-2">
                {[0.5, 1, 1.5, 2, 3].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setNewTimeHours(hrs)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      newTimeHours === hrs
                        ? 'bg-amber-400 text-slate-900 border-amber-400 shadow-xs'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                    }`}
                  >
                    {hrs}h
                  </button>
                ))}
              </div>
            </div>

            {/* Agent Goal Input */}
            <div className="sm:col-span-4 bg-white/10 border border-white/15 rounded-2xl p-3.5 backdrop-blur-xs">
              <label htmlFor="adjustGoal" className="block text-xs font-semibold text-indigo-100 mb-1.5">
                Agent Goal / Constraint
              </label>
              <input
                id="adjustGoal"
                type="text"
                value={agentGoalInput}
                onChange={(e) => setAgentGoalInput(e.target.value)}
                placeholder="e.g. &quot;I have only 1 hour. Focus only on must-pass topics.&quot;"
                className="w-full px-3 py-1.5 text-xs bg-black/20 border border-white/20 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400 text-white placeholder:text-white/40"
              />
            </div>

            {/* Trigger Button */}
            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={isAdjusting}
                className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAdjusting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                    <span>Agent Reorganizing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                    <span>Adapt My Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Demo Shortcuts for Hackathon Evaluation */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-indigo-200">
            <span className="font-semibold text-indigo-300">Quick Test Cases:</span>
            <button
              type="button"
              onClick={() => {
                setNewTimeHours(1);
                setAgentGoalInput("I have only 1 hour today. Prepare me for tomorrow's exam with top high-yield topics.");
              }}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-100 border border-white/10 transition-colors"
            >
              ⚡ 3h → 1h Emergency Cram
            </button>
            <button
              type="button"
              onClick={() => {
                setNewTimeHours(2);
                setAgentGoalInput('Prioritize numericals and practice questions over theory.');
              }}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-100 border border-white/10 transition-colors"
            >
              🎯 Focus on Practice & Numericals
            </button>
          </div>
        </form>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1: 📚 Study Schedule */}
      {/* ========================================================================= */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">📚 Study Schedule</h2>
              <p className="text-xs text-slate-500">Day-by-day practical time blocks with clear objectives</p>
            </div>
          </div>

          {/* Day Selector Tabs if more than 1 day */}
          {plan.studySchedule.length > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl no-print">
              {plan.studySchedule.map((day, idx) => (
                <button
                  key={day.dayNumber}
                  type="button"
                  onClick={() => setActiveDayIndex(idx)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeDayIndex === idx
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Day {day.dayNumber}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Day View */}
        {plan.studySchedule.map((day, dayIdx) => {
          const isVisible = plan.studySchedule.length === 1 || activeDayIndex === dayIdx;
          if (!isVisible) return null;

          return (
            <div key={day.dayNumber} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-indigo-600 text-white text-xs flex items-center justify-center">
                    {day.dayNumber}
                  </span>
                  <span>{day.dayTitle}</span>
                </div>
                <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                  Total Time: <span className="text-slate-900 font-bold">{day.totalMinutes} min</span> ({Math.round((day.totalMinutes / 60) * 10) / 10}h)
                </div>
              </div>

              {/* Time Blocks Grid */}
              <div className="grid grid-cols-1 gap-3">
                {day.blocks.map((block, blockIdx) => {
                  const activityStyles = {
                    concept: 'bg-blue-50/70 border-blue-200 text-blue-800',
                    deep_dive: 'bg-purple-50/70 border-purple-200 text-purple-800',
                    practice: 'bg-emerald-50/70 border-emerald-200 text-emerald-800',
                    revision: 'bg-amber-50/70 border-amber-200 text-amber-800',
                  }[block.activityType] || 'bg-slate-50 border-slate-200 text-slate-800';

                  const badgeLabels = {
                    concept: 'Core Concept',
                    deep_dive: 'Deep Dive',
                    practice: 'Practice Questions',
                    revision: 'Rapid Revision',
                  }[block.activityType] || block.activityType;

                  return (
                    <div
                      key={blockIdx}
                      className="group border border-slate-200 rounded-2xl p-4 hover:border-indigo-300 hover:shadow-xs transition-all bg-white"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="font-extrabold text-sm sm:text-base text-slate-900">
                            {block.topic}
                          </span>
                          {block.isHighPriority && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              ★ High Weightage
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${activityStyles}`}>
                            {badgeLabels}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/80">
                            <Clock className="w-3.5 h-3.5" />
                            {block.durationMinutes} min
                          </span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 pl-0.5 leading-relaxed">
                        {block.focusSummary}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: ⭐ Important Topics */}
      {/* ========================================================================= */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">⭐ Important Topics</h2>
            <p className="text-xs text-slate-500">
              High-priority topics identified directly from your syllabus with exam rationale
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plan.importantTopics.map((topic, idx) => {
            const tierColors = {
              Critical: 'bg-rose-50 text-rose-700 border-rose-200',
              High: 'bg-amber-50 text-amber-700 border-amber-200',
              Medium: 'bg-blue-50 text-blue-700 border-blue-200',
            }[topic.importanceTier] || 'bg-slate-50 text-slate-700 border-slate-200';

            return (
              <div
                key={idx}
                className="border border-slate-200/90 rounded-2xl p-5 bg-gradient-to-b from-white to-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {topic.topic}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierColors}`}>
                      {topic.importanceTier}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    {topic.reason}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Must-Master Concepts:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {topic.keyConceptsToMaster.map((concept, cIdx) => (
                      <span
                        key={cIdx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 font-medium text-slate-700 shadow-2xs"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: ✍️ Practice Questions (2 Marks & 5 Marks) */}
      {/* ========================================================================= */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">✍️ Practice Questions</h2>
              <p className="text-xs text-slate-500">
                Exam-oriented questions with scoring points and model answers
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl no-print">
            <button
              type="button"
              onClick={() => setMarksFilter('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                marksFilter === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({plan.practiceQuestions.length})
            </button>
            <button
              type="button"
              onClick={() => setMarksFilter('2')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                marksFilter === '2'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2 Marks
            </button>
            <button
              type="button"
              onClick={() => setMarksFilter('5')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                marksFilter === '5'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5 Marks
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((q, qIdx) => {
            const isExpanded = expandedQuestions[qIdx];
            return (
              <div
                key={qIdx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-white hover:border-slate-300"
              >
                <div
                  onClick={() => toggleQuestion(qIdx)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg border ${
                          q.marks === 2
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                        }`}
                      >
                        {q.marks} Marks
                      </span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {q.topic}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {q.category}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 pt-0.5 leading-snug">
                      {q.question}
                    </h3>
                  </div>

                  <button
                    type="button"
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 shrink-0 mt-1"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Model Answer Drawer */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/60 space-y-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 block mb-1">
                        Model Answer / Key Definition:
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal bg-white p-3 rounded-xl border border-slate-200">
                        {q.modelAnswer}
                      </p>
                    </div>

                    {q.keyPoints && q.keyPoints.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                          Scoring Key Points:
                        </span>
                        <ul className="space-y-1">
                          {q.keyPoints.map((pt, pIdx) => (
                            <li
                              key={pIdx}
                              className="text-xs text-slate-700 flex items-start gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: 📋 Revision Checklist */}
      {/* ========================================================================= */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">📋 Revision Checklist</h2>
              <p className="text-xs text-slate-500">Track topics you have reviewed and mastered</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleAllChecklist}
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer no-print"
            >
              {completedCount === totalChecklist ? 'Uncheck All' : 'Check All'}
            </button>
            <div className="px-3 py-1 rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
              {completedCount} / {totalChecklist} Done ({progressPercent}%)
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Checklist Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {plan.revisionChecklist.map((item) => {
            const isDone = !!completedItems[item.id];
            return (
              <div
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0 text-slate-400">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span
                      className={`text-sm font-bold block truncate ${
                        isDone ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {item.topic}
                    </span>
                    {item.subtopic && (
                      <span className="text-xs text-slate-500 truncate block">
                        {item.subtopic}
                      </span>
                    )}
                  </div>
                </div>

                {item.isHighYield && (
                  <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    High Yield
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* Actionable Agent Tips */}
      {/* ========================================================================= */}
      {plan.agentTips && plan.agentTips.length > 0 && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Exam Hall Strategy & Pro Tips
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plan.agentTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
