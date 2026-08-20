# NASM/GDB Workbench Design Record

## Student outcome

Fall 2026 has one x86 learning path: NASM 32-bit source, actual ELF32 assembly
and linking, an executable self-check, and actual GDB evidence. The workbench
does not simulate a successful build and does not switch dialects by operating
system.

The required learning loop is:

1. predict a register, flag, stack, memory, or branch result;
2. assemble and link the retained source;
3. run its self-check and read output plus exit status;
4. start GDB and continue to a named `inspect_*` label;
5. compare registers, decoded EFLAGS, stack, memory, and current Intel
   disassembly with the prediction;
6. step one actual machine instruction; and
7. explain the first observed mismatch before requesting a tutor hint.

## Runtime boundary

- x86 Linux uses actual NASM, GNU `ld`, and GDB. Debian/Ubuntu can prepare only
  the NASM package in private extension storage after explicit consent.
- Windows and macOS use the locally built `systemstudio-cis310-nasm:0.20.0`
  course image after Docker Desktop is started. NASM and GNU `ld` create ELF32;
  QEMU-i386 executes it and supplies the remote GDB stub.
- Student runs use `--network none`, `--cap-drop ALL`,
  `no-new-privileges`, a read-only root, a bounded temporary filesystem, and
  only the extension's private build directory as a writable mount.
- The optional Instruction Trace Tutor is source-level conceptual practice. It
  is never shown as NASM, GDB, build evidence, or executable behavior.

## Retained implementation sources

- `src/nativeAssemblyManager.ts`: runtime selection, build, run, and debugger
  launch;
- `src/core/gdbMi.ts`: persistent GDB/MI session and bounded input parsers;
- `src/nasmWorkbenchPanel.ts`: accessible workbench UI;
- `media/nasm-container/`: pinned portable runtime source;
- `assembly-starter/nasm-elf32/`: seven self-checking lab programs;
- `assembly-starter/trace-tutor-examples/`: four optional conceptual examples;
- `src/core/guidedLabs.ts`: predict/build/debug/explain walkthroughs; and
- `scripts/smoke-nasm-workbench.ts`: repeatable release smoke.

## Verification

Run `npm run smoke:nasm` on a host with NASM, GNU `ld`, and GDB. If NASM is in
private storage, set `SYSTEMSTUDIO_NASM_SMOKE_PATH` to that executable. The
smoke assembles, links, and executes all seven programs. It then starts an
actual GDB/MI session for `RegisterArithmetic`, verifies entry-state registers,
stack, memory, and current disassembly, continues to `inspect_after_add`, checks
EAX = 12, steps the `CMP`, checks named flags/source evidence, continues to
normal exit, and verifies the program's `PASS` output.

The container Dockerfile and debugger entrypoint are covered by static release
tests. A Docker-daemon-enabled Windows/macOS/Linux host is required for the
separate portable-runtime integration smoke; this development node does not
grant Docker socket access.

Passing formative programs or the smoke test does not submit work or predict an
instructor score. Canvas remains authoritative.
