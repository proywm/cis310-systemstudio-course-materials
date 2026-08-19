# CIS 310 Fall 2026 Course Pack

This is the active student course pack for Fall 2026 CIS 310. It is packaged with the SystemStudio VS Code extension so the syllabus, presentations, and assignment references open locally.

## Course authority

[Fall 2026 Canvas course 552144](https://canvas.umd.umich.edu/courses/552144) controls current deadlines, points, required files, collaboration and AI-use rules, announcements, changes, and submission. Students submit in Canvas; the extension does not submit coursework.

## Included

- one SHA-256-verified Fall 2026 syllabus PDF;
- 13 SHA-256-verified presentation PDFs covering Lectures 1--12, including the Lecture 8 companion;
- three homework study references;
- three processor-project study and implementation references;
- explicit homework/project categories and safe blank-circuit starter metadata;
- the lecture-to-assignment map in [`STUDENT_MATERIALS.md`](STUDENT_MATERIALS.md); and
- local files for every student-facing document---no external document-hosting account is needed.

## Student workflow

1. Open the syllabus and course calendar from the SystemStudio sidebar.
2. Read the mapped presentation and assignment reference.
3. Open the matching Canvas assignment and confirm its current requirements.
4. Predict a small result before building or running.
5. Create and test the circuit or assembly artifact incrementally.
6. Submit every required file in Canvas and confirm the submission receipt.

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
