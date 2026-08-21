# Cross-platform integration verification

The `Cross-platform extension integration` GitHub Actions workflow tests SystemStudio as an actual VS Code extension on GitHub-hosted Windows, macOS, and Ubuntu machines. It intentionally separates code-level checks from toolchain and graphical-runtime checks so a green badge has a specific meaning.

## What every operating-system job verifies

- installs the exact dependency lockfile with Node.js 22;
- regenerates and validates the course bundle, type-checks TypeScript, runs the deterministic test suite, and bundles the extension;
- downloads a real VS Code Stable build and activates SystemStudio inside an Extension Development Host;
- verifies critical command registration, `.dig` and `.asm` language routing, the Fall 2026 Canvas setting, and opening the setup, unit-test, FAQ, Copilot-coach, learning, coursework, guided-lab, accessible-lesson, and calendar webviews;
- builds the installable VSIX, audits required contents, and rejects test sources, scripts, internal fixtures, answer-key/solution paths, environment files, and student-data paths; and
- uploads the OS-specific VSIX as a short-lived workflow artifact.

Ubuntu also runs the Extension Host on the declared minimum supported VS Code 1.100.0.

## What the actual-tool jobs verify

The Ubuntu real-tool job installs NASM, GNU binutils, GDB, Java, Xvfb, and x11vnc. It then:

1. assembles, links, and executes all retained NASM programs and the student unit-test template as ELF32;
2. starts a real GDB/MI session and verifies breakpoint, register, flag, stack, memory, disassembly, instruction-step, output, and exit evidence;
3. downloads Digital v0.31 from the upstream release and verifies the pinned archive and JAR SHA-256 values;
4. launches the unmodified Digital Swing application on Xvfb;
5. transports its desktop through x11vnc and the extension's noVNC WebSocket bridge; and
6. requires a browser to connect, send pointer input through noVNC, and produce a nontrivial screenshot artifact.

The Ubuntu container job builds both extension-shipped Docker images. It runs every NASM starter in the course image and requires the Full Digital image to start Java and expose a live RFB desktop.

## Honest hosted-runner boundary

GitHub-hosted Windows and macOS runners validate the actual VS Code extension package and platform-specific host logic, but they do not run Docker Desktop. GitHub's hosted Linux Docker engine validates the same course images used by Docker Desktop. This catches container build and runtime defects, but it does not prove the Docker Desktop graphical application, named-pipe/socket permissions, virtualization policy, or first-start behavior on a student's physical Windows/macOS computer.

Before a course release, retain one manual clean-machine check on current Windows and macOS hardware:

1. start Docker Desktop and wait for its engine;
2. install the VSIX into current desktop VS Code;
3. open a fresh `.dig` in embedded Full Digital, interact, save, close, and reopen;
4. build/run and debug a NASM lab in the course container; and
5. repeat once with Docker Desktop stopped to verify the explanation, retry, setup-guide, and valid native-fallback choices.

If dedicated Windows/macOS self-hosted runners with Docker Desktop are later approved, add them as a separate required job rather than weakening or relabeling the hosted-runner boundary.

## Running the principal checks locally

From `extension/`:

```text
npm ci
npm run check
npm run test:integration:vscode
npm run package
npm run audit:vsix
```

On x86 Linux with NASM, GNU ld, and GDB installed:

```text
npm run smoke:nasm
```

The integration workflow is the authoritative definition of the remaining Digital GUI and container smoke commands.
