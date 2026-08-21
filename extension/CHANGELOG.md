# Change Log

## 0.25.0

- Replaced the multi-provider AI chooser with the student-owned U-M Codex CLI as the single online setup and learning coach; added cross-platform readiness checks, explicit in-terminal prompt consent, and persistent `AGENTS.md` academic-integrity guardrails.
- Made Codex assistance the first optional onboarding step before the verified Digital and NASM environment setup, while retaining private offline Orbit as a non-AI fallback.
- Kept the handoff student-controlled: SystemStudio does not read or store credentials and sends no course prompt until the student selects **Send guarded course prompt** inside VS Code.

## 0.24.0

- Replaced dense learning pages with remembered, wrapping, keyboard-operable tabs for lesson concepts/examples/practice/sources and dashboard next-work/practice/module/progress views.
- Grouped all thirteen modules and mapped labs into three visible course units while retaining the complete sequential outline requested for first-time navigation.
- Added a generated-webview JavaScript parse regression after independent review found a release-blocking template error; fixed visible-panel focus, help focus restoration/state, answer radio navigation, and confidence semantics.
- Reworded the five-attempt threshold as a preparation checkpoint—not evidence of readiness or mastery—and synchronized that boundary across the extension, exports, student guide, FAQ, and images.
- Made setup failures show the specific first unresolved component and next action, corrected Linux versus Windows/macOS Digital-runtime readiness, and reconciled the tutorial’s embedded/native descriptions.
- Added a two-axis feature-confidence scorecard and six-persona iterative usability evaluation that keep implementation evidence separate from observed learner evidence.

## 0.23.0

- Replaced the beginner tool list with one verified **Set up or repair my course environment** workflow and moved manual controls under Advanced Setup and Diagnostics.
- Added bounded Orbit guidance at setup and embedded-Digital failures; students review the prompt before their own Copilot or published U-M tutor account receives it.
- Added one-click Docker Desktop startup/retry where supported while keeping administrator installation and virtualization changes explicit and student-controlled.
- Prepares verified Digital and actual NASM/GDB course runtimes in extension storage or pinned containers and reports ready only after checks pass.
- Reorganized the main tree around Start Here, Modules, Practice, Coursework, Hands-on Labs, Help, and Advanced Diagnostics.

## 0.22.1

- Fixed new-circuit creation so the workspace `circuits/work` directory is prepared before the save dialog opens, with a visible workspace-root fallback if directory preparation fails.
- Replaced client-only Docker assumptions with a bounded Docker server-version probe shared by environment checks, the status bar/tree, setup messaging, and the Full Digital runtime.
- Made the Full Digital recovery page interactive immediately instead of waiting for the error notification to be dismissed.
- Added regression tests for stopped/missing Docker, circuit save-parent fallback, and non-blocking recovery controls.

## 0.22.0

- Added required GitHub Actions integration on Ubuntu 24.04, Windows Server 2025, and macOS 15. Every OS now runs deterministic checks, activates the extension in a real VS Code Stable Extension Development Host, navigates critical student panels, builds/audits a VSIX, and uploads the package as evidence.
- Added a minimum-version Extension Host run on VS Code 1.100.0, a real Ubuntu NASM/GDB run, an actual upstream Digital/Xvfb/x11vnc/noVNC browser-input run, and executable NASM and Full Digital course-container smokes.
- Added a fail-closed VSIX boundary audit that requires student release assets and rejects development tests/scripts, internal fixtures, answer-key/solution paths, environment files, and student-data paths.
- Replaced the raw stopped-Docker failure with a student-facing diagnosis that states the circuit is safe, explains why Windows/macOS need the container for in-tab Digital, preserves technical evidence, and offers retry, setup, and only-valid native-fallback choices.
- Added a packaged accessible HTML setup and first-task guide for Windows, macOS, and Linux, including the first half-adder circuit, first NASM/GDB lab, student unit tests, Canvas submission checks, and Docker named-pipe recovery.
- Strengthened the actual Full Digital GUI smoke so it must prove that a browser connected through noVNC and sent pointer input, rather than accepting screenshot size alone.

## 0.21.0

- Replaced the broken Maizey project-management handoff with an explicit tutor chooser. SystemStudio rejects Project `detail/overview` URLs, opens a published student-facing Maizey App or Canvas, and documents the required data indexing/App publication step.
- Added an optional in-VS-Code GitHub Copilot learning coach through the VS Code Language Model API. It uses the student's signed-in account, sends only submitted text, has no hard Copilot dependency, and blocks direct-solution requests before model access.
- Added a Student Unit Test Center and NASM Test Controller. Digital files with upstream Testcase components and NASM `*.test.asm` programs appear in VS Code's Testing view; assignment public preflights remain linked from the same center.
- Added an actual self-checking NASM test template and retained exit-code evidence (0 passes, nonzero fails) in generated student workspaces.
- Replaced the generic companion image with original anime-style Orbit artwork and made it visibly animated in the Help Center and Learning dashboard while preserving text controls, pause, keyboard, and reduced-motion behavior.
- Added automatic verified-native-Digital fallback when Docker Desktop is stopped but host Java is ready, and changed new-circuit creation to allocate a non-overwriting filename instead of failing with `EEXIST`.

## 0.20.0

- Replaced the dual MASM/NASM student path with one NASM 32-bit workflow using actual ELF32 assembly/link/execution and a persistent actual GDB/MI session.
- Added native x86-Linux and hardened Docker/QEMU runtimes for a consistent Windows/macOS fallback without relabeling a teaching model as a toolchain.
- Added seven retained self-checking programs and guided labs for arithmetic, flags/branches, loops, stack/calls, linear search, and iterative/recursive binary search.
- Added a repeatable NASM/GDB smoke script that verifies all seven executables plus actual breakpoints, registers, flags, stack, memory, disassembly, stepping, and output.
- Mapped Lecture 12 to Paul Carter's open NASM-based *PC Assembly Language* and the official NASM manual, while retaining accessible HTML as the primary introduction.
- Added Orbit, an original optional animated tutor companion with a pause control, keyboard-operable chat button, text-equivalent help paths, and reduced-motion behavior.

## 0.19.0

- Added prediction-first linear-search, iterative binary-search, and recursive binary-search walkthroughs with explicit return-to-Canvas steps.
- Retained inspectable MASM/Irvine32 and NASM/ELF32 sources for all three algorithms; the Linux programs self-check first, middle/final, and absent cases.
- Added direct search-walkthrough actions to Homework 3, the cumulative final-presentation plan, and the self-paced tutorial.
- Added attempt-first AI tutor prompts that request the learner’s expected/observed evidence and prohibit program completion or submission-ready code.
- Upgraded generated assembly workspaces without overwriting student `.asm` files and preserved the strict trace-tutor versus real-toolchain boundary.

## 0.18.0

- Replaced the ambiguous four-nibble/16-bit processor handout with one validated architecture: an 8-bit instruction word and instruction memory with a 4-bit PC, register file, ALU, and data memory.
- Defined a four-state non-pipelined controller and a complete 8-bit instructional ISA for R-type arithmetic, immediate load, data-memory load, and store.
- Added public preflights for the 8-bit instruction register and 16×8 instruction memory plus a 25-vector integrated program covering fetch, decode, execute, writeback, arithmetic, store, and load.
- Added circuit-specific attempt-first AI tutor prompts from Assignment Mission Control and failed preflights; the handoff shares public contracts, not circuit files, and prohibits finished designs.
- Retained a complete independently implemented reference CPU and all component validation designs in the instructor-only validation directory.

## 0.17.0

- Standardized Implementation 3, the syllabus, calendar, roadmap, FAQ, and final-presentation guide around one cumulative 4-bit processor built through Implementations 1–3.
- Added assignment-aware local circuit preflights backed by the unmodified Digital CLI: public register, program-counter, memory, register-file, and exhaustive 2,048-vector ALU contracts plus circuit-owned embedded tests for the integrated processor.
- Added an accessible public interface/preflight guide and explicit boundaries: local passes are formative evidence, not grades, rubric decisions, current Canvas-requirement checks, or submissions.
- Updated all active evaluation wording for the currently confirmed no-GSI/no-grader staffing state; Canvas and instructor evaluation remain authoritative.

## 0.16.0

- Added **Coursework and Final Presentation** with Assignment Mission Control for all three homework assignments, three implementation milestones, and the final presentation.
- Added local status and receipt tracking, assignment-specific checklists, selected-file validation, and safe planning ZIP creation; every surface states that Canvas remains the only submission and official evaluation record.
- Added a final-project progression bar and five-dimension self-evaluation that remain local and visibly distinct from instructor performance in Canvas.
- Added a manual grade planning estimate using student-entered Canvas scores, the published 15/65/20 category weights, the two-lowest participation-item drop rule, retained earned/possible point aggregation, and unrounded syllabus letter boundaries.
- Added opt-in local Canvas `.ics` import with course filtering, file-size limits, time-zone-aware deadlines, and all-day handling; also added meeting-to-module missed-class recovery, deterministic Digital error diagnosis, a structured private review request, and a course-staff Canvas release checklist.
- Made a responsive, navigable HTML syllabus the primary packaged syllabus and retained the matching untagged PDF only as an optional print copy.
- Updated the syllabus and calendar for the processor and assembly-program presentation during final examination week; exact date, time, room, order, released requirements, and deadline remain to be announced in Canvas.
- Added a final-presentation planning reference connected to the integrated processor milestone.
- Corrected the Fall 2026 staffing display after the department confirmed the previously proposed students were assigned to other courses; the extension now assumes no CIS 310 GSI or grader is assigned or confirmed and removes the earlier unverified course-assignment claim.

## 0.15.1

- Added a dedicated **Course Team and Schedule** sidebar section with the instructor, course-staff status, confirmed class time/room, and instructor office hours/location.
- Changed calendar export from all-day placeholders to the department-confirmed Monday/Wednesday 10:00–11:45 a.m. meetings in ELB 1329 while retaining official academic milestones and avoiding inferred deadlines.
- Corrected instructor office information to CIS Building, Room 230 throughout the active materials.

## 0.15.0

- Made 13 accessible HTML lectures the primary course format in SystemStudio and retained the original untagged PDFs only as optional visual archives.
- Added a deterministic Canvas publication bundle with 13 Canvas-safe page bodies, 13 standalone HTML documents, a title/file map, SHA-256 manifest, and instructor publication checklist.
- Routed module, practice, quiz-review, and guided-lab lecture buttons to the accessible HTML reader instead of the legacy PDFs.
- Added automated checks for heading structure, prohibited embedded content, descriptive link text, language declaration, skip navigation, and ZIP integrity.
- Documented that automated generation is not accessibility certification and that Panorama plus manual assistive-technology review remains required before publication.

## 0.14.0

- Added a novice-facing responsive HTML lesson for every one of the 13 lecture resources, grounded in extracted presentation text and the verified reading/video map.
- Each lesson provides objectives, key terms, three direct explanations, two worked examples, three self-checks, explicit presentation evidence and scope boundaries, previous/next navigation, and mapped learning/lab actions.
- Added lesson-specific, attempt-first tutor prompts that students copy before opening the configured U-M course tutor; graded-work guardrails and external-AI limitations remain explicit.
- Applied the instructor-supplied UM-Dearborn accessibility-course guidance to semantic headings, descriptive controls, keyboard focus, reflow, high-contrast/forced-color behavior, reduced motion, and a direct HTML alternative to visual PDFs.
- Added automated narrative completeness and accessible-structure checks, plus a documented manual screen-reader, keyboard, zoom, contrast, caption, and disabled-student review checklist.
- Corrected stale three-question and 43-question documentation to the current five-question preparation checkpoint, full eight-question set, and 104-question bank.

## 0.13.0

- Expanded the evidence-mapped practice bank from 43 to 104 questions: exactly eight per module, a five-question preparation checkpoint, balanced answer positions, Bloom-level labels from Remember through Evaluate, and explanation/justification with reading, video, and lecture-slide evidence.
- Moved the prerequisite-heavy CPU architecture/instruction-execution video out of Module 1 and retained it with the later CPU module after transcript review; added direct open readings/videos where the prior source set did not sufficiently cover logic/truth tables, I/O, or address spaces.
- Integrated required circuit or assembly activities into the corresponding module status and added a K-map-to-Digital construction lab. Create-level outcomes now live in authentic hands-on work rather than multiple-choice claims.
- Added an extension-managed Docker Desktop runtime on Windows/macOS that runs the unmodified upstream Digital application and streams it into the VS Code tab. Linux retains its private X11/noVNC path; native Digital is an explicit fallback.
- Updated the module dashboard, course map, FAQ, screenshot, learning-design rationale, and content-alignment audit for the eight-question and hands-on workflow.

## 0.12.0

- Added an expanded **Course Modules** sidebar section that keeps all 13 sequential modules visible, with completed-module count and per-module progress.
- Highlighted the next unfinished module without hiding the rest of the outline; expanding any module reveals its mapped readings, author videos, packaged lecture PDF, three-question preparation check, and relevant guided labs.
- Added sidebar controls for the existing local reading/video checkmarks and direct module-scoped readiness practice, while retaining **Start Here** as a short next-action area.
- Renamed the former **Learn and Practice** utility group to **Practice and Progress** so it is not mistaken for the course-module outline.

## 0.11.0

- Removed the reduced eight-component circuit renderer from the student path and made the complete upstream Digital v0.31 application the default `.dig` editor.
- Added a private Xvfb/x11vnc/noVNC transport so the actual Digital Swing desktop—including its full component library, menus, simulation, dialogs, and save behavior—runs inside VS Code on supported headless Linux/Remote SSH hosts.
- Kept native upstream Digital as the Windows/macOS desktop path and retained Digital’s official SVG exporter and testcase CLI for read-only verification.
- Added a real NASM → ELF32 → GNU `ld` → IA-32 executable workflow with private Debian/Ubuntu NASM setup after consent.
- Added exact Windows MASM/Irvine32 discovery and execution using Microsoft `ml.exe`/`link.exe`, plus an optional pinned, checksum-verified download of the author’s official Irvine resources.
- Added an explicit Auto/NASM/MASM toolchain chooser and removed references to a portable container that the extension does not provide.
- Renamed and relabeled the former embedded assembly lab as **Instruction Trace Tutor — not an assembler**. Loading there is no longer presented as compilation evidence.
- Added a safe pre-0.11 workspace migration that archives stale generated assembly guides, installs the corrected toolchain guides, and preserves student `.asm` files.
- Made NASM readiness require both the real assembler and GNU `ld`, fail closed on ambiguous syntax, and report unsupported hosts explicitly.
- Disclosed the screen-reader boundary of the graphical noVNC canvas and added a one-click native Digital fallback when the Linux host has a graphical desktop.
- Added actual-process manual smoke tests for upstream Digital input interaction and a NASM-built ELF32 program that prints `Sum = 15`.

## 0.10.6

- **Superseded in 0.11.0:** the reduced workbench below was removed from the student path and replaced by the actual upstream Digital application.
- Added an original embedded circuit workbench that builds and simulates the supported CIS 310 one-bit component set entirely inside desktop or Remote SSH VS Code.
- Added inputs, outputs, AND/OR/XOR/NOT, a manual clock, one-bit D flip-flops, port-to-port wiring, drag/nudge layout, live values, accessible component navigation, undo/redo, and Digital-compatible `.dig` saves.
- Made the embedded workbench the default for fresh guided and assignment circuits while retaining Digital v0.31 for official preview/testcases and advanced components.
- Added fail-closed handling for unsupported `.dig` features so an advanced circuit is never silently simplified or overwritten.
- Updated the half-adder, selector, decoder, state, and ALU-slice walkthroughs, FAQ, tutorial, student guide, syllabus, and automated round-trip/simulation tests.

## 0.10.5

- Added a self-paced Hands-on Lab Center mapped to the same reading, author video, and lecture sources as readiness practice.
- Added six prediction-first Digital circuit builds: a Boolean path, half adder, 2-to-1 selector, stored state bit, address decoder, and small arithmetic/logic selector.
- Added five guided instruction-trace-tutor activities for register arithmetic, flags/branching, array loops, stack frames, and virtual console input.
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

- **Clarified in 0.11.0:** the items below describe the source-level Instruction Trace Tutor, not MASM/NASM assembly or executable behavior.
- Added an explicit Irvine32 Classroom profile alongside NASM IA-32 and auto-detection; the selected profile changes accepted source syntax, not the host toolchain.
- Added virtual console input and classroom implementations of `ReadInt`, `ReadDec`, `ReadHex`, `ReadChar`, `ReadKey`, and `ReadString`.
- Expanded Irvine-style compatibility with `DumpMem`, binary/hex display variants, string length, deterministic random calls, `mWrite` macros, and documented console-call behavior.
- Added Visual Studio-shaped `AddTwo.asm`, interactive console, and NASM loop starters, plus an Irvine32 profile guide.
- Kept the default cross-platform path fully embedded: no Docker, Visual Studio, `ml.exe`, Irvine binary, NASM package, linker, or administrator access is required or bundled.
- Added automated coverage for profiles, official introductory program shape, input/flag contracts, formatting, macros, deterministic random behavior, input failures, and every new starter.

## 0.5.0

- **Clarified in 0.11.0:** the “interpreter” below is now labeled Instruction Trace Tutor and is not used as assembler evidence.
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
