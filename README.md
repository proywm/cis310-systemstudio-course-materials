# CIS 310 SystemStudio Course Materials

Active Fall 2026 course materials for **CIS 310: Computer Organization and Assembly Language** at the University of Michigan-Dearborn.

This repository is the student-facing home for the course syllabus, semester calendar, open-textbook/author-video preparation map, presentation PDFs, homework and processor-project references, and the SystemStudio CIS 310 VS Code extension with low-stakes practice and local learning progress.

## Start here

| Need | Open |
|---|---|
| Current requirements, deadlines, grades, announcements, and submission | [Fall 2026 CIS 310 Canvas](https://canvas.umd.umich.edu/courses/552144) |
| Course policies, outcomes, tools, and topic sequence | [Fall 2026 syllabus PDF](course-packs/cis310-fall2026/syllabus/CIS310_Fall_2026_Syllabus.pdf) |
| Open-book readings, author videos, homework, projects, and presentations | [Student course-material guide](course-packs/cis310-fall2026/STUDENT_MATERIALS.md) |
| Extension installation and commands | [SystemStudio extension guide](extension/README.md) |
| Practice design, research, and privacy boundary | [Learning Center design](extension/LEARNING_DESIGN.md) |
| Installable VS Code package | [Latest course release](https://github.com/proywm/cis310-systemstudio-course-materials/releases/latest) |

> Canvas is authoritative for live course details. Submit every required deliverable in Canvas and verify that Canvas recorded the submission. SystemStudio does not submit coursework.

![SystemStudio CIS 310 Learning Center showing the grouped sidebar and Read, Watch, Try three questions preparation path](docs/images/systemstudio-learning-center.svg)

## Fall 2026 calendar

CIS 310 meets on Mondays and Wednesdays. The first class is Wednesday, August 26, and the final regular class is Monday, December 7. The extension shows all 27 regular meetings and the official holiday, recess, study-day, and examination periods.

Use **CIS 310: Open Fall 2026 Course Calendar** in VS Code to view the calendar. The `.ics` exporter uses all-day placeholders by default so it does not guess the class time; timed export requires the confirmed Canvas start time and duration.

## What students receive

- a locally packaged Fall 2026 syllabus PDF;
- a Read → Watch → Try 3 questions path for every lecture topic, using focused sections of David Tarnoff's required open text and official author videos;
- 13 integrity-checked presentation PDFs that open inside VS Code;
- three homework references and three processor-project references;
- 43 short, author-written practice questions, with at least three for each of the 13 presentation resources;
- five-question recommended sessions, topic practice, and 10-question quiz mode;
- explanations, related-lesson links, confidence checks, saved questions, and spaced review;
- a local learning dashboard that reports practice evidence without estimating a grade or claiming mastery;
- a clickable Monday/Wednesday calendar with `.ics` export;
- managed installation and verification of Digital v0.31;
- blank and assignment-specific Digital circuit creation;
- circuit preview and deterministic testcase support;
- a cross-platform embedded Irvine32 Classroom/NASM IA-32 teaching lab;
- a skippable and rerunnable guided tutorial; and
- a local helper for topic, tool, calendar, and Canvas routing.

No external document-hosting account is required to open the packaged syllabus or presentations. The required Tarnoff book and companion videos open from the author's official ETSU/YouTube sources; the extension does not redistribute them or use Google Drive.

## Install the extension

Download `systemstudio-cis310.vsix` from the [latest release](https://github.com/proywm/cis310-systemstudio-course-materials/releases/latest), then run:

```bash
code --install-extension systemstudio-cis310.vsix
```

Alternatively, use **Extensions: Install from VSIX...** in desktop VS Code. Reload the VS Code window, open the **SystemStudio CIS 310** activity-bar view, and start the guided tutorial.

Java 8 or newer is required for the Digital graphical application. The embedded assembly lab does not require Visual Studio, Docker, MASM, NASM, a linker, or administrator access.

## Repository layout

```text
course-packs/cis310-fall2026/   Active syllabus, presentations, and assignments
extension/                      SystemStudio CIS 310 VS Code extension
CONTRIBUTING.md                 Course-material and extension contribution rules
SECURITY.md                     Security and privacy reporting
```

## Help and privacy

The extension does not transmit helper conversations, reading/video checkmarks, practice history, student code, circuit files, grades, or telemetry to an AI service. Learning history is stored locally in VS Code and can be reset by the student. External book/video links have their own privacy practices. Do not commit student submissions, grades, credentials, private correspondence, answer keys, hidden tests, or instructor solutions to this repository.

For a course requirement or deadline, check Canvas first. For a technical question, include what you expected, what happened, the exact evidence, and what you already tried.

## Development checks

```bash
cd extension
npm ci
npm run check
npm run package
```

The course pack and packaged extension verify local material hashes before use.
