<!-- systemstudio-assembly-compatibility: 0.11 -->
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

References:

- Microsoft MASM: <https://learn.microsoft.com/en-us/cpp/assembler/masm/masm?view=msvc-170>
- Official Irvine resources: <https://github.com/surferkip/asmbook>
- NASM documentation: <https://www.nasm.us/doc/>
- Intel architecture manuals: <https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html>
