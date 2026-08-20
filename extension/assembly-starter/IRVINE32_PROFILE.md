<!-- systemstudio-irvine-guide: 0.11 -->
# Exact Microsoft MASM and Irvine32 Setup

The exact course toolchain requires Windows, Microsoft’s 32-bit `ml.exe`, Microsoft `link.exe`, and Kip Irvine’s official 32-bit library. SystemStudio does not call any other engine “MASM.”

## Recommended setup

1. Install a licensed Visual Studio edition or Build Tools configuration containing **Desktop development with C++** and the x86/x64 C++ tools.
2. Open `real-toolchains/masm-irvine/AddTwo.asm`.
3. Run **CIS 310: Build and Run with Real Assembly Toolchain**.
4. SystemStudio searches the active `PATH` and Visual Studio Installer metadata for the x86-hosted `ml.exe` and `link.exe`.
5. If `C:\Irvine` is absent, SystemStudio can download the official `Irvine.zip` educational resources from the author’s pinned GitHub commit. The archive is checksum verified and extracted into private extension storage.

Override discovery only when necessary with these settings:

- `systemstudioCis310.masmPath`
- `systemstudioCis310.masmLinkerPath`
- `systemstudioCis310.irvineRoot`

The configured Irvine directory must contain `Irvine32.inc`, `Irvine32.lib`, `Kernel32.lib`, and `User32.lib`.

## Non-Windows systems

Microsoft MASM and Irvine32 target the Windows toolchain. SystemStudio reports the exact path as unavailable on Linux and macOS. Use the actual NASM/ELF32 example on an x86 Linux host, or an instructor-approved Windows machine/VM for assignments requiring Irvine32. The Instruction Trace Tutor remains available for prediction practice, but it is not used as an assembler substitute.
