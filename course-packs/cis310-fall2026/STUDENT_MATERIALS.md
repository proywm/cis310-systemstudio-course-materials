# CIS 310 Fall 2026 Course Materials

> **Fall 2026 course workspace:** [Canvas course 552144](https://canvas.umd.umich.edu/courses/552144) is authoritative for requirements, deadlines, points, allowed collaboration, required files, and submission. **Submit every required deliverable in Canvas; SystemStudio does not submit for you.** The study references were imported from Fall 2025 and require instructor review. All 13 presentations are embedded in the extension as offline, integrity-checked PDFs—no Google Drive access is required.

## Homework

| Homework | Preparation |
|---|---|
| [Homework 1: Logic Foundations](assignments/homework-1-logic-foundations.md) | Lectures 1--5 |
| [Homework 2: Sequential Logic and State Machines](assignments/homework-2-sequential-logic.md) | Lecture 6 |
| [Homework 3: Memory and Assembly Foundations](assignments/homework-3-memory-assembly.md) | Lectures 8--10 and 12 |

## Project assignments

| Milestone | Project assignment | Preparation |
|---|---|---|
| 1 | [Registers and DRAM](assignments/project-1-registers-dram.md) | Lectures 6, 7, and 10 |
| 2 | [Register File and ALU](assignments/project-2-register-file-alu.md) | Lectures 2, 5, and 10 |
| 3 | [Integrated 4-bit Processor](assignments/project-3-processor.md) | Lectures 5--7 and 10--12 |

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

1. Read the assignment and its mapped lecture topics before opening the simulator.
2. Create your own circuit under `circuits/work/`; do not modify the reference half-adder.
3. Build components as separate `.dig` subcircuits.
4. Add instructor-approved `Testcase` components where provided.
5. Run tests from VS Code after each milestone and keep the observed evidence for your report.
6. Open [Fall 2026 Canvas](https://canvas.umd.umich.edu/courses/552144) for the current requirements and due date.
7. Submit the required files in Canvas and confirm that Canvas recorded the submission.

## Assembly programming

Use **CIS 310: Create Embedded Assembly Lab**, open `assembly/irvine32/AddTwo.asm`, and choose **Open Embedded Assembly Lab**. Leave **Auto-detect** selected or choose **Irvine32 Classroom (MASM)**. The same source-level IA-32 teaching engine runs on Windows, Linux, macOS, and Remote SSH without Docker, Visual Studio, NASM, a linker, administrator access, or another download.

The lab lets you build, step, run, and reset while observing registers, flags, data, stack, virtual-console input, output, and the recent instruction trace. Try `assembly/irvine32/ConsoleInput.asm` with one response per input line, or switch to `assembly/nasm-ia32/LoopSum.asm`. Read `assembly/IRVINE32_PROFILE.md` and `assembly/COMPATIBILITY.md`: the embedded lab does not generate binaries or replace a complete MASM/NASM toolchain, operating-system APIs, the complete macro language, or arbitrary external libraries.
