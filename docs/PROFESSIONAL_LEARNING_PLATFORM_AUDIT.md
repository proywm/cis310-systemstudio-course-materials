# Professional learning-experience audit

Reviewed 2026-08-21 against the publicly advertised capabilities common to mature self-paced learning platforms. This is an evidence audit, not a marketing claim. Canvas remains the course system of record.

## Feature review

| Professional capability | CIS 310 implementation | Status and evidence |
|---|---|---|
| Clear first action | **Start Here** leads with one setup/repair workflow, next preparation, short practice, Orbit, Canvas, and coursework | Complete; `extension/src/statusTree.ts` |
| Low-friction setup | Digital is checksum-verified in extension storage; Windows/macOS use pinned Docker environments for embedded Digital and actual NASM/GDB; readiness is declared only after verification | Complete inside the extension's authority. Docker Desktop/Engine, licensing, virtualization, and administrator approval remain an explicit host handoff; `fullDigitalRuntime.ts`, `nativeAssemblyManager.ts` |
| Setup coaching | Every guided-setup or embedded-Digital failure offers a bounded Orbit prompt explaining host versus container requirements and one verifiable next step | Complete; `extension.ts`, `fullDigitalEditor.ts` |
| Modular learning path | Thirteen visible modules join objectives, accessible explanation, mapped open-book sections, author videos, presentation archive, questions, and hands-on work | Complete; module-navigation and course-pack tests |
| Text and video instruction | Primary accessible HTML plus mapped open textbook and verified author videos | Complete at lesson level. Questions have text explanations; bespoke video explanations for every question are not claimed |
| Retrieval practice | Eight-question module banks, five-question sessions, explanations, confidence, saved questions, due review, and topic analytics | Complete; practice tests and Learning Dashboard |
| Personalized continuation | Next incomplete module, due/saved review, and local confidence/miss indicators guide the next action | Complete locally; no opaque mastery claim |
| Hands-on application | Seven guided circuits, seven actual NASM labs, embedded upstream Digital, GDB registers/flags/stack/memory/disassembly, and student-side unit/preflight checks | Complete for formative preparation; Canvas rubric remains authoritative |
| Learning coach | Student-account Copilot coach, optional published/indexed U-M tutor route, deterministic offline FAQ, and attempt-first graded-work guardrails | Complete with an availability boundary: no instructor API key is bundled and the U-M course tutor is not claimed ready until published/indexed |
| Human help | Structured pre-class question handoff and Canvas/instructor routes | Complete as a handoff; no response-time promise |
| Study schedule | Dated Fall 2026 M/W preparation calendar and export, with Canvas authority for changes | Complete |
| Progress and confidence | Local module, practice, lab, saved/due, and coursework indicators explicitly separated from instructor/GSI Canvas evaluation | Complete and privacy-preserving |
| Grade planning | Manual Canvas-score entry, two-lowest-quiz handling from the syllabus, transparent calculation, and non-official warning | Complete |
| Accessibility | Semantic/reflowable HTML, keyboard and focus behavior, reduced motion, theme/high-contrast support, and a disclosed screen-reader boundary for streamed Swing Digital | Strong; physical assistive-technology and Canvas-theme review remains an instructor launch check |
| Cross-platform confidence | Deterministic tests and packaged Extension Host checks on Windows, macOS, and Ubuntu; actual toolchain/container smokes on supported CI | Strong. A hosted runner cannot prove an individual student's Docker Desktop, firmware virtualization, assistive technology, or campus-device policy |
| Mobile/offline learning | Course HTML/PDF and local practice are packaged for desktop VS Code | Partial: there is no mobile app; Canvas is the mobile route |
| Instructor analytics | Official grades and submissions stay in Canvas; local learning state is not uploaded | Intentionally not duplicated, preserving privacy and avoiding a shadow gradebook |

## Release judgment

The extension now meets the professional bar for a desktop, course-specific learning environment: coherent onboarding, source-mapped instruction, active practice, hands-on execution, guarded help, local analytics, accessibility controls, and reproducible release tests operate as one workflow.

It must not be described as a universal commercial learning platform or guaranteed zero-install product. The remaining launch gates are operational: validate the packaged VSIX on representative student-owned Windows/macOS devices with Docker Desktop running, publish/index the optional U-M tutor before advertising it, and complete assistive-technology checks in the actual Canvas theme.

