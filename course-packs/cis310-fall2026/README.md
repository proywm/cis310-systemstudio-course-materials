# CIS 310 Fall 2026 Course Pack

This is the active student course pack for Fall 2026 CIS 310. It is packaged with the SystemStudio VS Code extension so the syllabus, presentations, and assignment references open locally, while focused readings and official author videos open from the required book's authoritative sources.

## Course authority

[Fall 2026 Canvas course 552144](https://canvas.umd.umich.edu/courses/552144) controls current deadlines, points, required files, collaboration and AI-use rules, announcements, changes, and submission. Students submit in Canvas; the extension does not submit coursework.

## Included

- one SHA-256-verified Fall 2026 syllabus PDF;
- a 13-topic Read → Watch → Try 3 questions path mapped to David Tarnoff's required open text and official author videos;
- 13 SHA-256-verified presentation PDFs covering Lectures 1--12, including the Lecture 8 companion;
- three homework study references;
- three processor-project study and implementation references;
- 43 formative practice questions, with at least three mapped to each of the 13 presentation resources, delivered through the extension's local Learning Center;
- the complete upstream Digital v0.31 application for circuit editing and simulation, plus six mapped circuit builds; actual NASM/ELF32 execution, exact Windows MASM/Irvine32 routing, and five separately labeled trace-tutor activities;
- explicit homework/project categories and safe blank-circuit starter metadata;
- the lecture-to-assignment map in [`STUDENT_MATERIALS.md`](STUDENT_MATERIALS.md); and
- an anonymized [student FAQ](support/FAQ.md) plus an instructor-reviewed [Maizey tutor prompt](support/MAIZEY_SYSTEM_PROMPT.txt);
- local files for every student-facing document---no external document-hosting account is needed.

## Student workflow

1. Open **Start Here** and complete the next Read → Watch → Try 3 questions preparation module before class.
2. Open the syllabus and course calendar from the SystemStudio sidebar.
3. Use the presentation and assignment reference after the mapped open-book reading, not as a substitute for it.
4. Open the matching Canvas assignment and confirm its current requirements.
5. Use topic practice, quiz mode, or due/saved review when a concept needs another retrieval attempt.
6. Open a mapped guided lab when available, predict a small result, and inspect the requested evidence before marking a checkpoint.
7. Keep guided practice artifacts separate from graded assignment work, then create and test the required circuit or assembly artifact incrementally.
8. Submit every required file in Canvas and confirm the submission receipt.
9. Use the local FAQ for recurring questions, U-M Maizey for source-grounded conversational help, or **Ask a Question Before Class** when the instructor should address an issue in the next meeting.

Learning Center reading/video checkmarks, guided-lab checkmarks, and practice progress stay on the student's machine. They are ungraded and self-reported, do not predict a course grade or certify mastery, and can be reset from the relevant dashboard or lab.

## Circuit tool

SystemStudio runs the complete upstream Digital v0.31 application rather than a reduced circuit renderer. Supported headless Linux hosts stream the real Swing desktop into VS Code; Windows/macOS use Digital’s native window. The separate preview and testcase commands also use Digital’s official exporter and CLI.

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
