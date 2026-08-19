# Product Requirements

## 1. Product statement

SystemStudio AI is a VS Code extension that helps students configure a reproducible systems-development environment, write and test code, design and simulate a focused educational processor, practice prerequisite concepts, receive evidence-grounded hints, and escalate unresolved questions to a human.

## 2. Primary users

- **Student:** completes a CIS 310 or CIS 450 learning activity.
- **Instructor/client:** authors course packs, approves resources and checks, reviews common blockers, and handles escalations.
- **Teaching assistant:** responds to evidence-rich help requests and reviews formative output.
- **Course-pack maintainer:** versions environments, tests, lessons, rubrics, and migration information.

## 3. Goals

1. Reduce avoidable time spent configuring required course tools.
2. Separate environment failures from code or design failures.
3. provide useful formative evidence before later work depends on an incorrect implementation.
4. Scaffold the transition from a concept to an implementation.
5. Offer private, low-stakes practice and progressive hints.
6. Improve the quality and efficiency of student questions sent to instructors or TAs.
7. Preserve human responsibility for course requirements and grading.

## 4. Non-goals

- Silently install privileged host software.
- Replace VS Code, Docker, QEMU/xv6, or a full circuit-design suite.
- Generate complete assignment solutions by default.
- Determine final grades or alter the LMS gradebook.
- Infer motivation, effort, disability, or ability from student behavior.
- Train a model on student submissions without explicit authorization and the required institutional review.
- Guarantee a learning gain or a particular feedback turnaround before evaluation.

## 5. Functional requirements

### Environment and workspace

- **FR-ENV-01:** Detect the host platform, CPU architecture, VS Code version, workspace trust state, and availability of an approved container runtime.
- **FR-ENV-02:** Create or open a versioned Dev Container from an instructor-approved course pack.
- **FR-ENV-03:** Validate required tools by version and by executing a known diagnostic workload.
- **FR-ENV-04:** Distinguish host, container, build, test, and assignment failures in the user interface.
- **FR-ENV-05:** Provide approved remediation guidance or a remote fallback when a host prerequisite is unavailable.
- **FR-ENV-06:** Never execute privileged installation or AI-generated commands without an explicit user action and visible command description.

### Coding and testing

- **FR-CODE-01:** Support editing, building, running, and debugging the reference C and assembly projects in VS Code.
- **FR-CODE-02:** Contribute course commands through native VS Code Tasks or commands.
- **FR-CODE-03:** Discover and display instructor-authored checks in Test Explorer.
- **FR-CODE-04:** Normalize compiler diagnostics, test failures, sanitizer output, and selected runtime traces into the evidence schema.
- **FR-CODE-05:** Link evidence to the relevant file, line, test, concept, and rubric criterion when those links are available.

### Processor design and simulation

- **FR-CPU-01:** Open a versioned text-backed processor-design document in a visual custom editor.
- **FR-CPU-02:** Support the MVP component set: input/output pins, gates, multiplexer, register, program counter, ALU, instruction memory, data memory, control unit, wires, buses, clock, and probe.
- **FR-CPU-03:** Support create, edit, connect, delete, save, undo, redo, and reload operations.
- **FR-CPU-04:** Simulate a 4-bit reference processor deterministically and expose clock-by-clock values and control signals.
- **FR-CPU-05:** Run instructor-authored component and integration checks and identify the earliest observed divergence.
- **FR-CPU-06:** Provide a keyboard-operable component list and structured text representation in addition to the visual canvas.

### Guided practice

- **FR-LEARN-01:** Deliver versioned micro-lessons containing objectives, prerequisites, explanation, worked analogy, diagnostic items, answer explanations, and a small practice task.
- **FR-LEARN-02:** Recommend lessons from explicit readiness-check results or evidence categories.
- **FR-LEARN-03:** Record mastery locally by default and allow students to reset or export it.
- **FR-LEARN-04:** Provide explanations for both correct and incorrect diagnostic responses.
- **FR-LEARN-05:** Avoid ranking students or showing comparative performance to peers.

### Evidence-grounded AI coach

- **FR-AI-01:** Accept only the student question, explicitly selected artifacts, normalized evidence, approved course excerpts, and allowed hint level.
- **FR-AI-02:** Return a structured response with diagnosis, evidence citations, concept, hint, confidence, and escalation decision.
- **FR-AI-03:** Reject responses containing unknown evidence or resource identifiers.
- **FR-AI-04:** Offer three instructor-configurable hint levels: conceptual direction, evidence/location guidance, and an analogous worked example.
- **FR-AI-05:** Avoid full assignment solutions unless explicitly enabled for an instructor-authored demonstration.
- **FR-AI-06:** Provide a deterministic no-AI explanation when a known evidence rule matches.
- **FR-AI-07:** State uncertainty and escalate instead of fabricating a diagnosis.

### Human help

- **FR-HELP-01:** Create a previewable help packet containing the student's question, selected evidence, attempted steps, course-pack version, and relevant environment details.
- **FR-HELP-02:** Require student approval before copying or transmitting the packet.
- **FR-HELP-03:** Allow redaction of code, paths, usernames, hostnames, and other identifiers.
- **FR-HELP-04:** Preserve a local record of what was shared and when.

### Instructor authoring

- **FR-AUTHOR-01:** Validate course packs against a documented schema.
- **FR-AUTHOR-02:** Version objectives, resources, commands, tests, rubrics, lessons, and hint policies together.
- **FR-AUTHOR-03:** Reject unsigned or altered executable course-pack content in production mode.
- **FR-AUTHOR-04:** Provide a preview/test mode using synthetic student artifacts.

## 6. Non-functional requirements

- **NFR-01 Reproducibility:** The same course-pack version and reference artifact must produce the same deterministic evidence on supported platforms.
- **NFR-02 Security:** Executable commands run only in trusted workspaces and constrained environments; secrets never enter logs or model prompts.
- **NFR-03 Privacy:** Local processing is the default. External transmission is minimized, disclosed, and consented to.
- **NFR-04 Accessibility:** Core workflows support keyboard operation, screen readers, sufficient contrast, reduced motion, and text alternatives for visual state.
- **NFR-05 Reliability:** Build, test, and simulation remain usable when the AI service is unavailable.
- **NFR-06 Explainability:** Every technical AI claim presented as diagnosis cites captured evidence or an approved resource.
- **NFR-07 Maintainability:** Course-specific content is stored in course packs, not hard-coded into the extension.
- **NFR-08 Portability:** Support Windows, macOS, and Linux through a common container image or documented remote fallback.
- **NFR-09 Performance:** Common diagnostics and small simulations provide interactive feedback; long-running jobs expose progress and cancellation.
- **NFR-10 Auditability:** Version identifiers for the extension, course pack, test harness, simulator, and AI policy are recorded with each evidence bundle.

## 7. MVP user stories

1. As a CIS 450 student, I can press **Validate Environment** and learn whether Docker, the container, compiler, Make, QEMU, and xv6 are functioning before I begin the lab.
2. As a CIS 450 student, I can run instructor tests and see the first failed check linked to the relevant concept and code location.
3. As a CIS 310 student, I can construct a 4-bit processor, clock it one cycle at a time, and inspect the active data path and signal values.
4. As a student, I can request a limited hint that explains evidence without giving me a complete solution.
5. As a student, I can complete a short prerequisite refresher selected from an observed gap.
6. As a student, I can preview and send a concise, evidence-rich help request to a human.
7. As an instructor, I can change a lesson, test, rubric link, or hint policy without rebuilding the extension.

## 8. MVP acceptance summary

- Clean-environment setup succeeds through one guided workflow after a supported runtime is available.
- One CIS 450 and one CIS 310 reference workflow are complete end to end.
- Seeded faults yield expected evidence and hint paths.
- AI output with invalid citations or low confidence is blocked or escalated.
- The tool remains functional without AI.
- Accessibility, security, privacy, cross-platform, and usability tests are documented.
