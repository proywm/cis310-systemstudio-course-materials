# CIS 310 Embedded Assembly Decision

## Question

Can one VS Code extension give students a useful CIS 310 assembly experience on Windows, Linux, macOS, and Remote SSH without requiring Visual Studio, Docker, a VM, administrator access, or a separately installed assembler?

## Evidence from the course context

The course archive was reviewed only to identify the instructional concepts and source dialect. Lecture 12 covers 32-bit x86 registers, EFLAGS, EIP, process memory, stack behavior, address spaces, and an AddTwo-style Visual Studio example. Related examples use Microsoft/Irvine conventions such as `.386`, `.model flat,stdcall`, `.stack`, `PROC`/`ENDP`, `INVOKE ExitProcess`, EAX/EBP/ESP, `CALL`, and `RET`.

Those concepts are portable; the exact production toolchain is not. Microsoft MASM is part of the Visual C++ toolset, while NASM has its own syntax, preprocessing model, object formats, and effective-address rules. Windows APIs and Linux system calls are also different program interfaces. Renaming one native environment “universal MASM” would overstate compatibility.

## Selected common ground

SystemStudio v0.5.0 replaces the earlier container pilot with an original, source-level IA-32 teaching interpreter embedded in the extension. The common ground is the processor-learning layer:

- 32-bit general registers and 8-/16-bit aliases;
- CF, PF, ZF, SF, and OF;
- little-endian byte/word/doubleword data;
- effective addresses, stack behavior, procedures, arithmetic, logic, shifts, comparisons, branches, and loops;
- common MASM classroom wrappers and Irvine-style display helpers; and
- a NASM-style IA-32 form for the same supported concepts.

The lab provides **Assemble**, **Step**, **Run**, and **Reset** in a side-by-side webview. It displays registers, signed/unsigned/hex values, flags, declared data, the top of the stack, program output, the next source instruction, and a recent execution trace. Compile and runtime failures become VS Code diagnostics on the source line.

## Why embedding removes laptop setup overhead

The interpreter is TypeScript bundled in the VSIX. It does not start a child process, execute native student code, invoke a shell, download a compiler, or access the network. Consequently, the same source-level model runs wherever the extension host runs:

- Windows, Linux, Intel macOS, and Apple Silicon macOS use the same engine;
- Remote SSH does not change the instruction semantics and is not required;
- no Docker daemon, Visual Studio workload, NASM package, linker, VM, or administrator action is required; and
- restricted workspaces can use the bounded interpreter because it has no host-execution path.

This is a stronger common setup baseline than the earlier `linux/amd64` Docker pilot, while aligning more closely with the IA-32 register material used in the course.

## Safety and determinism

Each assemble/reset creates an isolated 1 MiB memory image. Stack and data accesses are range-checked. A run stops after 10,000 source instructions unless the program halts sooner, and string output is bounded to 4,096 bytes per runtime call. Source parsing supports a fixed allowlist; unknown directives and instructions fail closed with line-numbered diagnostics. There is no assembly instruction for host files, processes, devices, sockets, or arbitrary libraries.

## Compatibility boundary

The product deliberately says **MASM/NASM teaching subset**, not “full MASM,” “full NASM,” or “binary-compatible emulator.” It does not:

- generate encoded machine instructions, PE/COFF/ELF objects, or executables;
- reproduce exact instruction-byte lengths—displayed EIP values are synthetic teaching addresses;
- implement the complete MASM macro language or every NASM directive;
- implement a Windows/Linux ABI, arbitrary Irvine binaries, external object libraries, or OS calls; or
- model privilege, timing, caches, x87, MMX, SSE/AVX, or the complete IA-32 architecture.

The instructor-approved native environment remains necessary when the learning objective is exact encoding, linking, ABI/API behavior, external-library integration, or production-tool syntax outside the subset. This limitation is shown in both the student starter and the lab itself.

## Implemented and verified behaviors

Automated tests execute an Irvine-style MASM AddTwo program, NASM bracketed memory, register aliases, flags, loops, calls/returns, stack operations, data inspection, output helpers, unsupported-syntax diagnostics, and the infinite-loop bound. The two shipped starters are also executed during release verification. TypeScript type checking, the complete extension test suite, bundling, VSIX packaging, and installation are release gates.

Cross-platform consistency here is an architectural property of a pure extension-level interpreter, not yet evidence that the interface improves learning. A classroom pilot and pre/post/assignment evaluation remain necessary for that claim.

## Primary technical sources

- [Intel 64 and IA-32 Architectures Software Developer Manuals](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html)
- [Microsoft Macro Assembler documentation](https://learn.microsoft.com/en-us/cpp/assembler/masm/masm?view=msvc-170)
- [Microsoft MASM `INVOKE` directive](https://learn.microsoft.com/en-us/cpp/assembler/masm/invoke?view=msvc-170)
- [NASM language and effective-address documentation](https://www.nasm.us/doc/nasm03.html)
