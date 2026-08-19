# CIS 310 Assembly Toolchain Decision

## Question

Can one extension provide an assembly workflow that is easy to run on the Windows, Linux, and macOS laptops students bring while remaining faithful to CIS 310's existing MASM material?

## Course-material finding

The private course archive was reviewed only to identify the required dialect. Its examples use 32-bit Microsoft/Irvine conventions including `.386`, `.model flat,stdcall`, `INVOKE`, Windows process APIs, and the EAX/EBP/ESP register model. No exam, quiz, answer, copyrighted slide content, student record, or proprietary support library was copied into the repository.

That dialect cannot be promised as one native toolchain on all three host operating systems:

- Microsoft's MASM tools are installed with the Visual Studio C++ workload and target the Microsoft toolchain and Windows environment.
- NASM has different syntax and explicitly does not implement MASM memory models.
- Even when instructions are mechanically similar, Windows APIs/calling conventions and Linux system calls/System V conventions are different program interfaces.

## Selected common ground

SystemStudio therefore exposes two clearly named paths:

1. **Portable Assembly Lab:** original NASM syntax, x86-64 instructions, ELF64 objects, and the Linux system-call ABI inside a `linux/amd64` container.
2. **Exact MASM compatibility:** Microsoft MASM and instructor-approved Irvine dependencies on Windows only.

The portable image uses a digest-pinned Debian Bookworm Slim base and installs NASM, binutils, Make, and GDB from Debian repositories at build time. The base is pinned; the package repository snapshot is not, so the image definition is controlled but is not claimed to be bit-for-bit reproducible indefinitely. Windows and macOS use Docker Desktop; Linux can use Docker Engine. Apple Silicon runs the x86-64 image through emulation and may be slower.

The extension does not silently install Docker. It detects whether the Docker server is accessible, explains the prerequisite, and asks before downloading/building the course image. Student code runs only in a trusted workspace with networking disabled, all Linux capabilities dropped, `no-new-privileges`, a read-only container root, a read-only workspace mount except for `build/`, and CPU, memory, and process limits. On Linux, the container uses the invoking student's UID/GID so generated files are not owned by root. The selected `.asm` file must reside inside the open workspace.

## Implemented pilot workflow

- create `assembly/portable/hello.asm` and student-readable guides;
- edit `.asm` with bundled NASM syntax highlighting and comment/bracket behavior;
- check Docker and local course-image status from the SystemStudio view;
- build the image once after explicit confirmation;
- assemble with NASM, link with GNU `ld`, execute, and show evidence in the SystemStudio output channel; and
- retain generated object/executable files under workspace `build/` for inspection.

## Validation boundary

Automated tests cover workspace path containment, manifest metadata, circuit templates, process bounds, and extension compilation. A live Docker smoke test on the current development host was blocked because the account cannot access `/var/run/docker.sock`; the CLI is present but the socket is owned by `root:docker`. Therefore Windows, Intel macOS, Apple Silicon macOS, and a Docker-enabled Linux account remain required release/pilot checks. Cross-platform support is an architectural expectation based on the container platform, not yet classroom evidence.

## Primary sources

- [Microsoft Macro Assembler documentation](https://learn.microsoft.com/en-us/cpp/assembler/masm/masm?view=msvc-170)
- [Microsoft `ml64.exe` reference](https://learn.microsoft.com/en-us/cpp/assembler/masm/masm-for-x64-ml64-exe?view=msvc-170)
- [NASM introduction and supported object formats](https://www.nasm.us/doc/nasm01.html)
- [NASM official project site](https://www.nasm.us/)
- [VS Code Dev Containers across Windows, macOS, and Linux](https://code.visualstudio.com/docs/devcontainers/containers)
- [Docker installation guidance](https://docs.docker.com/get-started/get-docker/)
