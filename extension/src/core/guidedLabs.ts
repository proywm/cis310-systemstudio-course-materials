export const GUIDED_LAB_PROGRESS_VERSION = 1;
export const GUIDED_LAB_PROGRESS_KEY = 'guidedLabs.progress.v1';

export type GuidedLabKind = 'circuit' | 'assembly';

export interface GuidedLabStep {
  id: string;
  title: string;
  instruction: string;
  evidence: string;
}

export interface GuidedCircuitArtifact {
  kind: 'circuit';
  fileName: string;
}

export interface GuidedAssemblyArtifact {
  kind: 'assembly';
  relativePath: string;
}

export interface GuidedLab {
  id: string;
  kind: GuidedLabKind;
  title: string;
  lectureLabel: string;
  resourceId: string;
  requiredForModule: boolean;
  sourceReadingIndex: number;
  sourceVideoIndex: number;
  purpose: string;
  boundary: string;
  artifact: GuidedCircuitArtifact | GuidedAssemblyArtifact;
  steps: readonly GuidedLabStep[];
  reflection: string;
}

export interface GuidedLabProgress {
  version: number;
  labs: Record<string, { completedStepIds: string[]; updatedAt: string }>;
}

export type GuidedLabRequest =
  | { type: 'select'; labId: string }
  | { type: 'toggle-step'; labId: string; stepId: string; completed: boolean }
  | { type: 'open-source'; labId: string; source: 'reading' | 'video' | 'lecture' }
  | { type: 'open-artifact'; labId: string }
  | { type: 'open-tutor'; labId: string }
  | { type: 'reset-lab'; labId: string };

const circuitStep = (id: string, title: string, instruction: string, evidence: string): GuidedLabStep =>
  ({ id, title, instruction, evidence });

const nasmSteps = (breakpoint: string, prediction: string, experiment: string): readonly GuidedLabStep[] => [
  circuitStep('read', 'Read the mapped sources', 'Read the focused open-book sections and accessible lecture before opening code.', 'One prerequisite idea restated in your own words.'),
  circuitStep('predict', 'Predict before running', prediction, 'A written register/flag/stack prediction.'),
  circuitStep('build', 'Build and run actual code', 'Open the actual NASM Workbench and select Build and run. Resolve every assembler diagnostic before debugging.', 'NASM and linker success plus executable output and exit code.'),
  circuitStep('breakpoint', 'Continue to the evidence label', `Start the debugger, enter ${breakpoint} as the breakpoint, and select Continue.`, 'The actual EIP/source location and current disassembly row.'),
  circuitStep('inspect', 'Inspect architectural state', 'Compare registers, decoded EFLAGS, stack, memory, and Intel disassembly with the prediction. Identify the earliest mismatch.', 'An expected-versus-observed evidence table.'),
  circuitStep('experiment', 'Make one controlled change', experiment, 'A second prediction, actual build, and observed result.'),
  circuitStep('explain', 'Explain and return to Canvas', 'Explain which instruction caused each important change. Then verify the live Canvas requirements and submit only your own work.', 'A concise causal explanation and checked Canvas destination.')
];

const searchSteps = (breakpoint: string, prediction: string, cases: string): readonly GuidedLabStep[] => [
  circuitStep('contract', 'State the function contract', 'Define the target input, zero-based found result, and -1 absent sentinel before opening code.', 'A precise input/output contract.'),
  circuitStep('predict', 'Predict the algorithm state', prediction, 'A paper trace made before execution.'),
  circuitStep('build', 'Run the self-checking executable', 'Build and run actual NASM code. Treat PASS with exit code 0 as formative evidence, not a course grade.', 'Assembler/linker success, PASS output, and exit code 0.'),
  circuitStep('debug', 'Stop inside the algorithm', `Start actual GDB, continue to ${breakpoint}, and inspect registers, flags, memory, stack, and disassembly.`, 'Actual state at the named label.'),
  circuitStep('step', 'Step a complete decision', 'Step through comparison, branch, and state update; stop at the first mismatch from the paper trace.', 'Before/after state tied to actual instructions.'),
  circuitStep('cases', 'Exercise meaningful cases', cases, 'Found, boundary, and absent expected/observed results.'),
  circuitStep('explain', 'Explain complexity and submit correctly', 'Explain termination and comparison growth, then verify the current Canvas contract before submitting personal work.', 'A justified explanation and Canvas receipt when submitted.')
];

export const GUIDED_LABS: readonly GuidedLab[] = [
  {
    id: 'circuit-boolean-path', kind: 'circuit', title: 'Boolean path from expression to gates',
    lectureLabel: 'Lecture 3', resourceId: 'lecture-03', sourceReadingIndex: 0, sourceVideoIndex: 0,
    requiredForModule: true,
    purpose: 'Turn a small Boolean expression into a testable gate network before using K-maps or larger components.',
    boundary: 'This practice expression is deliberately different from the current homework expressions.',
    artifact: { kind: 'circuit', fileName: 'guided-boolean-path.dig' },
    steps: [
      circuitStep('predict', 'Predict before opening the workbench', 'Create the four-row table for F = (A AND NOT B) OR (NOT A AND B). Circle the rows where exactly one input is 1.', 'A completed four-row prediction in your notes.'),
      circuitStep('pins', 'Place and label the interface', 'Create input pins A and B and one output pin F. Keep the labels visible so each simulated row is unambiguous.', 'A blank interface with two labeled inputs and one labeled output.'),
      circuitStep('terms', 'Build the two product terms', 'Use two NOT gates and two AND gates to form A·¬B and ¬A·B. Build one term at a time.', 'Each AND output can be probed separately.'),
      circuitStep('combine', 'Combine the terms', 'Feed the two product terms into one OR gate and connect it to F.', 'F changes only when the two inputs differ.'),
      circuitStep('test', 'Test all rows', 'Toggle 00, 01, 10, and 11. Compare each observed F value with the prediction before changing the circuit.', 'Four recorded predicted/observed pairs.'),
      circuitStep('explain', 'Explain the structure', 'State which Boolean law or pattern the network implements and why two separate product paths are required.', 'A two-sentence explanation using signal names.')
    ],
    reflection: 'Where would one wrong inversion first appear in the four-row evidence?'
  },
  {
    id: 'circuit-half-adder', kind: 'circuit', title: 'Build and verify a half adder',
    lectureLabel: 'Lecture 2', resourceId: 'lecture-02', sourceReadingIndex: 2, sourceVideoIndex: 2,
    requiredForModule: true,
    purpose: 'Connect one-bit binary addition to separate Sum and Carry signals before attempting a full or multi-bit adder.',
    boundary: 'This prerequisite half-adder lab does not provide the full-adder or four-bit-adder required by Homework 1.',
    artifact: { kind: 'circuit', fileName: 'guided-half-adder.dig' },
    steps: [
      circuitStep('predict', 'Write the addition table', 'For A,B = 00, 01, 10, and 11, predict both Sum and Carry. Treat the two outputs as the low and high bits of A+B.', 'Four rows with two predicted output bits each.'),
      circuitStep('pins', 'Create the circuit interface', 'Create and label input pins A and B and output pins Sum and Carry. Arrange Sum above Carry so the paths remain visually separate.', 'Two labeled inputs and two labeled outputs.'),
      circuitStep('sum', 'Build the Sum path', 'Connect A and B to an XOR gate, then connect that output to Sum. Before clicking an input, predict which two rows make XOR high.', 'The Sum path implements “exactly one input is high.”'),
      circuitStep('carry', 'Build the Carry path', 'Connect the same A and B inputs to an AND gate, then connect that output to Carry.', 'The Carry path becomes high only for 1+1.'),
      circuitStep('test', 'Simulate all four additions', 'Toggle each input pair in the complete upstream Digital simulator. Record predicted and observed Sum/Carry; repair a mismatch before proceeding.', 'All four observed Carry·Sum pairs match the binary-addition table you wrote before building.'),
      circuitStep('inspect', 'Inspect and explain the evidence', 'Save the `.dig` file and optionally open Digital’s verified preview. Explain why the two output paths use different gates.', 'A saved Digital-compatible circuit plus a short explanation tied to the truth table.')
    ],
    reflection: 'What additional input and logic would a full adder need, without drawing the full assignment solution?'
  },
  {
    id: 'circuit-kmap-implementation', kind: 'circuit', title: 'Implement and verify a minimized K-map function',
    lectureLabel: 'Lecture 4', resourceId: 'lecture-04', sourceReadingIndex: 0, sourceVideoIndex: 1,
    requiredForModule: true,
    purpose: 'Connect a legal K-map grouping to a smaller gate implementation and verify that simplification preserved every truth-table row.',
    boundary: 'The practice function F(A,B,C)=Σm(1,3,5,7) is fixed here and is not a current homework or project function.',
    artifact: { kind: 'circuit', fileName: 'guided-kmap-implementation.dig' },
    steps: [
      circuitStep('map', 'Complete the K-map before building', 'Place 1s at minterms 1, 3, 5, and 7 using Gray-code column order. Identify the largest legal group and write the resulting term.', 'A four-cell group and the prediction F=C.'),
      circuitStep('table', 'Write the verification table', 'List all eight A,B,C input combinations and predict F from both the minterm list and the simplified expression.', 'Eight paired predictions with no disagreement.'),
      circuitStep('interface', 'Create and label the interface', 'Create inputs A, B, C and output F in Full Digital. Keep all three inputs visible even when the minimized circuit does not need every signal.', 'A clearly labeled three-input interface.'),
      circuitStep('build', 'Build the minimized circuit', 'Implement the term produced by the K-map rather than rebuilding four separate minterms. Connect the result to F.', 'A circuit whose structure matches the minimized expression.'),
      circuitStep('test', 'Simulate every row', 'Toggle all eight input combinations and record observed F beside both predictions. Repair any mismatch before marking the step complete.', 'Eight observed values matching the truth table.'),
      circuitStep('compare', 'Compare implementations', 'Estimate the gates and gate inputs required by canonical SOP versus the minimized implementation, then explain why A and B disappear.', 'A cost comparison and a constant-variable explanation tied to the K-map group.')
    ],
    reflection: 'Which evidence proves the smaller circuit is equivalent rather than merely plausible?'
  },
  {
    id: 'circuit-mux', kind: 'circuit', title: 'Build a 2-to-1 data selector',
    lectureLabel: 'Lecture 5', resourceId: 'lecture-05', sourceReadingIndex: 1, sourceVideoIndex: 2,
    requiredForModule: true,
    purpose: 'Make selection behavior visible before multiplexers are used inside registers, buses, and an ALU.',
    boundary: 'The lab uses one-bit inputs and does not construct the project register-file read ports.',
    artifact: { kind: 'circuit', fileName: 'guided-2to1-selector.dig' },
    steps: [
      circuitStep('predict', 'Predict selection', 'For S=0 predict Y for both values of D0; repeat for S=1 and D1. State which unselected input must not affect Y.', 'A selection table covering S, D0, D1, and Y.'),
      circuitStep('pins', 'Place the interface', 'Create D0, D1, and S input pins and one Y output pin.', 'All four signals are labeled.'),
      circuitStep('select', 'Create complementary select paths', 'Use S and NOT S to enable only one data path at a time.', 'Both S polarities are visible.'),
      circuitStep('gate', 'Gate and combine the data', 'AND D0 with NOT S, AND D1 with S, and OR the two results into Y.', 'Only the selected data path reaches Y.'),
      circuitStep('test', 'Try adversarial rows', 'Hold the selected input fixed while toggling the unselected input; verify Y does not change. Then switch S.', 'Observed evidence that the unselected input is blocked.'),
      circuitStep('explain', 'Connect to the processor', 'Explain how the same structure can choose a register output or an ALU result when the buses are wider.', 'A one-paragraph scaling explanation.')
    ],
    reflection: 'How many select bits would a four-input selector require, and why?'
  },
  {
    id: 'circuit-state-bit', kind: 'circuit', title: 'Observe one stored state bit',
    lectureLabel: 'Lecture 6', resourceId: 'lecture-06', sourceReadingIndex: 0, sourceVideoIndex: 0,
    requiredForModule: true,
    purpose: 'Separate data, clock, and stored output before building counters or multi-bit registers.',
    boundary: 'This single-bit observation lab is smaller than Homework 2 and the project register components.',
    artifact: { kind: 'circuit', fileName: 'guided-state-bit.dig' },
    steps: [
      circuitStep('predict', 'Predict clocked behavior', 'Write Q before and after a rising edge for D=0 and D=1. Also predict what happens when D changes without an edge.', 'A timing prediction distinguishing data changes from state updates.'),
      circuitStep('place', 'Place D, clock, and Q', 'Create a data input, a clock input, a D flip-flop, and a Q output. Label each signal.', 'A minimal sequential interface.'),
      circuitStep('load0', 'Store zero', 'Set D=0 and generate one active clock edge. Observe Q.', 'Q stores 0 after the event.'),
      circuitStep('hold', 'Test the hold behavior', 'Change D to 1 without an active edge. Confirm Q still shows the previous state.', 'Evidence that input change alone does not update state.'),
      circuitStep('load1', 'Store one', 'Generate the next active edge and observe Q. If it does not change, inspect the exact clock connection and component edge setting.', 'Q updates to 1 on the configured edge.'),
      circuitStep('explain', 'Explain current and next state', 'Use D as next-state input and Q as current state in a two-sentence explanation.', 'A precise current-state/next-state statement.')
    ],
    reflection: 'Which observation proves that this circuit has memory rather than only combinational behavior?'
  },
  {
    id: 'circuit-address-decoder', kind: 'circuit', title: 'Explore a 2-to-4 address decoder',
    lectureLabel: 'Lecture 7', resourceId: 'lecture-07', sourceReadingIndex: 0, sourceVideoIndex: 0,
    requiredForModule: true,
    purpose: 'Relate address bits to one selected device or location before integrating memory.',
    boundary: 'This uses four visible output indicators and does not implement project DRAM or a processor memory system.',
    artifact: { kind: 'circuit', fileName: 'guided-address-decoder.dig' },
    steps: [
      circuitStep('predict', 'Map addresses to outputs', 'List addresses 00 through 11 and predict which one of Y0–Y3 should be selected for each.', 'A four-row one-hot table.'),
      circuitStep('interface', 'Place address and output signals', 'Create two address inputs A1/A0 and four labeled outputs Y0–Y3.', 'Six clearly labeled signals.'),
      circuitStep('decoder', 'Build four decoded paths', 'Create NOT A1 and NOT A0, then use four two-input AND gates for ¬A1·¬A0, ¬A1·A0, A1·¬A0, and A1·A0. Connect them in address order to Y0–Y3.', 'Four visible minterm paths with active-high outputs.'),
      circuitStep('test', 'Sweep every address', 'Toggle 00, 01, 10, and 11. At each address, verify exactly one intended output is active.', 'Four observed one-hot selections.'),
      circuitStep('invariant', 'Check the one-hot invariant', 'For every address, count the active outputs. Diagnose the first row where the count is not exactly one.', 'A four-row active-output count of one.'),
      circuitStep('explain', 'Connect to memory', 'Explain why a memory system needs both an address and a selection/enable decision.', 'A short address-versus-chip-select explanation.')
    ],
    reflection: 'How many output selections are possible with n address bits?'
  },
  {
    id: 'circuit-alu-slice', kind: 'circuit', title: 'Build a small arithmetic/logic selector',
    lectureLabel: 'Lecture 10', resourceId: 'lecture-10', sourceReadingIndex: 0, sourceVideoIndex: 0,
    requiredForModule: true,
    purpose: 'See how an operation selector chooses between independently verified arithmetic and logic paths.',
    boundary: 'This one-bit ADD/XOR selector is an analogous practice component, not the multi-operation ALU required by Project 2.',
    artifact: { kind: 'circuit', fileName: 'guided-alu-slice.dig' },
    steps: [
      circuitStep('contract', 'Define the small contract', 'Use one-bit A and B, control OP, result Y, and carry C. Define OP=0 as XOR and OP=1 as half-adder Sum/Carry.', 'A written operation table.'),
      circuitStep('paths', 'Build independent paths', 'Build and test the XOR result and half-adder carry path separately before adding selection.', 'Each path has its own verified rows.'),
      circuitStep('select', 'Select the visible result', 'Build a 2-to-1 selector from NOT, two AND gates, and OR: gate the logic result with ¬OP and the arithmetic result with OP. Keep carry explicitly inactive or ignored for the logic operation.', 'OP visibly changes the chosen operation.'),
      circuitStep('test', 'Exercise operations and inputs', 'For both OP values, test at least A,B=01 and 11. Record Y and C.', 'Four operation/input observations.'),
      circuitStep('fault', 'Introduce and diagnose one mismatch', 'Temporarily swap one selector input, predict the symptom, observe it, and restore the correct connection.', 'A recorded expected/observed diagnostic.'),
      circuitStep('explain', 'Name the reusable pattern', 'Explain why computing candidate results first and selecting afterward scales to a larger ALU.', 'A structural explanation without a project wiring plan.')
    ],
    reflection: 'Which signals belong to operation computation, and which belong to control?'
  },
  {
    id: 'assembly-register-arithmetic', kind: 'assembly', title: 'Build and debug register arithmetic',
    lectureLabel: 'Lecture 12', resourceId: 'lecture-12', sourceReadingIndex: 4, sourceVideoIndex: 0, requiredForModule: true,
    purpose: 'Connect NASM MOV, ADD, and CMP to actual IA-32 registers, flags, disassembly, and executable evidence.',
    boundary: 'The original constants are formative; this is not a solution to a current Canvas assignment.',
    artifact: { kind: 'assembly', relativePath: 'nasm-elf32/RegisterArithmetic.asm' },
    steps: nasmSteps('inspect_after_add', 'Predict EAX after MOV/MOV/ADD and identify which instruction can change arithmetic flags.', 'Change one constant, predict the new EAX and test result, then rebuild.'),
    reflection: 'Which evidence distinguishes a NASM syntax error, a wrong prediction, and a failing executable check?'
  },
  {
    id: 'assembly-flags-branch', kind: 'assembly', title: 'Inspect flags and a signed branch',
    lectureLabel: 'Lecture 12', resourceId: 'lecture-12', sourceReadingIndex: 4, sourceVideoIndex: 3, requiredForModule: false,
    purpose: 'Use actual CMP/EFLAGS evidence to explain why a signed conditional branch is taken.',
    boundary: 'The comparison values are standalone practice, not submitted code.',
    artifact: { kind: 'assembly', relativePath: 'nasm-elf32/FlagsBranch.asm' },
    steps: nasmSteps('inspect_signed_compare', 'Predict ZF, SF, CF, OF and whether JGE is taken after comparing -3 with 2.', 'Reverse the operands, predict the new flags/path, then rebuild.'),
    reflection: 'Why can signed less-than not be decided from CF alone?'
  },
  {
    id: 'assembly-memory-loop', kind: 'assembly', title: 'Walk and sum an array',
    lectureLabel: 'Lecture 12', resourceId: 'lecture-12', sourceReadingIndex: 4, sourceVideoIndex: 0, requiredForModule: false,
    purpose: 'Relate ESI addresses, ECX loop count, memory words, EAX accumulation, and actual output.',
    boundary: 'This fixed array is formative and does not answer a released homework prompt.',
    artifact: { kind: 'assembly', relativePath: 'nasm-elf32/LoopSum.asm' },
    steps: nasmSteps('inspect_sum', 'Predict ESI, ECX, and EAX after the first and final loop iterations.', 'Change one array value, predict the output delta, then rebuild and run.'),
    reflection: 'Why does ESI advance by four for each DD array element?'
  },
  {
    id: 'assembly-linear-search', kind: 'assembly', title: 'Test linear search',
    lectureLabel: 'Lecture 12', resourceId: 'lecture-12', sourceReadingIndex: 4, sourceVideoIndex: 0, requiredForModule: false,
    purpose: 'Debug a complete NASM array search and verify found, boundary, and absent cases.',
    boundary: 'The fixed data and tests are formative; follow the current Canvas contract for submitted work.',
    artifact: { kind: 'assembly', relativePath: 'nasm-elf32/LinearSearch.asm' },
    steps: searchSteps('search_loop', 'For target 19, list each expected index/value comparison and the returned index.', 'Use first, last, and absent targets; retain PASS and exit-code evidence.'),
    reflection: 'Why is the worst-case comparison count linear in the number of elements?'
  },
  {
    id: 'assembly-binary-search-iterative', kind: 'assembly', title: 'Test iterative binary search',
    lectureLabel: 'Lecture 12', resourceId: 'lecture-12', sourceReadingIndex: 4, sourceVideoIndex: 0, requiredForModule: false,
    purpose: 'Inspect low/high/mid updates and verify that each comparison discards the correct half.',
    boundary: 'The seven-element data set is formative and must not replace a Canvas-assigned implementation.',
    artifact: { kind: 'assembly', relativePath: 'nasm-elf32/BinarySearchIterative.asm' },
    steps: searchSteps('inspect_midpoint', 'For target 25, predict every low/high/mid triple and the found index.', 'Test an absent value between elements and explain the final low>high interval.'),
    reflection: 'Which invariant keeps the possible target region within low through high?'
  },
  {
    id: 'assembly-binary-search-recursive', kind: 'assembly', title: 'Inspect recursive binary search',
    lectureLabel: 'Lecture 12', resourceId: 'lecture-12', sourceReadingIndex: 4, sourceVideoIndex: 2, requiredForModule: false,
    purpose: 'Connect recursive subproblems to actual stack frames, arguments, return addresses, and EAX.',
    boundary: 'This recursion exercise is formative; students must produce their own Canvas submission.',
    artifact: { kind: 'assembly', relativePath: 'nasm-elf32/BinarySearchRecursive.asm' },
    steps: searchSteps('inspect_recursive_frame', 'Name both base cases and map target, low, high, saved EBP, and return address in one frame.', 'Inspect two nested frames, then test the absent base case and return path.'),
    reflection: 'What guarantees that each recursive call receives a strictly smaller interval?'
  },
  {
    id: 'assembly-stack-call', kind: 'assembly', title: 'Inspect a call and stack frame',
    lectureLabel: 'Lecture 12', resourceId: 'lecture-12', sourceReadingIndex: 4, sourceVideoIndex: 2, requiredForModule: false,
    purpose: 'Observe actual CALL, argument placement, saved EBP, return address, RET, and restored ESP.',
    boundary: 'The small add procedure is formative, not a project implementation.',
    artifact: { kind: 'assembly', relativePath: 'nasm-elf32/StackCall.asm' },
    steps: nasmSteps('inspect_stack_frame', 'Predict the stack from the two PUSH instructions through CALL and the frame prologue.', 'Change one argument, predict EAX, then rebuild and rerun the self-check.'),
    reflection: 'Which stored stack value tells RET where execution should continue?'
  }
] as const;

const LAB_BY_ID = new Map(GUIDED_LABS.map((lab) => [lab.id, lab]));

export function guidedLab(id: string): GuidedLab | undefined {
  return LAB_BY_ID.get(id);
}

export function guidedLabsForResource(resourceId: string): readonly GuidedLab[] {
  return GUIDED_LABS.filter((lab) => lab.resourceId === resourceId);
}

export function guidedAssemblyTutorPrompt(labId: string): string | undefined {
  const lab = guidedLab(labId);
  if (!lab || lab.kind !== 'assembly') return undefined;
  return [
    `I am working through the formative CIS 310 lab “${lab.title}.”`,
    `Learning purpose: ${lab.purpose}`,
    'First ask me to state my expected result, the earliest instruction where expected and observed state differ, and the register/flag/memory/stack evidence I have collected.',
    'Then give one diagnostic question or one small hint at a time. Use a smaller analogous example if I lack a prerequisite.',
    'Do not write, repair, or complete my program; do not provide submission-ready NASM code; and do not infer current Canvas requirements.',
    'Use the actual NASM/GNU ld/GDB evidence when diagnosing build or execution behavior. Keep the optional Instruction Trace Tutor separate and tell me when actual toolchain evidence is required.'
  ].join('\n');
}

export function emptyGuidedLabProgress(): GuidedLabProgress {
  return { version: GUIDED_LAB_PROGRESS_VERSION, labs: {} };
}

export function normalizeGuidedLabProgress(value: unknown): GuidedLabProgress {
  if (!isRecord(value) || value.version !== GUIDED_LAB_PROGRESS_VERSION || !isRecord(value.labs)) {
    return emptyGuidedLabProgress();
  }
  const labs: GuidedLabProgress['labs'] = {};
  for (const [labId, raw] of Object.entries(value.labs)) {
    const lab = guidedLab(labId);
    if (!lab || !isRecord(raw) || !Array.isArray(raw.completedStepIds)) continue;
    const validSteps = new Set(lab.steps.map((step) => step.id));
    const completedStepIds = [...new Set(raw.completedStepIds.filter((id): id is string => typeof id === 'string' && validSteps.has(id)))];
    labs[labId] = {
      completedStepIds,
      updatedAt: typeof raw.updatedAt === 'string' && !Number.isNaN(Date.parse(raw.updatedAt))
        ? new Date(raw.updatedAt).toISOString()
        : new Date(0).toISOString()
    };
  }
  return { version: GUIDED_LAB_PROGRESS_VERSION, labs };
}

export function setGuidedLabStep(
  progress: GuidedLabProgress,
  labId: string,
  stepId: string,
  completed: boolean,
  now = new Date()
): GuidedLabProgress {
  const lab = guidedLab(labId);
  if (!lab || !lab.steps.some((step) => step.id === stepId)) throw new Error('The guided-lab step is invalid.');
  const ids = new Set(progress.labs[labId]?.completedStepIds ?? []);
  if (completed) ids.add(stepId); else ids.delete(stepId);
  return {
    version: GUIDED_LAB_PROGRESS_VERSION,
    labs: { ...progress.labs, [labId]: { completedStepIds: [...ids], updatedAt: now.toISOString() } }
  };
}

export function resetGuidedLab(progress: GuidedLabProgress, labId: string): GuidedLabProgress {
  if (!guidedLab(labId)) throw new Error('The guided lab is invalid.');
  const labs = { ...progress.labs };
  delete labs[labId];
  return { version: GUIDED_LAB_PROGRESS_VERSION, labs };
}

export function parseGuidedLabRequest(value: unknown): GuidedLabRequest | undefined {
  if (!isRecord(value) || typeof value.type !== 'string' || typeof value.labId !== 'string') return undefined;
  const lab = guidedLab(value.labId);
  if (!lab) return undefined;
  if (value.type === 'select') return { type: 'select', labId: lab.id };
  if (value.type === 'open-artifact') return { type: 'open-artifact', labId: lab.id };
  if (value.type === 'open-tutor' && lab.kind === 'assembly') return { type: 'open-tutor', labId: lab.id };
  if (value.type === 'reset-lab') return { type: 'reset-lab', labId: lab.id };
  if (value.type === 'open-source' && (value.source === 'reading' || value.source === 'video' || value.source === 'lecture')) {
    return { type: 'open-source', labId: lab.id, source: value.source };
  }
  if (value.type === 'toggle-step' && typeof value.stepId === 'string' && typeof value.completed === 'boolean'
    && lab.steps.some((step) => step.id === value.stepId)) {
    return { type: 'toggle-step', labId: lab.id, stepId: value.stepId, completed: value.completed };
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
