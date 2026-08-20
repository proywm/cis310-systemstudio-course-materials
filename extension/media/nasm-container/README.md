# NASM course runtime

This image supplies the actual NASM assembler, GNU ELF32 linker, GDB debugger,
and QEMU-i386 execution target used by the SystemStudio NASM Workbench. Student
programs run with networking disabled, all Linux capabilities dropped, a
read-only container root, and only the private build directory mounted writable.

The extension builds this image locally after explicit confirmation. Docker
Desktop is still a prerequisite on Windows and macOS; the extension does not
silently install or license Docker.
