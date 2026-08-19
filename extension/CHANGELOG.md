# Change Log

## 0.5.0

- Replaced the Docker/NASM container workflow with an original, extension-native IA-32 teaching interpreter that requires no external toolchain or administrator setup.
- Added a side-by-side Assembly Lab with assemble, run, step, reset, registers, flags, stack, declared data, program output, and a recent source trace.
- Added classroom MASM wrappers, common Irvine-style output helpers, a documented NASM-style IA-32 subset, exact source-line diagnostics, and bounded execution.
- Added MASM-style and NASM-style starter programs plus an explicit compatibility guide; the extension does not claim full MASM/NASM or object-file compatibility.
- Added a safe v0.4 lab upgrade that archives the generated container-pilot guide and adds embedded starters without overwriting student `.asm` files.

## 0.4.0

- Bundled all 13 CIS 310 presentations as integrity-checked offline PDFs.
- Removed the runtime dependency on private Google Drive access when opening presentations.
- Preserved the original Drive titles and URLs only as source provenance.

## 0.3.0

- Added a generic **Create a New Digital Circuit** action that works before Digital is installed.
- Added per-assignment blank-circuit buttons with collision-safe filenames and no solution content.
- Split the Course Materials view into Homework and Project Assignments.
- Added the original Portable Assembly Lab pilot (superseded in 0.5.0 by the embedded IA-32 lab).
- Added assembly/circuit path validation, syntax highlighting, starter content, research notes, and automated coverage.

## 0.2.2

- Open the course guide and assignments as rendered Markdown previews instead of showing students the Markdown source.
- Configure generated starter workspaces to render files under `course/` in the Markdown preview by default.
- Make it explicit that Remote SSH is optional and replace the unavailable Digital GUI action with a local-desktop explanation on headless remote hosts.

## 0.2.1

- Added a Remote SSH workspace-host fallback for course materials, starter workspaces, SVG previews, and headless tests.
- Added a clear warning instead of attempting to launch the native Digital editor when a remote Linux host has no graphical display.

## 0.2.0

- Added a Course Materials view with 13 mapped presentation entries and four packaged assignment references from the private Fall 2025 source folder.
- Added cryptographic integrity checks for every packaged assignment.
- Added presentation-to-assignment topic mappings and a student material guide.
- Added the course pack to generated starter workspaces.
- Removed the upstream ALU example from starter workspaces to avoid distributing an assignment-adjacent solution.
- Kept historical policies and deadlines visibly marked for instructor review; current Canvas instructions remain authoritative.

## 0.1.0

- Added managed, checksum-verified Digital v0.31 installation.
- Added Java environment validation.
- Added one-click native Digital launch for `.dig` files.
- Added in-editor SVG circuit preview.
- Added embedded-test execution and VS Code Test Explorer integration.
- Added CIS 310 starter workspace generation.
- Added Workspace Trust, local-storage, and no-shell execution controls.
