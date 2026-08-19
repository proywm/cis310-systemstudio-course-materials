# Technical Feasibility Research

## Conclusion

The one-stop experience is technically feasible as a VS Code extension backed by course containers and deterministic analysis services. It should be one product from the student's perspective, but it should not be one monolithic process internally.

The recommended architecture separates:

- the VS Code user interface;
- environment provisioning;
- build, test, and simulation adapters;
- course content and rubrics;
- evidence normalization;
- the AI explanation layer; and
- human escalation.

This separation makes the product testable, reduces model authority, and allows a course workflow to function even when the AI service is unavailable.

## Capability assessment

| Capability | Recommended implementation | Feasibility | Important constraint |
|---|---|---:|---|
| One-click course workspace | Generate/open a `devcontainer.json` course workspace and validate prerequisites | High | Docker/WSL or a remote runtime may require separate administrator-approved setup |
| Build/run/test commands | VS Code Task Provider using process execution where possible | High | Never interpolate untrusted model output into shell commands |
| Test display | VS Code Testing API plus a normalized evidence model | High | Tests must be instructor-authored and versioned |
| Visual processor canvas | VS Code custom text editor backed by a JSON design document and a webview | Medium | Limit MVP to a 4-bit educational processor and accessible keyboard alternatives |
| Processor simulation | Small internal engine or adapter to an approved existing simulator | Medium | Licensing, packaging, and cross-platform behavior must be reviewed before redistribution |
| Guided lessons | Webview or native tree view with versioned Markdown/JSON content | High | Prefer native VS Code controls when they meet the need; webviews add accessibility work |
| Evidence-grounded AI | Provider-neutral service boundary receiving approved context and normalized evidence | Medium | Accuracy, cost, privacy, availability, and prompt-injection controls require explicit tests |
| Human escalation | Local help-packet generator with user-controlled export | High | Student approval and data minimization are mandatory |

## Why Dev Containers

The official VS Code Dev Containers documentation describes containers as full-featured development environments configured by `devcontainer.json`. Tools, libraries, runtimes, settings, and extensions can be defined consistently while the student's files remain mounted into the environment. The open Development Container Specification also supports prebuilding and lifecycle commands.

Recommended design:

1. The extension checks whether a supported local or remote container runtime is reachable.
2. It creates a course workspace from a signed, versioned course pack.
3. The container provides compilers, Make, GDB, QEMU/xv6, assemblers, and test tools.
4. A preflight command verifies versions, executes a known program, and records structured evidence.
5. If the runtime itself is absent, the extension presents an approved guide or remote fallback; it does not silently make privileged host changes.

## Why a custom text editor for processor design

VS Code's Custom Editor API supports fully customized read/write editors implemented with webviews. For a text-backed format, `CustomTextEditorProvider` lets VS Code retain its normal text-document lifecycle and editing behavior.

Recommended design:

- Store a processor design as human-readable, versioned JSON.
- Render the JSON as an interactive schematic in a custom text editor.
- Route edits through VS Code workspace edits so save, undo, redo, and source control remain coherent.
- Provide a text view and keyboard-operable component list as an accessibility and recovery path.
- Keep simulation separate from rendering so the engine can be unit tested without VS Code.

## Build and test integration

VS Code Task Providers can detect workspace files and contribute build or execution tasks. The Testing API can discover tests and publish results in Test Explorer. Together, they provide a native route for `Build`, `Run`, `Check`, and `Explain` without recreating those interfaces in a custom webview.

Prefer `ProcessExecution` over a constructed shell string when arguments are known. This reduces quoting errors and command-injection exposure. Any assignment-specific command must come from a signed course pack, not from an AI response.

## Processor-simulator options

Two implementation paths should be prototyped before the October architecture decision:

### Option A: focused internal simulator

Implement only the components required for the reference 4-bit processor. Benefits include predictable evidence output and simple packaging. The risk is spending too much time reproducing existing circuit functionality.

### Option B: simulator adapter

The open-source **Digital** project is designed for educational logic circuits and includes tests, signal visualization, HDL import/export, and a remote TCP interface. It may be useful as an external engine or interoperability target. Before bundling or redistributing it, the team must review its license, packaging requirements, Java dependency, accessibility, and behavior on supported platforms.

The MVP decision should be based on a two-week spike measuring integration complexity, deterministic trace access, packaging, and testability.

## AI integration strategy

The core system should use a provider-neutral adapter rather than depend on one vendor-specific chat surface. Inputs should be limited to:

- the student's explicit question;
- selected code or processor elements;
- normalized compiler/test/simulation evidence;
- instructor-approved course excerpts; and
- the allowed hint level.

The response must conform to a structured contract containing the diagnosis, cited evidence identifiers, suggested concept, hint level, confidence, and escalation decision. Free-form text is rendered only after validation of this structure.

VS Code also exposes AI extensibility and language-model tool APIs, but those should be treated as an optional integration path rather than a requirement for the core product.

## Security feasibility

VS Code Workspace Trust exists because opening a workspace can lead extensions, tasks, or language tools to execute code. SystemStudio AI must declare limited support for untrusted workspaces and disable build, test, container, and AI-context collection commands until trust is granted. Student code must run in a constrained container with time, memory, filesystem, and network limits.

## Recommended baseline stack

- TypeScript extension host
- Native VS Code commands, Tasks, Testing API, diagnostics, and tree views
- React or lightweight TypeScript/HTML for the processor custom editor only
- JSON Schema for course packs, evidence, and processor documents
- Dev Container specification for course environments
- Containerized C/assembly/xv6 toolchain
- Pure simulation core or a separately licensed simulator adapter
- Provider-neutral AI adapter with a deterministic no-AI fallback
- Unit tests for pure modules and VS Code integration tests for extension behavior

## Primary references

- [VS Code Extension API](https://code.visualstudio.com/api/)
- [VS Code Custom Editor API](https://code.visualstudio.com/api/extension-guides/custom-editors)
- [VS Code Task Provider](https://code.visualstudio.com/api/extension-guides/task-provider)
- [VS Code Testing API](https://code.visualstudio.com/api/extension-guides/testing)
- [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [Development Container supporting tools and services](https://containers.dev/supporting.html)
- [VS Code Workspace Trust Extension Guide](https://code.visualstudio.com/api/extension-guides/workspace-trust)
- [VS Code webview UX guidance](https://code.visualstudio.com/api/ux-guidelines/webviews)
- [Digital logic designer and circuit simulator](https://github.com/hneemann/Digital)
