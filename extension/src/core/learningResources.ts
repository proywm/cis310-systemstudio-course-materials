export const PREPARATION_PROGRESS_VERSION = 1;
export const TARNOFF_BOOK_HOME = 'https://faculty.etsu.edu/tarnoff/138292/';
export const TARNOFF_AUTHOR_CHANNEL = 'https://www.youtube.com/@Intermation';
export const TARNOFF_OER_SERIES = 'https://dc.etsu.edu/computer-organization-design-oer/';
export const OSTEP_ADDRESS_SPACES = 'https://pages.cs.wisc.edu/~remzi/OSTEP/vm-intro.pdf';
export const MODULE_READINESS_QUESTION_TARGET = 5;
export const MODULE_CONFIDENCE_QUESTION_TARGET = 8;

export type PreparationField = 'read' | 'watched';
export type PreparationTarget = 'reading' | 'video' | 'lecture' | 'book-home' | 'author-channel' | 'oer-series';

export interface PreparationReading {
  title: string;
  focus: string;
  url: string;
}

export interface PreparationVideo {
  title: string;
  focus: string;
  url: string;
}

export interface PreparationSourceMap {
  readingIndexes: readonly number[];
  videoIndexes: readonly number[];
}

export interface PreClassModule {
  resourceId: string;
  lectureLabel: string;
  title: string;
  focus: string;
  readings: readonly PreparationReading[];
  authorVideos: readonly PreparationVideo[];
  readinessPrompt: string;
  readinessSources: PreparationSourceMap;
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
  practiceQuestionsAttempted: number;
  handsOnRequired: boolean;
  handsOnComplete: boolean;
  handsOnCompletedLabs: number;
  handsOnTotalLabs: number;
  complete: boolean;
}

const chapter = (number: number): string => `https://faculty.etsu.edu/tarnoff/ntes2150/Ch${number}_v02.pdf`;

export const PRE_CLASS_MODULES: readonly PreClassModule[] = [
  {
    resourceId: 'lecture-01', lectureLabel: 'Lecture 1', title: 'Introduction and Data Representation',
    focus: 'How source code reaches hardware; abstraction; digital representation; binary and hexadecimal.',
    readings: [
      { title: 'Tarnoff Chapter 1 — Digital Signals and Systems', focus: '§§1.1–1.5: why hardware matters and discrete digital representation', url: chapter(1) },
      { title: 'Tarnoff Chapter 2 — Numbering Systems', focus: '§§2.1–2.4 and §2.7: binary place value, conversion, and hexadecimal grouping', url: chapter(2) }
    ],
    authorVideos: [
      { title: 'Ep 001: Pulse Trains and the Digital Signal', focus: 'Optional signal vocabulary: levels, edges, pulse width, and period', url: 'https://www.youtube.com/watch?v=2jfoLxQXq3Y' },
      { title: 'Ep 004: Binary to Decimal Conversion', focus: 'Readiness: binary place value and conversion', url: 'https://www.youtube.com/watch?v=hBdGOb8w4DA' },
      { title: 'Ep 006: Hexadecimal Conversion', focus: 'Readiness: four-bit binary groups and hexadecimal', url: 'https://www.youtube.com/watch?v=HoZ8_UIziX8' }
    ],
    readinessPrompt: 'Can I trace the source-to-hardware abstraction and convert short values among binary, decimal, and hexadecimal?',
    readinessSources: { readingIndexes: [0, 1], videoIndexes: [1, 2] }
  },
  {
    resourceId: 'lecture-02', lectureLabel: 'Lecture 2', title: 'Signed Data, Boolean Logic, and Adders',
    focus: 'Two’s-complement representation, Boolean operations, truth tables, and binary addition.',
    readings: [
      { title: 'Tarnoff Chapter 2 — Numbering Systems', focus: '§§2.3–2.5: unsigned binary range and conversion', url: chapter(2) },
      { title: 'Tarnoff Chapter 3 — Binary Math and Signed Representations', focus: '§§3.1–3.3', url: chapter(3) },
      { title: 'Tarnoff Chapter 8 — Combinational Logic Applications', focus: '§8.1: half adders and full adders', url: chapter(8) },
      { title: 'Tarnoff Chapter 5 — Boolean Algebra', focus: '§§5.2–5.3: gate symbols, Boolean expressions, and truth tables', url: chapter(5) }
    ],
    authorVideos: [
      { title: 'Ep 004: Binary to Decimal Conversion', focus: 'Unsigned range and place value', url: 'https://www.youtube.com/watch?v=hBdGOb8w4DA' },
      { title: 'Ep 014: Two’s Complement Notation Example and Shortcut', focus: 'Fixed-width negative values', url: 'https://www.youtube.com/watch?v=Ix8mP_xneFc' },
      { title: 'Ep 012: Binary Addition and Subtraction', focus: 'Sum and carry in binary addition', url: 'https://www.youtube.com/watch?v=YyxlNN8l0zw' },
      { title: 'Episode 4.01: Intro to Logic Gates (ETSU OER video and transcript)', focus: 'AND, OR, XOR, and inverter behavior', url: 'https://dc.etsu.edu/computer-organization-design-oer/29/' },
      { title: 'Episode 4.02: Truth Tables (ETSU OER video and transcript)', focus: 'Truth tables and evidence for logical equivalence', url: 'https://dc.etsu.edu/computer-organization-design-oer/30/' }
    ],
    readinessPrompt: 'Can I represent a negative fixed-width value and predict the sum and carry of a one-bit addition?',
    readinessSources: { readingIndexes: [1, 2], videoIndexes: [1, 2] }
  },
  {
    resourceId: 'lecture-03', lectureLabel: 'Lecture 3', title: 'Boolean Algebra and Circuit Simplification',
    focus: 'Boolean laws, DeMorgan’s theorem, algebraic simplification, and canonical SOP.',
    readings: [
      { title: 'Tarnoff Chapter 5 — Boolean Algebra', focus: '§§5.1–5.7', url: chapter(5) },
      { title: 'Tarnoff Chapter 6 — Standard Boolean Expression Formats', focus: '§§6.1–6.3: SOP and truth-table conversion', url: chapter(6) }
    ],
    authorVideos: [
      { title: 'Ep 034: Basic Boolean Algebraic Simplification Examples', focus: 'Boolean laws and absorption', url: 'https://www.youtube.com/watch?v=dLIfh2wj8Dk' },
      { title: 'Ep 036: Converting Truth Tables to Sum-of-Products Expressions', focus: 'Canonical SOP from output-1 rows', url: 'https://www.youtube.com/watch?v=13HCv91RGOE' },
      { title: 'Ep 033: DeMorgan’s Theorem', focus: 'Complementing AND/OR expressions', url: 'https://www.youtube.com/watch?v=euW9JldGCFk' }
    ],
    readinessPrompt: 'Can I name the law used in each simplification step instead of relying on visual guessing?',
    readinessSources: { readingIndexes: [0], videoIndexes: [0, 2] }
  },
  {
    resourceId: 'lecture-04', lectureLabel: 'Lecture 4', title: 'Karnaugh Maps',
    focus: 'Gray-code adjacency, power-of-two groups, minimization, and wraparound.',
    readings: [
      { title: 'Tarnoff Chapter 7 — Karnaugh Maps', focus: '§§7.1–7.3: adjacency, grouping, and simplification', url: chapter(7) }
    ],
    authorVideos: [
      { title: 'Ep 040: Introduction to Karnaugh Maps', focus: 'Gray-code layout and adjacency', url: 'https://www.youtube.com/watch?v=pPHxpiJfyS8' },
      { title: 'Ep 041: Karnaugh Map Rectangle Rules', focus: 'Power-of-two groups and largest groups', url: 'https://www.youtube.com/watch?v=68e6eOKs8Gg' },
      { title: 'Ep 042: Four-Variable Karnaugh Maps', focus: 'Edge wrapping and larger maps', url: 'https://www.youtube.com/watch?v=GLSdMlzngsY' }
    ],
    readinessPrompt: 'Can I explain why adjacent K-map cells differ by one bit and identify one valid largest group?',
    readinessSources: { readingIndexes: [0], videoIndexes: [0, 1] }
  },
  {
    resourceId: 'lecture-05', lectureLabel: 'Lecture 5', title: 'Combinational Logic and Data Selection',
    focus: 'Present-input behavior, active-low decoders, multiplexers, and select-bit count.',
    readings: [
      { title: 'Tarnoff Chapter 5 — Boolean Algebra', focus: '§5.1: combinational logic as a function of present inputs', url: chapter(5) },
      { title: 'Tarnoff Chapter 8 — Combinational Logic Applications', focus: '§§8.3–8.6: decoders, multiplexers, and demultiplexers', url: chapter(8) }
    ],
    authorVideos: [
      { title: 'Ep 026: Introduction to Combinational Logic', focus: 'Present-input behavior and design', url: 'https://www.youtube.com/watch?v=lTmAlB1T6Yo' },
      { title: 'Ep 029: Active-Low Decoder', focus: 'One-of-many decoder behavior', url: 'https://www.youtube.com/watch?v=XKxGCw8nnRU' },
      { title: 'Episode 6.09: Multiplexers (ETSU OER video and transcript)', focus: 'Data selection and select-bit count', url: 'https://dc.etsu.edu/computer-organization-design-oer/49/' }
    ],
    readinessPrompt: 'Can I distinguish selecting one input from activating one output and state how many select bits are needed?',
    readinessSources: { readingIndexes: [1], videoIndexes: [1, 2] }
  },
  {
    resourceId: 'lecture-06', lectureLabel: 'Lecture 6', title: 'Memory Cells and Sequential Logic',
    focus: 'Latches, flip-flops, timing evidence, counters, and finite-state behavior.',
    readings: [
      { title: 'Tarnoff Chapter 10 — Latches', focus: '§§10.1–10.5', url: chapter(10) },
      { title: 'Tarnoff Chapter 11 — State Machines', focus: '§§11.1–11.2: state architecture, encoding, and next-state logic', url: chapter(11) }
    ],
    authorVideos: [
      { title: 'Ep 058: Timing Diagrams for Flip-Flops and Latches', focus: 'Clock events, stored state, and timing evidence', url: 'https://www.youtube.com/watch?v=moxMU86NeVI' },
      { title: 'Ep 061: D Flip-Flop Counter/Timer', focus: 'Counter states and divide-by-two behavior', url: 'https://www.youtube.com/watch?v=ts4g_NUuHAc' },
      { title: 'Ep 064: State Machine Theory', focus: 'State bits and current/next-state logic', url: 'https://www.youtube.com/watch?v=SZwLuDUsX3A' }
    ],
    readinessPrompt: 'Can I say what changes state, what holds state, and what evidence a timing diagram should show?',
    readinessSources: { readingIndexes: [0], videoIndexes: [0] }
  },
  {
    resourceId: 'lecture-07', lectureLabel: 'Lecture 7', title: 'Memory Organization and Buses',
    focus: 'Memory-device organization, buses, address-line capacity, address decoding, and chip select.',
    readings: [
      { title: 'Tarnoff Chapter 12 — Memory Organization', focus: '§§12.2–12.3.4: device organization, buses, and address decoding', url: chapter(12) }
    ],
    authorVideos: [
      { title: 'Ep 068: Organization of a Simple Memory Device', focus: 'Address lines, data width, decoders, and chip select', url: 'https://www.youtube.com/watch?v=3By4tx4grSk' }
    ],
    readinessPrompt: 'Can I relate address-line width to the number of locations and explain the purpose of chip select?',
    readinessSources: { readingIndexes: [0], videoIndexes: [0] }
  },
  {
    resourceId: 'lecture-08', lectureLabel: 'Lecture 8', title: 'Memory-Mapped I/O and Polling',
    focus: 'Peripheral interfaces, memory-mapped device registers, polling, interrupts, and asynchronous I/O at an introductory level.',
    readings: [
      { title: 'Tarnoff Chapter 15 — Introduction to Processor Architecture', focus: '§§15.9.1–15.9.3: device registers, memory-mapped I/O, polling, and interrupts', url: chapter(15) },
      { title: 'OSTEP — I/O Devices', focus: '§36: canonical device interface/protocol, polling, interrupts, and DMA', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/file-devices.pdf' }
    ],
    authorVideos: [
      { title: 'Ep 086: Introduction to Input/Output', focus: 'I/O interfaces and memory-mapped devices', url: 'https://www.youtube.com/watch?v=nnO2OfSTVbA' },
      { title: 'Ep 087: Using Polled I/O with a Memory-Mapped Device', focus: 'Status checks, configuration/control, and data transfer', url: 'https://www.youtube.com/watch?v=xNH1e5snIEY' },
      { title: 'Ep 088: Introduction to Interrupts', focus: 'Event-driven device notification and CPU work overlap', url: 'https://www.youtube.com/watch?v=dDA3PUr16As' }
    ],
    readinessPrompt: 'Can I explain what a status register communicates and why polling can waste processor time?',
    readinessSources: { readingIndexes: [0, 1], videoIndexes: [1, 2] }
  },
  {
    resourceId: 'lecture-08-supplement', lectureLabel: 'Lecture 8 supplement', title: 'Detailed I/O and Memory',
    focus: 'Selected foundations only: memory-mapped devices, polling evidence, interrupt setup, DMA, and volatile versus persistent memory. Advanced protocols, priority inversion, cache coherence, and emerging-memory slides are enrichment.',
    readings: [
      { title: 'Tarnoff Chapter 12 — Memory Organization', focus: '§12.4 memory-mapped I/O', url: chapter(12) },
      { title: 'Tarnoff Chapter 15 — Introduction to Processor Architecture', focus: '§15.9.1–15.9.4', url: chapter(15) }
    ],
    authorVideos: [
      { title: 'Ep 087: Using Polled I/O with a Memory-Mapped Device', focus: 'Address, status, and data-transfer trace', url: 'https://www.youtube.com/watch?v=xNH1e5snIEY' },
      { title: 'Ep 088: Introduction to Interrupts', focus: 'Event-driven device notification', url: 'https://www.youtube.com/watch?v=dDA3PUr16As' },
      { title: 'Introduction to Direct Memory Access (DMA)', focus: 'Block transfers with reduced CPU involvement', url: 'https://www.youtube.com/watch?v=M16l_ymlfcs' }
    ],
    readinessPrompt: 'Can I trace the address, status check, and data transfer in one polled I/O interaction?',
    readinessSources: { readingIndexes: [0, 1], videoIndexes: [0] }
  },
  {
    resourceId: 'lecture-09', lectureLabel: 'Lecture 9', title: 'Memory Hierarchy and Cache',
    focus: 'Storage latency, hierarchy tradeoffs, locality, cache placement, and replacement.',
    readings: [
      { title: 'Tarnoff Chapter 13 — Memory Hierarchy', focus: '§§13.1 and 13.4: hierarchy, locality, cache blocks, hits, and misses', url: chapter(13) }
    ],
    authorVideos: [
      { title: 'Ep 067: Introduction to the Memory Hierarchy', focus: 'Capacity, speed, and cost tradeoffs', url: 'https://www.youtube.com/watch?v=JogSnkvENr0' },
      { title: 'Ep 073: Introduction to Cache Memory', focus: 'Locality, cache blocks, hits, and misses', url: 'https://www.youtube.com/watch?v=Bz49xnKBH_0' }
    ],
    readinessPrompt: 'Can I use temporal and spatial locality to explain why a small cache can help?',
    readinessSources: { readingIndexes: [0], videoIndexes: [1] }
  },
  {
    resourceId: 'lecture-10', lectureLabel: 'Lecture 10', title: 'CPU Components and Instruction Execution',
    focus: 'Register, ALU, instruction-register/decoder, and control actions during instruction execution.',
    readings: [
      { title: 'Tarnoff Chapter 15 — Introduction to Processor Architecture', focus: '§§15.2–15.6', url: chapter(15) }
    ],
    authorVideos: [
      { title: 'Ep 079: Basic CPU Architecture and Instruction Execution', focus: 'Registers, ALU, instruction register/decoder, and control', url: 'https://www.youtube.com/watch?v=YNAcQ-uVM7Y' }
    ],
    readinessPrompt: 'Can I identify the register, ALU, and control actions needed for one simple instruction?',
    readinessSources: { readingIndexes: [0], videoIndexes: [0] }
  },
  {
    resourceId: 'lecture-11', lectureLabel: 'Lecture 11', title: 'Processor Pipelining',
    focus: 'Core slides 1–44: stage overlap, throughput, clock timing, and structural/data/control hazards. Slides 45–58 on multiple issue and speculation are optional enrichment.',
    readings: [
      { title: 'Tarnoff Chapter 15 — Introduction to Processor Architecture', focus: '§15.8 pipelined architectures', url: chapter(15) }
    ],
    authorVideos: [
      { title: 'Ep 085: Introduction to the CPU Pipeline', focus: 'Fetch/decode/execute overlap, throughput, and branch flushes', url: 'https://www.youtube.com/watch?v=E5qacBU1XjQ' }
    ],
    readinessPrompt: 'Can I trace fetch/decode/execute overlap and explain why a taken branch may flush unfinished work?',
    readinessSources: { readingIndexes: [0], videoIndexes: [0] }
  },
  {
    resourceId: 'lecture-12', lectureLabel: 'Lecture 12', title: 'x86 Registers, Flags, Stack, and Calls',
    focus: 'Process address spaces, virtual-to-physical mapping, program segments, x86 registers, EIP, flags, stack behavior, CALL, and RET.',
    readings: [
      { title: 'Tarnoff Chapter 15 — Introduction to Processor Architecture', focus: '§15.2.5: stack organization', url: chapter(15) },
      { title: 'Tarnoff Chapter 16 — Intel 80x86 Processor', focus: '§§16.2.1–16.2.3: registers, instruction pointer, stack pointer, and flags', url: chapter(16) },
      { title: 'Tarnoff Chapter 17 — Intel 80x86 Assembly Language', focus: '§§17.1–17.4.3: source translation, data transfer, control flow, CALL, and RET', url: chapter(17) },
      { title: 'OSTEP — The Abstraction: Address Spaces', focus: '§13: process address space, code, static data, heap, stack, and memory virtualization', url: OSTEP_ADDRESS_SPACES }
    ],
    authorVideos: [
      { title: 'Ep 080: Data Registers and the Program Counter', focus: 'EAX subregisters and EIP', url: 'https://www.youtube.com/watch?v=th8FnKQNIYE' },
      { title: 'Ep 081: The Stack Pointer', focus: 'ESP and top-of-stack behavior', url: 'https://www.youtube.com/watch?v=n8_2y5E8N4Y' },
      { title: 'Ep 082: How Functions Use the Stack Pointer', focus: 'Calls, return addresses, and stack frames', url: 'https://www.youtube.com/watch?v=mC5eNUpyfKY' },
      { title: 'Ep 083: The Flags Register', focus: 'Zero, sign, carry, and overflow flags', url: 'https://www.youtube.com/watch?v=7eaTT8PekE0' }
    ],
    readinessPrompt: 'Can I predict which register, flag, or stack location changes before stepping one instruction?',
    readinessSources: { readingIndexes: [0, 1, 2], videoIndexes: [0, 1, 2, 3] }
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

export function preparationModuleComplete(read: boolean, watched: boolean, attemptedQuestions: number): boolean {
  return read && watched && attemptedQuestions >= MODULE_READINESS_QUESTION_TARGET;
}

export function preparationUrl(resourceId: string, target: PreparationTarget, sourceIndex = 0): string | undefined {
  if (target === 'book-home') return TARNOFF_BOOK_HOME;
  if (target === 'author-channel') return TARNOFF_AUTHOR_CHANNEL;
  if (target === 'oer-series') return TARNOFF_OER_SERIES;
  const module = MODULE_BY_ID.get(resourceId);
  if (!module) return undefined;
  if (target === 'reading') return module.readings[sourceIndex]?.url;
  if (target === 'video') return module.authorVideos[sourceIndex]?.url;
  return undefined;
}

function safeIso(value: string): string {
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : new Date(0).toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
