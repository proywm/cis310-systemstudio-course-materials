# Architecture Decision Log

## ADR-001: One student-facing extension, multiple internal services

**Status:** Proposed

**Decision:** Present one VS Code extension while separating provisioning, execution, simulation, evidence, learning content, AI, and escalation behind explicit interfaces.

**Rationale:** A one-stop experience reduces context switching, while internal separation supports testing and prevents AI from becoming the authority for execution or course requirements.

## ADR-002: Provision tools in a Dev Container

**Status:** Proposed

**Decision:** Install course toolchains and libraries in a versioned Dev Container or approved remote equivalent. Detect missing host prerequisites and guide the student; do not silently install privileged host software.

**Rationale:** Reproducibility and cross-platform consistency are stronger when the toolchain is isolated from the host.

## ADR-003: Use a JSON-backed custom text editor for processor design

**Status:** Proposed

**Decision:** Store designs in a human-readable JSON format and use a VS Code custom text editor/webview as the visual projection.

**Rationale:** The design remains versionable and recoverable, while VS Code can retain standard save/undo/source-control behavior.

## ADR-004: Evidence before AI

**Status:** Proposed

**Decision:** Run deterministic environment checks, tests, and simulation first. Apply known feedback rules second. Consult AI only for bounded explanation and hint generation.

**Rationale:** Students need trustworthy diagnostic evidence. Deterministic sources are cheaper, testable, and less likely to fabricate behavior.

## ADR-005: No AI grading or automatic full solutions

**Status:** Proposed

**Decision:** Keep grading outside the system. Use instructor-configurable progressive hints and analogous examples, with human escalation for uncertainty.

**Rationale:** This protects instructor authority, academic integrity, and student trust.

## ADR-006: Local-first data handling

**Status:** Proposed

**Decision:** Store evidence, mastery, and help-packet drafts locally by default. Transmit only selected and redacted context through an approved endpoint after disclosure and consent.

**Rationale:** Data minimization reduces privacy risk and supports operation without a cloud service.

## ADR-007: Two workflows define MVP scope

**Status:** Proposed

**Decision:** Complete one CIS 450 C/xv6 workflow and one CIS 310 4-bit processor workflow before adding courses, dashboards, wider processors, HDL features, or LMS integration.

**Rationale:** The full vision is larger than one senior-design cycle. Two end-to-end workflows are substantial, testable, and directly grounded in the evaluation findings.

## ADR-008: Separate learning, perception, behavior, quality, and workload measures

**Status:** Proposed

**Decision:** Use parallel scored assignments for learning, questionnaires for student perceptions, telemetry for behavior/timing, blinded expert review for technical quality/safety, a scenario task for trust calibration, and active-minute staff logs for human workload.

**Rationale:** Satisfaction or self-reported confidence cannot establish learning, accuracy, timeliness, safety, or reduced workload. Distinct measures keep each claim tied to evidence that can support it.

## ADR-009: Ship a managed Digital adapter for the semester-start CIS 310 pilot

**Status:** Accepted for pilot; implemented August 2026

**Decision:** Provide a small VS Code extension that installs a pinned, checksum-verified Digital v0.31 release into extension global storage, integrates SVG previews and embedded testcase execution inside VS Code, and opens the native Digital editor for full circuit editing. Require Java as a visible prerequisite and do not enable Digital's remote TCP server.

**Rationale:** The pilot immediately removes the separate Digital download/configuration step and provides one discoverable workflow without delaying for a complete circuit-editor reimplementation. Java Swing cannot be embedded as a native VS Code editor, so the companion window is an explicit, documented boundary. The senior-design team can continue the custom editor, guided learning, AI, accessibility, and evaluation work in parallel.

## ADR-010: Integrate a review-gated course-material reference pack

**Status:** Accepted for pilot; implemented August 2026

**Decision:** Package readable assignment references and a lecture-to-assignment map in the extension, embed all 13 presentation PDFs for offline viewing, verify local material hashes at activation, and label the Fall 2026 workspace's imported Fall 2025 references as requiring instructor review. Keep the exact Fall 2026 Canvas course authoritative. Exclude exams, grades, student records, hidden tests, and completed assignment-adjacent circuits.

**Rationale:** Students need one discoverable path from concepts to the relevant task, but archived content and private links must not be represented as a ready Fall 2026 release. Removing Digital's completed ALU example avoids giving away a design that closely overlaps the register-file/ALU project while retaining a small half-adder example for simulator orientation.

## ADR-011: Separate portable assembly from exact MASM compatibility

**Status:** Superseded by ADR-012 after the initial pilot; August 2026

**Decision:** Provide an original NASM x86-64 Linux lab in a pinned `linux/amd64` container as the common Windows/Linux/macOS path. Detect Docker, request consent before building the local image, and constrain student execution with no network, dropped capabilities, bounded memory/CPU/processes, and Workspace Trust. Keep exact Microsoft MASM/Irvine work as a separately labeled Windows-only path; do not auto-translate between dialects or redistribute proprietary tools and course examples.

**Rationale:** The reviewed CIS 310 materials use 32-bit Windows MASM conventions, which are not portable to macOS or Linux. NASM supports the major host object formats, but it does not implement MASM memory models and a Linux runtime does not provide the Windows API. One containerized NASM/ELF environment gives students consistent build behavior without misrepresenting it as MASM. Apple Silicon can run the selected x86-64 container through platform emulation, with a documented performance cost.

## ADR-012: Embed a source-level IA-32 teaching engine

**Status:** Accepted and implemented August 2026

**Decision:** Replace the Docker/NASM execution path with an original TypeScript IA-32 teaching interpreter bundled in the extension. Support the documented course subset of register, memory, integer, flags, branch, loop, stack, and procedure behaviors; recognize common MASM/Irvine classroom wrappers and a NASM-style IA-32 form; provide assemble/run/step/reset and visible machine state. Use a fixed 1 MiB memory model, line-numbered diagnostics, bounded output, and a 10,000-instruction run limit. Do not invoke a shell or host toolchain. Label the interface as a teaching subset and keep exact object-file, ABI, API, macro, and unsupported-instruction work outside the claim.

**Rationale:** The course emphasizes IA-32 registers, EFLAGS, memory, stack, and execution observation, while the container pilot introduced a Docker prerequisite and changed the examples to x86-64 Linux. A source-level model removes the cross-platform installation barrier and more directly targets the shared learning concepts. It cannot replace production MASM/NASM, so that boundary is visible in the lab and compatibility guide.

## ADR-013: Add a clean-room Irvine32 Classroom profile; keep Docker optional and out of the default

**Status:** Accepted and implemented August 2026

**Decision:** Provide explicit Irvine32 Classroom (MASM), NASM IA-32, and auto-detect choices on the embedded engine. Extend the Irvine32 profile with selected console input/output, display, string, random, and macro behaviors used in introductory exercises. Take all input through an in-memory virtual console and keep execution deterministic and process-free. Do not bundle Visual Studio, Microsoft assemblers, Irvine binaries/examples, or a Docker image. Treat any future exact-binary/container backend as a separately approved optional mode, not as an automatic fallback selected from the student's operating system.

**Rationale:** Students need a recognizable path from the book's Visual Studio/Irvine syntax to observable registers and flags, but Windows-native installation is not a common denominator for macOS and Linux. Docker does not eliminate prerequisites and a Linux container cannot reproduce Win32 library/API behavior. A clean-room profile preserves the relevant learning workflow on every extension host while making the compatibility and redistribution boundaries explicit.

## ADR-014: Use a local evidence-and-routing helper before a generative coach

**Status:** Accepted and implemented August 2026

**Decision:** Add an extension-local conversational helper for topic routing, tool diagnosis, Canvas/submission redirection, and structured expected/observed/evidence/attempt prompts. Keep replies deterministic and disclose that it neither calls an external AI service nor knows current deadlines, grades work, or submits coursework. Route every deadline or submission question to the configured Fall 2026 Canvas course.

**Rationale:** Student evaluations identify timely explanation, setup uncertainty, concept-to-implementation gaps, and lower-friction help-seeking as immediate needs. A bounded local helper addresses navigation and evidence collection without fabricating dates, transmitting student data, or claiming the reliability of an unevaluated AI coach. Generative coaching remains a separately evaluated senior-design workstream.
