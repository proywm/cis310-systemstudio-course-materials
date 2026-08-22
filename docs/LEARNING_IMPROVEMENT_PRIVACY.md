# Learning-improvement data: dormant pre-IRB design

Status for this release: **disabled**.

The compiled institutional gate is `enabled: false`, its protocol identifier is blank, and its collection endpoint is blank. Students receive no research-consent prompt. The extension records no learning-improvement events and makes no learning-improvement network request. This cannot be enabled through VS Code settings.

Ordinary private course progress remains separate. Reading/video checkmarks, practice history, lab checkmarks, grade-planner values, and tutorial position continue to work locally and are not retrospectively copied if a later release enables the study.

## Proposed post-determination data

Only after institutional/IRB review, a new reviewed release may offer three separate opt-in categories:

- coarse technical setup outcome, platform family, architecture family, extension version, and course week;
- ungraded preparation, tutorial, practice, and guided-lab outcomes using allowlisted activity identifiers, answer option, correctness, confidence, hint use, attempt bucket, and duration bucket; and
- an optional fixed-choice helpfulness rating and reason.

The JSON payload excludes names, email addresses, UMIDs, IP addresses, Canvas identifiers or records, grades and grade-planner values, student files/code/circuits, paths, terminal output, logs, AI/FAQ conversations or prompts, credentials, exact timestamps, and stable student/device identifiers. The local queue is capped at 300 events. The future endpoint review must separately address ordinary HTTPS request metadata (including whether infrastructure logs retain a source IP).

No pre/post survey instrument or longitudinal linkage is active. Those require the approved research questions, instrument wording, recruitment/consent language, retention period, linkage method, and analysis plan.

## Student control in a future enabled release

Participation will not affect course access, AI help, grades, or instructor evaluation. Students may choose categories separately, preview the exact JSON, export it, explicitly approve each batch, withdraw, and delete the local queue. Nothing sends in the background. A destination must use HTTPS on an approved `umich.edu` host.

## Activation checklist

Do not change the gate until the PI has documented the institutional/IRB determination and approved protocol materials. Then:

1. freeze the event dictionary and survey instruments;
2. document recruitment, consent, data handling, access, retention, withdrawal, and analysis;
3. provision and security-review an approved U-M endpoint, including request-log minimization and retention;
4. enter the approved protocol identifier and endpoint in `extension/src/core/learningImprovement.ts`;
5. enable the compiled gate in a new reviewed release;
6. run unit, package-boundary, accessibility, and end-to-end consent/withdrawal tests; and
7. verify that declining participation produces no events or network traffic.
