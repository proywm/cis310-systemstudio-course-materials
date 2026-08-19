# Portable Assembly Lab

This lab uses NASM syntax, the x86-64 instruction set, and the Linux system-call ABI. Those choices make one deterministic course environment possible across student laptops.

1. Open `hello.asm`.
2. Run **CIS 310: Check Assembly Toolchain**.
3. Run **CIS 310: Build and Run Portable Assembly**.
4. Inspect the terminal-style evidence in the **SystemStudio CIS 310** output channel.
5. Modify the message or add a small computation, then rerun.

The first run may take several minutes because Docker builds the local course image. Apple Silicon runs the pinned `linux/amd64` image through emulation and may be slower.

This is not MASM. NASM syntax, Linux system calls, and the x86-64 System V conventions differ from 32-bit Windows MASM/Irvine examples.
