# Assembly Search Validation

This record distinguishes executed evidence from platform-specific release gates for the retained formative search designs.

## Retained sources

- `extension/assembly-starter/real-toolchains/nasm-linux/LinearSearch.asm`
- `extension/assembly-starter/real-toolchains/nasm-linux/BinarySearchIterative.asm`
- `extension/assembly-starter/real-toolchains/nasm-linux/BinarySearchRecursive.asm`
- Matching Irvine32/MASM sources under `extension/assembly-starter/real-toolchains/masm-irvine/`

The examples are formative. They do not define or solve a current Canvas assignment.

## Executed Linux evidence

On 2026-08-20, all three NASM sources were assembled with NASM 2.15.05 as ELF32 objects, linked with GNU `ld -m elf_i386`, and executed on the course-development Linux host. Each executable returned status 0 and printed its expected `PASS` line. The built files were identified as statically linked 32-bit Intel 80386 ELF executables.

Each program runs multiple internal assertions:

- linear search: first, middle, final, and absent targets;
- iterative binary search: first, interior, final, and absent targets; and
- recursive binary search: first, interior, final, and absent targets.

## MASM/Irvine32 evidence and boundary

The extension’s bounded instruction-trace model executed the three MASM/Irvine32 sources and returned the expected default indices: 3 for linear search and 4 for both binary-search forms. Automated variants also passed first, final, and absent targets for all three sources.

This trace evidence is not proof that Microsoft MASM accepts or runs the files. Exact MASM/Irvine32 assembly, linking, and execution require a clean Windows host with Microsoft `ml.exe`, Microsoft `link.exe`, and the official Irvine32 library. That Windows run remains a platform-specific release gate; LLVM assemblers and the trace tutor are not accepted as substitutes.

## Student-facing evidence boundary

The Hands-on Lab Center labels tracing as visualization and offers a separate real-toolchain action. Its tutor prompt asks for the learner’s prediction and earliest mismatch, supplies one diagnostic hint at a time, and prohibits writing or completing a graded program.
