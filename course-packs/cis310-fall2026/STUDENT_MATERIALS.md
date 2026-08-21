# CIS 310 Fall 2026 Course Materials

> **Active Fall 2026 course workspace:** [Canvas course 552144](https://canvas.umd.umich.edu/courses/552144) is authoritative for requirements, deadlines, points, allowed collaboration, required files, and submission. **Submit every required deliverable in Canvas; SystemStudio does not submit for you.** Each module uses a responsive accessible HTML lecture as its primary format and retains the local, integrity-checked presentation PDF only as an optional visual archive.

## Start with the Fall 2026 course documents

- Open the primary [accessible CIS 310 Fall 2026 HTML syllabus](syllabus/CIS310_Fall_2026_Syllabus.html). An [optional print PDF](syllabus/CIS310_Fall_2026_Syllabus.pdf) contains the same syllabus content but is not tagged for assistive technology. The syllabus contains the required texts, course structure, learning outcomes, technology workflow, policy links, and 27-meeting topic sequence. CIS 310 section 001 meets Mondays and Wednesdays, 10:00–11:45 a.m., in ELB 1329. The cumulative 4-bit processor and assembly-program final presentation occurs during final examination week; Canvas will announce its exact date, time, room, order, requirements, and deadline.
- In the SystemStudio sidebar, select **Open Fall 2026 course calendar** to see every Monday/Wednesday meeting and the official holiday, recess, study-day, and examination periods. Its `.ics` export uses the department-confirmed 10:00–11:45 a.m. meeting time and ELB 1329 location.
- **Course team:** Dr. Probir Roy (`probirr@umich.edu`), instructor, CIS Building Room 230. No Graduate Student Instructor or grader is currently assigned or confirmed for CIS 310; check Canvas and department announcements for any future staffing update. Instructor office hours are Mondays and Wednesdays, 9:30–10:00 a.m. and 12:00–1:00 p.m., or by appointment.
- Use [Fall 2026 Canvas](https://canvas.umd.umich.edu/courses/552144) for live course details and submission.

## Questions, AI tutor, and help before class

Open the collapsible chat bubble in the Learning Center or **Tutor, Questions, and Help** in the sidebar:

- **Local FAQ chat** answers recurring setup, Digital, assembly, navigation, and submission-process questions without calling an AI service. The complete [CIS 310 FAQ](support/FAQ.md) contains the same support boundaries.
- **U-M Maizey AI learning coach** opens the course-grounded tutor in Canvas using your U-M login. Attempt a question first, then ask for one hint, a smaller analogous example, or a check of your reasoning; verify its response against the cited course source.
- **Optional GitHub Copilot learning coach** uses a model available to your own signed-in VS Code account. It receives only the prompt you submit—SystemStudio does not attach your files, grades, Canvas data, or course records. It is a fallback, not a substitute for an indexed course-grounded Maizey App.
- **Ask a Question Before Class** structures a complex concept request, copies it, and opens the Canvas discussion so the instructor can adjust the next lecture. Canvas—not the extension—controls whether the final post is named or anonymous.

For ungraded SystemStudio practice, state your answer and reasoning before asking the tutor for feedback. For homework, projects, quizzes, exams, reports, or other graded work, follow the exact Canvas AI rule and do not use a tutor to generate final answers, finished circuits, complete code, report prose, or submission-ready artifacts. SystemStudio shows this boundary before opening Maizey, but it cannot control a different AI website or guarantee external-model behavior. Do not include passwords, access tokens, private grades, medical details, or another student's work in a chat or discussion. The AI tutor may be inaccurate and cannot grant extensions, decide grades, or replace current Canvas instructions.

## Practice and track your learning

Open the expanded **Course Modules** section to see all 13 modules and navigate them in sequence or revisit any topic. The next unfinished module is highlighted without hiding the rest of the outline. Expand any module to reach its primary accessible HTML lecture, mapped readings, author videos, optional visual PDF archive, five-question readiness checkpoint, eight-question confidence set, local progress controls, and any related guided activity. Begin with the HTML lecture's objectives, terms, explanations, examples, and self-checks; then use sources tagged **Readiness source**. The other listed items are additional references. The readings are focused sections of David Tarnoff's free *Computer Organization and Design Fundamentals*; the videos come from Tarnoff's official channel or ETSU OER series. Under **Practice and Progress**, you can also select one of six topics, take a 10-question quiz, or review questions that are due or saved. Practice mode gives feedback after each question; quiz mode gives feedback at the end. Choose a confidence level before submitting, then use the explanation, visibly labeled mapped reading/video focus, and related HTML lecture. A module's question checkpoint requires five distinct attempts; completing all eight gives the broader confidence set.

Instructors can publish the same lectures to Canvas from the [accessible HTML lecture bundle](canvas/CIS310_Fall2026_Accessible_HTML_Lectures.zip). The included page map and README give the exact title and Canvas HTML Editor workflow for every module.

The HTML lesson is the direct-text alternative to the visual slide deck. It reflows with zoom, uses semantic headings and native controls, does not depend on color alone, and offers previous/next navigation. Each **Ask a learning coach** button starts with a source-bounded, attempt-first prompt and lets the student choose the published U-M Maizey App or optional GitHub Copilot coach; every response must be checked against the mapped course source.

Open **Student Unit Test Center** for three distinct local checks: Digital files with upstream Testcase components in VS Code's Testing view, real NASM `*.test.asm` programs where exit 0 passes, and the published assignment circuit contracts in Mission Control. These checks are private formative evidence—not grades or Canvas submission.

The Learning dashboard reports local practice evidence—coverage, accuracy, due questions, practice days, and confidence mismatches. It does not calculate a grade, certify mastery, rank students, or send results to Canvas or the instructor. The separate **Coursework and Final Presentation** panel provides local planning status, self-evaluation, executable public circuit preflights, and an explicitly nonofficial manual grade estimate using student-entered Canvas scores; instructor evaluation in Canvas remains distinct and authoritative. You can reset the local history at any time.

## Build and debug with the Hands-on Lab Center

Open the activity inside its **Course Modules** entry, use **Practice and Progress → Build with guided labs**, or run **CIS 310: Open Hands-on Circuit and Assembly Labs**. Every lab is mapped to the same focused reading, author video, and lecture used by the readiness path. Checkmarks are self-reported, remain on this device, and are not grades.

The seven circuit labs create a fresh blank file under `circuits/guided/` and open it in the complete upstream Digital simulator. Students use Digital’s original component library, wiring canvas, simulation controls, dialogs, and save behavior, then optionally verify the result with Digital’s official preview/tests:

- Lecture 2 half adder;
- Lecture 3 Boolean expression to gates;
- Lecture 4 minimized K-map function;
- Lecture 5 2-to-1 data selector;
- Lecture 6 one stored state bit;
- Lecture 7 2-to-4 address decoder; and
- Lecture 10 small arithmetic/logic selector.

The seven assembly labs open retained, self-checking NASM 32-bit sources in the actual GDB workbench: register arithmetic, flags and signed branching, array addressing with a counted loop, a stack frame with `CALL`/`RET`, linear search, and iterative/recursive binary search. Students predict before execution, build and run actual ELF32 machine code, stop at named labels, then inspect registers, decoded EFLAGS, stack, memory, current Intel disassembly, output, and exit status. The three search programs test found, absent, first/last, and boundary behavior. The separately labeled Instruction Trace Tutor remains optional conceptual practice and is not assembler evidence.

These are formative prerequisite or analogous labs. They do not provide the graded four-bit adder, multiplier, counter, register file, ALU, processor, report, or assignment answer. Canvas controls the released task and submission.

There is no reduced student circuit editor. Every guided `.dig` file opens in Full Digital, including buses, RAM/ROM, subcircuits, HDL, and the rest of Digital’s upstream feature set.

## Read before class: open book and author-video map

The book is required; the targeted videos reinforce rather than replace the reading. Use the focused sections below before opening the presentation slides. Reading/video completion is self-reported and local to your VS Code installation.

| Class topic | Read in Tarnoff | Watch the author | Then |
|---|---|---|---|
| Lecture 1: Introduction and data representation | [Ch. 1](https://faculty.etsu.edu/tarnoff/ntes2150/Ch1_v02.pdf), §§1.1–1.5; [Ch. 2](https://faculty.etsu.edu/tarnoff/ntes2150/Ch2_v02.pdf), §§2.1–2.4 and §2.7 | [Ep 001: Digital Signal](https://www.youtube.com/watch?v=2jfoLxQXq3Y) (optional vocabulary); [Ep 004: Binary to Decimal](https://www.youtube.com/watch?v=hBdGOb8w4DA); [Ep 006: Hexadecimal](https://www.youtube.com/watch?v=HoZ8_UIziX8) | Complete five readiness questions; continue through all eight |
| Lecture 2: Signed data, Boolean logic, and adders | [Ch. 2](https://faculty.etsu.edu/tarnoff/ntes2150/Ch2_v02.pdf), §§2.3–2.5; [Ch. 3](https://faculty.etsu.edu/tarnoff/ntes2150/Ch3_v02.pdf), §§3.1–3.3; [Ch. 5](https://faculty.etsu.edu/tarnoff/ntes2150/Ch5_v02.pdf), §§5.2–5.3; [Ch. 8](https://faculty.etsu.edu/tarnoff/ntes2150/Ch8_v02.pdf), §8.1 | [Ep 014: Two's Complement](https://www.youtube.com/watch?v=Ix8mP_xneFc); [Ep 012: Binary Addition](https://www.youtube.com/watch?v=YyxlNN8l0zw); [ETSU Ep 4.01: Logic Gates](https://dc.etsu.edu/computer-organization-design-oer/29/); [ETSU Ep 4.02: Truth Tables](https://dc.etsu.edu/computer-organization-design-oer/30/) | Complete eight questions and the half-adder build |
| Lecture 3: Boolean algebra and simplification | [Ch. 5](https://faculty.etsu.edu/tarnoff/ntes2150/Ch5_v02.pdf), §§5.1–5.7; [Ch. 6](https://faculty.etsu.edu/tarnoff/ntes2150/Ch6_v02.pdf), §§6.1–6.3 | [Ep 034: Simplification](https://www.youtube.com/watch?v=dLIfh2wj8Dk); [Ep 036: SOP](https://www.youtube.com/watch?v=13HCv91RGOE); [Ep 033: DeMorgan](https://www.youtube.com/watch?v=euW9JldGCFk) | Try the Lecture 3 check |
| Lecture 4: Karnaugh maps | [Ch. 7](https://faculty.etsu.edu/tarnoff/ntes2150/Ch7_v02.pdf), §§7.1–7.3 | [Ep 040: K-map Introduction](https://www.youtube.com/watch?v=pPHxpiJfyS8); [Ep 041: Rectangle Rules](https://www.youtube.com/watch?v=68e6eOKs8Gg); [Ep 042: Four-Variable K-maps](https://www.youtube.com/watch?v=GLSdMlzngsY) | Try the Lecture 4 check |
| Lecture 5: Combinational logic and data selection | [Ch. 5](https://faculty.etsu.edu/tarnoff/ntes2150/Ch5_v02.pdf), §5.1; [Ch. 8](https://faculty.etsu.edu/tarnoff/ntes2150/Ch8_v02.pdf), §§8.3–8.6 | [Ep 026: Combinational Logic](https://www.youtube.com/watch?v=lTmAlB1T6Yo); [Ep 029: Decoder](https://www.youtube.com/watch?v=XKxGCw8nnRU); [ETSU Episode 6.09: Multiplexers](https://dc.etsu.edu/computer-organization-design-oer/49/) | Try the Lecture 5 check |
| Lecture 6: Memory cells and sequential logic | [Ch. 10](https://faculty.etsu.edu/tarnoff/ntes2150/Ch10_v02.pdf), §§10.1–10.5; [Ch. 11](https://faculty.etsu.edu/tarnoff/ntes2150/Ch11_v02.pdf), §§11.1–11.2 | [Ep 058: Timing Diagrams](https://www.youtube.com/watch?v=moxMU86NeVI); [Ep 061: D Flip-Flop Counter](https://www.youtube.com/watch?v=ts4g_NUuHAc); [Ep 064: State Machines](https://www.youtube.com/watch?v=SZwLuDUsX3A) | Try the Lecture 6 check |
| Lecture 7: Memory organization and buses | [Ch. 12](https://faculty.etsu.edu/tarnoff/ntes2150/Ch12_v02.pdf), §§12.2–12.3.4 | [Ep 068: Simple Memory Device](https://www.youtube.com/watch?v=3By4tx4grSk) | Try the Lecture 7 check |
| Lecture 8: I/O and interrupts | [Ch. 15](https://faculty.etsu.edu/tarnoff/ntes2150/Ch15_v02.pdf), §§15.9.1–15.9.3; [OSTEP: I/O Devices](https://pages.cs.wisc.edu/~remzi/OSTEP/file-devices.pdf), §36 | [Ep 086: Introduction to I/O](https://www.youtube.com/watch?v=nnO2OfSTVbA); [Ep 087: Polled I/O](https://www.youtube.com/watch?v=xNH1e5snIEY); [Ep 088: Interrupts](https://www.youtube.com/watch?v=dDA3PUr16As) | Complete the eight-question confidence set |
| Lecture 8 supplement: Detailed I/O and memory | [Ch. 12](https://faculty.etsu.edu/tarnoff/ntes2150/Ch12_v02.pdf), §12.4; [Ch. 15](https://faculty.etsu.edu/tarnoff/ntes2150/Ch15_v02.pdf), §§15.9.1–15.9.4 | [Ep 087: Polled I/O](https://www.youtube.com/watch?v=xNH1e5snIEY); [Ep 088: Interrupts](https://www.youtube.com/watch?v=dDA3PUr16As); [Direct Memory Access](https://www.youtube.com/watch?v=M16l_ymlfcs) | Try the supplement check |
| Lecture 9: Memory hierarchy and cache | [Ch. 13](https://faculty.etsu.edu/tarnoff/ntes2150/Ch13_v02.pdf), §§13.1 and 13.4 | [Ep 067: Memory Hierarchy](https://www.youtube.com/watch?v=JogSnkvENr0); [Ep 073: Cache](https://www.youtube.com/watch?v=Bz49xnKBH_0) | Try the Lecture 9 check |
| Lecture 10: RTL, arithmetic, and control | [Ch. 15](https://faculty.etsu.edu/tarnoff/ntes2150/Ch15_v02.pdf), §§15.2–15.6 | [Ep 079: CPU Architecture](https://www.youtube.com/watch?v=YNAcQ-uVM7Y) | Try the Lecture 10 check |
| Lecture 11: Processor pipelining | [Ch. 15](https://faculty.etsu.edu/tarnoff/ntes2150/Ch15_v02.pdf), §15.8 | [Ep 085: CPU Pipeline](https://www.youtube.com/watch?v=E5qacBU1XjQ) | Try the Lecture 11 check |
| Lecture 12: x86 and assembly | [Ch. 15](https://faculty.etsu.edu/tarnoff/ntes2150/Ch15_v02.pdf), §15.2.5; [Ch. 16](https://faculty.etsu.edu/tarnoff/ntes2150/Ch16_v02.pdf), §§16.2.1–16.2.3; [Ch. 17](https://faculty.etsu.edu/tarnoff/ntes2150/Ch17_v02.pdf), §§17.1–17.4.3; [OSTEP: Address Spaces](https://pages.cs.wisc.edu/~remzi/OSTEP/vm-intro.pdf), §13; [Carter: PC Assembly Language](https://pacman128.github.io/pcasm/), focused §§1.2.5, 1.3–1.4, 2.1–2.3, 4.2–4.5, 4.8.1, and 5.1 | [Ep 080: Registers/EIP](https://www.youtube.com/watch?v=th8FnKQNIYE); [Ep 081: Stack Pointer](https://www.youtube.com/watch?v=n8_2y5E8N4Y); [Ep 082: Functions/Stack](https://www.youtube.com/watch?v=mC5eNUpyfKY); [Ep 083: Flags](https://www.youtube.com/watch?v=7eaTT8PekE0) | Complete eight questions and the required actual register/arithmetic build/debug lab; continue with six more NASM labs |

Browse the [official Tarnoff book page](https://faculty.etsu.edu/tarnoff/138292/), [ETSU author-video series](https://dc.etsu.edu/computer-organization-design-oer/), or [author's YouTube channel](https://www.youtube.com/@Intermation) when you need a broader review. These external sources have their own privacy practices. Presentation PDFs remain embedded locally; no Google Drive is used.

## Homework

| Homework | Preparation |
|---|---|
| [Homework 1: Logic Foundations](assignments/homework-1-logic-foundations.md) | Lectures 1--5 |
| [Homework 2: Sequential Logic and State Machines](assignments/homework-2-sequential-logic.md) | Lecture 6 |
| [Homework 3: Memory and Assembly Foundations](assignments/homework-3-memory-assembly.md) | Lectures 8--10 and 12 |

## Project assignments

| Milestone | Project assignment | Preparation |
|---|---|---|
| 1 | [Registers and Processor Memories](assignments/project-1-registers-dram.md) | Lectures 6, 7, and 10 |
| 2 | [Register File and ALU](assignments/project-2-register-file-alu.md) | Lectures 2, 5, and 10 |
| 3 | [Integrated 4-bit Processor](assignments/project-3-processor.md) | Lectures 5--7 and 10--12 |

## Cumulative final presentation

The [Final Presentation: Cumulative 4-bit Processor](assignments/final-project-4-bit-processor.md) presents the same processor built through the three implementation milestones; it is not a separate width-upgrade project. The instruction word and instruction memory are 8 bits wide, while the registers, ALU, and data memory remain 4 bits wide. Use the [public local circuit preflight contracts](assignments/LOCAL_CIRCUIT_PREFLIGHT.md) before submitting. The presentation and demonstration occur during final examination week. The exact date, time, room, order, released requirements, required files, and submission deadline are to be announced in Canvas.

## Bundled offline presentation sequence

| Lecture | Main concepts | Assignment connection | Original presentation |
|---:|---|---|---|
| 1 | Abstraction, ISA/microarchitecture, binary and hexadecimal representation | Logic Foundations prerequisite | [Open Lecture 1](presentations/lecture-01.pdf) |
| 2 | Two's complement, Boolean operations, truth tables, full adders | Logic Foundations; ALU arithmetic | [Open Lecture 2](presentations/lecture-02.pdf) |
| 3 | Boolean algebra and circuit simplification | Logic Foundations | [Open Lecture 3](presentations/lecture-03.pdf) |
| 4 | Karnaugh maps, minimization, don't-care conditions | Logic Foundations; ALU simplification | [Open Lecture 4](presentations/lecture-04.pdf) |
| 5 | Combinational circuits, displays, decoders, multiplexers, demultiplexers | Register selection; instruction decoding | [Open Lecture 5](presentations/lecture-05.pdf) |
| 6 | Latches, flip-flops, clocks, sequential circuits, counters | Registers, PC, and instruction registers | [Open Lecture 6](presentations/lecture-06.pdf) |
| 7 | Memory organization, buses, memory maps, address decoding | DRAM and instruction memory | [Open Lecture 7](presentations/lecture-07.pdf) |
| 8 | I/O protocols, polling, interrupts, asynchronous programming | Processor context and extension activity | [Open Lecture 8](presentations/lecture-08.pdf) |
| 8 supplement | Detailed I/O, interrupts, asynchronous programming, and memory | Processor context | [Open I/O supplement](presentations/lecture-08-supplement.pdf) |
| 9 | Memory hierarchy, storage latency, RAM, cache, locality | Memory-system context | [Open Lecture 9](presentations/lecture-09.pdf) |
| 10 | Registers, RTL, arithmetic units, ALU, control unit, instruction cycle | Register File/ALU and integrated processor | [Open Lecture 10](presentations/lecture-10.pdf) |
| 11 | Processor components and pipelining | Integrated processor and extension activity | [Open Lecture 11](presentations/lecture-11.pdf) |
| 12 | Address spaces, memory segments, x86 registers, assembly observation | ISA and execution context | [Open Lecture 12](presentations/lecture-12.pdf) |

## Using these materials in SystemStudio

1. Complete the mapped Accessible lesson → Read → Watch → five-question readiness checkpoint before the related class meeting; continue through all eight questions for the confidence set.
2. Complete the mapped formative lab when one is required; predict before creating or running its artifact. Optional labs provide further circuit or assembly practice.
3. Read the assignment and its mapped lecture topics before opening the simulator.
4. Keep guided practice under `circuits/guided/` and create assignment work separately under `circuits/work/`.
5. Build assignment components as separate `.dig` subcircuits.
6. Add instructor-approved `Testcase` components where provided.
7. Run tests from VS Code after each milestone and keep the observed evidence for your report.
8. Open [Fall 2026 Canvas](https://canvas.umd.umich.edu/courses/552144) for the current requirements and due date.
9. Submit the required files in Canvas and confirm that Canvas recorded the submission.

## Assembly programming

Use **CIS 310: Create NASM Assembly Workspace**. Open a source under `assembly/nasm-elf32/` and select **Open Actual NASM Debug Workbench**. Build/run produces an actual ELF32 executable; Start debugger opens an actual GDB session. On x86 Linux the extension uses native NASM, GNU `ld`, and GDB. On Windows/macOS it uses the course container with QEMU-i386 after Docker Desktop is started and the one-time image build is approved.

Follow predict → build/run → breakpoint → inspect → step → explain. Start with `RegisterArithmetic.asm`, then continue through flags/branches, loops, stack/calls, linear search, and iterative/recursive binary search. For optional prediction practice only, open a source under `assembly/trace-tutor-examples/` with **Instruction Trace Tutor**. Read `assembly/README.md`, `assembly/COMPATIBILITY.md`, and `assembly/OPEN_BOOK.md`.
