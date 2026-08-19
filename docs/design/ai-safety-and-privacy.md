# AI Safety, Academic Integrity, and Privacy

## Policy position

SystemStudio AI is a formative learning aid. It is not an autonomous instructor, assignment author, or grader. It must remain useful when the AI component is disabled.

This position directly responds to the underlying student need and to a documented trust risk: some evaluations criticized being redirected to generic ChatGPT instead of receiving instructor guidance. The product must therefore make instructor authority, evidence, and human escalation visible.

## Authority hierarchy

When sources disagree, the system uses this order:

1. instructor-authored assignment requirements and version notices;
2. instructor-authored rubric and tests;
3. captured compiler, test, or simulator evidence;
4. instructor-approved course resources;
5. deterministic feedback rules; and
6. AI-generated explanation.

The AI may explain higher-authority material but may not override it.

## Academic-integrity controls

- Default to progressive hints rather than complete solutions.
- Require the student to make an attempt before assignment-specific hints become available, unless the instructor configures otherwise.
- Use analogous examples rather than the active assignment's completed code or circuit.
- Allow the instructor to cap hint level by milestone.
- Display when a response is AI-generated and list its cited evidence/resources.
- Never label AI output as instructor feedback.
- Keep final grading outside the system.
- Include an instructor-configurable reflection prompt after a successful retry.
- Record hint level locally so a student can accurately disclose tool use when required by course policy.

## Evidence-grounding controls

Before rendering a technical AI response:

1. validate the response schema;
2. verify every evidence and resource identifier;
3. confirm that cited evidence belongs to the active run and course-pack version;
4. reject shell commands or code outside the allowed hint policy;
5. compare the requested and returned hint levels;
6. suppress diagnosis below the configured confidence threshold; and
7. provide a visible **Ask a human** path.

An evidence citation shows why the system reached a statement; it does not guarantee that the inference is correct. Accuracy must be measured against faculty-labeled cases.

## Prompt-injection controls

Student code, comments, filenames, test output, and free-text questions are untrusted data. They must not be concatenated into privileged system instructions.

- Use structured fields with explicit delimiters and size limits.
- Tell the model that artifact content is data, not instruction.
- Do not give the model tools that execute commands, alter files, change grades, or send messages.
- Do not place secrets, tokens, hidden tests, or complete solutions in the model context.
- Validate the response independently of the model.
- Test with malicious comments, filenames, compiler output, and processor labels.

## Data classification

| Data | Default location | External transmission | Retention |
|---|---|---|---|
| Course pack and public resources | Local/container | Not required | Versioned with project |
| Student code/design | Local workspace | Selected excerpts only with approval | Controlled by student/course policy |
| Compiler/test/simulation evidence | Local | Minimum required fields if AI is used | Local per activity; user can clear |
| Mastery/practice state | Local | None by default | User-resettable |
| AI request/response | Local record plus approved endpoint as required | Only after disclosure/consent | Defined by institutional/vendor policy |
| Help packet | Local preview | Only after student approval | Local audit copy configurable |
| Grade | LMS/instructor systems | Never handled by MVP | Not applicable |

## Required redaction

Before external transmission, remove or replace:

- student name and institutional identifier;
- email address;
- absolute home/workspace paths;
- hostnames, usernames, IP addresses, and tokens;
- repository credentials and environment variables;
- unrelated code and data;
- names of other students; and
- hidden tests or instructor-only solution material.

## Security controls

- Disable executable features in untrusted workspaces.
- Run student code in a constrained container with CPU, memory, time, filesystem, and network controls.
- Use fixed argument arrays rather than AI-generated shell strings.
- Verify course-pack and container integrity.
- Store credentials through approved secret storage, never course files or logs.
- Log security-relevant events without logging student content.
- Provide cancellation and clean recovery after runaway builds or simulations.
- Produce a software bill of materials and scan dependencies before release.

## Accessibility and equity

- Do not require a visual processor canvas as the only representation.
- Support keyboard navigation, focus order, ARIA labeling, screen-reader text, and non-color signal states.
- Provide captions/transcripts for video lessons and text equivalents for diagrams.
- Offer a remote or campus-lab fallback for students who cannot run containers locally.
- Keep the deterministic core available without a paid AI account.
- Avoid comparative dashboards or opaque mastery scores.

## Institutional review

Before a live student pilot:

1. obtain an institutional determination on whether the planned evaluation is research involving human participants;
2. complete applicable privacy, security, accessibility, and vendor reviews;
3. disclose what data is processed, where it is sent, and how long it is retained;
4. ensure that declining research participation does not affect course access or grades; and
5. separate instructional operations from research analysis wherever possible.

## Incident behavior

- **Potential answer leakage:** disable the affected hint path, preserve diagnostic metadata, and notify the course-pack maintainer.
- **Unsupported or harmful advice:** suppress the response, offer human escalation, and add the case to the offline benchmark after deidentification and approval.
- **Possible data exposure:** stop external transmission, preserve necessary security logs, follow university incident procedures, and inform affected parties through approved channels.
- **Test-harness defect:** mark results as infrastructure failure and do not attribute fault to the student.
