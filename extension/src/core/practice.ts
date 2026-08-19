import { preparationModule } from './learningResources';

export const PRACTICE_PROGRESS_VERSION = 1;

export type PracticeTopicId =
  | 'architecture-data'
  | 'combinational-logic'
  | 'sequential-logic'
  | 'memory-io'
  | 'processor'
  | 'assembly';

export type PracticeMode = 'practice' | 'quiz';
export type PracticeFocus = 'recommended' | 'due' | 'saved' | 'all';
export type PracticeConfidence = 'low' | 'medium' | 'high';
export type PracticeReflection = 'concept' | 'careless' | 'guessed' | 'need-help';
export type PracticeDifficulty = 'foundation' | 'application';

export interface PracticeTopic {
  id: PracticeTopicId;
  title: string;
  shortTitle: string;
  description: string;
  resourceIds: readonly string[];
}

export interface PracticeQuestion {
  id: string;
  topicId: PracticeTopicId;
  resourceId: string;
  difficulty: PracticeDifficulty;
  prompt: string;
  options: readonly string[];
  correctIndex: number;
  hint: string;
  explanation: string;
  takeaway: string;
  sourceMap: {
    readingIndexes: readonly number[];
    videoIndexes: readonly number[];
  };
}

export interface QuestionLearningProgress {
  attempts: number;
  correct: number;
  correctStreak: number;
  stage: number;
  lastCorrect: boolean;
  lastAnsweredAt: string;
  nextReviewAt: string;
  highConfidenceAttempts: number;
  highConfidenceCorrect: number;
  correctButUncertain: number;
  usedHintCount: number;
  flagged: boolean;
  reflectionCounts: Partial<Record<PracticeReflection, number>>;
}

export interface PracticeAttemptLog {
  questionId: string;
  topicId: PracticeTopicId;
  correct: boolean;
  confidence: PracticeConfidence;
  usedHint: boolean;
  answeredAt: string;
  durationMs: number;
}

export interface PracticeProgress {
  version: number;
  questions: Record<string, QuestionLearningProgress>;
  attempts: PracticeAttemptLog[];
}

export interface PracticeAnswerInput {
  questionId: string;
  selectedIndex: number;
  confidence: PracticeConfidence;
  usedHint: boolean;
  durationMs: number;
}

export interface PracticeAnswerResult {
  question: PracticeQuestion;
  selectedIndex: number;
  correct: boolean;
  confidence: PracticeConfidence;
  usedHint: boolean;
  reviewLabel: string;
  nextReviewAt: string;
}

export interface PracticeSelectionOptions {
  mode: PracticeMode;
  focus: PracticeFocus;
  topicId?: PracticeTopicId;
  resourceId?: string;
  length: number;
}

export interface PracticeTopicSummary {
  id: PracticeTopicId;
  title: string;
  attemptedQuestions: number;
  totalQuestions: number;
  attempts: number;
  accuracy?: number;
  due: number;
  status: 'not-started' | 'building' | 'review' | 'strengthening' | 'steady';
  statusLabel: string;
}

export interface PracticeDashboard {
  totalQuestions: number;
  attemptedQuestions: number;
  attempts: number;
  correct: number;
  accuracy?: number;
  due: number;
  saved: number;
  practiceDays: number;
  confidentAttempts: number;
  confidentAccuracy?: number;
  correctButUncertain: number;
  confidentMisses: number;
  recommendation: string;
  confidenceInsight: string;
  topics: PracticeTopicSummary[];
}

export type PracticePanelRequest =
  | { type: 'ready' }
  | { type: 'start'; mode: PracticeMode; focus: PracticeFocus; topicId?: PracticeTopicId; resourceId?: string; length: number }
  | { type: 'answer'; questionId: string; selectedIndex: number; confidence: PracticeConfidence; usedHint: boolean; durationMs: number }
  | { type: 'next' }
  | { type: 'toggle-save'; questionId: string }
  | { type: 'reflect'; questionId: string; reflection: PracticeReflection }
  | { type: 'open-resource'; resourceId: string }
  | { type: 'open-preparation'; resourceId: string; target: 'reading' | 'video' | 'lecture' | 'book-home' | 'author-channel' | 'oer-series'; readingIndex: number }
  | { type: 'toggle-preparation'; resourceId: string; field: 'read' | 'watched' }
  | { type: 'open-help'; destination: 'faq' | 'ai-tutor' | 'before-class' }
  | { type: 'home' }
  | { type: 'reset' };

const DAY_MS = 24 * 60 * 60 * 1_000;
const REVIEW_INTERVAL_DAYS = [1, 2, 4, 7, 14, 30] as const;
const CONFIDENCE_VALUES = new Set<PracticeConfidence>(['low', 'medium', 'high']);
const REFLECTION_VALUES = new Set<PracticeReflection>(['concept', 'careless', 'guessed', 'need-help']);
const MODE_VALUES = new Set<PracticeMode>(['practice', 'quiz']);
const FOCUS_VALUES = new Set<PracticeFocus>(['recommended', 'due', 'saved', 'all']);

export const PRACTICE_TOPICS: readonly PracticeTopic[] = [
  {
    id: 'architecture-data',
    title: 'Architecture and Data Representation',
    shortTitle: 'Architecture & data',
    description: 'Abstraction layers, ISA, binary, hexadecimal, signed values, and arithmetic.',
    resourceIds: ['lecture-01', 'lecture-02']
  },
  {
    id: 'combinational-logic',
    title: 'Boolean and Combinational Logic',
    shortTitle: 'Combinational logic',
    description: 'Boolean forms, simplification, K-maps, adders, decoders, and multiplexers.',
    resourceIds: ['lecture-03', 'lecture-04', 'lecture-05']
  },
  {
    id: 'sequential-logic',
    title: 'Sequential Logic and State',
    shortTitle: 'Sequential logic',
    description: 'Latches, flip-flops, clocks, counters, state encoding, and state machines.',
    resourceIds: ['lecture-06']
  },
  {
    id: 'memory-io',
    title: 'Memory, Buses, and I/O',
    shortTitle: 'Memory & I/O',
    description: 'Memory organization, address decoding, device registers, interrupts, storage, and cache.',
    resourceIds: ['lecture-07', 'lecture-08', 'lecture-08-supplement', 'lecture-09']
  },
  {
    id: 'processor',
    title: 'Processor Datapath and Pipelining',
    shortTitle: 'Processor',
    description: 'RTL, registers, ALU/control interaction, instruction flow, and pipelines.',
    resourceIds: ['lecture-10', 'lecture-11']
  },
  {
    id: 'assembly',
    title: 'Address Spaces and Assembly',
    shortTitle: 'Assembly',
    description: 'x86 registers, flags, stack behavior, calls, returns, and instruction tracing.',
    resourceIds: ['lecture-12']
  }
] as const;

export const PRACTICE_QUESTIONS: readonly PracticeQuestion[] = [
  {
    id: 'arch-digital-signal', topicId: 'architecture-data', resourceId: 'lecture-01', difficulty: 'foundation',
    prompt: 'Which description best matches a digital signal?',
    options: ['A signal that can take every value continuously', 'A signal that exists only inside a CPU', 'A signal represented with a finite set of discrete states', 'A signal that never changes with time'],
    correctIndex: 2,
    hint: 'Contrast discrete states with a continuously varying quantity.',
    explanation: 'A digital signal uses a finite set of discrete states. In binary digital systems, those states are conventionally represented as 0 and 1.',
    takeaway: 'Digital representation uses discrete states; binary systems use two states.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0] }
  },
  {
    id: 'arch-hex-group', topicId: 'architecture-data', resourceId: 'lecture-01', difficulty: 'foundation',
    prompt: 'Which hexadecimal digit represents the four-bit pattern 1010?',
    options: ['8', '9', 'A', 'F'],
    correctIndex: 2,
    hint: 'Convert 1010₂ to decimal, then use the corresponding base-16 digit.',
    explanation: 'The binary pattern 1010 has value 10, which is written A in hexadecimal. Each hexadecimal digit corresponds to exactly four binary bits.',
    takeaway: 'Group binary into four-bit nibbles to convert directly to hexadecimal.',
    sourceMap: { readingIndexes: [1], videoIndexes: [1] }
  },
  {
    id: 'data-unsigned-range', topicId: 'architecture-data', resourceId: 'lecture-02', difficulty: 'foundation',
    prompt: 'What is the largest unsigned value representable with 8 bits?',
    options: ['127', '128', '255', '256'],
    correctIndex: 2,
    hint: 'Eight bits represent 2⁸ distinct patterns, starting at zero.',
    explanation: 'Eight bits provide 256 patterns. Unsigned values start at 0, so the range is 0 through 255, or 2⁸ − 1.',
    takeaway: 'An n-bit unsigned value ranges from 0 through 2ⁿ − 1.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0] }
  },
  {
    id: 'data-twos-complement', topicId: 'architecture-data', resourceId: 'lecture-02', difficulty: 'application',
    prompt: 'Which 8-bit pattern represents −5 in two’s-complement form?',
    options: ['0000 0101', '1000 0101', '1111 1010', '1111 1011'],
    correctIndex: 3,
    hint: 'Start with +5, invert all bits, then add 1.',
    explanation: '+5 is 0000 0101. Inverting gives 1111 1010; adding 1 gives 1111 1011.',
    takeaway: 'To negate a fixed-width two’s-complement value, invert the bits and add one.',
    sourceMap: { readingIndexes: [1], videoIndexes: [1] }
  },
  {
    id: 'logic-sop-row', topicId: 'combinational-logic', resourceId: 'lecture-03', difficulty: 'foundation',
    prompt: 'When deriving canonical sum-of-products (SOP) from a truth table, which rows create product terms?',
    options: ['Rows where the output is 0', 'Only rows with all inputs equal to 1', 'Rows where the output is 1', 'Only don’t-care rows'],
    correctIndex: 2,
    hint: 'SOP ORs together minterms that make the function true.',
    explanation: 'Each output-1 row becomes a minterm (a product of input literals), and the minterms are ORed together.',
    takeaway: 'Canonical SOP is built from the truth-table rows where the function is 1.',
    sourceMap: { readingIndexes: [1], videoIndexes: [1] }
  },
  {
    id: 'logic-absorption', topicId: 'combinational-logic', resourceId: 'lecture-03', difficulty: 'application',
    prompt: 'Which expression is equivalent to A + A·B?',
    options: ['B', 'A·B', 'A + B', 'A'],
    correctIndex: 3,
    hint: 'If A is already true, the second term cannot add a new true case.',
    explanation: 'By the absorption law, A + A·B = A. The A·B term is already covered whenever A is 1.',
    takeaway: 'Absorption removes a term whose true cases are already included by another term.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0] }
  },
  {
    id: 'logic-demorgan', topicId: 'combinational-logic', resourceId: 'lecture-03', difficulty: 'application',
    prompt: 'According to DeMorgan’s theorem, which expression equals the complement of A·B?',
    options: ['A·B', 'A + B', 'A̅·B̅', 'A̅ + B̅'],
    correctIndex: 3,
    hint: 'When the outer complement crosses the AND operator, the operator changes.',
    explanation: 'DeMorgan’s theorem changes the complemented AND to an OR of the complemented inputs: (A·B)̅ = A̅ + B̅.',
    takeaway: 'Push a complement through an expression by swapping AND/OR and complementing each input.',
    sourceMap: { readingIndexes: [0], videoIndexes: [2] }
  },
  {
    id: 'logic-kmap-adjacency', topicId: 'combinational-logic', resourceId: 'lecture-04', difficulty: 'foundation',
    prompt: 'Why do K-map rows and columns use Gray-code ordering?',
    options: ['To sort values numerically', 'To force groups to contain four cells', 'So adjacent cells differ in exactly one input bit', 'So every function has one group'],
    correctIndex: 2,
    hint: 'Simplification relies on one variable changing while the others stay fixed.',
    explanation: 'Gray-code ordering makes neighboring cells differ by one variable. Grouping neighbors then eliminates the changing variable from the product term.',
    takeaway: 'K-map adjacency represents a one-bit change, including wraparound at the edges.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0] }
  },
  {
    id: 'logic-kmap-group', topicId: 'combinational-logic', resourceId: 'lecture-04', difficulty: 'application',
    prompt: 'When several valid K-map groupings cover the same 1-cells, which grouping usually gives the simpler SOP term?',
    options: ['The smallest power-of-two group', 'A diagonal group', 'A group containing both 0s and 1s', 'The largest valid power-of-two group'],
    correctIndex: 3,
    hint: 'A larger group has more variables changing within it.',
    explanation: 'The largest valid power-of-two group eliminates the most changing variables and therefore produces a term with fewer literals.',
    takeaway: 'Prefer large valid groups while still covering every required 1-cell.',
    sourceMap: { readingIndexes: [0], videoIndexes: [1] }
  },
  {
    id: 'logic-combinational-state', topicId: 'combinational-logic', resourceId: 'lecture-05', difficulty: 'foundation',
    prompt: 'What distinguishes a combinational circuit from a sequential circuit?',
    options: ['It can use only AND gates', 'It always has one output', 'Its output depends only on current inputs', 'It must contain a clock'],
    correctIndex: 2,
    hint: 'Ask whether past input history is needed to determine the output.',
    explanation: 'A combinational circuit’s output is a direct function of its current inputs. Sequential circuits include state, so past events can affect the current output.',
    takeaway: 'Combinational logic has no stored state or feedback-dependent history.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0] }
  },
  {
    id: 'logic-decoder', topicId: 'combinational-logic', resourceId: 'lecture-05', difficulty: 'foundation',
    prompt: 'What does a conventional 2-to-4 decoder do for each 2-bit input value?',
    options: ['Adds the two input bits', 'Stores the input for four cycles', 'Combines four inputs into two outputs', 'Selects one of four output lines'],
    correctIndex: 3,
    hint: 'The input is interpreted as an index.',
    explanation: 'A 2-bit input has four possible values. A 2-to-4 decoder activates the corresponding one of four outputs.',
    takeaway: 'A decoder turns a binary selection value into a one-of-many activation pattern.',
    sourceMap: { readingIndexes: [1], videoIndexes: [1] }
  },
  {
    id: 'logic-mux', topicId: 'combinational-logic', resourceId: 'lecture-05', difficulty: 'application',
    prompt: 'A 4-to-1 multiplexer has four data inputs. How many select bits are required?',
    options: ['1', '3', '2', '4'],
    correctIndex: 2,
    hint: 'How many binary patterns are needed to choose among four inputs?',
    explanation: 'Two select bits provide four selection patterns: 00, 01, 10, and 11.',
    takeaway: 'Selecting among 2ⁿ inputs requires n select bits.',
    sourceMap: { readingIndexes: [1], videoIndexes: [2] }
  },
  {
    id: 'logic-full-adder-carry', topicId: 'architecture-data', resourceId: 'lecture-02', difficulty: 'application',
    prompt: 'For a full adder with A=1, B=1, and Cin=0, what are Sum and Cout?',
    options: ['Sum=0, Cout=1', 'Sum=1, Cout=0', 'Sum=1, Cout=1', 'Sum=0, Cout=0'],
    correctIndex: 0,
    hint: 'Add the three one-bit values as an ordinary binary number.',
    explanation: '1 + 1 + 0 equals binary 10, so the sum bit is 0 and the carry-out bit is 1.',
    takeaway: 'A full adder returns the low result bit as Sum and the high result bit as Cout.',
    sourceMap: { readingIndexes: [2], videoIndexes: [2] }
  },
  {
    id: 'seq-why-clock', topicId: 'sequential-logic', resourceId: 'lecture-06', difficulty: 'foundation',
    prompt: 'What is the clock’s main role in a synchronous sequential circuit?',
    options: ['It supplies the data value', 'It replaces combinational logic', 'It permanently resets every register', 'It coordinates when state elements update'],
    correctIndex: 3,
    hint: 'The clock is about timing, not the value being stored.',
    explanation: 'The clock coordinates state transitions so registers and flip-flops update at defined events, usually an edge.',
    takeaway: 'A synchronous clock establishes when state changes are allowed to occur.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0] }
  },
  {
    id: 'seq-d-flipflop', topicId: 'sequential-logic', resourceId: 'lecture-06', difficulty: 'foundation',
    prompt: 'For an edge-triggered D flip-flop, what value is captured at the active clock edge?',
    options: ['The complement of D', 'The previous clock value', 'The current D input', 'Always 1'],
    correctIndex: 2,
    hint: 'The device is named for the data input it samples.',
    explanation: 'At the active edge, a D flip-flop samples D and stores that value as its next Q state.',
    takeaway: 'For a D flip-flop, the characteristic relation is Q(next)=D at the active edge.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0] }
  },
  {
    id: 'seq-state-bits-19', topicId: 'sequential-logic', resourceId: 'lecture-06', difficulty: 'application',
    prompt: 'What is the minimum number of state bits needed to encode 19 distinct states?',
    options: ['4', '6', '19', '5'],
    correctIndex: 3,
    hint: 'Find the smallest n for which 2ⁿ is at least 19.',
    explanation: 'Four bits encode only 16 states, while five bits encode up to 32 states. Therefore five state bits are required.',
    takeaway: 'The minimum state-bit count is the smallest n satisfying 2ⁿ ≥ number of states.',
    sourceMap: { readingIndexes: [1], videoIndexes: [2] }
  },
  {
    id: 'seq-counter-width', topicId: 'sequential-logic', resourceId: 'lecture-06', difficulty: 'foundation',
    prompt: 'How many distinct states can a 5-bit binary counter represent before repeating?',
    options: ['5', '10', '25', '32'],
    correctIndex: 3,
    hint: 'Each added state bit doubles the number of possible patterns.',
    explanation: 'Five bits have 2⁵ = 32 distinct patterns, from 00000 through 11111.',
    takeaway: 'An n-bit binary counter has 2ⁿ distinct states.',
    sourceMap: { readingIndexes: [0], videoIndexes: [1] }
  },
  {
    id: 'seq-next-state-inputs', topicId: 'sequential-logic', resourceId: 'lecture-06', difficulty: 'application',
    prompt: 'In a synchronous state machine, what information normally feeds the next-state logic?',
    options: ['Only the clock frequency', 'Only the output labels', 'The current state and external inputs', 'The wire colors and gate count'],
    correctIndex: 2,
    hint: 'The next state depends on where the machine is now and what it observes.',
    explanation: 'The combinational next-state logic uses the current state bits and relevant external inputs to determine the state value loaded at the next active clock event.',
    takeaway: 'Next-state logic computes a future state from current state and inputs.',
    sourceMap: { readingIndexes: [1], videoIndexes: [2] }
  },
  {
    id: 'memory-address-lines', topicId: 'memory-io', resourceId: 'lecture-07', difficulty: 'application',
    prompt: 'How many address bits are needed to select one of 16 memory locations?',
    options: ['2', '8', '16', '4'],
    correctIndex: 3,
    hint: 'Find n such that 2ⁿ equals the number of locations.',
    explanation: 'Four address bits produce 16 distinct addresses, from 0000 through 1111.',
    takeaway: 'n address bits directly select up to 2ⁿ locations.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0] }
  },
  {
    id: 'memory-address-decoder', topicId: 'memory-io', resourceId: 'lecture-07', difficulty: 'foundation',
    prompt: 'What is the purpose of address decoding in a memory system?',
    options: ['Convert data from binary to decimal', 'Select the intended memory device or location for an address', 'Increase every stored value', 'Store the current instruction permanently'],
    correctIndex: 1,
    hint: 'Several devices may share a bus, but only one should respond to a given range.',
    explanation: 'Address-decoding logic recognizes address patterns and activates the appropriate memory device or location.',
    takeaway: 'Address decoding maps an address value or range to the component that should respond.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0] }
  },
  {
    id: 'io-device-registers', topicId: 'memory-io', resourceId: 'lecture-08', difficulty: 'foundation',
    prompt: 'Which set matches the device-interface registers described in the assigned material?',
    options: ['Status, configuration/control, and data', 'Stack, base, and instruction', 'Read, decode, and execute', 'Cache, DRAM, and disk'],
    correctIndex: 0,
    hint: 'One reports readiness, one configures or controls operation, and one carries the value.',
    explanation: 'The assigned examples use status, configuration/control, and data registers for host/device coordination. Exact names vary by device.',
    takeaway: 'Status reports state, configuration/control sets behavior, and data carries the payload.',
    sourceMap: { readingIndexes: [0], videoIndexes: [1] }
  },
  {
    id: 'io-polling-cost', topicId: 'memory-io', resourceId: 'lecture-08', difficulty: 'application',
    prompt: 'Why can polling a slow device be inefficient?',
    options: ['It prevents the device from having registers', 'The CPU repeatedly checks status instead of doing other useful work', 'It always corrupts the data register', 'It requires virtual memory'],
    correctIndex: 1,
    hint: 'Consider what the processor does while the device remains busy.',
    explanation: 'Busy-wait polling repeatedly consumes processor time checking device status. Interrupts can allow other work until the device signals completion.',
    takeaway: 'Polling trades implementation simplicity for potentially wasted CPU time.',
    sourceMap: { readingIndexes: [0], videoIndexes: [1] }
  },
  {
    id: 'io-interrupt-purpose', topicId: 'memory-io', resourceId: 'lecture-08-supplement', difficulty: 'foundation',
    prompt: 'What advantage does an interrupt provide over continuous polling?',
    options: ['The CPU can do other work until the device signals attention', 'The device no longer needs data', 'Every operation becomes instantaneous', 'The CPU no longer executes instructions'],
    correctIndex: 0,
    hint: 'Think of a notification instead of repeatedly checking for an event.',
    explanation: 'With interrupts, the CPU can execute other work and respond when the device raises an interrupt, instead of continuously checking status.',
    takeaway: 'Interrupts provide event-driven notification; they do not make the device itself faster.',
    sourceMap: { readingIndexes: [1], videoIndexes: [1] }
  },
  {
    id: 'memory-hierarchy-goal', topicId: 'memory-io', resourceId: 'lecture-09', difficulty: 'foundation',
    prompt: 'What central tradeoff motivates a memory hierarchy?',
    options: ['Combining small fast expensive storage with larger slower cheaper storage', 'Making every storage level identical', 'Removing locality from programs', 'Replacing registers with disks'],
    correctIndex: 0,
    hint: 'No single storage technology optimizes speed, capacity, and cost simultaneously.',
    explanation: 'A hierarchy combines small fast levels near the processor with progressively larger, slower, and cheaper levels to approximate both speed and capacity goals.',
    takeaway: 'Memory hierarchies exploit differing latency, capacity, and cost characteristics.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0] }
  },
  {
    id: 'memory-locality', topicId: 'memory-io', resourceId: 'lecture-09', difficulty: 'application',
    prompt: 'A loop repeatedly accesses the same small array. Which principle helps a cache serve those accesses efficiently?',
    options: ['Temporal and spatial locality', 'Address overflow', 'Instruction decoding', 'Two’s-complement negation'],
    correctIndex: 0,
    hint: 'The program reuses recent data and accesses nearby addresses.',
    explanation: 'Repeated use of the same data shows temporal locality; walking nearby array elements shows spatial locality. Caches are designed to exploit both.',
    takeaway: 'Locality makes recently used and nearby data good candidates for fast storage.',
    sourceMap: { readingIndexes: [0], videoIndexes: [1] }
  },
  {
    id: 'memory-cache-miss', topicId: 'memory-io', resourceId: 'lecture-09', difficulty: 'foundation',
    prompt: 'What happens on a cache miss in the basic cache model?',
    options: ['The processor permanently deletes the requested address', 'A block containing the requested item is fetched from a lower level', 'Every cache entry becomes a register', 'The requested data is assumed to be zero'],
    correctIndex: 1,
    hint: 'The requested item was not found at the fast level, so another level must supply it.',
    explanation: 'On a cache miss, the system obtains a block containing the requested item from the next lower level and places it in the cache before completing the access.',
    takeaway: 'A miss brings a block from a lower level; a hit finds the item in the cache.',
    sourceMap: { readingIndexes: [0], videoIndexes: [1] }
  },
  {
    id: 'cpu-alu-role', topicId: 'processor', resourceId: 'lecture-10', difficulty: 'foundation',
    prompt: 'What is the arithmetic logic unit (ALU) responsible for in the CPU model?',
    options: ['Storing the complete program permanently', 'Performing selected arithmetic and logical operations on data', 'Generating the external system clock', 'Replacing the instruction register'],
    correctIndex: 1,
    hint: 'The control unit selects the operation; this component performs it.',
    explanation: 'The ALU performs selected arithmetic and logical operations on operand data. Control signals choose the operation and coordinate movement of the result.',
    takeaway: 'The ALU performs data operations; the control unit coordinates them.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0] }
  },
  {
    id: 'cpu-control-unit', topicId: 'processor', resourceId: 'lecture-10', difficulty: 'foundation',
    prompt: 'What is the control unit’s main role in a processor?',
    options: ['Store every program permanently', 'Generate signals that coordinate datapath, memory, and I/O actions', 'Replace all registers with logic gates', 'Translate C source directly into machine code'],
    correctIndex: 1,
    hint: 'The datapath performs operations; another component tells it which operation to perform and when.',
    explanation: 'The control unit interprets instruction/state information and issues control signals that coordinate registers, the ALU, memory, and other datapath elements.',
    takeaway: 'The datapath performs data operations; control orchestrates those operations.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0] }
  },
  {
    id: 'cpu-instruction-register', topicId: 'processor', resourceId: 'lecture-10', difficulty: 'foundation',
    prompt: 'Why does a processor use an instruction register (IR)?',
    options: ['To hold the instruction currently being decoded or executed', 'To store every instruction in the program', 'To replace the program counter', 'To calculate disk seek time'],
    correctIndex: 0,
    hint: 'It provides a stable instruction value while control logic examines its fields.',
    explanation: 'The instruction register holds the current fetched instruction so the decoder and control logic can use it during execution.',
    takeaway: 'The IR holds the current instruction; instruction memory holds the program.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0] }
  },
  {
    id: 'pipeline-cycle-count', topicId: 'processor', resourceId: 'lecture-11', difficulty: 'application',
    prompt: 'In the assigned three-stage pipeline model, how many cycles are needed to complete five instructions?',
    options: ['5 cycles', '7 cycles', '10 cycles', '15 cycles'],
    correctIndex: 1,
    hint: 'The assigned model needs two cycles to fill, then completes one instruction per cycle.',
    explanation: 'For the assigned three-stage model, the chapter and video use 2 + number of instructions. Five instructions therefore require 2 + 5 = 7 cycles.',
    takeaway: 'After a three-stage pipeline fills, it can complete one instruction per cycle in the ideal model.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0] }
  },
  {
    id: 'pipeline-benefit', topicId: 'processor', resourceId: 'lecture-11', difficulty: 'foundation',
    prompt: 'What is the main performance goal of pipelining instruction execution?',
    options: ['Reduce every individual instruction to zero latency', 'Overlap stages from different instructions to improve throughput', 'Eliminate the need for control logic', 'Make all hazards impossible'],
    correctIndex: 1,
    hint: 'Several instructions can occupy different stages at the same time.',
    explanation: 'Pipelining overlaps the stages of different instructions. Its central benefit is improved throughput, not necessarily lower latency for one instruction.',
    takeaway: 'Pipelining targets instruction throughput by overlapping stage work.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0] }
  },
  {
    id: 'asm-register-halves', topicId: 'assembly', resourceId: 'lecture-12', difficulty: 'foundation',
    prompt: 'Which pair names the low and high 8-bit portions of the 16-bit AX register?',
    options: ['EBX and EAX', 'AL and AH', 'EIP and ESP', 'ZF and CF'],
    correctIndex: 1,
    hint: 'The suffixes identify the low and high byte of AX.',
    explanation: 'AL is the low-order byte of AX and AH is the high-order byte. Together they form the 16-bit AX portion of EAX.',
    takeaway: 'AX is divided into AH and AL; EAX contains the wider 32-bit register.',
    sourceMap: { readingIndexes: [1], videoIndexes: [0] }
  },
  {
    id: 'asm-stack-pointer', topicId: 'assembly', resourceId: 'lecture-12', difficulty: 'foundation',
    prompt: 'What does ESP identify in the assigned 32-bit x86 model?',
    options: ['The current arithmetic result', 'The current top of the stack', 'The next cache replacement', 'The instruction opcode'],
    correctIndex: 1,
    hint: 'Its name is the extended stack pointer.',
    explanation: 'ESP holds the address associated with the current top of the stack. Stack operations and procedure calls update it as values are pushed and removed.',
    takeaway: 'ESP tracks the top of the 32-bit x86 stack.',
    sourceMap: { readingIndexes: [0, 1], videoIndexes: [1] }
  },
  {
    id: 'asm-eip', topicId: 'assembly', resourceId: 'lecture-12', difficulty: 'foundation',
    prompt: 'In 32-bit x86, what does EIP identify?',
    options: ['The next/current instruction address in the execution flow', 'The top value stored in the heap', 'The number of CPU cores', 'The result of every arithmetic operation'],
    correctIndex: 0,
    hint: 'Its expanded name is the extended instruction pointer.',
    explanation: 'EIP is the instruction pointer for 32-bit x86 execution. Control-flow instructions change it to alter which instruction executes next.',
    takeaway: 'EIP tracks instruction flow; branches, calls, and returns update it.',
    sourceMap: { readingIndexes: [1], videoIndexes: [0] }
  },
  {
    id: 'asm-stack-call', topicId: 'assembly', resourceId: 'lecture-12', difficulty: 'application',
    prompt: 'What value is normally placed on the stack by an x86 CALL instruction?',
    options: ['The return address', 'Every general-purpose register', 'The complete executable file', 'The current physical-memory size'],
    correctIndex: 0,
    hint: 'RET needs to know where execution should continue.',
    explanation: 'CALL saves the return address on the stack before transferring control. RET later uses that address to resume the caller.',
    takeaway: 'CALL and RET use the stack to preserve and restore control flow.',
    sourceMap: { readingIndexes: [2], videoIndexes: [2] }
  },
  {
    id: 'asm-zero-flag', topicId: 'assembly', resourceId: 'lecture-12', difficulty: 'application',
    prompt: 'When does an arithmetic or logical operation set the x86 zero flag (ZF)?',
    options: ['When the operation result is zero', 'Whenever EIP changes', 'Only when the stack is empty', 'Whenever the result is negative'],
    correctIndex: 0,
    hint: 'The flag name describes the property of the result it records.',
    explanation: 'ZF is set when the result produced by the relevant arithmetic or logical operation is zero; otherwise it is cleared.',
    takeaway: 'ZF records whether the most recent relevant result was zero.',
    sourceMap: { readingIndexes: [1], videoIndexes: [3] }
  },
  {
    id: 'arch-instruction-decoder', topicId: 'architecture-data', resourceId: 'lecture-01', difficulty: 'foundation',
    prompt: 'Which CPU component interprets the operation encoded in the fetched instruction?',
    options: ['Instruction decoder', 'Data bus', 'Clock oscillator', 'Cache block'],
    correctIndex: 0,
    hint: 'The instruction register holds the instruction; another component examines its fields.',
    explanation: 'The instruction decoder examines the fetched instruction and identifies the operation and operand-related control needs for execution.',
    takeaway: 'The instruction register holds the instruction; the decoder interprets it.',
    sourceMap: { readingIndexes: [2], videoIndexes: [2] }
  },
  {
    id: 'logic-kmap-wraparound', topicId: 'combinational-logic', resourceId: 'lecture-04', difficulty: 'application',
    prompt: 'In a four-variable Karnaugh map, why may cells on the left and right edges be grouped together?',
    options: ['Every edge cell is a don’t-care', 'Gray-code ordering makes opposite edges adjacent by one-bit change', 'Groups may skip any number of columns', 'The map is sorted by decimal magnitude'],
    correctIndex: 1,
    hint: 'Compare the column labels at the two outer edges.',
    explanation: 'The outer Gray-code columns differ in only one bit, so the map wraps around and those edge cells are logically adjacent. A valid group must still be rectangular and power-of-two sized.',
    takeaway: 'K-map adjacency wraps across opposing edges because Gray-code labels still differ by one bit.',
    sourceMap: { readingIndexes: [0], videoIndexes: [2] }
  },
  {
    id: 'memory-device-capacity', topicId: 'memory-io', resourceId: 'lecture-07', difficulty: 'application',
    prompt: 'A memory device has 10 address lines and stores 8 bits at each address. What is its organization?',
    options: ['10 × 8 bits', '80 locations × 1 bit', '1024 locations × 8 bits', '256 locations × 10 bits'],
    correctIndex: 2,
    hint: 'Address lines determine the number of locations; data width determines bits per location.',
    explanation: 'Ten address lines select 2¹⁰ = 1024 locations. An 8-bit data width means each selected location stores eight bits, so the organization is 1024 × 8.',
    takeaway: 'Memory organization is number of addressable locations × bits stored per location.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0] }
  },
  {
    id: 'io-status-before-data', topicId: 'memory-io', resourceId: 'lecture-08', difficulty: 'application',
    prompt: 'In a simple polled input sequence, what should software normally do before reading the device data register?',
    options: ['Clear all processor registers', 'Disable the memory system', 'Write the data register to cache', 'Check the status register until input is ready'],
    correctIndex: 3,
    hint: 'The status value tells software whether the data value is valid yet.',
    explanation: 'Polling software repeatedly checks the device status register and reads the data register only after the ready condition is observed. Reading earlier may retrieve stale or invalid data.',
    takeaway: 'In polled I/O, status provides the evidence that a data transfer is ready.',
    sourceMap: { readingIndexes: [0], videoIndexes: [1] }
  },
  {
    id: 'io-memory-mapped-access', topicId: 'memory-io', resourceId: 'lecture-08-supplement', difficulty: 'foundation',
    prompt: 'What defines memory-mapped I/O?',
    options: ['Device registers occupy addresses accessed with ordinary memory-style operations', 'Every device contains the program’s main memory', 'I/O can occur only through an interrupt', 'The processor bypasses its address bus'],
    correctIndex: 0,
    hint: 'The device interface shares the processor’s address space.',
    explanation: 'With memory-mapped I/O, device registers are assigned addresses in the processor’s address space, so ordinary load/store-style accesses can communicate with them.',
    takeaway: 'Memory-mapped I/O places device registers in the address space seen by the processor.',
    sourceMap: { readingIndexes: [0, 1], videoIndexes: [0] }
  },
  {
    id: 'io-dma-purpose', topicId: 'memory-io', resourceId: 'lecture-08-supplement', difficulty: 'application',
    prompt: 'Why is direct memory access (DMA) useful for a large I/O transfer?',
    options: ['It makes every device register unnecessary', 'It transfers a block between a device and memory with less per-item CPU involvement', 'It guarantees that interrupts never occur', 'It changes virtual addresses into Boolean expressions'],
    correctIndex: 1,
    hint: 'Compare moving every item through CPU instructions with configuring one block transfer.',
    explanation: 'After the CPU configures a DMA operation, the controller can move a block between the device and memory without the CPU executing an instruction for every transferred item.',
    takeaway: 'DMA reduces per-item CPU work for block transfers; the CPU still configures and coordinates the operation.',
    sourceMap: { readingIndexes: [1], videoIndexes: [2] }
  },
  {
    id: 'pipeline-branch-flush', topicId: 'processor', resourceId: 'lecture-11', difficulty: 'application',
    prompt: 'Why may a taken branch require unfinished instructions in a simple pipeline to be discarded?',
    options: ['The cache permanently loses all instructions', 'The ALU can execute only hexadecimal values', 'Those instructions were fetched from the wrong sequential path', 'Every taken branch ends the program'],
    correctIndex: 2,
    hint: 'The fetch stage may continue before the processor knows the branch destination.',
    explanation: 'Before the branch decision is known, the pipeline may fetch instructions from the next sequential addresses. If the branch is taken, that work is on the wrong path and must be flushed.',
    takeaway: 'A taken branch can invalidate speculatively fetched sequential-path work.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0] }
  }
] as const;

const QUESTION_BY_ID = new Map(PRACTICE_QUESTIONS.map((question) => [question.id, question]));
const TOPIC_IDS = new Set(PRACTICE_TOPICS.map((topic) => topic.id));
const RESOURCE_IDS = new Set(PRACTICE_QUESTIONS.map((question) => question.resourceId));

export function emptyPracticeProgress(): PracticeProgress {
  return { version: PRACTICE_PROGRESS_VERSION, questions: {}, attempts: [] };
}

export function normalizePracticeProgress(value: unknown): PracticeProgress {
  if (!isRecord(value) || value.version !== PRACTICE_PROGRESS_VERSION || !isRecord(value.questions) || !Array.isArray(value.attempts)) {
    return emptyPracticeProgress();
  }
  const questions: Record<string, QuestionLearningProgress> = {};
  for (const [id, raw] of Object.entries(value.questions)) {
    if (!QUESTION_BY_ID.has(id) || !isQuestionProgress(raw)) continue;
    questions[id] = {
      attempts: boundedInteger(raw.attempts, 0, 100_000),
      correct: boundedInteger(raw.correct, 0, 100_000),
      correctStreak: boundedInteger(raw.correctStreak, 0, 100_000),
      stage: boundedInteger(raw.stage, 0, REVIEW_INTERVAL_DAYS.length - 1),
      lastCorrect: raw.lastCorrect,
      lastAnsweredAt: safeIso(raw.lastAnsweredAt),
      nextReviewAt: safeIso(raw.nextReviewAt),
      highConfidenceAttempts: boundedInteger(raw.highConfidenceAttempts, 0, 100_000),
      highConfidenceCorrect: boundedInteger(raw.highConfidenceCorrect, 0, 100_000),
      correctButUncertain: boundedInteger(raw.correctButUncertain, 0, 100_000),
      usedHintCount: boundedInteger(raw.usedHintCount, 0, 100_000),
      flagged: raw.flagged,
      reflectionCounts: normalizeReflectionCounts(raw.reflectionCounts)
    };
  }
  const attempts = value.attempts
    .filter(isAttemptLog)
    .slice(-500)
    .map((attempt) => ({ ...attempt, durationMs: boundedInteger(attempt.durationMs, 0, 60 * 60 * 1_000) }));
  return { version: PRACTICE_PROGRESS_VERSION, questions, attempts };
}

export function recordPracticeAnswer(
  progress: PracticeProgress,
  input: PracticeAnswerInput,
  now = new Date()
): { progress: PracticeProgress; result: PracticeAnswerResult } {
  const question = QUESTION_BY_ID.get(input.questionId);
  if (!question || !Number.isInteger(input.selectedIndex) || input.selectedIndex < 0 || input.selectedIndex >= question.options.length) {
    throw new Error('The practice answer is invalid.');
  }
  if (!CONFIDENCE_VALUES.has(input.confidence)) throw new Error('The confidence choice is invalid.');
  const correct = input.selectedIndex === question.correctIndex;
  const previous = progress.questions[question.id];
  const previousStage = previous?.stage ?? 0;
  const stageAdvance = correct ? (input.confidence === 'high' && !input.usedHint ? 2 : 1) : 0;
  const stage = correct ? Math.min(REVIEW_INTERVAL_DAYS.length - 1, previousStage + stageAdvance) : 0;
  const nextReviewAt = new Date(now.getTime() + REVIEW_INTERVAL_DAYS[stage]! * DAY_MS).toISOString();
  const current: QuestionLearningProgress = {
    attempts: (previous?.attempts ?? 0) + 1,
    correct: (previous?.correct ?? 0) + Number(correct),
    correctStreak: correct ? (previous?.correctStreak ?? 0) + 1 : 0,
    stage,
    lastCorrect: correct,
    lastAnsweredAt: now.toISOString(),
    nextReviewAt,
    highConfidenceAttempts: (previous?.highConfidenceAttempts ?? 0) + Number(input.confidence === 'high'),
    highConfidenceCorrect: (previous?.highConfidenceCorrect ?? 0) + Number(input.confidence === 'high' && correct),
    correctButUncertain: (previous?.correctButUncertain ?? 0) + Number(correct && input.confidence === 'low'),
    usedHintCount: (previous?.usedHintCount ?? 0) + Number(input.usedHint),
    flagged: previous?.flagged ?? false,
    reflectionCounts: { ...(previous?.reflectionCounts ?? {}) }
  };
  const attempt: PracticeAttemptLog = {
    questionId: question.id,
    topicId: question.topicId,
    correct,
    confidence: input.confidence,
    usedHint: input.usedHint,
    answeredAt: now.toISOString(),
    durationMs: boundedInteger(input.durationMs, 0, 60 * 60 * 1_000)
  };
  const updated: PracticeProgress = {
    version: PRACTICE_PROGRESS_VERSION,
    questions: { ...progress.questions, [question.id]: current },
    attempts: [...progress.attempts, attempt].slice(-500)
  };
  return {
    progress: updated,
    result: {
      question,
      selectedIndex: input.selectedIndex,
      correct,
      confidence: input.confidence,
      usedHint: input.usedHint,
      reviewLabel: reviewLabel(correct, input.confidence, input.usedHint),
      nextReviewAt
    }
  };
}

export function toggleSavedQuestion(progress: PracticeProgress, questionId: string): PracticeProgress {
  if (!QUESTION_BY_ID.has(questionId)) throw new Error('The practice question is invalid.');
  const previous = progress.questions[questionId] ?? freshQuestionProgress();
  return {
    ...progress,
    questions: {
      ...progress.questions,
      [questionId]: { ...previous, flagged: !previous.flagged }
    }
  };
}

export function recordPracticeReflection(
  progress: PracticeProgress,
  questionId: string,
  reflection: PracticeReflection
): PracticeProgress {
  if (!QUESTION_BY_ID.has(questionId) || !REFLECTION_VALUES.has(reflection)) {
    throw new Error('The practice reflection is invalid.');
  }
  const previous = progress.questions[questionId];
  if (!previous || previous.attempts < 1) throw new Error('Answer the question before adding a reflection.');
  const reflectionCounts = { ...previous.reflectionCounts };
  reflectionCounts[reflection] = (reflectionCounts[reflection] ?? 0) + 1;
  return {
    ...progress,
    questions: { ...progress.questions, [questionId]: { ...previous, reflectionCounts } }
  };
}

export function selectPracticeQuestions(
  progress: PracticeProgress,
  options: PracticeSelectionOptions,
  now = new Date()
): PracticeQuestion[] {
  const length = Math.max(1, Math.min(20, Math.trunc(options.length)));
  let candidates = PRACTICE_QUESTIONS.filter((question) =>
    (!options.topicId || question.topicId === options.topicId)
    && (!options.resourceId || question.resourceId === options.resourceId)
  );
  if (options.focus === 'due') {
    const due = candidates.filter((question) => isDue(progress.questions[question.id], now));
    candidates = due.length > 0 ? due : candidates.filter((question) => progress.questions[question.id]?.lastCorrect === false);
  } else if (options.focus === 'saved') {
    candidates = candidates.filter((question) => progress.questions[question.id]?.flagged);
  }
  if (candidates.length === 0) return [];
  const recentIds = new Set(progress.attempts.slice(-8).map((attempt) => attempt.questionId));
  const remaining = [...candidates];
  const chosen: PracticeQuestion[] = [];
  while (remaining.length > 0 && chosen.length < length) {
    const previousTopic = chosen.at(-1)?.topicId;
    remaining.sort((a, b) => {
      const difference = questionPriority(b, progress, now, recentIds, previousTopic) - questionPriority(a, progress, now, recentIds, previousTopic);
      return difference || a.id.localeCompare(b.id);
    });
    const next = remaining.shift();
    if (next) chosen.push(next);
  }
  return chosen;
}

export function buildPracticeDashboard(progress: PracticeProgress, now = new Date()): PracticeDashboard {
  const questionProgress = Object.values(progress.questions);
  const attempts = questionProgress.reduce((sum, item) => sum + item.attempts, 0);
  const correct = questionProgress.reduce((sum, item) => sum + item.correct, 0);
  const due = PRACTICE_QUESTIONS.filter((question) => isDue(progress.questions[question.id], now)).length;
  const saved = questionProgress.filter((item) => item.flagged).length;
  const confidentAttempts = questionProgress.reduce((sum, item) => sum + item.highConfidenceAttempts, 0);
  const confidentCorrect = questionProgress.reduce((sum, item) => sum + item.highConfidenceCorrect, 0);
  const correctButUncertain = questionProgress.reduce((sum, item) => sum + item.correctButUncertain, 0);
  const confidentMisses = confidentAttempts - confidentCorrect;
  const practiceDays = new Set(progress.attempts.map((attempt) => attempt.answeredAt.slice(0, 10))).size;
  const topics = PRACTICE_TOPICS.map((topic) => summarizeTopic(topic, progress, now));
  return {
    totalQuestions: PRACTICE_QUESTIONS.length,
    attemptedQuestions: questionProgress.filter((item) => item.attempts > 0).length,
    attempts,
    correct,
    accuracy: attempts > 0 ? correct / attempts : undefined,
    due,
    saved,
    practiceDays,
    confidentAttempts,
    confidentAccuracy: confidentAttempts > 0 ? confidentCorrect / confidentAttempts : undefined,
    correctButUncertain,
    confidentMisses,
    recommendation: recommendationText(topics, due, attempts),
    confidenceInsight: confidenceInsight(confidentAttempts, confidentCorrect, correctButUncertain),
    topics
  };
}

export function parsePracticePanelRequest(value: unknown): PracticePanelRequest | undefined {
  if (!isRecord(value) || typeof value.type !== 'string') return undefined;
  if (value.type === 'start') {
    const topicId = typeof value.topicId === 'string' && TOPIC_IDS.has(value.topicId as PracticeTopicId)
      ? value.topicId as PracticeTopicId
      : undefined;
    const resourceId = typeof value.resourceId === 'string' && RESOURCE_IDS.has(value.resourceId)
      ? value.resourceId
      : undefined;
    if (!MODE_VALUES.has(value.mode as PracticeMode) || !FOCUS_VALUES.has(value.focus as PracticeFocus)) return undefined;
    if (value.topicId !== undefined && !topicId) return undefined;
    if (value.resourceId !== undefined && !resourceId) return undefined;
    if (!Number.isInteger(value.length) || Number(value.length) < 1 || Number(value.length) > 20) return undefined;
    return {
      type: 'start', mode: value.mode as PracticeMode, focus: value.focus as PracticeFocus,
      ...(topicId ? { topicId } : {}),
      ...(resourceId ? { resourceId } : {}),
      length: Number(value.length)
    };
  }
  if (value.type === 'answer') {
    if (typeof value.questionId !== 'string' || !QUESTION_BY_ID.has(value.questionId)) return undefined;
    if (!Number.isInteger(value.selectedIndex) || !CONFIDENCE_VALUES.has(value.confidence as PracticeConfidence)) return undefined;
    if (typeof value.usedHint !== 'boolean' || !Number.isFinite(value.durationMs)) return undefined;
    return {
      type: 'answer', questionId: value.questionId, selectedIndex: Number(value.selectedIndex),
      confidence: value.confidence as PracticeConfidence, usedHint: value.usedHint,
      durationMs: boundedInteger(value.durationMs, 0, 60 * 60 * 1_000)
    };
  }
  if (value.type === 'toggle-save' && typeof value.questionId === 'string' && QUESTION_BY_ID.has(value.questionId)) {
    return { type: 'toggle-save', questionId: value.questionId };
  }
  if (value.type === 'reflect' && typeof value.questionId === 'string' && QUESTION_BY_ID.has(value.questionId) && REFLECTION_VALUES.has(value.reflection as PracticeReflection)) {
    return { type: 'reflect', questionId: value.questionId, reflection: value.reflection as PracticeReflection };
  }
  if (value.type === 'open-resource' && typeof value.resourceId === 'string' && RESOURCE_IDS.has(value.resourceId)) {
    return { type: 'open-resource', resourceId: value.resourceId };
  }
  if (value.type === 'open-preparation' && typeof value.resourceId === 'string' && RESOURCE_IDS.has(value.resourceId)) {
    const targets = new Set(['reading', 'video', 'lecture', 'book-home', 'author-channel', 'oer-series']);
    if (typeof value.target !== 'string' || !targets.has(value.target)) return undefined;
    const readingIndex = value.readingIndex === undefined ? 0 : Number(value.readingIndex);
    if (!Number.isInteger(readingIndex) || readingIndex < 0) return undefined;
    if (value.target === 'reading' && !preparationModule(value.resourceId)?.readings[readingIndex]) return undefined;
    if (value.target === 'video' && !preparationModule(value.resourceId)?.authorVideos[readingIndex]) return undefined;
    return { type: 'open-preparation', resourceId: value.resourceId, target: value.target as 'reading' | 'video' | 'lecture' | 'book-home' | 'author-channel' | 'oer-series', readingIndex };
  }
  if (value.type === 'toggle-preparation' && typeof value.resourceId === 'string' && RESOURCE_IDS.has(value.resourceId)
    && (value.field === 'read' || value.field === 'watched')) {
    return { type: 'toggle-preparation', resourceId: value.resourceId, field: value.field };
  }
  if (value.type === 'open-help' && (value.destination === 'faq' || value.destination === 'ai-tutor' || value.destination === 'before-class')) {
    return { type: 'open-help', destination: value.destination };
  }
  if (value.type === 'ready' || value.type === 'next' || value.type === 'home' || value.type === 'reset') return { type: value.type };
  return undefined;
}

export function practiceQuestion(questionId: string): PracticeQuestion | undefined {
  return QUESTION_BY_ID.get(questionId);
}

function summarizeTopic(topic: PracticeTopic, progress: PracticeProgress, now: Date): PracticeTopicSummary {
  const questions = PRACTICE_QUESTIONS.filter((question) => question.topicId === topic.id);
  const records = questions.map((question) => progress.questions[question.id]).filter((item): item is QuestionLearningProgress => Boolean(item));
  const attempts = records.reduce((sum, item) => sum + item.attempts, 0);
  const correct = records.reduce((sum, item) => sum + item.correct, 0);
  const due = questions.filter((question) => isDue(progress.questions[question.id], now)).length;
  const hasRecentMiss = records.some((item) => !item.lastCorrect);
  const averageStage = records.length > 0 ? records.reduce((sum, item) => sum + item.stage, 0) / records.length : 0;
  let status: PracticeTopicSummary['status'];
  let statusLabel: string;
  if (records.length === 0) {
    status = 'not-started'; statusLabel = 'Not started';
  } else if (due > 0 || hasRecentMiss) {
    status = 'review'; statusLabel = `${Math.max(due, 1)} to review`;
  } else if (records.length < questions.length) {
    status = 'building'; statusLabel = 'Building coverage';
  } else if (averageStage < 3) {
    status = 'strengthening'; statusLabel = 'Strengthening';
  } else {
    status = 'steady'; statusLabel = 'Steady practice';
  }
  return {
    id: topic.id, title: topic.title, attemptedQuestions: records.length, totalQuestions: questions.length,
    attempts, accuracy: attempts > 0 ? correct / attempts : undefined, due, status, statusLabel
  };
}

function questionPriority(
  question: PracticeQuestion,
  progress: PracticeProgress,
  now: Date,
  recentIds: Set<string>,
  previousTopic: PracticeTopicId | undefined
): number {
  const item = progress.questions[question.id];
  let score = 0;
  if (item?.flagged) score += 800;
  if (isDue(item, now)) score += 700;
  if (item?.lastCorrect === false) score += 500;
  if (!item || item.attempts === 0) score += 350;
  score += (REVIEW_INTERVAL_DAYS.length - 1 - (item?.stage ?? 0)) * 20;
  if (item && item.correctButUncertain > 0) score += 80;
  if (recentIds.has(question.id)) score -= 250;
  if (previousTopic && question.topicId !== previousTopic) score += 35;
  return score;
}

function isDue(progress: QuestionLearningProgress | undefined, now: Date): boolean {
  return Boolean(progress?.attempts && Date.parse(progress.nextReviewAt) <= now.getTime());
}

function reviewLabel(correct: boolean, confidence: PracticeConfidence, usedHint: boolean): string {
  if (!correct && confidence === 'high') return 'Confident miss — review the distinction and retry later';
  if (!correct) return 'Useful miss — read the explanation and schedule a retry';
  if (confidence === 'low' || usedHint) return 'Correct with support — revisit once to make it durable';
  return 'Correct retrieval — the next review is spaced farther out';
}

function recommendationText(topics: PracticeTopicSummary[], due: number, attempts: number): string {
  if (attempts === 0) return 'Start with a five-question mixed readiness check. It is ungraded and explanations appear immediately.';
  if (due > 0) return `${due} ${due === 1 ? 'question is' : 'questions are'} ready for spaced review.`;
  const target = [...topics].sort((a, b) => {
    const aAccuracy = a.accuracy ?? 1;
    const bAccuracy = b.accuracy ?? 1;
    return Number(a.status === 'not-started') - Number(b.status === 'not-started') || aAccuracy - bAccuracy;
  })[0];
  return target ? `Continue with ${target.title}; it currently offers the clearest next practice opportunity.` : 'Continue with a short mixed practice session.';
}

function confidenceInsight(confidentAttempts: number, confidentCorrect: number, correctButUncertain: number): string {
  if (confidentAttempts < 3) return 'Add a confidence choice before each answer; after three confident attempts, the dashboard can show whether confidence matches performance.';
  const rate = confidentCorrect / confidentAttempts;
  if (rate < 0.67) return 'Some confident answers were incorrect. Prioritize those distinctions instead of simply doing more questions.';
  if (correctButUncertain > 0) return `${correctButUncertain} correct ${correctButUncertain === 1 ? 'answer was' : 'answers were'} marked uncertain; review can turn those wins into reliable knowledge.`;
  return 'Your confident answers are usually correct in this local practice history. Keep checking confidence on new topics.';
}

function freshQuestionProgress(): QuestionLearningProgress {
  return {
    attempts: 0, correct: 0, correctStreak: 0, stage: 0, lastCorrect: false,
    lastAnsweredAt: new Date(0).toISOString(), nextReviewAt: new Date(0).toISOString(),
    highConfidenceAttempts: 0, highConfidenceCorrect: 0, correctButUncertain: 0,
    usedHintCount: 0, flagged: false, reflectionCounts: {}
  };
}

function isQuestionProgress(value: unknown): value is QuestionLearningProgress {
  if (!isRecord(value)) return false;
  return ['attempts', 'correct', 'correctStreak', 'stage', 'highConfidenceAttempts', 'highConfidenceCorrect', 'correctButUncertain', 'usedHintCount']
    .every((key) => Number.isFinite(value[key]))
    && typeof value.lastCorrect === 'boolean'
    && typeof value.lastAnsweredAt === 'string'
    && typeof value.nextReviewAt === 'string'
    && typeof value.flagged === 'boolean';
}

function isAttemptLog(value: unknown): value is PracticeAttemptLog {
  return isRecord(value)
    && typeof value.questionId === 'string' && QUESTION_BY_ID.has(value.questionId)
    && typeof value.topicId === 'string' && TOPIC_IDS.has(value.topicId as PracticeTopicId)
    && typeof value.correct === 'boolean'
    && typeof value.confidence === 'string' && CONFIDENCE_VALUES.has(value.confidence as PracticeConfidence)
    && typeof value.usedHint === 'boolean'
    && typeof value.answeredAt === 'string' && Number.isFinite(Date.parse(value.answeredAt))
    && Number.isFinite(value.durationMs);
}

function normalizeReflectionCounts(value: unknown): Partial<Record<PracticeReflection, number>> {
  if (!isRecord(value)) return {};
  const result: Partial<Record<PracticeReflection, number>> = {};
  for (const reflection of REFLECTION_VALUES) {
    if (Number.isFinite(value[reflection])) result[reflection] = boundedInteger(value[reflection], 0, 100_000);
  }
  return result;
}

function boundedInteger(value: unknown, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, Math.trunc(Number(value) || 0)));
}

function safeIso(value: string): string {
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : new Date(0).toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
