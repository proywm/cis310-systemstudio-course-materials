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
- explicit homework/project categories and safe blank-circuit starter metadata;
- the lecture-to-assignment map in [`STUDENT_MATERIALS.md`](STUDENT_MATERIALS.md); and
- local files for every student-facing document---no external document-hosting account is needed.

## Student workflow

1. Open **Start Here** and complete the next Read → Watch → Try 3 questions preparation module before class.
2. Open the syllabus and course calendar from the SystemStudio sidebar.
3. Use the presentation and assignment reference after the mapped open-book reading, not as a substitute for it.
4. Open the matching Canvas assignment and confirm its current requirements.
5. Use topic practice, quiz mode, or due/saved review when a concept needs another retrieval attempt.
6. Predict a small result before building or running.
7. Create and test the circuit or assembly artifact incrementally.
8. Submit every required file in Canvas and confirm the submission receipt.

Learning Center reading/video checkmarks and practice progress stay on the student's machine. They are ungraded and self-reported, do not predict a course grade or certify mastery, and can be reset from the dashboard.

## Assembly boundary

The extension supplies an original, bounded IA-32 teaching interpreter with Irvine32 Classroom and NASM IA-32 profiles. It supports the documented introductory register, memory, flag, stack, branch, procedure, and console workflows on Windows, macOS, Linux, and Remote SSH.

It is not a full MASM/NASM toolchain, does not produce native objects or executables, and does not reproduce every operating-system API, macro, directive, calling convention, x87 instruction, or SIMD instruction. Use an instructor-approved native toolchain when an assignment explicitly requires those capabilities.

## Deliberately excluded

- examinations and answer keys;
- grades, student records, submissions, or correspondence;
- hidden tests and instructor solutions;
- completed ALU, register-file, or processor circuits; and
- proprietary assembly libraries or textbook example distributions.

## Release maintenance

After changing a packaged file, recompute its SHA-256 value in `materials-manifest.json`, increment the course-pack/extension version, run `npm run check`, and review the resulting VSIX before distribution.
