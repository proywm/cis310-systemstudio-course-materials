# Contributing

## Working agreement

SystemStudio CIS 310 is active course software that opens student-authored circuit and assembly files. Correctness, privacy, accessibility, and clear course authority take priority over feature volume.

## Development workflow

1. Create a focused branch from the protected default branch.
2. Add or update tests with every behavior change.
3. Recompute course-material SHA-256 values after content changes.
4. Update the student guide and changelog when a workflow changes.
5. Run security and accessibility checks appropriate to the change.
6. Request instructor review for changes that affect course content or policy.

## Pull-request checklist

- [ ] Scope and user impact are clear.
- [ ] Unit/integration tests cover success and failure paths.
- [ ] No student data, raw course evaluations, credentials, hidden tests, or solutions are included.
- [ ] Executable commands use validated process/argument definitions.
- [ ] UI changes are keyboard operable and have screen-reader/text alternatives where needed.
- [ ] Student documentation and course-material hashes are updated.
- [ ] Claims describe observed results and limitations without implying untested learning outcomes.

## Data prohibition

Do not commit:

- identifiable student data;
- raw evaluations or emails;
- grades or LMS exports;
- student submissions;
- API keys, access tokens, or credentials;
- instructor-only solutions or hidden tests in student-distributed paths; or
- helper transcripts containing student artifacts.

Use instructor-created reference artifacts and seeded faults for development and automated tests.

## Definition of done

A feature is done only when implementation, tests, documentation, accessibility, privacy/security review, and instructor acceptance criteria are complete.
