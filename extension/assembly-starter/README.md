<!-- systemstudio-assembly-guide: 0.20 -->
# CIS 310 NASM 32-bit Workspace

Fall 2026 uses one student-facing x86 dialect: **NASM 32-bit**. Start with a
source under `nasm-elf32/`, open it in VS Code, and select **CIS 310: Open
Actual NASM Debug Workbench**.

## One workflow

1. Predict the register, flag, stack, or memory effect before running.
2. Select **Build and run** to invoke the actual NASM assembler, GNU ELF32
   linker, and executable tests.
3. Select **Start or restart debugger** to enter an actual GDB session.
4. Step instructions, continue to a NASM label, and inspect EIP-aligned Intel
   disassembly, registers, decoded EFLAGS, stack words, and a memory watch.
5. Explain the first place where expected and observed state differ.

On x86 Linux, SystemStudio can use host NASM, GNU `ld`, and GDB. On Windows,
macOS, or as a Linux fallback, it uses a locally built course container with
NASM, GNU `ld`, GDB, and QEMU-i386. Docker Desktop remains a prerequisite on
Windows and macOS and is never installed silently. Student execution runs with
networking disabled, capabilities dropped, a read-only container root, and
only the private build directory writable.

The optional `trace-tutor-examples/` sources provide bounded prediction
practice. The tutor is not an assembler and cannot prove that source builds.

## Included actual programs

- `RegisterArithmetic.asm` — registers and integer arithmetic;
- `FlagsBranch.asm` — `CMP`, EFLAGS, and conditional control flow;
- `LoopSum.asm` — array addressing and a counted loop;
- `StackCall.asm` — stack frame, arguments, `CALL`, and `RET`;
- `LinearSearch.asm` — found, boundary, and absent cases;
- `BinarySearchIterative.asm` — loop invariants and midpoint updates; and
- `BinarySearchRecursive.asm` — recursive frames and base cases; and
- `StudentUnitTest.test.asm` — a small exit-code self-test discovered in VS
  Code's Testing view (exit 0 passes; any other exit code fails).

The search examples are self-checking: exit code 0 and `PASS` require all
included cases to succeed. Passing formative tests is not an instructor/GSI
grade; Canvas remains authoritative for graded requirements and submission.
Use **CIS 310: Open Student Unit Test Center** to discover Digital Testcase
components, NASM `*.test.asm` programs, and the assignment public preflights in
one place.

Read [COMPATIBILITY.md](COMPATIBILITY.md) for the execution boundary and
[OPEN_BOOK.md](OPEN_BOOK.md) for the accessible reading map.
