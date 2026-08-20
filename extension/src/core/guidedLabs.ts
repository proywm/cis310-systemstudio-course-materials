export const GUIDED_LAB_PROGRESS_VERSION = 1;

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
  profile: 'irvine32' | 'nasm-ia32';
}

export interface GuidedLab {
  id: string;
  kind: GuidedLabKind;
  title: string;
  lectureLabel: string;
  resourceId: string;
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
  | { type: 'reset-lab'; labId: string };

const circuitStep = (id: string, title: string, instruction: string, evidence: string): GuidedLabStep =>
  ({ id, title, instruction, evidence });

export const GUIDED_LABS: readonly GuidedLab[] = [
  {
    id: 'circuit-boolean-path', kind: 'circuit', title: 'Boolean path from expression to gates',
    lectureLabel: 'Lecture 3', resourceId: 'lecture-03', sourceReadingIndex: 0, sourceVideoIndex: 0,
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
    id: 'circuit-mux', kind: 'circuit', title: 'Build a 2-to-1 data selector',
    lectureLabel: 'Lecture 5', resourceId: 'lecture-05', sourceReadingIndex: 1, sourceVideoIndex: 2,
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
    id: 'assembly-register-arithmetic', kind: 'assembly', title: 'Trace register arithmetic',
    lectureLabel: 'Lecture 12', resourceId: 'lecture-12', sourceReadingIndex: 1, sourceVideoIndex: 0,
    purpose: 'Connect MOV and ADD source statements to EAX and arithmetic flags.',
    boundary: 'The bundled example uses original constants and is not a solution to Homework 3.',
    artifact: { kind: 'assembly', relativePath: 'irvine32/AddTwo.asm', profile: 'irvine32' },
    steps: [
      circuitStep('predict', 'Predict EAX', 'Before loading the trace model, compute EAX after each MOV/ADD instruction and note which flags might change.', 'A line-by-line EAX prediction.'),
      circuitStep('build', 'Load the trace model', 'Open the Instruction Trace Tutor with the Irvine32-style profile or Auto-detect and select Load trace model.', 'The next source instruction and initial teaching-state registers are visible; this is not assembler evidence.'),
      circuitStep('step-mov', 'Step through MOV', 'Step once and compare EAX with your prediction. Explain why moving a value does not perform addition.', 'The observed EAX value after MOV.'),
      circuitStep('step-add', 'Step through ADD', 'Step again and inspect EAX, ZF, SF, CF, and OF.', 'The result and four observed flags.'),
      circuitStep('modify', 'Change one constant', 'Edit one constant, predict the new result, rebuild, and step again.', 'A second prediction/observation pair.'),
      circuitStep('explain', 'Explain source-to-state evidence', 'Name the exact instruction responsible for each register or flag change.', 'A concise trace explanation.')
    ],
    reflection: 'Which evidence distinguishes a wrong prediction from a tool or syntax error?'
  },
  {
    id: 'assembly-flags-branch', kind: 'assembly', title: 'Compare, inspect flags, and branch',
    lectureLabel: 'Lecture 12', resourceId: 'lecture-12', sourceReadingIndex: 1, sourceVideoIndex: 3,
    purpose: 'Observe how CMP updates flags and a conditional jump changes EIP.',
    boundary: 'The example is a standalone signed-comparison trace, not submitted assignment code.',
    artifact: { kind: 'assembly', relativePath: 'irvine32/FlagsBranch.asm', profile: 'irvine32' },
    steps: [
      circuitStep('predict', 'Predict the branch', 'Read the two compared values and predict whether JL is taken. Record the expected EBX marker.', 'A branch and EBX prediction.'),
      circuitStep('build', 'Build and locate CMP', 'Build the source, then step until CMP is the next instruction.', 'The source line and pre-CMP registers are visible.'),
      circuitStep('cmp', 'Execute CMP', 'Step CMP and inspect ZF, SF, CF, and OF without expecting either operand to change.', 'A flag snapshot with unchanged operands.'),
      circuitStep('jump', 'Execute the conditional jump', 'Step JL and observe the next source line/EIP. Compare the taken path with your prediction.', 'The selected control-flow path.'),
      circuitStep('reverse', 'Reverse the relationship', 'Change the first value so the comparison reverses, rebuild, and repeat.', 'A second branch outcome with evidence.'),
      circuitStep('explain', 'Explain signed branching', 'Explain why signed less-than uses sign/overflow meaning rather than carry alone.', 'A flags-to-branch explanation.')
    ],
    reflection: 'Why does CMP change flags without storing a subtraction result in either operand?'
  },
  {
    id: 'assembly-memory-loop', kind: 'assembly', title: 'Walk an array with a counted loop',
    lectureLabel: 'Lecture 12', resourceId: 'lecture-12', sourceReadingIndex: 1, sourceVideoIndex: 0,
    purpose: 'Connect ESI addresses, ECX loop count, memory values, and an EAX accumulator.',
    boundary: 'The NASM example sums a fixed original array and does not answer a current homework prompt.',
    artifact: { kind: 'assembly', relativePath: 'nasm-ia32/LoopSum.asm', profile: 'nasm-ia32' },
    steps: [
      circuitStep('predict', 'Predict the first iteration', 'Record initial ESI, ECX, and EAX, then predict them after one loop body.', 'Three before/after register predictions.'),
      circuitStep('build', 'Load the NASM-style trace', 'Select NASM-style trace model, load it, and locate the declared values in Data symbols.', 'The teaching-model array address and first value are visible; use the real NASM example for executable evidence.'),
      circuitStep('load', 'Observe memory addressing', 'Step ADD EAX,[ESI] and verify the loaded value comes from the address in ESI.', 'A matching address, memory value, and accumulator change.'),
      circuitStep('advance', 'Observe pointer and count changes', 'Step ADD ESI,4 and LOOP. Record the new pointer, ECX, and branch target.', 'Evidence for one complete iteration.'),
      circuitStep('run', 'Run to completion', 'Predict the sum and doubled result, then Run and compare with output and EAX.', 'Final EAX and output match the prediction.'),
      circuitStep('modify', 'Change the data, not the algorithm', 'Change one array element, predict the delta in the final output, rebuild, and run.', 'A controlled data-change experiment.')
    ],
    reflection: 'Why does ESI advance by four rather than one in this example?'
  },
  {
    id: 'assembly-stack-call', kind: 'assembly', title: 'Trace a call and stack frame',
    lectureLabel: 'Lecture 12', resourceId: 'lecture-12', sourceReadingIndex: 2, sourceVideoIndex: 2,
    purpose: 'Observe CALL, a saved register, a frame pointer, RET, and restoration of ESP.',
    boundary: 'The small procedure is an original trace example, not a project implementation.',
    artifact: { kind: 'assembly', relativePath: 'irvine32/StackCall.asm', profile: 'irvine32' },
    steps: [
      circuitStep('predict', 'Predict preserved and changed state', 'Predict EAX, EBX, EBP, and ESP before CALL, inside the procedure, and after RET.', 'A three-point register/stack prediction.'),
      circuitStep('call', 'Step CALL', 'Build and step to CALL, then execute it. Inspect EIP and the top of stack for the return address.', 'Visible control transfer and stack growth.'),
      circuitStep('frame', 'Create the frame', 'Step PUSH EBP and MOV EBP,ESP. Identify the saved frame pointer and current frame base.', 'A stack and EBP snapshot.'),
      circuitStep('preserve', 'Observe register preservation', 'Step PUSH/POP around the arithmetic and confirm EBX returns to its caller-visible value.', 'EBX before and after the procedure.'),
      circuitStep('return', 'Leave and return', 'Step LEAVE and RET. Confirm ESP and EIP return to the caller path while EAX keeps the result.', 'Restored stack plus returned result.'),
      circuitStep('explain', 'Explain the calling sequence', 'Describe separately what CALL, the procedure body, LEAVE, and RET contribute.', 'A four-part explanation tied to trace evidence.')
    ],
    reflection: 'Which stack value lets RET know where execution should continue?'
  },
  {
    id: 'assembly-console-input', kind: 'assembly', title: 'Use virtual console input safely',
    lectureLabel: 'Lecture 12', resourceId: 'lecture-12', sourceReadingIndex: 2, sourceVideoIndex: 0,
    purpose: 'Trace Irvine-style input contracts without OS-specific setup or a shared instructor credential.',
    boundary: 'Input remains in the bounded trace-tutor model and the example is not a submitted program.',
    artifact: { kind: 'assembly', relativePath: 'irvine32/ConsoleInput.asm', profile: 'irvine32' },
    steps: [
      circuitStep('contract', 'Read the procedure contracts', 'Identify the register used for ReadInt output and the EDX/ECX inputs plus EAX output used by ReadString.', 'A short input/output register table.'),
      circuitStep('input', 'Plan virtual input', 'Enter one signed integer and one name on separate lines in Virtual console input.', 'Two deliberate input lines with no private information.'),
      circuitStep('readint', 'Step ReadInt', 'Step through the first call and inspect EAX and OF. Compare with the entered integer.', 'The integer and overflow evidence.'),
      circuitStep('readstring', 'Step ReadString', 'Observe the buffer address, maximum length, returned character count, and Data symbols.', 'EDX, ECX, EAX, and buffer evidence.'),
      circuitStep('invalid', 'Try a controlled invalid integer', 'Rebuild with a nonnumeric first line and observe OF and the badInput branch.', 'A reproducible error-path trace.'),
      circuitStep('explain', 'Explain the model boundary', 'State why the tutor’s virtual input is portable and why it is not evidence of native Irvine32 behavior.', 'A portability explanation that explicitly separates the trace model from exact Windows execution.')
    ],
    reflection: 'What evidence shows whether a failure came from input validation or program control flow?'
  }
] as const;

const LAB_BY_ID = new Map(GUIDED_LABS.map((lab) => [lab.id, lab]));

export function guidedLab(id: string): GuidedLab | undefined {
  return LAB_BY_ID.get(id);
}

export function guidedLabsForResource(resourceId: string): readonly GuidedLab[] {
  return GUIDED_LABS.filter((lab) => lab.resourceId === resourceId);
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
