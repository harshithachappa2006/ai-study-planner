export interface Preset {
  id: string;
  subject: string;
  syllabus: string;
  daysRemaining: number;
  dailyHours: number;
  goal: string;
  tag: string;
}

export const SAMPLE_PRESETS: Preset[] = [
  {
    id: 'dbms',
    subject: 'DBMS',
    syllabus: 'Normalization, Functional Dependencies, 1NF, 2NF, 3NF, BCNF, Transactions, ACID Properties, Concurrency Control.',
    daysRemaining: 2,
    dailyHours: 3,
    goal: 'Master core normalization rules and transactions for a 2-day exam cram.',
    tag: 'Popular Example',
  },
  {
    id: 'os',
    subject: 'Operating Systems',
    syllabus: 'Process Management, CPU Scheduling Algorithms, Threads, Synchronization & Semaphores, Deadlocks (Detection & Banker\'s Algorithm), Memory Paging, Virtual Memory.',
    daysRemaining: 3,
    dailyHours: 2.5,
    goal: 'Focus on numericals (CPU scheduling, Banker\'s algorithm) and core theoretical concepts.',
    tag: 'Engineering Core',
  },
  {
    id: 'dsa',
    subject: 'Data Structures & Algorithms',
    syllabus: 'Time Complexity (Big-O), Arrays & Strings, Singly & Doubly Linked Lists, Stacks & Queues, Binary Search Trees, Graph Traversals (BFS & DFS), Dynamic Programming basics.',
    daysRemaining: 4,
    dailyHours: 2,
    goal: 'Understand patterns, trace algorithms, and prepare for code tracing questions.',
    tag: 'CS Fundamental',
  },
  {
    id: 'cn',
    subject: 'Computer Networks',
    syllabus: 'OSI 7-Layer Reference Model, TCP/IP Suite, Flow & Error Control (Sliding Window), IPv4 & Subnetting, Routing Algorithms (Distance Vector & Link State), TCP 3-Way Handshake, DNS & HTTP.',
    daysRemaining: 2,
    dailyHours: 2,
    goal: 'Clear understanding of packet flow, protocol handshakes, and subnetting calculations.',
    tag: 'Exam Ready',
  },
];
