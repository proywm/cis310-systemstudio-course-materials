<!-- systemstudio-assembly-compatibility: 0.20 -->
# Actual NASM, GDB, and Trace-Practice Boundary

## Actual NASM workbench

SystemStudio invokes the actual NASM assembler, produces an ELF32 object with
DWARF information, links it with GNU `ld`, and runs or debugs the resulting
IA-32 machine code. The integrated workbench uses an actual persistent GDB
session for instruction stepping, breakpoints, registers, EFLAGS, stack,
memory, source location, and Intel-syntax disassembly.

The portable course environment contains NASM, GNU `ld`, GDB, and QEMU-i386.
It is locally built from a digest-pinned Debian base. Windows and macOS still
require Docker Desktop; the extension does not silently install Docker.

Use actual execution for claims about accepted syntax, emitted object files,
instruction encoding, addresses, Linux IA-32 system calls, output, or exit
status. A successful local formative check is not a Canvas submission or an
instructor/GSI grade.

## Optional Instruction Trace Tutor

The separate tutor is a bounded source-level visualization for prediction and
explanation. It does not emit machine code. Its teaching addresses and virtual
procedures are not operating-system behavior. Loading a file there is never
reported as evidence that NASM accepts or executes it.

## Two different processors

NASM programs target IA-32 x86. They do not execute on the course processor.
The cumulative Digital project has a 4-bit datapath and 8-bit instructional
words. Its instructional ISA, memory format, and tests remain separate.

Primary references:

- Paul A. Carter, *PC Assembly Language*: <https://pacman128.github.io/pcasm/>
- NASM documentation: <https://www.nasm.us/doc/>
- GDB documentation: <https://sourceware.org/gdb/current/onlinedocs/gdb.html/>
- Intel architecture manuals: <https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html>
