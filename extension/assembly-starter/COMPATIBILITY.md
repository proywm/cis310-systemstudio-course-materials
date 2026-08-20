<!-- systemstudio-assembly-compatibility: 0.12 -->
# Assembly Toolchain and Trace-Tutor Boundary

## Real toolchains

**Actual NASM/ELF32:** SystemStudio invokes a real `nasm` process, produces an ELF32 object with DWARF information, links it with GNU `ld`, and executes the resulting IA-32 program with a timeout and bounded captured output. The assembler and linker diagnostics are preserved in the SystemStudio output channel.

This verified path runs on x86 Linux. SystemStudio does not bundle a Docker engine, Linux VM, or course container for other hosts.

**Exact Microsoft MASM/Irvine32:** On Windows only, SystemStudio invokes Microsoft `ml.exe` and `link.exe`, then links the official `Irvine32.lib`, `Kernel32.lib`, and `User32.lib`. The extension does not bundle Microsoft tools. Visual Studio C++ licensing and installation remain governed by Microsoft. The author’s Irvine resources are downloaded only from the pinned official repository after the student confirms, and the archive is SHA-256 verified.

Use real execution for any claim about:

- accepted assembler syntax;
- emitted object files or executable code;
- encoded instructions and actual addresses;
- operating-system ABI and library behavior; or
- the program’s real output and exit status.

## Instruction Trace Tutor

The separate tutor is a bounded source-level visualization. It can illustrate common IA-32 registers, arithmetic flags, data movement, integer arithmetic, branches, loops, stack operations, calls, and selected Irvine-style contracts. It does not emit machine code and is not MASM or NASM.

Its displayed EIP values are synthetic teaching positions. Its virtual input/output and procedure helpers are pedagogical models rather than Windows or Linux runtime behavior. A file loading in the tutor is not evidence that an external assembler accepts it.

Open a formative source with **CIS 310: Open Instruction Trace Tutor**. Use **Build and run real code** from that panel when exact behavior is needed.

## Search examples and expected evidence

`LinearSearch.asm`, `BinarySearchIterative.asm`, and `BinarySearchRecursive.asm` are retained in both real-toolchain directories. The NASM/Linux versions are self-checking executables: success requires correct first, middle/final, and absent results. The MASM/Irvine32 versions return the located zero-based index in `EAX` or `-1` when absent and expose it with `DumpRegs`.

The extension can trace the MASM/Irvine versions on any supported VS Code host. Exact MASM assembly/link/run verification still requires Microsoft `ml.exe` and `link.exe` on Windows; the trace tutor is never substituted for that release check.

References:

- Microsoft MASM: <https://learn.microsoft.com/en-us/cpp/assembler/masm/masm?view=msvc-170>
- Official Irvine resources: <https://github.com/surferkip/asmbook>
- NASM documentation: <https://www.nasm.us/doc/>
- Intel architecture manuals: <https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html>
