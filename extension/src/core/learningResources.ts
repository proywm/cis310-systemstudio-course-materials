export const PREPARATION_PROGRESS_VERSION = 1;
export const TARNOFF_BOOK_HOME = 'https://faculty.etsu.edu/tarnoff/138292/';
export const TARNOFF_AUTHOR_CHANNEL = 'https://www.youtube.com/@Intermation';
export const TARNOFF_OER_SERIES = 'https://dc.etsu.edu/computer-organization-design-oer/';

export type PreparationField = 'read' | 'watched';
export type PreparationTarget = 'reading' | 'video' | 'lecture' | 'book-home' | 'author-channel' | 'oer-series';

export interface PreparationReading {
  title: string;
  focus: string;
  url: string;
}

export interface PreClassModule {
  resourceId: string;
  lectureLabel: string;
  title: string;
  focus: string;
  readings: readonly PreparationReading[];
  authorVideo: { title: string; url: string };
  readinessPrompt: string;
}

export interface PreparationModuleProgress {
  read: boolean;
  watched: boolean;
  updatedAt: string;
}

export interface PreparationProgress {
  version: number;
  modules: Record<string, PreparationModuleProgress>;
}

export interface LearningPathModule extends PreClassModule {
  read: boolean;
  watched: boolean;
  practiceAttempts: number;
  complete: boolean;
}

const chapter = (number: number): string => `https://faculty.etsu.edu/tarnoff/ntes2150/Ch${number}_v02.pdf`;

export const PRE_CLASS_MODULES: readonly PreClassModule[] = [
  {
    resourceId: 'lecture-01', lectureLabel: 'Lecture 1', title: 'Introduction and Data Representation',
    focus: 'Why hardware matters; digital signals; binary and hexadecimal representation.',
    readings: [
      { title: 'Tarnoff Chapter 1 — Digital Signals and Systems', focus: '§§1.1–1.7', url: chapter(1) },
      { title: 'Tarnoff Chapter 2 — Numbering Systems', focus: '§§2.1–2.5', url: chapter(2) }
    ],
    authorVideo: { title: 'Ep 006: Hexadecimal Conversion', url: 'https://www.youtube.com/watch?v=HoZ8_UIziX8' },
    readinessPrompt: 'Can I convert a short value between binary and hexadecimal and explain why hardware representation matters?'
  },
  {
    resourceId: 'lecture-02', lectureLabel: 'Lecture 2', title: 'Signed Data, Boolean Logic, and Adders',
    focus: 'Two’s-complement representation, Boolean operations, truth tables, and binary addition.',
    readings: [
      { title: 'Tarnoff Chapter 3 — Binary Math and Signed Representations', focus: '§§3.1–3.3', url: chapter(3) },
      { title: 'Tarnoff Chapter 8 — Combinational Logic Applications', focus: '§8.2 binary adders', url: chapter(8) }
    ],
    authorVideo: { title: 'Ep 014: Two’s Complement Notation Example and Shortcut', url: 'https://www.youtube.com/watch?v=Ix8mP_xneFc' },
    readinessPrompt: 'Can I represent a negative fixed-width value and predict the sum/carry of a one-bit addition?'
  },
  {
    resourceId: 'lecture-03', lectureLabel: 'Lecture 3', title: 'Boolean Algebra and Circuit Simplification',
    focus: 'Boolean laws, DeMorgan’s theorem, simplification, SOP, and POS forms.',
    readings: [
      { title: 'Tarnoff Chapter 5 — Boolean Algebra', focus: '§§5.1–5.7', url: chapter(5) },
      { title: 'Tarnoff Chapter 6 — Standard Boolean Expression Formats', focus: 'SOP and POS', url: chapter(6) }
    ],
    authorVideo: { title: 'Ep 034: Basic Boolean Algebraic Simplification Examples', url: 'https://www.youtube.com/watch?v=dLIfh2wj8Dk' },
    readinessPrompt: 'Can I name the law used in each simplification step instead of relying on visual guessing?'
  },
  {
    resourceId: 'lecture-04', lectureLabel: 'Lecture 4', title: 'Karnaugh Maps',
    focus: 'Gray-code adjacency, valid groups, minimization, wraparound, and don’t-care conditions.',
    readings: [
      { title: 'Tarnoff Chapter 7 — Karnaugh Maps', focus: 'entire chapter', url: chapter(7) }
    ],
    authorVideo: { title: 'Ep 040: Introduction to Karnaugh Maps', url: 'https://www.youtube.com/watch?v=pPHxpiJfyS8' },
    readinessPrompt: 'Can I explain why adjacent K-map cells differ by one bit and identify one valid largest group?'
  },
  {
    resourceId: 'lecture-05', lectureLabel: 'Lecture 5', title: 'Combinational Logic and Data Selection',
    focus: 'Design process, active-low signals, decoders, multiplexers, and demultiplexers.',
    readings: [
      { title: 'Tarnoff Chapter 8 — Combinational Logic Applications', focus: '§§8.1–8.6', url: chapter(8) }
    ],
    authorVideo: { title: 'Episode 6.09: Multiplexers (ETSU OER video and transcript)', url: 'https://dc.etsu.edu/computer-organization-design-oer/49/' },
    readinessPrompt: 'Can I distinguish selecting one input from activating one output and state how many select bits are needed?'
  },
  {
    resourceId: 'lecture-06', lectureLabel: 'Lecture 6', title: 'Memory Cells and Sequential Logic',
    focus: 'Latches, flip-flops, timing, registers, counters, and finite-state behavior.',
    readings: [
      { title: 'Tarnoff Chapter 10 — Latches', focus: '§§10.1–10.5', url: chapter(10) },
      { title: 'Tarnoff Chapter 11 — State Machines', focus: 'state architecture and design', url: chapter(11) }
    ],
    authorVideo: { title: 'Ep 057: Latch and Flip-Flop Operation', url: 'https://www.youtube.com/watch?v=lVXjI8Mpu4w' },
    readinessPrompt: 'Can I say what changes state, what holds state, and what evidence a timing diagram should show?'
  },
  {
    resourceId: 'lecture-07', lectureLabel: 'Lecture 7', title: 'Memory Organization and Buses',
    focus: 'Memory-device organization, buses, memory maps, address decoding, SRAM, and DRAM.',
    readings: [
      { title: 'Tarnoff Chapter 12 — Memory Organization', focus: '§§12.1–12.5', url: chapter(12) }
    ],
    authorVideo: { title: 'Ep 068: Organization of a Simple Memory Device', url: 'https://www.youtube.com/watch?v=3By4tx4grSk' },
    readinessPrompt: 'Can I relate address-line width to the number of locations and explain the purpose of chip select?'
  },
  {
    resourceId: 'lecture-08', lectureLabel: 'Lecture 8', title: 'I/O, Interrupts, and Asynchronous Programming',
    focus: 'Peripheral interfaces, memory-mapped I/O, polling, interrupts, and asynchronous events.',
    readings: [
      { title: 'Tarnoff Chapter 15 — Introduction to Processor Architecture', focus: '§15.9, especially §§15.9.1–15.9.3', url: chapter(15) }
    ],
    authorVideo: { title: 'Ep 086: Introduction to Input/Output', url: 'https://www.youtube.com/watch?v=nnO2OfSTVbA' },
    readinessPrompt: 'Can I explain what a status register communicates and why polling can waste processor time?'
  },
  {
    resourceId: 'lecture-08-supplement', lectureLabel: 'Lecture 8 supplement', title: 'Detailed I/O and Memory',
    focus: 'Memory-mapped devices, polling evidence, interrupt setup, and I/O data movement.',
    readings: [
      { title: 'Tarnoff Chapter 12 — Memory Organization', focus: '§12.4 memory-mapped I/O', url: chapter(12) },
      { title: 'Tarnoff Chapter 15 — Introduction to Processor Architecture', focus: '§15.9.1–15.9.4', url: chapter(15) }
    ],
    authorVideo: { title: 'Ep 087: Using Polled I/O with a Memory Mapped Device', url: 'https://www.youtube.com/watch?v=xNH1e5snIEY' },
    readinessPrompt: 'Can I trace the address, status check, and data transfer in one polled I/O interaction?'
  },
  {
    resourceId: 'lecture-09', lectureLabel: 'Lecture 9', title: 'Memory Hierarchy and Cache',
    focus: 'Storage latency, hierarchy tradeoffs, locality, cache placement, and replacement.',
    readings: [
      { title: 'Tarnoff Chapter 13 — Memory Hierarchy', focus: 'entire chapter', url: chapter(13) }
    ],
    authorVideo: { title: 'Ep 073: Introduction to Cache Memory', url: 'https://www.youtube.com/watch?v=Bz49xnKBH_0' },
    readinessPrompt: 'Can I use temporal and spatial locality to explain why a small cache can help?'
  },
  {
    resourceId: 'lecture-10', lectureLabel: 'Lecture 10', title: 'RTL, Arithmetic Unit, and Control Unit',
    focus: 'Register transfers, CPU components, ALU/control interaction, and instruction execution.',
    readings: [
      { title: 'Tarnoff Chapter 9 — Binary Operation Applications', focus: 'arithmetic operations', url: chapter(9) },
      { title: 'Tarnoff Chapter 15 — Introduction to Processor Architecture', focus: '§§15.2–15.6', url: chapter(15) }
    ],
    authorVideo: { title: 'Ep 079: Basic CPU Architecture and Instruction Execution', url: 'https://www.youtube.com/watch?v=YNAcQ-uVM7Y' },
    readinessPrompt: 'Can I identify the register, ALU, and control actions needed for one simple instruction?'
  },
  {
    resourceId: 'lecture-11', lectureLabel: 'Lecture 11', title: 'Processor Pipelining',
    focus: 'Fetch/decode/execute overlap, throughput, stage timing, and control-flow disruption.',
    readings: [
      { title: 'Tarnoff Chapter 15 — Introduction to Processor Architecture', focus: '§15.8 pipelined architectures', url: chapter(15) }
    ],
    authorVideo: { title: 'Ep 085: Introduction to the CPU Pipeline', url: 'https://www.youtube.com/watch?v=E5qacBU1XjQ' },
    readinessPrompt: 'Can I distinguish latency from throughput and explain why the slowest stage constrains the clock?'
  },
  {
    resourceId: 'lecture-12', lectureLabel: 'Lecture 12', title: 'Address Spaces, x86 Registers, and Assembly',
    focus: '80x86 registers, flags, segments, stack behavior, addressing, and assembly-language structure.',
    readings: [
      { title: 'Tarnoff Chapter 16 — Intel 80x86 Processor', focus: 'registers, flags, segments, and memory organization', url: chapter(16) },
      { title: 'Tarnoff Chapter 17 — Intel 80x86 Assembly Language', focus: 'source form, operands, and basic execution', url: chapter(17) }
    ],
    authorVideo: { title: 'Ep 080: Data Registers and the Program Counter', url: 'https://www.youtube.com/watch?v=th8FnKQNIYE' },
    readinessPrompt: 'Can I predict which register or stack location changes before stepping one instruction?'
  }
] as const;

const MODULE_BY_ID = new Map(PRE_CLASS_MODULES.map((module) => [module.resourceId, module]));

export function emptyPreparationProgress(): PreparationProgress {
  return { version: PREPARATION_PROGRESS_VERSION, modules: {} };
}

export function normalizePreparationProgress(value: unknown): PreparationProgress {
  if (!isRecord(value) || value.version !== PREPARATION_PROGRESS_VERSION || !isRecord(value.modules)) {
    return emptyPreparationProgress();
  }
  const modules: Record<string, PreparationModuleProgress> = {};
  for (const [resourceId, raw] of Object.entries(value.modules)) {
    if (!MODULE_BY_ID.has(resourceId) || !isRecord(raw) || typeof raw.read !== 'boolean' || typeof raw.watched !== 'boolean') continue;
    modules[resourceId] = {
      read: raw.read,
      watched: raw.watched,
      updatedAt: safeIso(typeof raw.updatedAt === 'string' ? raw.updatedAt : '')
    };
  }
  return { version: PREPARATION_PROGRESS_VERSION, modules };
}

export function togglePreparation(
  progress: PreparationProgress,
  resourceId: string,
  field: PreparationField,
  now = new Date()
): PreparationProgress {
  if (!MODULE_BY_ID.has(resourceId) || (field !== 'read' && field !== 'watched')) {
    throw new Error('The preparation item is invalid.');
  }
  const previous = progress.modules[resourceId] ?? { read: false, watched: false, updatedAt: new Date(0).toISOString() };
  return {
    version: PREPARATION_PROGRESS_VERSION,
    modules: {
      ...progress.modules,
      [resourceId]: { ...previous, [field]: !previous[field], updatedAt: now.toISOString() }
    }
  };
}

export function preparationModule(resourceId: string): PreClassModule | undefined {
  return MODULE_BY_ID.get(resourceId);
}

export function preparationUrl(resourceId: string, target: PreparationTarget, readingIndex = 0): string | undefined {
  if (target === 'book-home') return TARNOFF_BOOK_HOME;
  if (target === 'author-channel') return TARNOFF_AUTHOR_CHANNEL;
  if (target === 'oer-series') return TARNOFF_OER_SERIES;
  const module = MODULE_BY_ID.get(resourceId);
  if (!module) return undefined;
  if (target === 'reading') return module.readings[readingIndex]?.url;
  if (target === 'video') return module.authorVideo.url;
  return undefined;
}

function safeIso(value: string): string {
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : new Date(0).toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
