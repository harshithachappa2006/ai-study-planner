import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// Gemini client initialization
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const studyPlanSchema = {
  type: Type.OBJECT,
  properties: {
    subject: { type: Type.STRING, description: 'Subject name' },
    summary: { type: Type.STRING, description: 'High level summary of the study strategy' },
    strategyReasoning: {
      type: Type.STRING,
      description: 'Agent rationale explaining how time was prioritized, which topics to tackle first, and why',
    },
    daysRemaining: { type: Type.NUMBER, description: 'Number of days remaining' },
    dailyStudyHours: { type: Type.NUMBER, description: 'Available study hours per day' },
    totalStudyHours: { type: Type.NUMBER, description: 'Total study hours across all days' },
    studySchedule: {
      type: Type.ARRAY,
      description: 'Day-by-day plan with exact time allocations (e.g. 45 min, 60 min)',
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.NUMBER },
          dayTitle: { type: Type.STRING, description: 'E.g. Day 1: Normalization & Core Dependencies' },
          totalMinutes: { type: Type.NUMBER, description: 'Total minutes for this day' },
          blocks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                topic: { type: Type.STRING, description: 'Topic or activity name' },
                durationMinutes: { type: Type.NUMBER, description: 'Minutes allocated to this topic' },
                activityType: {
                  type: Type.STRING,
                  description: 'One of: concept, deep_dive, practice, revision',
                },
                focusSummary: { type: Type.STRING, description: 'Clear focus or objective for this block' },
                isHighPriority: { type: Type.BOOLEAN, description: 'True if high importance topic' },
              },
              required: ['topic', 'durationMinutes', 'activityType', 'focusSummary'],
            },
          },
        },
        required: ['dayNumber', 'dayTitle', 'totalMinutes', 'blocks'],
      },
    },
    importantTopics: {
      type: Type.ARRAY,
      description: 'Key important topics with rationale and sub-concepts',
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          importanceTier: { type: Type.STRING, description: 'Critical, High, or Medium' },
          reason: { type: Type.STRING, description: 'Why this is critical for the exam' },
          keyConceptsToMaster: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['topic', 'importanceTier', 'reason', 'keyConceptsToMaster'],
      },
    },
    practiceQuestions: {
      type: Type.ARRAY,
      description: 'Exam questions including 2 Marks and 5 Marks questions with answers',
      items: {
        type: Type.OBJECT,
        properties: {
          marks: { type: Type.NUMBER, description: '2 for short answer, 5 for detailed answer' },
          category: { type: Type.STRING, description: 'Short Answer or Detailed Concept' },
          topic: { type: Type.STRING },
          question: { type: Type.STRING },
          modelAnswer: { type: Type.STRING, description: 'Crisp model answer or structure' },
          keyPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Essential scoring points'
          },
        },
        required: ['marks', 'category', 'topic', 'question', 'modelAnswer', 'keyPoints'],
      },
    },
    revisionChecklist: {
      type: Type.ARRAY,
      description: 'Checklist of syllabus topics and key subtopics',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          topic: { type: Type.STRING },
          subtopic: { type: Type.STRING },
          isHighYield: { type: Type.BOOLEAN },
        },
        required: ['id', 'topic', 'isHighYield'],
      },
    },
    agentTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Actionable tips for maximizing exam performance',
    },
  },
  required: [
    'subject',
    'summary',
    'strategyReasoning',
    'daysRemaining',
    'dailyStudyHours',
    'totalStudyHours',
    'studySchedule',
    'importantTopics',
    'practiceQuestions',
    'revisionChecklist',
    'agentTips',
  ],
};

// Helper: Retry wrapper for Gemini API calls to handle transient 503 spikes
async function callGeminiWithRetry(prompt: string, schema: any, maxRetries = 2): Promise<any> {
  let lastError: any = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      const text = response.text?.trim() || '{}';
      return JSON.parse(text);
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.code || (err?.message && err.message.includes('503') ? 503 : 0);
      if (attempt < maxRetries && (status === 503 || status === 429 || `${err}`.includes('high demand'))) {
        console.warn(`Gemini API 503/429 spike on attempt ${attempt + 1}, retrying in ${(attempt + 1) * 1200}ms...`);
        await new Promise((res) => setTimeout(res, (attempt + 1) * 1200));
        continue;
      }
      break;
    }
  }
  throw lastError;
}

// Fallback plan generator in case of network outages or service unavailability
function generateFallbackPlan(
  subject: string,
  syllabus: string,
  daysRemaining: number,
  dailyHours: number,
  agentGoal?: string,
  adapted = false
) {
  const rawTopics = syllabus
    .split(/[,;\n]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const topics = rawTopics.length > 0 ? rawTopics : ['Core Foundations', 'Key Algorithms', 'Applications'];
  const totalMinutes = Math.round(dailyHours * 60);

  const schedule = [];
  for (let d = 1; d <= daysRemaining; d++) {
    const dayTopics = topics.slice((d - 1) * 2, d * 2);
    const selectedTopics = dayTopics.length > 0 ? dayTopics : [topics[(d - 1) % topics.length]];
    const blockTime = Math.max(15, Math.floor((totalMinutes - 30) / Math.max(1, selectedTopics.length)));

    const blocks = selectedTopics.map((t, idx) => ({
      topic: t,
      durationMinutes: blockTime,
      activityType: idx === 0 ? 'concept' : 'deep_dive',
      focusSummary: `Master the core principles, formulas, and definitions of ${t}.`,
      isHighPriority: true,
    }));

    // Add revision and practice in remaining time
    const remainingTime = totalMinutes - blockTime * selectedTopics.length;
    if (remainingTime >= 30) {
      blocks.push({
        topic: 'Rapid Revision & Flashcards',
        durationMinutes: Math.floor(remainingTime / 2),
        activityType: 'revision',
        focusSummary: 'Quickly recall key definitions and formula derivations.',
        isHighPriority: false,
      });
      blocks.push({
        topic: 'High-Yield Practice Questions',
        durationMinutes: remainingTime - Math.floor(remainingTime / 2),
        activityType: 'practice',
        focusSummary: 'Solve past exam questions under timed pressure.',
        isHighPriority: true,
      });
    } else if (remainingTime > 0) {
      blocks.push({
        topic: 'Speed Revision & Practice',
        durationMinutes: remainingTime,
        activityType: 'practice',
        focusSummary: 'Solve 2-mark definitions and verify answers.',
        isHighPriority: false,
      });
    }

    schedule.push({
      dayNumber: d,
      dayTitle: `Day ${d}: ${selectedTopics.join(' & ')} Focus`,
      totalMinutes: totalMinutes,
      blocks,
    });
  }

  return {
    subject,
    summary: `${daysRemaining}-day strategic study plan tailored for ${subject} with ${dailyHours}h/day time budget.`,
    strategyReasoning: adapted
      ? `AI Study Agent adapted the study plan to ${dailyHours} hours/day. Pruned non-essential topics and prioritized core high-scoring units (${topics.slice(0, 3).join(', ')}) with timed practice drills.`
      : `AI Study Agent budgeted ${totalMinutes} minutes per day across ${daysRemaining} days. Foundations are tackled early, followed by high-yield application and exam question practice.`,
    daysRemaining,
    dailyStudyHours: dailyHours,
    totalStudyHours: Math.round(daysRemaining * dailyHours * 10) / 10,
    studySchedule: schedule,
    importantTopics: topics.slice(0, 3).map((t, idx) => ({
      topic: t,
      importanceTier: idx === 0 ? 'Critical' : 'High',
      reason: `Foundational unit for ${subject}; high likelihood of appearing in both short answer and long scenario questions.`,
      keyConceptsToMaster: [`Core definition and axioms of ${t}`, `Application and numerical solving in ${t}`, `Common exam pitfalls`],
    })),
    practiceQuestions: [
      {
        marks: 2,
        category: 'Short Answer',
        topic: topics[0] || 'Core Subject',
        question: `Define ${topics[0] || 'the main concept'} and state its primary significance.`,
        modelAnswer: `${topics[0] || 'The topic'} represents the fundamental structure required to maintain consistency and efficiency in ${subject}.`,
        keyPoints: ['Accurate formal definition', 'Real-world context or relevance', 'Key properties'],
      },
      {
        marks: 5,
        category: 'Detailed Concept',
        topic: topics[1] || topics[0] || 'Advanced Concept',
        question: `Explain the mechanisms and principles of ${topics[1] || topics[0]} with a suitable example.`,
        modelAnswer: `Step-by-step breakdown illustrating the rules, constraints, and standard procedures used to analyze ${topics[1] || topics[0]}.`,
        keyPoints: ['Structured explanation', 'Diagram or illustrative formula', 'Evaluation of advantages and trade-offs'],
      },
    ],
    revisionChecklist: topics.map((t, idx) => ({
      id: `chk-${idx + 1}`,
      topic: t,
      subtopic: `Key definitions and typical exam questions for ${t}`,
      isHighYield: idx < 3,
    })),
    agentTips: [
      'Focus first on 2-mark definitions to secure quick foundational points.',
      'Spend 10 minutes at the end of each session solving one past exam question without notes.',
      'Review your revision checklist right before sleeping to strengthen memory retention.',
    ],
    adaptedFromPrevious: adapted,
    lastAdjustedGoal: agentGoal || undefined,
  };
}

// API: Generate new study plan
app.post('/api/generate-plan', async (req: Request, res: Response) => {
  try {
    const { subject, syllabus, daysRemaining, dailyHours, agentGoal } = req.body;

    if (!subject || !syllabus || !daysRemaining || !dailyHours) {
      return res.status(400).json({ error: 'Please provide subject, syllabus, days remaining, and daily hours.' });
    }

    const totalHours = Math.round(Number(daysRemaining) * Number(dailyHours) * 10) / 10;
    const dailyMinutes = Math.round(Number(dailyHours) * 60);

    const prompt = `You are an expert AI Study Agent for university/college students preparing for exams.
A student needs an organized, highly practical exam study plan.

Subject: ${subject}
Syllabus / Topics provided:
${syllabus}

Days Remaining until exam: ${daysRemaining}
Available study time per day: ${dailyHours} hours (${dailyMinutes} minutes/day)
Total available study time: ${totalHours} hours
${agentGoal ? `Student's Specific Goal: "${agentGoal}"` : ''}

Your tasks:
1. UNDERSTAND THE SYLLABUS: Parse the topics, group related concepts, and identify which topics are highest-yield/foundational solely based on the syllabus.
2. AGENTIC TIME BUDGETING:
   - Create a realistic Day-by-Day schedule for ${daysRemaining} day(s).
   - Each day's study blocks MUST sum up exactly or very closely to ${dailyMinutes} minutes (${dailyHours} hours).
   - Divide time into practical blocks (e.g. 30 min, 45 min, 60 min, 75 min).
   - Include dedicated time for Revision (e.g., 30-45 min) and Practice Questions (e.g., 30 min) in the final stretch.
3. IMPORTANT TOPICS:
   - Identify 3-5 crucial topics marked with clear importance tiers (Critical, High, Medium) and why they matter.
4. PRACTICE QUESTIONS:
   - Provide a mix of 2 Marks (definitions/short concepts) and 5 Marks (detailed explanations, comparative questions, or step-by-step problem solving).
   - Provide clear, high-scoring model answers and bulleted key points.
5. REVISION CHECKLIST:
   - Provide an actionable checklist covering all key topics and subtopics from the syllabus.
6. STRATEGY REASONING:
   - Explain your AI Study Agent strategy: how you sequenced topics (e.g., prerequisites first, heavy weightage early, rapid revision at the end).

Ensure the output strictly conforms to the requested JSON schema.`;

    try {
      const planData = await callGeminiWithRetry(prompt, studyPlanSchema);
      planData.adaptedFromPrevious = false;
      planData.lastAdjustedGoal = agentGoal || undefined;
      return res.json(planData);
    } catch (geminiError: any) {
      console.warn('Gemini API call failed after retries, falling back to built-in generator:', geminiError?.message);
      const fallback = generateFallbackPlan(
        subject,
        syllabus,
        Number(daysRemaining),
        Number(dailyHours),
        agentGoal,
        false
      );
      return res.json(fallback);
    }
  } catch (error: any) {
    console.error('Error generating plan:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate study plan. Please try again.',
    });
  }
});

// API: Adjust plan with AI Study Agent (e.g., time change or goal change)
app.post('/api/adjust-plan', async (req: Request, res: Response) => {
  try {
    const { subject, syllabus, previousPlan, newDailyHours, newDaysRemaining, agentGoal } = req.body;

    if (!previousPlan || !newDailyHours) {
      return res.status(400).json({ error: 'Previous plan and new daily hours are required.' });
    }

    const days = newDaysRemaining || previousPlan.daysRemaining || 1;
    const newDailyMinutes = Math.round(Number(newDailyHours) * 60);
    const newTotalHours = Math.round(Number(days) * Number(newDailyHours) * 10) / 10;

    const prompt = `You are the AI Study Agent adapting an existing study plan due to changed constraints.

Original Subject: ${subject || previousPlan.subject}
Syllabus:
${syllabus || 'Refer to previous plan topics'}

Previous Plan Context:
- Previous Daily Hours: ${previousPlan.dailyStudyHours} hrs
- Previous Days Remaining: ${previousPlan.daysRemaining} days
- Previous Total Hours: ${previousPlan.totalStudyHours} hrs

NEW CONSTRAINT / AGENT GOAL:
- New Available Study Time: ${newDailyHours} hours per day (${newDailyMinutes} minutes/day)
- Days Remaining: ${days} day(s)
- Total New Available Time: ${newTotalHours} hours
${agentGoal ? `- User Agent Goal: "${agentGoal}"` : '- Time constraint change: Student has less/more time available.'}

YOUR AGENTIC INSTRUCTIONS:
1. Re-evaluate the topic priority. If time decreased (e.g. 3 hours -> 1 hour), aggressively compress or prioritize:
   - Focus exclusively on the highest-priority/must-pass topics.
   - Combine or shorten concept time, fast-track to high-yield formulas/rules.
   - Keep high-impact practice questions for the critical topics.
2. In 'strategyReasoning', clearly explain how you adapted:
   - Detail what you prioritized, what was trimmed or compressed, and why.
   - Give the student confidence on how to score maximum marks within ${newDailyHours} hours/day.
3. Each day's study blocks must strictly sum up to ${newDailyMinutes} minutes!
4. Return the full adapted plan adhering to the JSON schema.`;

    try {
      const planData = await callGeminiWithRetry(prompt, studyPlanSchema);
      planData.adaptedFromPrevious = true;
      planData.lastAdjustedGoal = agentGoal || `Adjusted study time to ${newDailyHours} hr/day`;
      return res.json(planData);
    } catch (geminiError: any) {
      console.warn('Gemini API call failed after retries, falling back to adapted generator:', geminiError?.message);
      const fallback = generateFallbackPlan(
        subject || previousPlan.subject,
        syllabus || '',
        Number(days),
        Number(newDailyHours),
        agentGoal,
        true
      );
      return res.json(fallback);
    }
  } catch (error: any) {
    console.error('Error adjusting plan:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to adjust study plan. Please try again.',
    });
  }
});


// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Study Planner server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
