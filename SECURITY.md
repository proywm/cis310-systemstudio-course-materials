# Security Policy

## Reporting a vulnerability

During senior-design development, report security or privacy concerns privately to the project client, Probir Roy, at `probirr@umich.edu`. Do not open a public issue containing exploit details, credentials, student data, or private course materials.

## High-risk areas

- execution of student-controlled code;
- container and host-boundary configuration;
- construction of shell/process arguments;
- course-pack integrity and update delivery;
- webview content security policy and message validation;
- prompt injection through code, comments, filenames, and tool output;
- transmission of student code/evidence to an AI endpoint;
- hidden tests and instructor solution material; and
- help-packet redaction and sharing.

## Required defaults

- Disable executable functionality in untrusted workspaces.
- Run student artifacts inside a constrained environment.
- Deny network access unless a course operation explicitly requires it.
- Use fixed executables and validated argument arrays.
- Keep student artifacts local unless the user approves a disclosed external operation.
- Validate every AI response and never execute model-generated commands automatically.
- Store no secrets in the repository, course packs, logs, or prompts.
- Treat test-harness failures as infrastructure failures rather than student errors.

## Supported versions

No production release exists yet. Security support and disclosure timelines must be defined before a classroom pilot or public distribution.
