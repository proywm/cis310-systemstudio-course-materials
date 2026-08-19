# CIS 310 Fall 2026 Course Pack

This pack supports the Fall 2026 CIS 310 workspace. It embeds the student-facing presentations and readable assignment references found in Probir Roy's private Fall 2025 archive so students do not depend on Google Drive at runtime.

## Release status

**Instructor review required. [Fall 2026 Canvas course 552144](https://canvas.umd.umich.edu/courses/552144) is authoritative.** The source files are from Fall 2025. Assignment deadlines, point totals, group rules, required files, and submission instructions must be reviewed before release. Students submit in Canvas; the extension does not submit coursework.

The extension labels this status and preserves the source titles and modification dates. It does not silently rewrite historical course policy.

## Included

- 13 locally packaged, SHA-256-verified PDF presentations covering Lectures 1--12; Lecture 8 has a main deck and a detailed I/O companion PDF.
- A locally packaged, SHA-256-verified Fall 2026 syllabus PDF with a verified Monday/Wednesday term calendar and clearly marked instructor-review fields.
- Six local Markdown assignment references: three homework items and three processor-project milestones.
- Explicit homework/project categories and safe blank-circuit starter metadata for circuit-design tasks.
- A lecture-to-assignment concept map in [`STUDENT_MATERIALS.md`](STUDENT_MATERIALS.md).
- SHA-256 values for every locally packaged presentation and assignment.
- No Google Drive requirement at runtime; the extension opens all syllabus and presentation PDFs from its own package.

## Deliberately excluded

- exams and answer keys;
- grading spreadsheets and rubrics containing student records;
- student submissions or correspondence;
- hidden tests or completed processor circuits; and
- Digital's upstream completed ALU example, because it is too close to Project Assignment 2.

The only simulator example retained in the generated student workspace is Digital's basic half-adder, used as prerequisite practice rather than as a solution to a listed project.

## Assembly boundary

The reviewed course archive uses Microsoft/Irvine-style MASM conventions in its assembly material. The extension does not copy exams, quizzes, textbook slides, proprietary support libraries, or archived assembly examples from that source. Instead, it supplies an original embedded IA-32 teaching interpreter, explicit Irvine32 Classroom and NASM IA-32 profiles, original starters, and compatibility guides. The engine targets shared register/memory/flags/stack and introductory console-procedure concepts and does not claim that source-level teaching support is interchangeable with exact object formats, APIs, calling conventions, complete macros, or native production tools.

## Presentation boundary

The extension ships offline PDF copies of all 13 presentations and verifies each copy before use. The recorded Drive URLs and source titles remain provenance metadata only; students do not need Drive access to open a presentation. PowerPoint sources were converted to PDF with LibreOffice, while source PDFs were copied without content conversion. Instructor review is still required before classroom release.

## Provenance

- Source folder: [`CIS310_fall25`](https://drive.google.com/drive/folders/1tyJh-06nEZ9oHTYyPfnC2UQHNGXBlSiZ)
- Inventory reviewed: August 19, 2026
- Source presentation modification dates: August 26, 2025
- Source assignment modification dates: August 26, 2025
- Newer Fall 2026 presentation/assignment folder found: no

See [`source-audit.md`](source-audit.md) for the selection and release checklist.
