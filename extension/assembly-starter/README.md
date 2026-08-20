# CIS 310 Embedded Assembly Lab

Start with `irvine32/AddTwo.asm`, then run **CIS 310: Open Embedded Assembly Lab**. The lab is built into the extension and works in desktop or remote VS Code on Windows, Linux, Intel Mac, and Apple Silicon. It needs no Docker, Visual Studio, native assembler, compiler, SDK, administrator access, or network connection.

Choose one execution profile in the lab:

- **Irvine32 Classroom (MASM)** accepts the 32-bit Visual Studio/Irvine source shape used in introductory textbook activities and supplies an embedded teaching implementation of common Irvine-style calls.
- **NASM IA-32** accepts the documented NASM-style classroom subset.
- **Auto-detect** chooses a profile from the source wrappers and can be overridden at any time.

The side-by-side lab provides four controls:

1. **Build** parses the current source and resets the machine and virtual console.
2. **Step** executes one source instruction and highlights the next source line.
3. **Run** executes until `EXIT`, `HLT`, program completion, an error, or the 10,000-instruction safety limit.
4. **Rebuild / Reset** restores registers, flags, data, input, output, and the stack.

You can inspect EAX–EIP, arithmetic flags, the top of the stack, declared data, program output, remaining input, and a recent execution trace. The **CIS 310 Hands-on Lab Center** maps each original example to prediction and evidence checkpoints:

- `irvine32/AddTwo.asm`: register arithmetic;
- `irvine32/FlagsBranch.asm`: `CMP`, flags, and signed conditional branching;
- `nasm-ia32/LoopSum.asm`: array addressing and a counted loop;
- `irvine32/StackCall.asm`: `CALL`, a small stack frame, register preservation, and `RET`; and
- `irvine32/ConsoleInput.asm`: virtual input, procedure contracts, and an invalid-input path.

These are formative examples with different values and scope from graded work. Canvas assignment rules remain authoritative.

## What “embedded” means

SystemStudio interprets a documented classroom subset of 32-bit x86 at the source level in a 1 MiB teaching memory model. It accepts the common instructions used for registers, data, arithmetic, flags, branches, procedures, and stack exercises. It also recognizes the common MASM/Irvine teaching wrappers, input/output procedures, and a NASM-style IA-32 form.

This is intentionally not a claim of full Microsoft MASM, Irvine32, or NASM compatibility. It does not emit PE/ELF objects, run arbitrary native code, or reproduce Windows/Linux ABIs. Read [the Irvine32 profile guide](IRVINE32_PROFILE.md) and [the compatibility guide](COMPATIBILITY.md) before assigning an example that uses the MASM macro language, operating-system calls, external libraries, x87, SIMD, or an unsupported directive.
