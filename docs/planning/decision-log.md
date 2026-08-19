# Architecture Decision Log

## ADR-001: One student-facing extension, multiple internal services

**Status:** Proposed

**Decision:** Present one VS Code extension while separating provisioning, execution, simulation, evidence, learning content, AI, and escalation behind explicit interfaces.

**Rationale:** A one-stop experience reduces context switching, while internal separation supports testing and prevents AI from becoming the authority for execution or course requirements.

## ADR-002: Provision tools in a Dev Container

**Status:** Proposed

**Decision:** Install course toolchains and libraries in a versioned Dev Container or approved remote equivalent. Detect missing host prerequisites and guide the student; do not silently install privileged host software.

**Rationale:** Reproducibility and cross-platform consistency are stronger when the toolchain is isolated from the host.

## ADR-003: Use a JSON-backed custom text editor for processor design

**Status:** Proposed

**Decision:** Store designs in a human-readable JSON format and use a VS Code custom text editor/webview as the visual projection.

**Rationale:** The design remains versionable and recoverable, while VS Code can retain standard save/undo/source-control behavior.

## ADR-004: Evidence before AI

**Status:** Proposed

**Decision:** Run deterministic environment checks, tests, and simulation first. Apply known feedback rules second. Consult AI only for bounded explanation and hint generation.

**Rationale:** Students need trustworthy diagnostic evidence. Deterministic sources are cheaper, testable, and less likely to fabricate behavior.

## ADR-005: No AI grading or automatic full solutions

**Status:** Proposed

**Decision:** Keep grading outside the system. Use instructor-configurable progressive hints and analogous examples, with human escalation for uncertainty.

**Rationale:** This protects instructor authority, academic integrity, and student trust.

## ADR-006: Local-first data handling

**Status:** Proposed

**Decision:** Store evidence, mastery, and help-packet drafts locally by default. Transmit only selected and redacted context through an approved endpoint after disclosure and consent.

**Rationale:** Data minimization reduces privacy risk and supports operation without a cloud service.

## ADR-007: Two workflows define MVP scope

**Status:** Proposed

**Decision:** Complete one CIS 450 C/xv6 workflow and one CIS 310 4-bit processor workflow before adding courses, dashboards, wider processors, HDL features, or LMS integration.

**Rationale:** The full vision is larger than one senior-design cycle. Two end-to-end workflows are substantial, testable, and directly grounded in the evaluation findings.

## ADR-008: Separate learning, perception, behavior, quality, and workload measures

**Status:** Proposed

**Decision:** Use parallel scored assignments for learning, questionnaires for student perceptions, telemetry for behavior/timing, blinded expert review for technical quality/safety, a scenario task for trust calibration, and active-minute staff logs for human workload.

**Rationale:** Satisfaction or self-reported confidence cannot establish learning, accuracy, timeliness, safety, or reduced workload. Distinct measures keep each claim tied to evidence that can support it.
