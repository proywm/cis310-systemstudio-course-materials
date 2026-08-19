# CIS 310 Embedded Assembly Lab

Open `embedded/add-two.asm`, then run **CIS 310: Open Embedded Assembly Lab**. The lab is built into the extension and works in desktop or remote VS Code on Windows, Linux, Intel Mac, and Apple Silicon. It needs no Docker, native assembler, compiler, SDK, administrator access, or network connection.

The side-by-side lab provides four controls:

1. **Assemble** parses the current source and resets the machine.
2. **Step** executes one source instruction and highlights the next source line.
3. **Run** executes until `EXIT`, `HLT`, program completion, an error, or the 10,000-instruction safety limit.
4. **Reset** restores registers, flags, data, output, and the stack.

You can inspect EAX–EIP, arithmetic flags, the top of the stack, declared data, program output, and a recent execution trace. Try `embedded/loop-sum.asm` after the MASM-style example.

## What “embedded” means

SystemStudio interprets a documented classroom subset of 32-bit x86 at the source level in a 1 MiB teaching memory model. It accepts the common instructions used for registers, data, arithmetic, flags, branches, procedures, and stack exercises. It also recognizes the common MASM/Irvine teaching wrappers and a NASM-style IA-32 form.

This is intentionally not a claim of full Microsoft MASM or NASM compatibility. It does not emit PE/ELF objects, run arbitrary native code, or reproduce Windows/Linux ABIs. See [the compatibility guide](COMPATIBILITY.md) before assigning an example that uses macros, operating-system calls, external libraries, x87, SIMD, or an unsupported directive.
