import type { CourseworkId } from './coursework';

export type CircuitPreflightId =
  | 'register-4'
  | 'instruction-register-8'
  | 'program-counter-4'
  | 'instruction-memory-16x8'
  | 'memory-16x4'
  | 'register-file-4x4'
  | 'alu-4'
  | 'processor-4bit';

export interface CircuitPreflightContract {
  id: CircuitPreflightId;
  label: string;
  detail: string;
  courseworkIds: readonly CourseworkId[];
  mode: 'external' | 'embedded';
  interfaceSummary: string;
  expectedVectors: number;
  testData?: string;
}

const REGISTER_TESTS = `C LD RST D Q
C 0 1 0 0
C 1 0 9 9
C 0 0 3 9
C 1 0 6 6
C 0 1 15 0`;

const PROGRAM_COUNTER_TESTS = `C INC LD RST D Q
C 0 0 1 0 0
C 1 0 0 0 1
C 1 0 0 0 2
C 0 0 0 7 2
C 0 1 0 10 10
C 1 0 0 0 11
C 0 0 1 0 0
C 0 1 0 15 15
C 1 0 0 0 0`;

const INSTRUCTION_REGISTER_TESTS = `C LD RST D Q
C 0 1 0 0
C 1 0 149 149
C 0 0 36 149
C 1 0 238 238
C 0 1 255 0`;

const INSTRUCTION_MEMORY_TESTS = `Address Instruction
0 149
1 163
2 36
3 238
4 126
5 53
6 0
7 0
8 0
9 0
10 0
11 0
12 0
13 0
14 0
15 0`;

const MEMORY_TESTS = `C CS WE Address DataIn DataOut
C 1 1 2 9 x
0 1 0 2 0 9
C 1 1 14 6 x
0 1 0 14 0 6
0 1 0 2 0 9
C 1 0 2 3 9
0 1 0 2 0 9`;

const REGISTER_FILE_TESTS = `C WE WriteSel WriteData ReadSelA ReadSelB ReadA ReadB
C 1 0 3 0 0 3 3
C 1 1 12 0 1 3 12
C 1 2 5 2 0 5 3
C 1 3 10 1 3 12 10
C 0 0 15 0 3 3 10
0 0 0 0 2 1 5 12`;

const PROCESSOR_TESTS = `C RST PC State IR ReadA ReadB ALUOut DataOut RFWE DMemWE
C 1 0 0 x x x x x 0 0
C 0 1 1 149 0 x x x 0 0
C 0 1 2 149 0 x x x 0 0
C 0 1 3 149 0 x x x 1 0
C 0 1 0 149 5 x x x 0 0
C 0 2 1 163 0 x x x 0 0
C 0 2 2 163 0 x x x 0 0
C 0 2 3 163 0 x x x 1 0
C 0 2 0 163 3 x x x 0 0
C 0 3 1 36 3 5 8 x 0 0
C 0 3 2 36 3 5 8 x 0 0
C 0 3 3 36 3 5 8 x 1 0
C 0 3 0 36 8 5 13 x 0 0
C 0 4 1 238 8 x x 0 0 0
C 0 4 2 238 8 x x 0 0 1
C 0 4 3 238 8 x x 8 0 0
C 0 4 0 238 8 x x 8 0 0
C 0 5 1 126 0 x x 8 0 0
C 0 5 2 126 0 x x 8 0 0
C 0 5 3 126 0 x x 8 1 0
C 0 5 0 126 8 x x 8 0 0
C 0 6 1 53 8 5 3 x 0 0
C 0 6 2 53 8 5 3 x 0 0
C 0 6 3 53 8 5 3 x 1 0
C 0 6 0 53 3 5 14 x 0 0`;

export function expectedAluResult(control: number, a: number, b: number): number {
  if (!Number.isInteger(control) || control < 0 || control > 7) throw new Error('ALU control must be an integer from 0 through 7.');
  if (!Number.isInteger(a) || a < 0 || a > 15 || !Number.isInteger(b) || b < 0 || b > 15) {
    throw new Error('ALU operands must be 4-bit unsigned integers.');
  }
  const raw = [a + b, a + b + 1, a + (15 - b), a - b, a, a + 1, a - 1, a][control]!;
  return raw & 0xf;
}

export function createAluTestData(): string {
  const lines = ['S1 S0 Cin A B D', '# All eight published operations over every pair of 4-bit operands.'];
  for (let control = 0; control < 8; control += 1) {
    const s1 = (control >> 2) & 1;
    const s0 = (control >> 1) & 1;
    const cin = control & 1;
    for (let a = 0; a < 16; a += 1) {
      for (let b = 0; b < 16; b += 1) {
        lines.push(`${s1} ${s0} ${cin} ${a} ${b} ${expectedAluResult(control, a, b)}`);
      }
    }
  }
  return lines.join('\n');
}

export const CIRCUIT_PREFLIGHT_CONTRACTS: readonly CircuitPreflightContract[] = [
  {
    id: 'register-4',
    label: '4-bit load/reset register',
    detail: 'Tests reset, load, hold, and replacement behavior.',
    courseworkIds: ['project-01', 'project-03', 'final-project'],
    mode: 'external',
    interfaceSummary: 'C clock; 1-bit LD and RST; 4-bit D input; 4-bit Q output. Reset has precedence over load.',
    expectedVectors: 5,
    testData: REGISTER_TESTS
  },
  {
    id: 'program-counter-4',
    label: '4-bit program counter',
    detail: 'Tests reset, hold, increment, modulo-16 wraparound, and explicit load.',
    courseworkIds: ['project-01', 'project-03', 'final-project'],
    mode: 'external',
    interfaceSummary: 'C clock; 1-bit INC, LD, and RST; 4-bit D input; 4-bit Q output. Precedence: RST, LD, INC, hold.',
    expectedVectors: 9,
    testData: PROGRAM_COUNTER_TESTS
  },
  {
    id: 'instruction-register-8',
    label: '8-bit instruction register',
    detail: 'Tests reset, load, hold, and replacement behavior for the complete instruction word.',
    courseworkIds: ['project-01', 'project-03', 'final-project'],
    mode: 'external',
    interfaceSummary: 'C clock; 1-bit LD and RST; 8-bit D input; 8-bit Q output. Reset has precedence over load.',
    expectedVectors: 5,
    testData: INSTRUCTION_REGISTER_TESTS
  },
  {
    id: 'instruction-memory-16x8',
    label: '16-address × 8-bit instruction memory',
    detail: 'Checks the published six-instruction preflight program and zero-filled remaining addresses.',
    courseworkIds: ['project-01', 'project-03', 'final-project'],
    mode: 'external',
    interfaceSummary: '4-bit Address input and 8-bit Instruction output. Address 0..5 must contain 0x95, 0xA3, 0x24, 0xEE, 0x7E, 0x35; addresses 6..15 must contain 0x00 for this public preflight image.',
    expectedVectors: 16,
    testData: INSTRUCTION_MEMORY_TESTS
  },
  {
    id: 'memory-16x4',
    label: '16-address × 4-bit memory',
    detail: 'Writes and reads two addresses and checks that a disabled write does not alter data.',
    courseworkIds: ['project-01', 'project-03', 'final-project'],
    mode: 'external',
    interfaceSummary: 'C clock; 1-bit CS and active-high WE; 4-bit Address and DataIn inputs; 4-bit DataOut output.',
    expectedVectors: 7,
    testData: MEMORY_TESTS
  },
  {
    id: 'register-file-4x4',
    label: 'Four-register, 4-bit register file',
    detail: 'Tests selective writes, two independent read ports, and write-disable hold.',
    courseworkIds: ['project-02', 'project-03', 'final-project'],
    mode: 'external',
    interfaceSummary: 'C clock; WE; 2-bit WriteSel, ReadSelA, ReadSelB; 4-bit WriteData; 4-bit ReadA and ReadB.',
    expectedVectors: 6,
    testData: REGISTER_FILE_TESTS
  },
  {
    id: 'alu-4',
    label: '4-bit ALU — exhaustive public operation table',
    detail: 'Runs all 2,048 combinations from the published eight-operation table.',
    courseworkIds: ['project-02', 'project-03', 'final-project'],
    mode: 'external',
    interfaceSummary: '1-bit S1, S0, Cin; 4-bit A and B inputs; 4-bit D output. Arithmetic wraps modulo 16.',
    expectedVectors: 2_048,
    testData: createAluTestData()
  },
  {
    id: 'processor-4bit',
    label: 'Integrated 4-bit processor — public ISA program',
    detail: 'Runs the published six-instruction program through fetch, decode, execute, writeback, register updates, and data-memory store/load behavior.',
    courseworkIds: ['project-03', 'final-project'],
    mode: 'external',
    interfaceSummary: 'C clock and RST inputs; 4-bit PC; 2-bit State (FETCH=0, DECODE=1, EXECUTE=2, WRITEBACK=3); 8-bit IR; 4-bit ReadA, ReadB, ALUOut, and DataOut; 1-bit RFWE and DMemWE outputs. Instruction memory must contain the published six-instruction preflight image.',
    expectedVectors: 25,
    testData: PROCESSOR_TESTS
  }
] as const;

export function circuitPreflightsForCoursework(id: CourseworkId): readonly CircuitPreflightContract[] {
  return CIRCUIT_PREFLIGHT_CONTRACTS.filter((contract) => contract.courseworkIds.includes(id));
}

export function circuitPreflightById(id: string): CircuitPreflightContract | undefined {
  return CIRCUIT_PREFLIGHT_CONTRACTS.find((contract) => contract.id === id);
}

export type CircuitTutorMode = 'design' | 'failed-preflight';

export function circuitTutorPrompt(id: string, mode: CircuitTutorMode = 'design'): string | undefined {
  const contract = circuitPreflightById(id);
  if (!contract) return undefined;
  const evidenceRequest = mode === 'failed-preflight'
    ? 'My local public preflight did not pass. First ask me to paste only the earliest mismatch or error, state what I expected, and describe one change I already tried.'
    : 'First ask me to state the behavior I am implementing, sketch my current data path or control path in words, and identify the smallest case I have tested.';
  return [
    `I am designing my own ${contract.label} for a potentially graded CIS 310 implementation assignment.`,
    `The public interface is: ${contract.interfaceSummary}`,
    `The public check exercises: ${contract.detail}`,
    evidenceRequest,
    'Coach me with one diagnostic question, one conceptual hint, or one smaller analogous example at a time.',
    'Do not give me a finished wiring plan, completed circuit, .dig file, answer key, report prose, or a sequence of steps that reconstructs the whole deliverable.',
    'Require me to predict the next observable result, make the change myself in Digital, rerun the local preflight, and explain the evidence.',
    'Use only visible CIS 310 course sources. If a needed assignment rule or ISA detail is unavailable, say so and direct me to the current Canvas assignment.'
  ].join(' ');
}

export function externalTestCircuit(contract: CircuitPreflightContract): string {
  if (contract.mode !== 'external' || !contract.testData) {
    throw new Error(`${contract.label} does not define an external Digital test suite.`);
  }
  return `<?xml version="1.0" encoding="utf-8"?>
<circuit>
  <version>1</version>
  <attributes/>
  <visualElements>
    <visualElement>
      <elementName>Testcase</elementName>
      <elementAttributes>
        <entry><string>Label</string><string>${escapeXml(contract.label)}</string></entry>
        <entry><string>Testdata</string><testData><dataString>${escapeXml(contract.testData)}</dataString></testData></entry>
      </elementAttributes>
      <pos x="100" y="100"/>
    </visualElement>
  </visualElements>
  <wires/>
</circuit>
`;
}

function escapeXml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}
