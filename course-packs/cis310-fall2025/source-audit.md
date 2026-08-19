# Course-Material Source Audit

## Selection rule

The private Drive folder `CIS310_fall25` was treated as the bounded source set because it contains a coherent sequence of Lectures 1--12 and corresponding student-facing homework/project files. Searches for `CIS310 fall26`, `CIS 310 Fall 2026`, and recently modified CIS 310 assignment files did not identify a newer Fall 2026 course-material folder.

## Assignment selection

The folder contains two distinct items numbered “1,” so both are preserved with unambiguous names:

- `CIS310-HW-1.md` → Homework 1: Logic Foundations;
- `CIS310_assignment-1-v2.md.txt` → Project Assignment 1: Registers and DRAM;
- `cis310_Assignment2.md.txt` → Project Assignment 2: Register File and ALU; and
- `cis310_Assignment3.md.txt` → Project Assignment 3: 4-bit Processor.

The Markdown/text versions were selected over duplicate DOCX files for Assignments 2 and 3 because they are directly readable, versionable, and suitable for VS Code. Their source text is retained except for a clearly separated provenance/review warning added at the beginning.

## Presentation selection

The folder has one primary item for each Lecture 1--12 and a second, detailed I/O PDF associated with Lecture 8. All are recorded in the materials manifest. Topic labels were checked against readable text extracted from each source.

## Exclusions

Search results outside the bounded folder contained grades, examinations, student submissions, accommodation information, and correspondence. None were copied or referenced in the course pack.

## Instructor release checklist

- [ ] Confirm these are the intended presentation revisions for the new course offering.
- [ ] Publish presentations through student-accessible Canvas or Drive URLs and update the manifest.
- [ ] Update assignment deadlines, points, group rules, submission channel, and repository requirements.
- [ ] Resolve any wording or technical corrections in the assignments.
- [ ] Add instructor-authored public testcases without including hidden tests or solutions.
- [ ] Confirm that the half-adder reference is permitted and that no direct ALU/processor solution is distributed.
- [ ] Recompute assignment hashes and increment the course-pack version.
- [ ] Run the extension's validation and cross-platform smoke tests.
