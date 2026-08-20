import type { CourseworkId } from './coursework';

export type CircuitPreflightId =
  | 'register-4'
  | 'program-counter-4'
  | 'memory-16x4'
  | 'register-file-4x4'
  | 'alu-4'
  | 'processor-embedded';

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
    id: 'processor-embedded',
    label: 'Integrated 4-bit processor — embedded tests',
    detail: 'Runs the test cases embedded in the selected processor circuit for its released ISA and program.',
    courseworkIds: ['project-03', 'final-project'],
    mode: 'embedded',
    interfaceSummary: 'No universal external port contract is imposed because the assignment does not define one universal opcode encoding. The selected .dig file must contain Digital Testcase elements.',
    expectedVectors: 0
  }
] as const;

export function circuitPreflightsForCoursework(id: CourseworkId): readonly CircuitPreflightContract[] {
  return CIRCUIT_PREFLIGHT_CONTRACTS.filter((contract) => contract.courseworkIds.includes(id));
}

export function circuitPreflightById(id: string): CircuitPreflightContract | undefined {
  return CIRCUIT_PREFLIGHT_CONTRACTS.find((contract) => contract.id === id);
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
