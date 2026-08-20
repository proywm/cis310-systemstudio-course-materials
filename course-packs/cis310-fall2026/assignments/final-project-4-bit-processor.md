> **Fall 2026 planning reference — Canvas remains authoritative.** The final presentation culminates the same 4-bit processor developed through Implementations 1–3. Canvas will announce the exact date, time, room, order, released rubric, required files, and submission deadline.

# Final Presentation: Cumulative 4-bit Processor

The presentation demonstrates, tests, and explains the **same cumulative 4-bit processor**. It is not a new processor-width redesign.

## Schedule

The presentation occurs during **Fall 2026 final examination week**. Exact logistics are **to be announced in Canvas**.

## Required progression

1. **Implementation 1 — storage and fetch:** 4-bit register and PC, 8-bit instruction register, 16×8 instruction memory, and 16×4 data memory.
2. **Implementation 2 — computation:** four-register × 4-bit register file and exhaustive 4-bit ALU behavior.
3. **Implementation 3 — integration:** one 8-bit instruction is fetched per `FETCH` edge and executed by the four-state 4-bit processor.
4. **Instructional assembly program:** explain the published `LDI`, `ADD`, `STORE`, `LOAD`, and `SUB` sequence from assembly notation through hexadecimal encoding to processor state changes.
5. **System evidence:** show expected versus observed PC, state, IR, register operands/results, data memory, and write-enable timing.
6. **Presentation:** explain the datapath, control sequence, tests, limitations, and each authorized team member’s contribution.

An 8-bit instruction word carries control fields; the general-purpose registers, ALU data, and data-memory words remain 4 bits. If Canvas separately requests IA-32 MASM/NASM work, present it as a different toolchain artifact—x86 code does not execute on this instructional processor.

## Pre-presentation verification

- rerun the component preflights;
- run the 25-vector integrated processor preflight using the published instruction-memory image;
- add at least one student-designed test that is not a copy of the public sequence;
- preserve the edge-by-edge trace and expected-versus-observed table;
- rehearse an explanation of one correct result and one defect you found and fixed; and
- open Canvas to confirm the released files, rubric, logistics, and submission receipt.

The local tests are formative. Passing does not predict a score, replace instructor evaluation, assess the explanation, or submit anything.

## Planning artifacts

- cumulative processor `.dig` file and reusable subcircuits;
- published program plus any additional instructional-ISA program requested in Canvas;
- public and student-designed test evidence;
- datapath and four-state control explanation;
- presentation material and demonstration evidence; and
- contribution/explanation record for any instructor-authorized team.

Do not assume this planning list is the final Canvas checklist.
