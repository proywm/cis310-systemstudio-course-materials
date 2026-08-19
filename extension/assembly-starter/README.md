# CIS 310 Assembly Paths

SystemStudio provides two deliberately separate paths because portable NASM and Microsoft MASM are not source-compatible.

## Recommended: Portable Assembly Lab

Open `portable/hello.asm`, then run **CIS 310: Build and Run Portable Assembly**. The extension builds and executes it in the same isolated NASM x86-64 Linux environment on Windows, Linux, Intel Mac, and Apple Silicon.

Prerequisite: Docker Desktop or Docker Engine must be installed and running. The extension asks before it builds the course toolchain image; it does not silently install Docker or change administrator settings.

The generated object file and executable appear under the workspace `build/` directory. Do not submit generated build artifacts unless the instructor requests them.

## Optional: exact MASM compatibility

If an activity explicitly uses `.386`, `.model flat,stdcall`, `INVOKE`, Irvine libraries, or Microsoft `ml.exe`, use the [Windows MASM guide](MASM_WINDOWS.md). That syntax and runtime are Windows-specific and are not automatically translated by SystemStudio.
