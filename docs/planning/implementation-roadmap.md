# Implementation Roadmap

## Delivery frame

- Period: September 2026--April 2027
- Team: 3--4 interdisciplinary students
- Total effort target: 600--800 hours
- Client meetings: at least biweekly
- Method: iterative delivery with one vertical slice before expanding scope

## Work allocation

| Workstream | Estimated hours |
|---|---:|
| Discovery, requirements, UX research, and architecture | 70 |
| Extension shell and environment provisioning | 145 |
| Build/test/simulation adapters and evidence model | 130 |
| 4-bit processor editor and simulator integration | 125 |
| Guided practice, AI adapter, validator, and escalation | 105 |
| Security, accessibility, integration, and cross-platform testing | 95 |
| Documentation, deployment, evaluation, and final demonstration | 50 |
| **Planned total** | **720** |

The allocation is a planning baseline, not an individual workload contract. Scope should be reduced before quality gates are relaxed.

## Milestones

### September 2026: discovery and definition

- Confirm reference CIS 450 and CIS 310 activities.
- Interview client and representative users using non-sensitive examples.
- Validate goals, non-goals, data flows, and acceptance criteria.
- Create clickable UX prototype and threat model.
- Finalize repository conventions and continuous integration.

**Exit:** client-approved requirements, architecture, privacy boundary, and test strategy.

### October 2026: vertical technical spikes

- Build a minimal VS Code command and view.
- Open a basic Dev Container and execute a known task.
- Publish one synthetic test result through the Testing API.
- Open/save a JSON-backed custom processor editor.
- Compare focused internal simulation with an adapter to an existing simulator.
- Exercise one structured AI request/response with validation and no file mutation.

**Exit:** architecture decision record and an end-to-end spike from artifact to evidence to displayed hint.

### November--December 2026: CIS 450 foundation

- Implement environment detection and preflight.
- Add controlled build/run/test tasks.
- Normalize compiler, test, and runtime evidence.
- Complete the Lab 0/reference C workflow.
- Add first micro-lessons and deterministic messages.
- Test Windows, macOS, Linux, and remote fallback paths.

**Exit:** a new user can validate the environment and complete the first reference workflow without AI.

### January 2027: processor model and simulation

- Finalize processor JSON schema.
- Implement visual component creation, connections, save/undo/redo, and text alternative.
- Integrate deterministic simulation.
- Add component and integration tests with traces.

**Exit:** reference 4-bit processor and seeded faults produce reproducible evidence.

### February 2027: guided learning and AI coach

- Complete at least ten micro-lessons.
- Implement readiness mapping and mastery state.
- Add progressive hint policy and structured response validation.
- Implement deterministic no-AI fallback.
- Implement help-packet preview and redaction.

**Exit:** seeded faults produce the approved hint/escalation sequence without full-solution leakage.

### March 2027: hardening and evaluation

- Run threat, prompt-injection, privacy, accessibility, and dependency tests.
- Complete expert correctness review.
- Run synthetic-task usability sessions.
- Fix high-severity issues and document known limitations.
- Package VSIX and prebuilt container candidate.

**Exit:** release-candidate quality gates met or remaining gaps explicitly accepted by the client.

### April 2027: final delivery

- Demonstrate the two end-to-end workflows.
- Deliver source, VSIX, course packs, schemas, container, tests, and documentation.
- Present evaluation results without overclaiming.
- Transfer maintenance knowledge.
- Obtain client product-evaluation letter.

## Suggested team roles

| Role | Primary responsibilities |
|---|---|
| Extension and UX lead | VS Code integration, commands/views, accessibility, custom editor shell |
| Systems/platform lead | Dev Containers, toolchains, process execution, sandboxing, cross-platform setup |
| Simulation/evidence lead | Processor model, simulation, test adapters, evidence normalization |
| Learning/AI/quality lead | Micro-lessons, hint policy, AI adapter/validator, privacy, evaluation, CI |

For a three-person team, combine the third and fourth roles and reduce stretch scope.

## Quality gates

The release candidate must demonstrate:

- a one-command guided setup after a supported runtime is present;
- complete deterministic workflows when AI is unavailable;
- correct seeded-fault evidence on all supported environments;
- blocked invalid citations and disallowed answer leakage;
- workspace-trust enforcement and constrained execution;
- keyboard and screen-reader completion of critical workflows;
- student-controlled help-packet export; and
- reproducible build and deployment documentation.

## Risk register

| Risk | Probability | Impact | Mitigation / trigger |
|---|---:|---:|---|
| Scope too broad | High | High | Lock two reference workflows; move dashboards and additional courses to stretch |
| Container runtime unavailable | Medium | High | Document remote/campus fallback; test early on supported machines |
| Simulator integration too costly | Medium | High | Two-week spike; choose focused internal engine if adapter cannot expose deterministic traces |
| AI hallucination or answer leakage | High | High | Evidence schema, response validation, hint caps, offline benchmark, human escalation |
| Assignment/test defect blamed on student | Medium | High | Separate infrastructure/test-harness status and label unknown cases |
| Student data exposure | Medium | High | Local default, redaction, consent, approved endpoint, no raw data in research repository |
| Webview accessibility gaps | Medium | High | Native controls where possible, keyboard/text alternative, early accessibility testing |
| Cross-platform inconsistency | High | Medium | Prebuilt container, platform matrix, remote fallback, weekly automated smoke tests |
| Client feedback delay | Low | High | Fixed biweekly meeting, written decisions, named backup contact if necessary |
| Dependence on one AI vendor | Medium | Medium | Provider-neutral adapter and deterministic no-AI core |

## Stretch goals

- additional CIS 310/450 course packs;
- instructor dashboard with approved deidentified aggregation;
- HDL export/import;
- additional processor widths;
- LMS integration;
- remote collaborative debugging; and
- longitudinal mastery scheduling.

Stretch work begins only after the two reference workflows meet their acceptance criteria.
