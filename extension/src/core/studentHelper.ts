export type StudentHelperAction =
  | 'open-canvas'
  | 'open-ai-tutor'
  | 'ask-before-class'
  | 'open-calendar'
  | 'open-syllabus'
  | 'open-materials'
  | 'open-learning'
  | 'practice-now'
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
  'open-ai-tutor',
  'ask-before-class',
  'open-calendar',
  'open-syllabus',
  'open-materials',
  'open-learning',
  'practice-now',
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

  if (matches(text, ['ai tutor', 'maizey', 'chatbot', 'artificial intelligence', 'llm'])) {
    return {
      title: 'Use the U-M Maizey course tutor for conversational help',
      paragraphs: [
        'An AI tutor is a conversational learning coach that uses course sources to diagnose uncertainty, offer a small hint or explanation, ask a check-for-understanding question, and connect the student back to evidence. It is not simply an answer-generating chatbot.',
        'For CIS 310, U-M Maizey in Canvas is the preferred AI layer. Students authenticate with their own U-M account, so the extension does not receive your prompt and does not use the instructor’s personal LLM account or API key. AI can still be wrong: verify technical claims against the cited course source.'
      ],
      checklist: [
        'State the concept, your prediction, and the exact step that is unclear.',
        'Ask for one hint or one analogous example before asking for a complete solution.',
        'Open and check the cited course source.',
        'For a graded task, use the tutor to learn the method—not to produce a submission.'
      ],
      actions: [
        { id: 'open-ai-tutor', label: 'Open U-M Maizey in Canvas' },
        { id: 'ask-before-class', label: 'Ask the instructor before class' }
      ]
    };
  }

  if (matches(text, ['quiz', 'practice question', 'practice questions', 'learning progress', 'my progress', 'confidence', 'review missed'])) {
    return {
      title: 'Use short practice, then review the evidence',
      paragraphs: [
        'The CIS 310 Learning Center offers five-question practice with immediate explanations, quiz mode with feedback at the end, topic selection, saved questions, and spaced review.',
        'Before feedback, record how sure you are. A correct-but-uncertain answer and a confident miss are both useful review signals. Progress stays on this device and is not a grade or mastery prediction.'
      ],
      checklist: [
        'Start with the recommended five-question session.',
        'Read the explanation even when your answer is correct.',
        'Review due, missed, uncertain, or saved questions on another day.'
      ],
      actions: [
        { id: 'practice-now', label: 'Start 5-question practice' },
        { id: 'open-learning', label: 'Open learning dashboard' }
      ]
    };
  }

  if (matches(text, ['book', 'reading', 'what should i read', 'read before class', 'watch before class', 'tarnoff', 'author video', 'youtube', 'prepare for class', 'preparation'])) {
    return {
      title: 'Prepare with the open book before using the slides',
      paragraphs: [
        'The Learning Center maps each of the 13 lecture resources to focused sections of David Tarnoff’s open Computer Organization and Design Fundamentals and the targeted official author videos needed for its questions.',
        'Use the short Read → Watch → Try 3 questions path before class. The lecture PDF then becomes a guide for discussion instead of the only source you study.'
      ],
      checklist: [
        'Open the next preparation module and read only its mapped chapter or sections.',
        'Watch the mapped author videos and write down one unresolved point.',
        'Try the three-question readiness check without reopening the source.',
        'Bring the unresolved point or a confident miss to class or to the instructor.'
      ],
      actions: [
        { id: 'open-learning', label: 'Open Read → Watch → Practice path' },
        { id: 'open-materials', label: 'See the complete lecture map' }
      ]
    };
  }

  if (matches(text, ['syllabus', 'grading policy', 'grade scale', 'course policy', 'office hour', 'textbook'])) {
    return {
      title: 'Open the Fall 2026 syllabus and verify Canvas-controlled fields',
      paragraphs: [
        'The packaged PDF includes the course description, learning outcomes, tools, workflow, university-policy links, and the verified Monday/Wednesday term calendar.',
        'Class time, room, office hours, the current Irvine edition/access instructions, grade weights, detailed deadlines, and the final-exam slot remain instructor-confirmed fields in Canvas.'
      ],
      checklist: [
        'Open the syllabus PDF for the stable course structure.',
        'Open Canvas for current section details and announcements.',
        'Ask the instructor if a highlighted field has not yet been finalized.'
      ],
      actions: [
        { id: 'open-syllabus', label: 'Open syllabus PDF' },
        { id: 'open-canvas', label: 'Open Fall 2026 Canvas' }
      ]
    };
  }

  if (matches(text, ['calendar', 'semester start', 'classes begin', 'first class', 'labor day', 'thanksgiving', 'recess', 'study day', 'exam period', 'class meeting', 'meet on'])) {
    return {
      title: 'Fall 2026 meets Mondays and Wednesdays starting August 26',
      paragraphs: [
        'The verified university calendar yields 27 regular CIS 310 meetings: 13 Mondays and 14 Wednesdays, from Wednesday, August 26 through Monday, December 7.',
        'There is no class Monday, September 7, or during Thanksgiving recess November 21–29. The university exam period is December 10–11 and 14–16; Canvas must confirm the CIS 310 final-exam slot.'
      ],
      checklist: [
        'Open the visual calendar to see every meeting date.',
        'Export all-day placeholders, or enter the confirmed Canvas time for timed events.',
        'Use Canvas for assignment deadlines, room, changes, and the final exam.'
      ],
      actions: [
        { id: 'open-calendar', label: 'Open Fall 2026 calendar' },
        { id: 'open-canvas', label: 'Open Fall 2026 Canvas' }
      ]
    };
  }

  if (matches(text, ['pretest', 'expected output', 'assignment scope', 'instructions unclear', 'what is the assignment asking'])) {
    return {
      title: 'Turn an ambiguous requirement into one concrete decision',
      paragraphs: [
        'Do not guess whether a program should process one input, a range of inputs, or produce a particular report. Read the current Canvas prompt and examples, then name the two interpretations that remain possible.',
        'A short clarification before implementation prevents a technically correct solution to the wrong task.'
      ],
      checklist: [
        'Quote the exact sentence or example that is ambiguous.',
        'State interpretation A and interpretation B in your own words.',
        'Explain how the output or circuit would differ between them.',
        'Ask the instructor which interpretation is required.'
      ],
      actions: [
        { id: 'open-canvas', label: 'Open the current Canvas prompt' },
        { id: 'ask-before-class', label: 'Ask for clarification' }
      ]
    };
  }

  if (matches(text, ['deadline', 'due', 'when is', 'submit', 'submission', 'canvas', 'turn in'])
    && !matches(text, ['cannot see assignment', "can't see assignment", 'assignment tab', 'cannot find video', "can't locate", 'where is the lecture', 'final presentation', 'final demo'])) {
    return {
      title: 'Verify and submit in Fall 2026 Canvas',
      paragraphs: [
        'SystemStudio does not store authoritative deadlines and cannot submit coursework.',
        'Open the current Canvas assignment for the due date, required files, points, collaboration rules, and submission confirmation.'
      ],
      checklist: [
        'Open the matching Fall 2026 Canvas assignment.',
        'Compare your files and file types with its current requirements.',
        'Submit in Canvas; do not stop after uploading a file.',
        'Reopen the assignment and confirm that Canvas shows a recorded submission or receipt.'
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
        { id: 'practice-now', label: 'Practice five questions' },
        { id: 'open-materials', label: 'Open course-material guide' },
        { id: 'open-canvas', label: 'Open Fall 2026 Canvas' }
      ]
    };
  }

  if (matches(text, ['ssh', 'remote', 'java', 'digital', 'install', 'setup', 'environment', 'will not open', "won't open"])
    && !matches(text, ['save multiple', 'multiple circuit', 'overwrite', 'new circuit file', 'another circuit', 'clock error', 'connected to the clock', 'processor analysis', 'analysis error'])) {
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

  if (matches(text, ['save multiple', 'multiple circuit', 'overwrite', 'new circuit file', 'another circuit'])) {
    return {
      title: 'Create a separate Digital file instead of reusing one circuit',
      paragraphs: [
        'Use Create a new blank Digital circuit for each task or subcircuit and give it a distinct name. SystemStudio checks the target path and does not overwrite an existing circuit.',
        'Inside Digital, use Save As when you intentionally branch an existing design. Keep reusable subcircuits in the same workspace and confirm each file name before editing.'
      ],
      checklist: [
        'Create or choose the circuits/work folder.',
        'Use a descriptive unique name such as full-adder.dig or four-bit-adder.dig.',
        'Open the new file and verify its title before making changes.'
      ],
      actions: [
        { id: 'create-circuit', label: 'Create a new circuit' },
        { id: 'start-tutorial', label: 'Review the circuit workflow' }
      ]
    };
  }

  if (matches(text, ['clock error', 'connected to the clock', 'processor analysis', 'analysis error'])) {
    return {
      title: 'Trace every sequential element back to the processor clock',
      paragraphs: [
        'A Digital analysis error can come from a flip-flop inside a nested subcircuit even when the visible top-level clock wires look connected. Treat the diagnostic as evidence that at least one sequential element has no valid clock path, not as proof that the visible connection is correct.',
        'Reduce the circuit: analyze each register or sequential subcircuit separately, then integrate one verified component at a time.'
      ],
      checklist: [
        'Check every flip-flop and register, including those inside subcircuits.',
        'Verify the clock reaches the correct clock pin rather than a data or enable pin.',
        'Test the smallest sequential subcircuit that still reproduces the error.',
        'Include the exact error and a screenshot in a pre-class or help request.'
      ],
      actions: [
        { id: 'ask-before-class', label: 'Send this before class' },
        { id: 'open-materials', label: 'Open sequential-logic materials' }
      ]
    };
  }

  if (matches(text, ['cannot see assignment', "can't see assignment", 'assignment tab', 'cannot find video', "can't locate", 'where is the lecture', 'final presentation', 'final demo'])) {
    return {
      title: 'Use Canvas as the live map, then report the missing item precisely',
      paragraphs: [
        'A syllabus or announcement can refer to an item that is unpublished, hidden from course navigation, or available only through Modules. SystemStudio cannot infer that a missing link is available.',
        'Check Modules, Assignments, Announcements, and the Canvas To Do list. If the item still is not visible, report its exact name and the page where it was referenced.'
      ],
      checklist: [
        'Refresh Canvas and confirm you opened the Fall 2026 course.',
        'Check Modules and Assignments even if an Assignments navigation tab is hidden.',
        'For a final demonstration, use only the current published instructions.',
        'Send a focused question if the referenced item is still unavailable.'
      ],
      actions: [
        { id: 'open-canvas', label: 'Open Fall 2026 Canvas' },
        { id: 'ask-before-class', label: 'Report a missing item' }
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
        { id: 'open-materials', label: 'Find mapped course material' },
        { id: 'ask-before-class', label: 'Ask before class' }
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
      { id: 'practice-now', label: 'Practice five questions' },
      { id: 'open-ai-tutor', label: 'Open the AI course tutor' },
      { id: 'ask-before-class', label: 'Ask before class' },
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
      { id: 'practice-now', label: 'Practice this material' },
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
