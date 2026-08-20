> **Fall 2026 planning reference — Canvas remains authoritative.** The final presentation is the culmination of the same 4-bit processor developed through Implementation Assignments 1–3. Canvas will announce the exact date, time, room, presentation order, released rubric, required files, and submission deadline.

# Final Presentation: Cumulative 4-bit Processor and Assembly-Program Demonstration

The final CIS 310 presentation asks you to demonstrate, test, and explain the **same 4-bit processor** that you build incrementally across the three implementation assignments. It is not a separate processor redesign.

## Schedule

The presentation and demonstration will occur during **Fall 2026 final examination week**. The exact date, time, room, presentation order, and submission deadline are **to be announced in Canvas**.

## Cumulative progression

1. **Implementation 1 — storage and fetch foundations:** Verify the 4-bit registers, program counter, instruction register, and 4-bit-wide, 16-address memory.
2. **Implementation 2 — computation and data movement:** Verify the four-register, 4-bit register file and every required 4-bit ALU control case.
3. **Implementation 3 — processor integration:** Reuse those tested components to complete the 4-bit processor, assemble each 16-bit instruction from four memory nibbles, decode it, execute it, and update visible state.
4. **Assembly program:** Demonstrate the released program for the processor's instructional ISA and explain how each encoded instruction changes registers, memory, ALU results, and control flow. If Canvas also requests x86 MASM/NASM work, treat that as a separate toolchain artifact; x86 code does not run on the instructional 4-bit processor.
5. **System evidence:** Compare expected and observed state for representative arithmetic, data-movement, memory, sequential-PC, and branch behavior.
6. **Presentation:** Explain the datapath, control sequence, test strategy, limitations, and each authorized team member's contribution.

## Local preflight before Canvas

Use **Coursework and Final Presentation → Run local circuit preflight** in SystemStudio before submitting:

- rerun the public register, PC, register-file, and ALU component contracts against the corresponding `.dig` subcircuits;
- run the integrated processor's own embedded Digital test cases;
- verify the released program step-by-step and preserve expected-versus-observed evidence;
- build/run the required assembly source with the released toolchain; and
- open the current Canvas assignment and confirm that the required files, naming, and evidence match the released rubric.

The local preflight is formative. A passing result does **not** predict a score, replace instructor evaluation, submit work, or verify the current Canvas requirements.

## Planning artifacts

Prepare these likely evidence types while checking Canvas for the authoritative list:

- the cumulative 4-bit processor circuit and reusable subcircuits;
- the processor test program and assembly source requested in Canvas;
- public preflight results plus additional test cases for the released ISA;
- a documented test table with expected and observed processor state;
- a clear datapath/control explanation;
- presentation material and demonstration evidence; and
- an individual contribution/explanation record when working in an instructor-authorized team.

Do not assume this planning list is the final submission checklist. Open the released Canvas assignment before packaging or submitting anything, and confirm the Canvas submission receipt afterward.
