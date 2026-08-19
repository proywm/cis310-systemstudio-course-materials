# Embedded Assembly Compatibility Guide

The SystemStudio lab is a source-level educational IA-32 interpreter. It is designed for CIS 310 register, memory, arithmetic, control-flow, stack, procedure, and processor-observation activities—not as a general binary toolchain.

## Runs inside the extension

- 32-bit general registers: EAX, EBX, ECX, EDX, ESI, EDI, EBP, ESP, EIP; 16-bit and 8-bit aliases are supported.
- CF, PF, ZF, SF, and OF observation.
- Data declarations: MASM `BYTE`/`WORD`/`DWORD` and NASM `db`/`dw`/`dd`, strings, `?`, `DUP`, `EQU`, and little-endian memory.
- Register/data movement, integer arithmetic, logic, shifts, comparison, conditional/unconditional branches, loops, stack operations, `CALL`/`RET`, `LEAVE`, multiplication, and division.
- Common MASM teaching wrappers: `.386`, `.model flat,stdcall`, `.stack`, `.data`, `.code`, `PROC`/`ENDP`, `END`, `INCLUDE`, `INVOKE ExitProcess`, and `EXIT`.
- Embedded classroom output helpers: `DumpRegs`, `WriteInt`, `WriteDec`, `WriteHex`, `WriteChar`, `WriteString`, and `Crlf`.
- Common NASM IA-32 wrappers: `bits 32`, `section .data`, `section .text`, `global`, `extern`, bracketed memory operands, and `rel` address expressions.

Open a `.asm` file and choose **CIS 310: Open Embedded Assembly Lab**. Diagnostics appear on the exact source line. The lab executes no native student code and starts no external process.

## Deliberate boundary

The embedded lab does **not**:

- invoke or bundle Microsoft `ml.exe`/`ml64.exe`, NASM, a linker, Visual Studio, Docker, or a VM;
- generate machine-code bytes, PE/COFF/ELF object files, executables, or debugger symbols;
- implement a complete MASM macro/preprocessor language or every NASM directive;
- provide Windows APIs, Linux system calls, arbitrary Irvine binaries, C libraries, or host filesystem/network access;
- model instruction timing, byte-accurate encoded instruction lengths, privilege levels, x87, MMX, SSE/AVX, or all processor exceptions.

EIP is displayed using synthetic four-byte-spaced teaching addresses so students can observe control flow. It is not the byte address that a production assembler would calculate from actual instruction encodings.

## When exact toolchain compatibility is required

Use the instructor-approved native environment when an activity requires exact binary output, ABI behavior, OS calls, external object libraries, Visual Studio project files, or syntax outside the documented subset. Microsoft documents MASM as part of the Visual C++ toolset; NASM separately documents its syntax and output formats.

- Microsoft MASM overview: <https://learn.microsoft.com/en-us/cpp/assembler/masm/masm?view=msvc-170>
- Intel 64 and IA-32 Software Developer Manuals: <https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html>
- NASM language documentation: <https://www.nasm.us/doc/nasm03.html>

Do not assume a file accepted here will assemble unchanged with every external MASM/NASM version, or that every externally valid file belongs to the embedded subset.
