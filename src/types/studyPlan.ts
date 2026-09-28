export type ActivityType = 'concept' | 'deep_dive' | 'practice' | 'revision';

export interface StudyBlock {
  topic: string;
  durationMinutes: number;
  activityType: ActivityType;
  focusSummary: string;
  isHighPriority?: boolean;
}

export interface DayPlan {
  dayNumber: number;
  dayTitle: string; // e.g. "Day 1: Foundations & Core Relations"
  totalMinutes: number;
  blocks: StudyBlock[];
}

export interface ImportantTopic {
  topic: string;
  importanceTier: 'Critical' | 'High' | 'Medium';
  reason: string;
  keyConceptsToMaster: string[];
}

export interface PracticeQuestion {
  marks: 2 | 5 | 10;
  category: 'Short Answer' | 'Detailed Concept' | 'Comprehensive Problem';
  topic: string;
  question: string;
  modelAnswer: string;
  keyPoints: string[];
}

export interface ChecklistItem {
  id: string;
  topic: string;
  subtopic?: string;
  isHighYield: boolean;
  completed?: boolean;
}

export interface StudyPlanResponse {
  subject: string;
  summary: string;
  strategyReasoning: string; // How the AI Study Agent budgeted time and adapted priorities
  daysRemaining: number;
  dailyStudyHours: number;
  totalStudyHours: number;
  studySchedule: DayPlan[];
  importantTopics: ImportantTopic[];
  practiceQuestions: PracticeQuestion[];
  revisionChecklist: ChecklistItem[];
  agentTips: string[];
  lastAdjustedGoal?: string;
  adaptedFromPrevious?: boolean;
}

export interface CreatePlanRequest {
  subject: string;
  syllabus: string;
  daysRemaining: number;
  dailyHours: number;
  agentGoal?: string;
}

export interface AdjustPlanRequest {
  subject: string;
  syllabus: string;
  previousPlan: StudyPlanResponse;
  newDailyHours: number;
  newDaysRemaining?: number;
  agentGoal?: string;
}
