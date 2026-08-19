# Course-Material Source Audit

## Selection rule

The private Drive folder `CIS310_fall25` was treated as the bounded source set because it contains a coherent sequence of Lectures 1--12 and corresponding student-facing homework/project files. Searches for `CIS310 fall26`, `CIS 310 Fall 2026`, and recently modified CIS 310 assignment files did not identify a newer Fall 2026 course-material folder.

## Assignment selection

The folder contains two distinct items numbered “1,” and separate Homework 2 and Homework 3 files. All six assignments are preserved with unambiguous names:

- `CIS310-HW-1.md` → Homework 1: Logic Foundations;
- `CIS310_HW2_v2 (2).docx` → Homework 2: Sequential Logic and State Machines;
- `CIS310_HW3_v1 (1).docx` → Homework 3: Memory and Assembly Foundations;
- `CIS310_assignment-1-v2.md.txt` → Project Assignment 1: Registers and DRAM;
- `cis310_Assignment2.md.txt` → Project Assignment 2: Register File and ALU; and
- `cis310_Assignment3.md.txt` → Project Assignment 3: 4-bit Processor.

The Markdown/text versions were selected over duplicate DOCX files for the processor projects because they are directly readable and versionable. Homework 2 and Homework 3 existed only as DOCX source files; readable Markdown references were prepared from their extracted instructor text. Homework 2 diagrams are explicitly deferred to the current Canvas assignment rather than reconstructed or guessed. Every reference begins with a Fall 2026 Canvas/submission warning and preserves its source title, URL, and modification time.

## Presentation selection

The folder has one primary item for each Lecture 1--12 and a second, detailed I/O PDF associated with Lecture 8. All are recorded in the materials manifest. Topic labels were checked against readable text extracted from each source. To remove the private-Drive runtime dependency, stored PowerPoint files were downloaded and converted to PDF with LibreOffice; stored PDFs were copied unchanged. The manifest binds every packaged PDF by local path and SHA-256 while retaining the original Drive URL only as provenance.

## Exclusions

Search results outside the bounded folder contained grades, examinations, student submissions, accommodation information, and correspondence. None were copied or referenced in the course pack.

## Instructor release checklist

- [ ] Confirm these are the intended presentation revisions for the new course offering.
- [ ] Review the packaged PDF rendering and approve the presentation revisions for student release.
- [ ] Update assignment deadlines, points, group rules, submission channel, and repository requirements.
- [ ] Resolve any wording or technical corrections in the assignments.
- [ ] Add instructor-authored public testcases without including hidden tests or solutions.
- [ ] Confirm that the half-adder reference is permitted and that no direct ALU/processor solution is distributed.
- [ ] Recompute all packaged-material hashes and increment the course-pack version after any content change.
- [ ] Run the extension's validation and cross-platform smoke tests.
