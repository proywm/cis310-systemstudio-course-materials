# CIS 310 Course Materials

> **Reference edition:** imported from Fall 2025. Confirm all deadlines and submission requirements in the current Canvas course. Presentation links require access granted by the instructor.

## Assignment sequence

| Stage | Assignment | Preparation |
|---|---|---|
| Foundations | [Homework 1: Logic Foundations](assignments/homework-1-logic-foundations.md) | Lectures 1--5 |
| Processor milestone 1 | [Registers and DRAM](assignments/project-1-registers-dram.md) | Lectures 6, 7, and 10 |
| Processor milestone 2 | [Register File and ALU](assignments/project-2-register-file-alu.md) | Lectures 2, 5, and 10 |
| Processor milestone 3 | [Integrated 4-bit Processor](assignments/project-3-processor.md) | Lectures 5--7 and 10--12 |

## Presentation sequence

| Lecture | Main concepts | Assignment connection | Original presentation |
|---:|---|---|---|
| 1 | Abstraction, ISA/microarchitecture, binary and hexadecimal representation | Logic Foundations prerequisite | [Open Lecture 1](https://docs.google.com/presentation/d/1ZrPn24kn9iq6uVw6QWxBdY3THQYfWx2Z/edit) |
| 2 | Two's complement, Boolean operations, truth tables, full adders | Logic Foundations; ALU arithmetic | [Open Lecture 2](https://docs.google.com/presentation/d/19GzsyThmPGdYbeV0VdzohI70uxvMmdN3/edit) |
| 3 | Boolean algebra and circuit simplification | Logic Foundations | [Open Lecture 3](https://drive.google.com/file/d/1Xrw6mFbgx-9Nez3inFobkUCLqvcRJSo4/view) |
| 4 | Karnaugh maps, minimization, don't-care conditions | Logic Foundations; ALU simplification | [Open Lecture 4](https://docs.google.com/presentation/d/1C6IuGjFVfKrO62HOdaKeHB-37SXWFnHw/edit) |
| 5 | Combinational circuits, displays, decoders, multiplexers, demultiplexers | Register selection; instruction decoding | [Open Lecture 5](https://docs.google.com/presentation/d/1M08X7A59gGf0JRAAHvSFoPeZsX1x7WjC/edit) |
| 6 | Latches, flip-flops, clocks, sequential circuits, counters | Registers, PC, and instruction registers | [Open Lecture 6](https://docs.google.com/presentation/d/1qq-LEi8xKmBIEHF1okfHoPV2XBxJ0R0v/edit) |
| 7 | Memory organization, buses, memory maps, address decoding | DRAM and instruction memory | [Open Lecture 7](https://docs.google.com/presentation/d/1uRrjQ007Ga_BOQyaAoD1mr0Hjm9aDcqq/edit) |
| 8 | I/O protocols, polling, interrupts, asynchronous programming | Processor context and extension activity | [Open Lecture 8](https://docs.google.com/presentation/d/1OmwFehWQ3WKrWmnS1ugB1KYmXKgPgVDB/edit) |
| 8 supplement | Detailed I/O, interrupts, asynchronous programming, and memory | Processor context | [Open I/O supplement](https://drive.google.com/file/d/1nrI3Jvavgea9QBfLzdxA1754DFLesrny/view) |
| 9 | Memory hierarchy, storage latency, RAM, cache, locality | Memory-system context | [Open Lecture 9](https://docs.google.com/presentation/d/1eMAd2iBfeWldoEkXDOw9uW56tktfBa6b/edit) |
| 10 | Registers, RTL, arithmetic units, ALU, control unit, instruction cycle | Register File/ALU and integrated processor | [Open Lecture 10](https://docs.google.com/presentation/d/1f8yBwks9AUFcDIs4A2NigjlewGaSjp59/edit) |
| 11 | Processor components and pipelining | Integrated processor and extension activity | [Open Lecture 11](https://drive.google.com/file/d/1Q4aEQr_yyoardE_aAKrxFK0USQ7E1gB5/view) |
| 12 | Address spaces, memory segments, x86 registers, assembly observation | ISA and execution context | [Open Lecture 12](https://docs.google.com/presentation/d/1_C0UZfWmZaRAVcnhbBdzmaql81uutKlj/edit) |

## Using these materials in SystemStudio

1. Read the assignment and its mapped lecture topics before opening the simulator.
2. Create your own circuit under `circuits/work/`; do not modify the reference half-adder.
3. Build components as separate `.dig` subcircuits.
4. Add instructor-approved `Testcase` components where provided.
5. Run tests from VS Code after each milestone and keep the observed evidence for your report.
6. Use the current Canvas page—not this archived pack—for deadlines, grading, and submission.
