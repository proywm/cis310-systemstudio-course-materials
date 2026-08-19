# Security Policy

## Reporting a vulnerability

Report security or privacy concerns privately to the course instructor, Probir Roy, at `probirr@umich.edu`. Do not open an issue containing exploit details, credentials, student data, or private course materials.

## High-risk areas

- execution of student-controlled code;
- construction of shell/process arguments;
- course-pack integrity and update delivery;
- webview content security policy and message validation;
- hidden tests and instructor solution material; and
- webview message validation and local helper privacy.

## Required defaults

- Disable executable functionality in untrusted workspaces.
- Run student artifacts inside a constrained or bounded environment.
- Deny network access unless a course operation explicitly requires it.
- Use fixed executables and validated argument arrays.
- Keep student artifacts local unless the user approves a disclosed external operation.
- Store no secrets in the repository, course packs, logs, or prompts.
- Treat test-harness failures as infrastructure failures rather than student errors.

## Supported versions

The current Fall 2026 course release is supported. Students should install the newest release and report security or privacy problems promptly.
