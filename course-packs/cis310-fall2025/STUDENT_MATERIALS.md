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

SystemStudio keeps two assembly paths separate so that syntax and runtime expectations remain accurate:

- **Portable Assembly Lab (recommended for shared laptop support):** NASM syntax, x86-64 instructions, and the Linux system-call ABI in one containerized environment on Windows, Linux, and macOS.
- **Exact MASM compatibility:** Microsoft MASM and Windows-specific course examples on Windows only. MASM source is not automatically translated to NASM.

Use **CIS 310: Create Portable Assembly Lab** from the extension, then open `assembly/README.md`. The first build requires Docker Desktop or Docker Engine already installed and running.
