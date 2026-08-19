# Irvine32 Classroom Profile

Choose **Irvine32 Classroom (MASM)** in the Assembly Lab when a CIS 310 source file follows the 32-bit Visual Studio/Irvine textbook style. **Auto-detect** also selects this profile when it sees directives such as `.386`, `.model`, `PROC`, `INCLUDE Irvine32.inc`, or `INVOKE`.

This profile is an original, source-level teaching environment inside SystemStudio. It is not Microsoft MASM, Visual Studio, Windows, or the Irvine32 binary library. It makes the register-and-procedure exercises portable while preserving an explicit compatibility boundary.

## Student workflow

1. Open `irvine32/AddTwo.asm` or another `.asm` file.
2. Run **CIS 310: Open Embedded Assembly Lab**.
3. Select **Irvine32 Classroom (MASM)** or leave **Auto-detect** selected.
4. For `ReadInt`, `ReadString`, or another input procedure, put the planned input in **Virtual console input**, one response per line.
5. Select **Build**, then **Step** to observe EIP, registers, flags, stack, data, output, and trace. Select **Run** when ready.

The virtual console is reset by **Build** or **Rebuild / Reset**. Repeated runs are deterministic, including `Random32` and `RandomRange`, which is useful for demonstrations and automated checking.

## Recognized Irvine-style procedures and macros

| Group | Supported classroom calls |
|---|---|
| Display | `DumpRegs`, `DumpMem`, `WriteInt`, `WriteDec`, `WriteHex`, `WriteHexB`, `WriteBin`, `WriteBinB`, `WriteChar`, `WriteString`, `Crlf` |
| Input | `ReadInt`, `ReadDec`, `ReadHex`, `ReadChar`, `ReadKey`, `ReadString` |
| String/random | `StrLength` / `Str_length`, `Random32`, `RandomRange`, deterministic `Randomize` |
| Console compatibility | `Clrscr`, `WaitMsg`; `Delay`, `Gotoxy`, and `SetTextColor` are accepted as no-ops because the lab output is not a Windows console |
| Macros | `mWrite`, `mWriteLn`, `mWriteString`, `EXIT`, and `INVOKE ExitProcess,code` |

The implementation follows the register contracts needed by these procedures—for example, `ReadString` uses EDX for the buffer and ECX for its maximum length, and returns the character count in EAX. Invalid `ReadInt` input sets OF; invalid `ReadDec` input sets CF.

## Deliberate limits

SystemStudio does not preprocess the complete MASM macro language, call arbitrary Irvine procedures, create a Windows executable, provide DOS/Windows interrupts, or reproduce Visual Studio's debugger and disassembly window. Displayed EIP values are synthetic teaching addresses, not addresses calculated from encoded instruction sizes. See [COMPATIBILITY.md](COMPATIBILITY.md) for the instruction boundary.

When an assignment assesses exact PE/COFF output, instruction encoding, Windows API linkage, debugger integration, or a source feature outside this profile, use the instructor-approved Windows toolchain instead.
