# CIS 310 Course Materials

> **Reference edition:** imported from Fall 2025. Confirm all deadlines and submission requirements in the current Canvas course. Presentations are included as offline, integrity-checked PDFs.

## Homework

| Homework | Preparation |
|---|---|
| [Homework 1: Logic Foundations](assignments/homework-1-logic-foundations.md) | Lectures 1--5 |

## Project assignments

| Milestone | Project assignment | Preparation |
|---|---|---|
| 1 | [Registers and DRAM](assignments/project-1-registers-dram.md) | Lectures 6, 7, and 10 |
| 2 | [Register File and ALU](assignments/project-2-register-file-alu.md) | Lectures 2, 5, and 10 |
| 3 | [Integrated 4-bit Processor](assignments/project-3-processor.md) | Lectures 5--7 and 10--12 |

## Presentation sequence

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
6. Use the current Canvas page—not this archived pack—for deadlines, grading, and submission.

## Assembly programming

Use **CIS 310: Create Embedded Assembly Lab**, open `assembly/embedded/add-two.asm`, and choose **Open Embedded Assembly Lab**. The same source-level IA-32 teaching engine runs on Windows, Linux, macOS, and Remote SSH without Docker, Visual Studio, NASM, a linker, administrator access, or another download.

The lab lets you assemble, step, run, and reset while observing registers, flags, data, stack, output, and the recent instruction trace. It recognizes common course MASM wrappers and a documented NASM-style 32-bit subset. Read `assembly/COMPATIBILITY.md`: the embedded lab does not generate binaries or replace a complete MASM/NASM toolchain, operating-system APIs, macros, or arbitrary external libraries.
