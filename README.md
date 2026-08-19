# SystemStudio AI

**A one-stop VS Code learning environment for systems programming and processor design**

SystemStudio AI is a Fall 2026--Winter 2027 senior-design project proposed by Probir Roy at the University of Michigan-Dearborn. The product will combine reproducible environment setup, systems coding, visual processor design, automated evidence collection, guided practice, and an evidence-grounded AI coach in a single VS Code experience.

The central design principle is simple: **the system should explain verified evidence, not invent an answer**. Compilation results, instructor-authored tests, simulator traces, rubrics, and approved course resources remain authoritative. The AI organizes and explains that evidence, offers progressive hints, and escalates uncertain cases to an instructor or teaching assistant.

## Why this project

A review of written student evaluations from Fall 2019 through Winter 2026 found recurring needs in project-heavy systems courses:

- faster and more explanatory formative feedback;
- help translating concepts into working implementations;
- reliable setup for C, assembly, Make, Docker, QEMU/xv6, and circuit tools;
- smaller practice activities and worked examples;
- support when prerequisite knowledge differs across students; and
- a clearer path for asking an instructor or TA for help.

Students also consistently valued hands-on work, group problem solving, live demonstrations, and concrete examples. SystemStudio AI is designed to extend those strengths. The evaluations do **not** establish that AI will improve learning; that is a hypothesis the project must test.

## Minimum product

The eight-month minimum viable product will support two reference workflows:

1. **CIS 450:** one C/xv6 systems-programming workflow with environment validation, build/test integration, deterministic evidence, guided practice, and progressive hints.
2. **CIS 310:** one visual 4-bit processor workflow with a structured design file, simulation, signal traces, seeded-fault tests, guided practice, and progressive hints.

The minimum product is not a general-purpose IDE, a general-purpose circuit simulator, or an automated grading system.

## Repository map

| Path | Purpose |
|---|---|
| [`proposal/`](proposal/) | One-page LaTeX proposal and compiled PDF |
| [`docs/research/student-evaluation-findings.md`](docs/research/student-evaluation-findings.md) | Evidence base, method, themes, and limitations |
| [`docs/research/technical-feasibility.md`](docs/research/technical-feasibility.md) | VS Code, container, simulator, and AI integration research |
| [`docs/research/measurement-literature.md`](docs/research/measurement-literature.md) | Research basis for surveys, learning measures, trust, workload, analysis, and ethics |
| [`docs/design/product-requirements.md`](docs/design/product-requirements.md) | Functional and non-functional requirements |
| [`docs/design/system-architecture.md`](docs/design/system-architecture.md) | Component model, trust boundaries, and data flow |
| [`docs/design/course-workflows.md`](docs/design/course-workflows.md) | Student and instructor workflows for CIS 310 and CIS 450 |
| [`docs/design/ai-safety-and-privacy.md`](docs/design/ai-safety-and-privacy.md) | Academic-integrity, privacy, security, and escalation controls |
| [`docs/planning/evaluation-plan.md`](docs/planning/evaluation-plan.md) | Research questions, metrics, and pilot plan |
| [`docs/planning/rq-instrument-matrix.md`](docs/planning/rq-instrument-matrix.md) | Item-level mapping from each RQ to its primary and supporting evidence |
| [`docs/planning/analysis-plan.md`](docs/planning/analysis-plan.md) | Pre-specified outcomes, estimands, models, missing-data rules, and reporting limits |
| [`docs/planning/implementation-roadmap.md`](docs/planning/implementation-roadmap.md) | Schedule, work allocation, risks, and definition of done |
| [`docs/planning/traceability-matrix.md`](docs/planning/traceability-matrix.md) | Student needs mapped to requirements and validation |
| [`schemas/`](schemas/) | Proposed versioned formats for course packs, evidence, and processor designs |
| [`instruments/`](instruments/) | Pre/post surveys, item-to-RQ map, task pulse, assignments, rubrics, calibration task, logs, and data dictionary |

## Project constraints

- Team: 3--4 interdisciplinary students.
- Period: September 2026 through April 2027.
- Expected effort: approximately 600--800 total student hours.
- Client: Probir Roy (`probirr@umich.edu`, +1 313-583-6620).
- Meetings: at least biweekly, virtually or in person.
- Required work: software design, programming, integration, testing, documentation, and final product evaluation.

## Build the proposal

```bash
cd proposal
latexmk -pdf -interaction=nonstopmode -halt-on-error \
  SystemStudio_AI_Fall_2026_Senior_Design_Proposal.tex
```

## Data handling

This repository intentionally contains no raw course evaluations, student names, submissions, grades, or email. The research notes report aggregated themes only. Any future study involving student data must receive the appropriate institutional determination before data collection.

## Current status

The repository contains the compiled client-facing proposal, research-backed product specification, and a complete draft measurement package. The instruments still require institutional determination, expert review, cognitive testing, and piloting before use. Implementation will begin with requirements validation and a vertical prototype; no claim is made that the proposed learning benefits or feedback turnaround have already been achieved.
