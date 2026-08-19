# Contributing

## Working agreement

SystemStudio AI is an educational system that may eventually process student code and learning evidence. Correctness, privacy, accessibility, and honest claims take priority over feature volume.

## Development workflow

1. Create a focused branch from the protected default branch.
2. Link work to a requirement ID from `docs/design/product-requirements.md`.
3. Add or update tests with every behavior change.
4. Document changes to course-pack, evidence, or processor schemas.
5. Run security and accessibility checks appropriate to the change.
6. Request review from a teammate outside the primary workstream.

## Pull-request checklist

- [ ] Scope and user impact are clear.
- [ ] Relevant requirement IDs are listed.
- [ ] Unit/integration tests cover success and failure paths.
- [ ] No student data, raw course evaluations, credentials, hidden tests, or solutions are included.
- [ ] Executable commands use validated process/argument definitions.
- [ ] AI changes include invalid-citation, prompt-injection, low-confidence, and leakage tests.
- [ ] UI changes are keyboard operable and have screen-reader/text alternatives where needed.
- [ ] Documentation and schemas are updated.
- [ ] Claims describe observed results and limitations without implying untested learning outcomes.

## Data prohibition

Do not commit:

- identifiable student data;
- raw evaluations or emails;
- grades or LMS exports;
- student submissions unless an explicitly approved, deidentified research workflow permits them;
- API keys, access tokens, or credentials;
- instructor-only solutions or hidden tests in student-distributed paths; or
- model request/response logs containing student artifacts.

Use instructor-created reference artifacts and seeded faults for development and automated tests.

## Schema changes

Schema changes require:

1. a semantic-version decision;
2. updated valid and invalid examples;
3. migration behavior or an explicit incompatibility note;
4. tests for unknown/additional properties; and
5. client approval when the change affects course authoring or stored student artifacts.

## Definition of done

A feature is done only when implementation, tests, documentation, accessibility, privacy/security review, and client acceptance criteria are complete.
