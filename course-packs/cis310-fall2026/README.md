# CIS 310 Fall 2026 Course Pack

This is the active student course pack for Fall 2026 CIS 310. It is packaged with the SystemStudio VS Code extension so the syllabus, primary accessible HTML lectures, optional PDF archives, and assignment references open locally, while focused readings and official author videos open from the required book's authoritative sources.

## Course authority

[Fall 2026 Canvas course 552144](https://canvas.umd.umich.edu/courses/552144) controls current deadlines, points, required files, collaboration and AI-use rules, announcements, changes, and submission. Students submit in Canvas; the extension does not submit coursework.

## Included

- one SHA-256-verified accessible Fall 2026 HTML syllabus, with an optional print PDF carrying the same content;
- a 13-module Accessible HTML lecture → Read → Watch → Practice 8 questions → Build/trace path mapped to focused open readings, transcript-checked author videos, legacy slide evidence, and hands-on work;
- 13 responsive HTML lectures with objectives, definitions, explanations, examples, self-checks, source evidence, and lesson-specific tutor prompts;
- a Canvas publication bundle at [`canvas/CIS310_Fall2026_Accessible_HTML_Lectures.zip`](canvas/CIS310_Fall2026_Accessible_HTML_Lectures.zip), containing 13 Canvas-safe bodies, 13 standalone pages, a page map, and a validation manifest;
- 13 SHA-256-verified legacy presentation PDFs covering Lectures 1--12, including the Lecture 8 companion, retained as optional visual archives;
- three homework study references;
- three cumulative 4-bit processor study/implementation references plus a final-presentation planning reference;
- 104 formative practice questions, exactly eight mapped to each of the 13 presentation resources, delivered through the extension's local Learning Center;
- the complete upstream Digital v0.31 application for circuit editing and simulation, plus seven mapped circuit builds; actual NASM/ELF32 execution, exact Windows MASM/Irvine32 routing, and five separately labeled trace-tutor activities;
- explicit homework/project categories and safe blank-circuit starter metadata;
- the lecture-to-assignment map in [`STUDENT_MATERIALS.md`](STUDENT_MATERIALS.md); and
- an anonymized [student FAQ](support/FAQ.md) plus an instructor-reviewed [Maizey tutor prompt](support/MAIZEY_SYSTEM_PROMPT.txt);
- local files for every student-facing document---no external document-hosting account is needed.

## Student workflow

1. Open the expanded **Course Modules** outline, choose the scheduled module, and complete its Accessible HTML lecture → Read → Watch → five-question readiness checkpoint before class; continue through the eight-question confidence set and mapped hands-on activity.
2. Open the syllabus and course calendar from the SystemStudio sidebar.
3. Use the optional visual PDF archive only when its diagrams help; the accessible HTML lecture is the primary lecture format.
4. Open the matching Canvas assignment and confirm its current requirements.
5. Use topic practice, quiz mode, or due/saved review when a concept needs another retrieval attempt.
6. Open a mapped guided lab when available, predict a small result, and inspect the requested evidence before marking a checkpoint.
7. Keep guided practice artifacts separate from graded assignment work, then create and test the required circuit or assembly artifact incrementally.
8. Submit every required file in Canvas and confirm the submission receipt.
9. Use the local FAQ for recurring questions, U-M Maizey for source-grounded conversational help, or **Ask a Question Before Class** when the instructor should address an issue in the next meeting.

Learning Center reading/video checkmarks, guided-lab checkmarks, coursework planning states, and practice progress stay on the student's machine. They are ungraded and self-reported and do not certify mastery. A separately labeled manual grade estimator can calculate a planning estimate from scores the student copies from Canvas; it is not an instructor evaluation or official Canvas grade.

## Circuit tool

SystemStudio runs the complete upstream Digital v0.31 application rather than a reduced circuit renderer. Linux hosts stream its real Swing desktop into VS Code; Windows/macOS stream the same application from an extension-managed Docker Desktop container. Native Digital is an explicit fallback. The separate preview and testcase commands also use Digital’s official exporter and CLI.

## Assembly boundary

The real execution path invokes actual NASM and GNU `ld` for ELF32 on Linux. Exact MASM/Irvine32 invokes Microsoft `ml.exe`, Microsoft `link.exe`, and the official Irvine library on Windows. The separate Instruction Trace Tutor is a bounded visualization, not an assembler; it does not emit machine code and cannot establish toolchain compatibility.

## Deliberately excluded

- examinations and answer keys;
- grades, student records, submissions, or correspondence;
- hidden tests and instructor solutions;
- completed ALU, register-file, or processor circuits; and
- proprietary assembly libraries or textbook example distributions.

## Release maintenance

After changing a packaged file, recompute its SHA-256 value in `materials-manifest.json`, increment the course-pack/extension version, run `npm run check`, and review the resulting VSIX before distribution.
