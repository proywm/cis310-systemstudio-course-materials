# Embedded Assembly Compatibility Guide

The SystemStudio lab is a source-level educational IA-32 interpreter. It is designed for CIS 310 register, memory, arithmetic, control-flow, stack, procedure, and processor-observation activities—not as a general binary toolchain.

## Runs inside the extension

- 32-bit general registers: EAX, EBX, ECX, EDX, ESI, EDI, EBP, ESP, EIP; 16-bit and 8-bit aliases are supported.
- CF, PF, ZF, SF, and OF observation.
- Data declarations: MASM `BYTE`/`WORD`/`DWORD` and NASM `db`/`dw`/`dd`, strings, `?`, `DUP`, `EQU`, and little-endian memory.
- Register/data movement, integer arithmetic, logic, shifts, comparison, conditional/unconditional branches, loops, stack operations, `CALL`/`RET`, `LEAVE`, multiplication, and division.
- Common MASM teaching wrappers: `.386`, `.model flat,stdcall`, `.stack`, `.data`, `.code`, `PROC`/`ENDP`, `END`, `INCLUDE`, `INVOKE ExitProcess`, and `EXIT`.
- Irvine-style display helpers: `DumpRegs`, `DumpMem`, `WriteInt`, `WriteDec`, `WriteHex`, `WriteHexB`, `WriteBin`, `WriteBinB`, `WriteChar`, `WriteString`, and `Crlf`.
- Irvine-style virtual-console input: `ReadInt`, `ReadDec`, `ReadHex`, `ReadChar`, `ReadKey`, and `ReadString`; input is provided in the lab rather than read from the host terminal.
- Selected classroom helpers and macros: `StrLength`, deterministic `Random32`/`RandomRange`/`Randomize`, `mWrite`, `mWriteLn`, and `mWriteString`. Console-position/color/timing calls are documented no-ops.
- Common NASM IA-32 wrappers: `bits 32`, `section .data`, `section .text`, `global`, `extern`, bracketed memory operands, and `rel` address expressions.

Open a `.asm` file and choose **CIS 310: Open Embedded Assembly Lab**. Use **Irvine32 Classroom (MASM)** for the book-style workflow, **NASM IA-32** for NASM syntax, or **Auto-detect**. Diagnostics appear on the exact source line. The lab executes no native student code and starts no external process.

## Deliberate boundary

The embedded lab does **not**:

- invoke or bundle Microsoft `ml.exe`/`ml64.exe`, NASM, a linker, Visual Studio, Docker, or a VM;
- generate machine-code bytes, PE/COFF/ELF object files, executables, or debugger symbols;
- implement a complete MASM macro/preprocessor language or every NASM directive;
- provide Windows APIs, Linux system calls, arbitrary Irvine procedures or binaries, C libraries, or host filesystem/network access;
- model instruction timing, byte-accurate encoded instruction lengths, privilege levels, x87, MMX, SSE/AVX, or all processor exceptions.

EIP is displayed using synthetic four-byte-spaced teaching addresses so students can observe control flow. It is not the byte address that a production assembler would calculate from actual instruction encodings.

## When exact toolchain compatibility is required

Use the instructor-approved native environment when an activity requires exact binary output, ABI behavior, OS calls, external object libraries, Visual Studio project files, or syntax outside the documented subset. Microsoft documents MASM as part of the Visual C++ toolset; NASM separately documents its syntax and output formats.

- Microsoft MASM overview: <https://learn.microsoft.com/en-us/cpp/assembler/masm/masm?view=msvc-170>
- Intel 64 and IA-32 Software Developer Manuals: <https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html>
- NASM language documentation: <https://www.nasm.us/doc/nasm03.html>

Do not assume a file accepted here will assemble unchanged with every external MASM/NASM version, or that every externally valid file belongs to the embedded subset.

SystemStudio's Irvine32 profile is a clean-room teaching implementation. It does not copy or redistribute the Irvine library, Microsoft assembler, Visual C++ toolchain, or textbook example collection.
