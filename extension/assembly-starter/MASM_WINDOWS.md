# Exact MASM Compatibility (Windows Only)

Use this path only when an instructor activity requires Microsoft Macro Assembler syntax or Windows-specific support libraries.

## Why this path is separate

Course examples that use directives such as `.386`, `.model flat,stdcall`, `INVOKE`, `ExitProcess`, or Irvine support libraries target Microsoft MASM and the Windows ABI. NASM does not implement MASM memory models, and a Linux executable does not provide the Windows API. Automatic translation would therefore be unreliable and pedagogically misleading.

## Supported setup

On Windows, install the **Desktop development with C++** workload in Visual Studio or the Visual Studio Build Tools. Microsoft includes `ml.exe` and `ml64.exe` with the C++ tools. Start a matching Developer Command Prompt so the assembler, linker, SDK, and library paths are configured.

- MASM overview: <https://learn.microsoft.com/en-us/cpp/assembler/masm/masm-for-x64-ml64-exe>
- Visual Studio C++ tools: <https://visualstudio.microsoft.com/downloads/>

If an exercise depends on an Irvine library, use the exact instructor-approved library and project instructions. SystemStudio does not redistribute proprietary Microsoft tools, textbook libraries, or copyrighted examples.

Students on macOS or Linux should use a Windows lab machine or approved Windows virtual machine for exact MASM work. For architecture concepts that do not depend on Windows, use the separate Portable Assembly Lab.
