# One NASM 32-bit workflow

Fall 2026 uses NASM 32-bit for student-authored x86 work. Create the NASM
workspace, open an actual source, predict its state, and use **Build and run**.
SystemStudio invokes NASM and GNU `ld`; a self-checking program reports `PASS`
and exit code 0 only when its included cases succeed.

Open the **Actual NASM Debug Workbench**, start GDB, and continue to a named
NASM label such as `inspect_after_add`. Compare EAX–EDI, EBP, ESP, EIP,
decoded EFLAGS, stack, memory, source location, and Intel disassembly with the
prediction. Step one actual instruction and explain every changed value.

On x86 Linux the extension can use NASM, GNU `ld`, and GDB directly. On
Windows/macOS it uses the locally built course container after Docker Desktop
is available and the student confirms setup. The container executes without
network access. Docker itself is not silently installed.

The optional Instruction Trace Tutor is conceptual practice, not build or
debug evidence. NASM targets IA-32 x86 and is separate from the Digital
project’s 4-bit datapath and 8-bit instructional words.
