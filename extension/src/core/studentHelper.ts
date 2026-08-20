import { looksLikeDirectSolutionRequest } from './aiTutorGuardrails';

export type StudentHelperAction =
  | 'open-canvas'
  | 'open-ai-tutor'
  | 'ask-before-class'
  | 'open-calendar'
  | 'open-syllabus'
  | 'open-materials'
  | 'open-learning'
  | 'open-coursework'
  | 'open-guided-labs'
  | 'practice-now'
  | 'start-tutorial'
  | 'check-environment'
  | 'setup-digital'
  | 'create-circuit'
  | 'create-assembly-lab'
  | 'build-run-assembly'
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
  'open-coursework',
  'open-guided-labs',
  'practice-now',
  'start-tutorial',
  'check-environment',
  'setup-digital',
  'create-circuit',
  'create-assembly-lab',
  'build-run-assembly',
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

  if (looksLikeDirectSolutionRequest(question)) {
    return {
      title: 'Use the tutor to strengthen your attempt—not replace it',
      paragraphs: [
        'SystemStudio will not route a request for an answer, finished circuit, complete program, report, or other submission-ready work. For ungraded readiness practice, commit to an answer and explain why before requesting feedback. For homework or projects, the current Canvas instructions control whether AI assistance is allowed.',
        'The AI tutor can still help with a smaller analogous example, one conceptual hint, a question about your prediction, or feedback on evidence and reasoning you provide. If you are unsure whether a request crosses the assignment boundary, ask the instructor.'
      ],
      checklist: [
        'State your current prediction or attempted answer.',
        'Show the exact truth-table row, signal, instruction, register state, or error where reasoning breaks down.',
        'Ask for one hint or an analogous example with different values—not the deliverable.',
        'Verify the response against a mapped course source and the current Canvas AI rules.'
      ],
      actions: [
        { id: 'open-ai-tutor', label: 'Open tutor as a learning coach' },
        { id: 'ask-before-class', label: 'Ask the instructor about this boundary' },
        { id: 'open-canvas', label: 'Check assignment AI rules' }
      ]
    };
  }

  if (matches(text, ['circuit preflight', 'local preflight', 'self test', 'self-test', 'test assignment circuit', 'test before canvas'])) {
    return {
      title: 'Run a public local circuit contract before Canvas',
      paragraphs: [
        'Open Coursework and Final Presentation, choose the implementation card, and select Run local circuit preflight. Choose the component contract and its .dig file. SystemStudio runs the unmodified Digital CLI against public expected behavior and reports the actual evidence.',
        'The register, program-counter, memory, register-file, and ALU contracts use documented labels and widths. The integrated 4-bit processor runs its own embedded tests because the assignment does not define one universal opcode encoding. A pass is formative evidence—not a grade, rubric decision, or Canvas submission.'
      ],
      checklist: [
        'Use the exact public interface labels shown in the preflight guide.',
        'Fix the earliest mismatch before interpreting later failures.',
        'Add embedded tests for reset, four-nibble fetch, PC behavior, representative execution/writeback, and released program control flow.',
        'Open the current Canvas assignment, submit the released files there, and confirm the receipt.'
      ],
      actions: [
        { id: 'open-coursework', label: 'Open coursework preflights' },
        { id: 'open-canvas', label: 'Open official Canvas assignment' }
      ]
    };
  }

  if (matches(text, ['final project', 'final presentation', 'final demo', '4-bit processor', '4 bit processor', 'grade calculator', 'grade estimate', 'drop two', 'lowest quiz', 'coursework progress'])) {
    return {
      title: 'Use the coursework roadmap; Canvas remains the official record',
      paragraphs: [
        'The final presentation demonstrates the same cumulative 4-bit processor built through Implementations 1–3, its released assembly program, and expected-versus-observed evidence during final examination week. It is not a separate processor redesign. The exact date, time, room, order, released specification, and deadline are to be announced in Canvas.',
        'SystemStudio can run formative circuit preflights and track local planning status, file checks, receipt confirmation, and self-evaluation. Those indicators are not instructor grades. Its manual grade estimate applies the published 15/65/20 weights and drops two lowest participation-quiz percentages from scores you enter; Canvas remains official.'
      ],
      checklist: [
        'Carry forward the tested registers/memory and register-file/ALU into the integrated 4-bit processor.',
        'Check Canvas to learn the released program, ISA expectations, and required artifacts.',
        'Test the processor and assembly program, retain expected/observed evidence, and rehearse the explanation.',
        'Submit in Canvas and confirm its receipt before the announced final-week presentation.'
      ],
      actions: [
        { id: 'open-coursework', label: 'Open coursework and final presentation' },
        { id: 'open-canvas', label: 'Open official Canvas record' }
      ]
    };
  }

  if (matches(text, ['guided lab', 'hands-on lab', 'hands on lab', 'half adder tutorial', 'circuit walkthrough', 'assembly walkthrough'])) {
    return {
      title: 'Use the lecture-mapped Hands-on Lab Center',
      paragraphs: [
        'The lab center connects the mapped reading, author video, and lecture to a prediction-first circuit build or assembly trace. Its checkmarks stay on this device and are not graded.',
        'Circuit labs create a fresh blank file under circuits/guided and open it in the complete upstream Digital application; assembly trace labs open an original example beside the clearly labeled Instruction Trace Tutor. These formative labs do not generate a graded deliverable.'
      ],
      checklist: [
        'Choose the lab mapped to the lecture concept.',
        'Read and watch the displayed sources, then write the requested prediction.',
        'Create or open the artifact and complete one evidence checkpoint at a time.',
        'Explain the observed signal, register, flag, memory, stack, EIP, output, or trace before continuing.'
      ],
      actions: [
        { id: 'open-guided-labs', label: 'Open hands-on labs' },
        { id: 'open-learning', label: 'Open mapped learning path' }
      ]
    };
  }

  if (matches(text, ['ai tutor', 'maizey', 'chatbot', 'artificial intelligence', 'llm'])) {
    return {
      title: 'Use the U-M Maizey course tutor for conversational help',
      paragraphs: [
        'An AI tutor is a conversational learning coach that uses course sources to diagnose uncertainty, offer a small hint or explanation, ask a check-for-understanding question, and connect the student back to evidence. It is not simply an answer-generating chatbot.',
        'For CIS 310, U-M Maizey in Canvas is the preferred AI layer. Students authenticate with their own U-M account, so the extension does not receive your prompt and does not use the instructor’s personal LLM account or API key. AI can still be wrong: verify technical claims against the cited course source.'
      ],
      checklist: [
        'Attempt the question first; state your prediction and the exact step that is unclear.',
        'Ask for one hint, one diagnostic question, or one analogous example—not the answer.',
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
        'Use the self-paced Accessible lesson → Read → Watch → Practice → Build/trace path before class. Five distinct questions establish readiness; finish the eight-question confidence set and the mapped hands-on activity. Explanations point back to the reading, transcript-checked video, and lecture slides.'
      ],
      checklist: [
        'Open the next preparation module and study its direct HTML lesson, then read only the mapped chapter or sections.',
        'Watch the mapped author videos and write down one unresolved point.',
        'Try the five-question readiness checkpoint without reopening the source.',
        'Bring the unresolved point or a confident miss to class or to the instructor.'
      ],
      actions: [
        { id: 'open-learning', label: 'Open course preparation path' },
        { id: 'open-materials', label: 'See the complete lecture map' }
      ]
    };
  }

  if (matches(text, ['instructor', 'professor', 'teacher', 'gsi', 'teaching assistant', 'course staff', 'course team', 'who is the ta', 'who is my ta'])) {
    return {
      title: 'CIS 310 instructional team',
      paragraphs: [
        'The instructor is Dr. Probir Roy (probirr@umich.edu), Assistant Professor. His office is CIS Building, Room 230; instructor office hours are Mondays and Wednesdays, 9:30–10:00 a.m. and 12:00–1:00 p.m., or by appointment.',
        'No Graduate Student Instructor (GSI) or grader is currently assigned or confirmed for CIS 310. Check Canvas and department announcements for any future instructional-staff update.'
      ],
      checklist: [
        'Include CIS 310 and a specific topic or assignment name in an email.',
        'For a technical problem, include the exact error, expected result, observed result, and one step you tried.',
        'Use Canvas announcements for any updated contact or office-hour information.'
      ],
      actions: [
        { id: 'open-syllabus', label: 'Open accessible syllabus' },
        { id: 'open-canvas', label: 'Open Fall 2026 Canvas' }
      ]
    };
  }

  if (matches(text, ['syllabus', 'grading policy', 'grade scale', 'course policy', 'office hour', 'textbook'])) {
    return {
      title: 'Fall 2026 course details and instructor office hours',
      paragraphs: [
        'CIS 310 section 001 meets Mondays and Wednesdays from 10:00–11:45 a.m. in ELB 1329.',
        'Instructor office hours are Mondays and Wednesdays, 9:30–10:00 a.m. and 12:00–1:00 p.m., in the CIS Building, Room 230. The packaged syllabus contains the remaining stable course structure; Canvas controls announced changes and live assignment details.'
      ],
      checklist: [
        'Open the accessible HTML syllabus for the stable course structure.',
        'For office hours, go to CIS Building, Room 230 during either listed interval or arrange an appointment.',
        'Open Canvas for announcements, assignment requirements, deadlines, and schedule changes.'
      ],
      actions: [
        { id: 'open-syllabus', label: 'Open accessible syllabus' },
        { id: 'open-canvas', label: 'Open Fall 2026 Canvas' }
      ]
    };
  }

  if (matches(text, ['calendar', 'semester start', 'classes begin', 'first class', 'labor day', 'thanksgiving', 'recess', 'study day', 'exam period', 'class meeting', 'meet on'])) {
    return {
      title: 'Fall 2026 meets Mondays and Wednesdays, 10:00–11:45 a.m., in ELB 1329',
      paragraphs: [
        'The department-confirmed schedule and verified university calendar yield 27 regular CIS 310 meetings: 13 Mondays and 14 Wednesdays, from Wednesday, August 26 through Monday, December 7. Each regular meeting is 10:00–11:45 a.m. in ELB 1329.',
        'There is no class Monday, September 7, or during Thanksgiving recess November 21–29. The cumulative 4-bit processor and assembly-program presentation occurs during final examination week; its exact date, time, room, order, and deadline are to be announced in Canvas.'
      ],
      checklist: [
        'Open the visual calendar to see every meeting date.',
        'Export the confirmed timed class meetings directly to an .ics calendar.',
        'Use Canvas for assignment deadlines, announced schedule changes, and the final-project presentation logistics.'
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
        { id: 'open-coursework', label: 'Open assignment checklist' },
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
      actions: [
        { id: 'open-coursework', label: 'Open coursework checklist' },
        { id: 'open-canvas', label: 'Open Fall 2026 Canvas' }
      ]
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
        'SystemStudio uses the complete upstream Digital application. Linux/Remote SSH hosts transport its real Swing desktop into the VS Code tab; Windows and macOS run that same upstream application in an extension-managed Docker Desktop container and stream it into the tab. The native window is an explicit fallback, not the default.'
      ],
      checklist: [
        'Check Digital checksum, Java version, and workspace trust.',
        'Open a small blank circuit in Full Digital and confirm that its original menus and component library are visible.',
        'On Linux, allow SystemStudio to prepare the private X/VNC display. On Windows/macOS, start Docker Desktop for the one-time embedded-runtime build; use the native desktop fallback only if the container cannot start.'
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
        'Full Digital opens every newly created file separately. Use Digital’s Save As when you intentionally branch an existing design. Keep reusable subcircuits in the same workspace and confirm each title and path before editing.'
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
      title: 'Choose real execution or instructional tracing deliberately',
      paragraphs: [
        'Choose Build and Run with Real Assembly Toolchain for executable evidence. Actual NASM produces and runs ELF32 code; exact Microsoft MASM/Irvine32 is available only with ml.exe, link.exe, and the official Irvine library on Windows.',
        'The separate Instruction Trace Tutor visualizes a bounded source model. It is not MASM or NASM, does not emit machine code, and cannot be used as proof that a source file assembles.'
      ],
      checklist: [
        'For executable evidence, use Build and Run with Real Assembly Toolchain and inspect the assembler, linker, output, and exit status.',
        'For a prediction exercise, open the Instruction Trace Tutor and watch registers, flags, stack, memory, output, and control flow.',
        'Never treat a trace-tutor load as proof that external MASM or NASM accepts the source.'
      ],
      actions: [
        { id: 'build-run-assembly', label: 'Build and run real assembly' },
        { id: 'open-guided-labs', label: 'Open guided assembly traces' },
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
      'Ask about a course topic, Digital setup, circuit workflow, real assembly toolchains, the instruction trace tutor, Canvas submission, or describe where your expected and observed results differ.',
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
      { id: 'open-guided-labs', label: circuit ? 'Open guided circuit labs' : 'Open guided labs' },
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
