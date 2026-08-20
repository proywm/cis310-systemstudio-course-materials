# Change Log

## 0.10.6

- Added an original embedded circuit workbench that builds and simulates the supported CIS 310 one-bit component set entirely inside desktop or Remote SSH VS Code.
- Added inputs, outputs, AND/OR/XOR/NOT, a manual clock, one-bit D flip-flops, port-to-port wiring, drag/nudge layout, live values, accessible component navigation, undo/redo, and Digital-compatible `.dig` saves.
- Made the embedded workbench the default for fresh guided and assignment circuits while retaining Digital v0.31 for official preview/testcases and advanced components.
- Added fail-closed handling for unsupported `.dig` features so an advanced circuit is never silently simplified or overwritten.
- Updated the half-adder, selector, decoder, state, and ALU-slice walkthroughs, FAQ, tutorial, student guide, syllabus, and automated round-trip/simulation tests.

## 0.10.5

- Added a self-paced Hands-on Lab Center mapped to the same reading, author video, and lecture sources as readiness practice.
- Added six prediction-first Digital circuit builds: a Boolean path, half adder, 2-to-1 selector, stored state bit, address decoder, and small arithmetic/logic selector.
- Added five guided embedded-assembly traces for register arithmetic, flags/branching, array loops, stack frames, and virtual console input.
- Added fresh non-overwriting guided-circuit creation, lecture-linked lab launch buttons, local checklist progress, and explicit formative-versus-graded boundaries.
- Extended the guided tutorial, Learning dashboard, sidebar, FAQ, syllabus, student guide, and tests around the new build-and-trace workflow.

## 0.10.4

- Added an attempt-first learning-coach checkpoint before SystemStudio opens the external U-M Maizey tutor.
- Added distinct tutor behavior for ungraded readiness practice and potentially graded homework, projects, quizzes, exams, and reports.
- Strengthened the instructor Maizey prompt against direct-answer requests, deliverable reconstruction over multiple turns, and role-change/prompt-injection attempts.
- Added deterministic local-FAQ interception for obvious requests to solve an assignment, write submission code, build a completed circuit, or provide an answer key.
- Documented both the allowed help patterns and the honest limitation that SystemStudio cannot control another AI website or guarantee external-model compliance.

## 0.10.3

- Rebuilt the guided tutorial as a visible eight-lesson self-paced path with free lesson selection, skipping, resume, and rerun controls.
- Required three distinct readiness questions before a preparation module is checked; repeated answers no longer complete the module.
- Distinguished readiness sources from additional references and made each mapped source focus visible instead of implying an exact PDF page or video timestamp.
- Replaced the one partially inferred I/O item with the directly supported timer-status polling example and narrowed module focus statements to verified source coverage.
- Added a completed-path dashboard state, safer partial-session exit, and screen-transition focus handling based on an independent blind-student review.

## 0.10.2

- Verified every lecture-readiness prompt and all 43 practice questions against exact Tarnoff open-book sections and actual author-video content.
- Added explicit reading/video source maps with automated bounds and completeness tests, and made feedback open the supporting source mapped to each question.
- Corrected the hexadecimal, adder, I/O, CPU, pipeline, and assembly source assignments; replaced questions that went beyond the assigned materials.
- Expanded the preparation path to show every targeted author video and added a maintainable content-alignment audit.

## 0.10.1

- Rebuilt the Fall 2026 syllabus in the current UM-Dearborn component order with verified section, meeting, office, grading, policy, calendar, and final-examination information.
- Added the inherited assessment weights, letter-grade scale, participation and late-work rules, team limits, program goals, Food Pantry information, university-policy routing, and copyright guidance.
- Removed named commercial-platform comparisons from course and design documentation while retaining the course-specific learning rationale.

## 0.10.0

- Added a keyboard-accessible collapsible chat-style help entry to the Learning Center and redesigned the Help Center around three explicit paths: local FAQ, U-M Maizey, and Questions Before Class.
- Added a U-M Maizey course-tutor handoff that uses students' U-M/Canvas authentication and does not embed a faculty LLM key in the extension.
- Added a structured pre-class question composer with lecture topic, current understanding, point of confusion, prior attempt/evidence, and named or Canvas-enabled anonymous intent.
- Kept Canvas in control of identity and posting: SystemStudio copies the draft and opens the configured discussion; it does not claim anonymity or store a Canvas token.
- Expanded the local FAQ from aggregate prior CIS 310 concerns, including hidden Canvas items, submission confirmation/file types, multiple Digital files, nested clock analysis errors, and escalation when stuck.
- Added an instructor-ready Maizey system prompt with source citations, one-hint-at-a-time tutoring, prediction/check-for-understanding, graded-work boundaries, uncertainty disclosure, and human escalation.
- Documented U-M AI access, privacy/cost boundaries, learning evidence, Canvas OAuth/LTI requirements, and instructor release steps.

## 0.9.0

- Reorganized the activity bar around one expanded **Start Here** path to reduce scanning and choice overload.
- Added a 13-module **Read → Watch → Try 3 questions** pre-class path that maps every lecture resource to focused sections of David Tarnoff's required open text and an official author video.
- Added self-reported local reading/video checkmarks, a next-incomplete preparation recommendation, lecture-specific readiness prompts, and direct book/video/lecture review links after practice feedback.
- Updated the Fall 2026 syllabus and student guide with the required texts and complete lecture-to-book/video map; authoritative sources open directly and no Google Drive is used.
- Added a local Learning Center with five-question recommended sessions, topic practice, 10-question quiz mode, immediate or delayed feedback, hints, explanations, and mapped packaged lessons.
- Added 43 author-written questions covering six course-topic groups, with at least three questions for every presentation resource.
- Added confidence checks, correct-but-uncertain and confident-miss feedback, saved questions, optional error reflection, and transparent spaced review.
- Added a local progress dashboard for coverage, practice accuracy, due items, practice days, and confidence calibration without grade prediction, mastery claims, ranking, telemetry, or instructor reporting.
- Connected practice to **Start Here**, Lessons and Assignments, the guided tutorial, and the local Student Helper.
- Documented the research basis, student-evaluation response, cognitive-load decisions, privacy boundary, and classroom-review requirements in `LEARNING_DESIGN.md`.

## 0.8.1

- Reframed the repository and extension as active Fall 2026 student course materials.
- Removed project-planning and research-only language from the student workflow.
- Replaced external source links with local course-repository or Canvas links.
- Marked the course pack as a student release while keeping Canvas authoritative for live section details and submission.

## 0.8.0

- Added a packaged four-page Fall 2026 syllabus PDF with current catalog information, learning outcomes, course technology, assessment placeholders, policy links, and an instructor-finalization checklist.
- Added a visual Fall 2026 course calendar for all 27 Monday/Wednesday meetings from August 26 through December 7, excluding Labor Day and Thanksgiving recess.
- Added official term milestones for study days and examination windows without inventing the CIS 310 final-exam slot.
- Added `.ics` export with an all-day default that does not guess the class time and an optional timed mode requiring the confirmed Canvas start time and duration.
- Connected the syllabus and calendar to the grouped sidebar, Course Materials view, guided tutorial, Command Palette, and local Student Helper.
- Kept the syllabus and presentation workflow fully local to the extension; no external document-hosting account is required.

## 0.7.0

- Reorganized the setup/tool tree into five student-centered groups instead of one flat command list.
- Added a first-run, skippable, resumable, and rerunnable tutorial grounded in recurring student concerns and an accompanying native Getting Started walkthrough.
- Added a local Student Helper for course-topic routing, tool diagnosis, Canvas/deadline redirection, and evidence-based help-request preparation; no conversation is sent to an external AI service.
- Set the delivery workspace to Fall 2026 and added the exact Canvas course 552144 link as the authoritative requirements and submission destination.
- Added Homework 2 and Homework 3 references from the instructor source folder, bringing the course pack to three homework and three project references.
- Kept all 13 presentation PDFs embedded and checksum-verified in the extension so presentation viewing does not depend on external document hosting.
- Removed archived dates and collaboration claims from student-facing assignment references in favor of explicit Fall 2026 Canvas verification and submission instructions.

## 0.6.0

- Added an explicit Irvine32 Classroom profile alongside NASM IA-32 and auto-detection; the selected profile changes accepted source syntax, not the host toolchain.
- Added virtual console input and classroom implementations of `ReadInt`, `ReadDec`, `ReadHex`, `ReadChar`, `ReadKey`, and `ReadString`.
- Expanded Irvine-style compatibility with `DumpMem`, binary/hex display variants, string length, deterministic random calls, `mWrite` macros, and documented console-call behavior.
- Added Visual Studio-shaped `AddTwo.asm`, interactive console, and NASM loop starters, plus an Irvine32 profile guide.
- Kept the default cross-platform path fully embedded: no Docker, Visual Studio, `ml.exe`, Irvine binary, NASM package, linker, or administrator access is required or bundled.
- Added automated coverage for profiles, official introductory program shape, input/flag contracts, formatting, macros, deterministic random behavior, input failures, and every new starter.

## 0.5.0

- Replaced the Docker/NASM container workflow with an original, extension-native IA-32 teaching interpreter that requires no external toolchain or administrator setup.
- Added a side-by-side Assembly Lab with assemble, run, step, reset, registers, flags, stack, declared data, program output, and a recent source trace.
- Added classroom MASM wrappers, common Irvine-style output helpers, a documented NASM-style IA-32 subset, exact source-line diagnostics, and bounded execution.
- Added MASM-style and NASM-style starter programs plus an explicit compatibility guide; the extension does not claim full MASM/NASM or object-file compatibility.
- Added a safe v0.4 lab upgrade that archives the generated container-pilot guide and adds embedded starters without overwriting student `.asm` files.

## 0.4.0

- Bundled all 13 CIS 310 presentations as integrity-checked offline PDFs.
- Removed the runtime dependency on private external hosting when opening presentations.
- Preserved the original Drive titles and URLs only as source provenance.

## 0.3.0

- Added a generic **Create a New Digital Circuit** action that works before Digital is installed.
- Added per-assignment blank-circuit buttons with collision-safe filenames and no solution content.
- Split the Course Materials view into Homework and Project Assignments.
- Added the original Portable Assembly Lab prototype (superseded in 0.5.0 by the embedded IA-32 lab).
- Added assembly/circuit path validation, syntax highlighting, starter content, technical notes, and automated coverage.

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
