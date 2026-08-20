<!-- systemstudio-assembly-guide: 0.12 -->
# CIS 310 Assembly Workspace

SystemStudio keeps real execution and instructional visualization separate.

## Build and execute real code

Use **CIS 310: Build and Run with Real Assembly Toolchain**.

- `real-toolchains/nasm-linux/` contains real ELF32 programs for array summation, linear search, iterative binary search, and recursive binary search. They are assembled by the actual NASM executable, linked by GNU `ld`, and executed as IA-32 machine code. Each search program checks found, absent, and boundary cases and exits nonzero if a check fails. On Debian/Ubuntu Linux, SystemStudio can install the distribution NASM package into private extension storage without administrator access.
- `real-toolchains/masm-irvine/` contains exact Windows/Irvine32 counterparts for arithmetic and all three searches. SystemStudio invokes Microsoft `ml.exe`, Microsoft `link.exe`, and the official `Irvine32.lib`. It discovers Visual Studio C++ tools when possible and can download the author’s pinned, checksum-verified `Irvine.zip` for educational use. It does not redistribute or emulate Microsoft MASM.

Exact MASM/Irvine32 execution is Windows-only. The verified NASM/ELF32 build-and-execute path is x86 Linux. On macOS, use an instructor-provided Linux or Windows environment; this extension does not ship a VM or container. The extension reports unsupported paths as unavailable instead of silently using a different interpreter.

## Visualize instruction effects

Use **CIS 310: Open Instruction Trace Tutor** for the formative files under `irvine32/` and `nasm-ia32/`. The tutor shows predicted source-level changes to registers, flags, memory, stack, input, output, and control flow. Its panel is explicitly labeled **Learning simulator — not an assembler**.

The search walkthroughs open the readable MASM/Irvine source first so students can predict and trace it, then provide explicit buttons for the matching real NASM/Linux or MASM/Windows source. The trace examples are useful for prediction and explanation but are not evidence that source assembled successfully. Use the real-toolchain command whenever compilation, linking, binary output, ABI behavior, or executable behavior matters.

Read [COMPATIBILITY.md](COMPATIBILITY.md) for the exact boundary and [IRVINE32_PROFILE.md](IRVINE32_PROFILE.md) for the Windows setup.
