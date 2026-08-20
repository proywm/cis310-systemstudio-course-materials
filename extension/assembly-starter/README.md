<!-- systemstudio-assembly-guide: 0.11 -->
# CIS 310 Assembly Workspace

SystemStudio keeps real execution and instructional visualization separate.

## Build and execute real code

Use **CIS 310: Build and Run with Real Assembly Toolchain**.

- `real-toolchains/nasm-linux/LoopSum.asm` is assembled by the actual NASM executable, linked by GNU `ld` as ELF32, and executed as IA-32 machine code. On Debian/Ubuntu Linux, SystemStudio can install the distribution NASM package into private extension storage without administrator access.
- `real-toolchains/masm-irvine/AddTwo.asm` is the exact Windows path. SystemStudio invokes Microsoft `ml.exe`, Microsoft `link.exe`, and the official `Irvine32.lib`. It discovers Visual Studio C++ tools when possible and can download the author’s pinned, checksum-verified `Irvine.zip` for educational use. It does not redistribute or emulate Microsoft MASM.

Exact MASM/Irvine32 execution is Windows-only. The verified NASM/ELF32 build-and-execute path is x86 Linux. On macOS, use an instructor-provided Linux or Windows environment; this extension does not ship a VM or container. The extension reports unsupported paths as unavailable instead of silently using a different interpreter.

## Visualize instruction effects

Use **CIS 310: Open Instruction Trace Tutor** for the formative files under `irvine32/` and `nasm-ia32/`. The tutor shows predicted source-level changes to registers, flags, memory, stack, input, output, and control flow. Its panel is explicitly labeled **Learning simulator — not an assembler**.

The trace examples are useful for prediction and explanation but are not evidence that source assembled successfully. Use the real-toolchain command whenever compilation, linking, binary output, ABI behavior, or executable behavior matters.

Read [COMPATIBILITY.md](COMPATIBILITY.md) for the exact boundary and [IRVINE32_PROFILE.md](IRVINE32_PROFILE.md) for the Windows setup.
