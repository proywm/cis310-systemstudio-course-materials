export type StudentHelperAction =
  | 'open-canvas'
  | 'open-materials'
  | 'start-tutorial'
  | 'check-environment'
  | 'setup-digital'
  | 'create-circuit'
  | 'create-assembly-lab'
  | 'assembly-guide';

export interface StudentHelperReply {
  title: string;
  paragraphs: string[];
  checklist: string[];
  actions: Array<{ id: StudentHelperAction; label: string }>;
}

export type StudentHelperRequest =
  | { type: 'ask'; question: string }
  | { type: 'action'; action: StudentHelperAction };

const STUDENT_HELPER_ACTIONS = new Set<StudentHelperAction>([
  'open-canvas',
  'open-materials',
  'start-tutorial',
  'check-environment',
  'setup-digital',
  'create-circuit',
  'create-assembly-lab',
  'assembly-guide'
]);

export function parseStudentHelperRequest(value: unknown): StudentHelperRequest | undefined {
  if (!isRecord(value)) return undefined;
  if (value.type === 'action' && typeof value.action === 'string' && STUDENT_HELPER_ACTIONS.has(value.action as StudentHelperAction)) {
    return { type: 'action', action: value.action as StudentHelperAction };
  }
  if (value.type !== 'ask' || typeof value.question !== 'string') return undefined;
  const question = value.question.trim().slice(0, 2_000);
  return question ? { type: 'ask', question } : undefined;
}

export function answerStudentQuestion(question: string): StudentHelperReply {
  const text = question.toLowerCase();

  if (matches(text, ['deadline', 'due', 'when is', 'submit', 'submission', 'canvas', 'turn in'])) {
    return {
      title: 'Verify and submit in Fall 2026 Canvas',
      paragraphs: [
        'SystemStudio does not store authoritative deadlines and cannot submit coursework.',
        'Open the current Canvas assignment for the due date, required files, points, collaboration rules, and submission confirmation.'
      ],
      checklist: [
        'Open the matching Fall 2026 Canvas assignment.',
        'Compare your files with its current requirements.',
        'Submit in Canvas and confirm that Canvas recorded the submission.'
      ],
      actions: [{ id: 'open-canvas', label: 'Open Fall 2026 Canvas' }]
    };
  }

  if (matches(text, ['homework', 'hw1', 'hw2', 'hw3', 'how many'])) {
    return {
      title: 'CIS 310 has three homework references',
      paragraphs: [
        'Homework 1 covers logic foundations; Homework 2 covers sequential logic and state machines; Homework 3 covers memory and assembly foundations.',
        'The packaged references help you prepare, but the current Fall 2026 Canvas assignment controls what is due and what to submit.'
      ],
      checklist: [
        'Homework 1 → bundled Lectures 1–5.',
        'Homework 2 → bundled Lecture 6.',
        'Homework 3 → bundled Lectures 8–10 and 12.'
      ],
      actions: [
        { id: 'open-materials', label: 'Open course-material guide' },
        { id: 'open-canvas', label: 'Open Fall 2026 Canvas' }
      ]
    };
  }

  if (matches(text, ['ssh', 'remote', 'java', 'digital', 'install', 'setup', 'environment', 'will not open', "won't open"])) {
    return {
      title: 'Separate an environment problem from a circuit problem',
      paragraphs: [
        'Run the environment check first. Digital needs the pinned simulator and Java 8 or newer; the extension can install and verify Digital in its own storage.',
        'On Remote SSH, the native Digital window cannot appear without a graphical desktop. Bundled PDFs, circuit preview/tests, and the embedded assembly lab still work there; use local desktop VS Code for the Digital GUI.'
      ],
      checklist: [
        'Check Digital checksum, Java version, and workspace trust.',
        'If setup is ready, create a small blank circuit and inspect preview/test evidence.',
        'If only the GUI is unavailable over SSH, reopen the workspace locally.'
      ],
      actions: [
        { id: 'check-environment', label: 'Check environment' },
        { id: 'setup-digital', label: 'Install/verify Digital' },
        { id: 'start-tutorial', label: 'Walk through setup' }
      ]
    };
  }

  if (matches(text, ['masm', 'nasm', 'irvine', 'assembly', 'register', 'flag', 'stack', 'eip'])) {
    return {
      title: 'Use the embedded IA-32 teaching lab',
      paragraphs: [
        'Choose Irvine32 Classroom for textbook-style MASM/Irvine syntax, NASM IA-32 for NASM-style syntax, or Auto-detect when unsure.',
        'The bounded teaching interpreter runs inside the extension on Windows, macOS, Linux, and Remote SSH. It does not require Docker or a host assembler and does not claim complete native MASM/NASM compatibility.'
      ],
      checklist: [
        'Build first and read the exact source-line diagnostic.',
        'Step while watching registers, flags, stack, memory, output, and trace.',
        'Compare observed state with the state you predicted before running.'
      ],
      actions: [
        { id: 'create-assembly-lab', label: 'Create assembly lab' },
        { id: 'assembly-guide', label: 'Open compatibility guide' }
      ]
    };
  }

  if (matches(text, ['flip-flop', 'flip flop', 'fsm', 'state machine', 'counter', 'sequence'])) {
    return conceptBridge(
      'Sequential logic and state machines',
      'Homework 2 and bundled Lecture 6',
      ['List the states and transitions.', 'Choose the required flip-flop relationship.', 'Implement and test one transition at a time.'],
      true
    );
  }

  if (matches(text, ['gate', 'truth table', 'boolean', 'karnaugh', 'k-map', 'kmap', 'adder', 'multiplier'])) {
    return conceptBridge(
      'Logic foundations',
      'Homework 1 and bundled Lectures 1–5',
      ['Write the expected truth table.', 'Simplify only after the behavior is clear.', 'Build a small circuit and compare every tested row with your prediction.'],
      true
    );
  }

  if (matches(text, ['memory', 'cache', 'dram', 'sram', 'instruction cycle', 'address space', 'virtual memory'])) {
    return conceptBridge(
      'Memory and machine organization',
      'Homework 3 and bundled Lectures 8–10 and 12',
      ['Locate the relevant hierarchy, cycle, or address-space diagram.', 'Explain each transition in your own words.', 'Use an assembly trace when the question concerns instructions or registers.'],
      false
    );
  }

  if (matches(text, ['circuit', 'alu', 'processor', 'mux', 'multiplexer', 'decoder'])) {
    return conceptBridge(
      'From concept to circuit',
      'the mapped bundled presentation and project reference',
      ['State the component inputs, outputs, and expected behavior.', 'Implement one subcircuit and test it before integration.', 'Use preview/tests as evidence; do not treat “it opened” as proof of correctness.'],
      true
    );
  }

  if (matches(text, ['confused', 'stuck', 'help', 'error', 'not working', 'wrong'])) {
    return {
      title: 'Turn “I am stuck” into a useful help request',
      paragraphs: [
        'You do not need to solve the problem before asking for help. Collect a small amount of evidence so the instructor or tutor can distinguish a concept issue from a tool issue.',
        'Do not paste private grades, credentials, or another student’s work into this helper.'
      ],
      checklist: [
        'Expected: what should happen?',
        'Observed: what actually happened?',
        'Evidence: exact source line, diagnostic, truth-table row, register/flag value, or screenshot.',
        'Attempt: what one change did you try?',
        'Question: what specific decision do you need help making?'
      ],
      actions: [
        { id: 'start-tutorial', label: 'Review the guided workflow' },
        { id: 'open-materials', label: 'Find mapped course material' }
      ]
    };
  }

  return {
    title: 'Choose the kind of help you need',
    paragraphs: [
      'Ask about a course topic, Digital setup, circuit workflow, embedded assembly, Canvas submission, or describe where your expected and observed results differ.',
      'This local helper routes you to bundled course evidence and tools. It is not Canvas, a grader, or a source of current deadlines.'
    ],
    checklist: [
      'Topic example: “How should I start a state-machine problem?”',
      'Tool example: “Why will Digital not open over SSH?”',
      'Evidence example: “I expected EAX=5 after ADD, but observed EAX=3.”'
    ],
    actions: [
      { id: 'open-materials', label: 'Open course materials' },
      { id: 'start-tutorial', label: 'Start guided tutorial' },
      { id: 'open-canvas', label: 'Open Fall 2026 Canvas' }
    ]
  };
}

function conceptBridge(title: string, source: string, checklist: string[], circuit: boolean): StudentHelperReply {
  return {
    title,
    paragraphs: [
      `Start with ${source}. Predict a small result before using the tool, then compare that prediction with visible evidence.`,
      'The helper can organize your next step but will not generate a submission-ready answer or decide a grade.'
    ],
    checklist,
    actions: [
      { id: 'open-materials', label: 'Open mapped materials' },
      ...(circuit ? [{ id: 'create-circuit' as const, label: 'Create a blank circuit' }] : [])
    ]
  };
}

function matches(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
