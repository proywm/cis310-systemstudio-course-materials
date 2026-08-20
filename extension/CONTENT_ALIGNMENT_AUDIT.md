# CIS 310 Reading–Video–Lecture–Practice Alignment Audit

Last verified: August 20, 2026

## Scope and method

This audit covers all 13 Fall 2026 modules, 13 novice-facing HTML lesson texts, 104 formative questions, seven circuit labs, and seven actual NASM/GDB labs. It does not infer coverage from a title.

1. All 14 assigned Tarnoff chapter PDFs and the two added OSTEP chapter PDFs were checked against the named concept and bounded section.
2. Text was extracted from all 13 packaged lecture PDFs and checked against the slide locators stored with questions.
3. Captions/transcripts were retrieved and read for all 29 unique mapped author videos. The official [ETSU OER series](https://dc.etsu.edu/computer-organization-design-oer/) and Intermation channel are the author-video sources. Caption text was used for verification and is not redistributed.
4. Every question records at least one direct evidence path: reading index, video index, or legacy lecture-slide number. An item may rely on verified slide evidence when the book/video does not teach the course-specific framing; the interface says so instead of inventing a source, and the resulting explanation appears in the primary HTML lecture.
5. Automated tests require exactly eight questions per module, valid source indexes, valid slide numbers, a full answer explanation, a takeaway, all five selected-response Bloom levels, and balanced answer positions.
6. Every HTML lesson was written from the extracted lecture text and verified reading/video map. Tests require at least 500 words, four objectives and key terms, three explanatory sections, two worked examples, three self-checks, three bounded tutor prompts, explicit slide evidence, and a scope boundary.

## Accessible lesson-text alternative

Each module now begins with a responsive HTML lecture rather than requiring a student to infer meaning from a visual PDF. The lecture uses one descriptive heading hierarchy, plain-language definitions, speakable notation, sequenced examples, source links with descriptive labels, previous/next navigation, and native keyboard-operable controls. It does not claim that the original presentation PDF is independently remediated; the PDF remains available only as an optional visual archive.

The implementation follows the instructor-supplied UM-Dearborn digital-accessibility course export and current U-M guidance summarized in [`ACCESSIBILITY_IMPLEMENTATION.md`](ACCESSIBILITY_IMPLEMENTATION.md). Automated structural checks supplement, but do not replace, keyboard, screen-reader, zoom/reflow, contrast, and caption review with disabled students and accessibility specialists.

## Depth and prerequisite decisions

- **Lecture 1:** source-to-hardware translation, abstraction, digital representation, binary, and hexadecimal remain. “Basic CPU Architecture and Instruction Execution” was removed from Lecture 1 because its 20-minute transcript assumes assembly language, fixed-width instructions, logical shifts, registers, buses, caches, and addressing. It is retained in Lecture 10 after those foundations have been introduced.
- **Lecture 2:** Chapter 5 §§5.2–5.3 and the official ETSU logic-gate/truth-table episodes were added because the earlier source set did not directly support all Boolean and truth-table questions.
- **Lecture 8:** OSTEP’s I/O Devices chapter and the interrupts episode were added to support device protocols, polling, interrupts, and DMA without stretching Tarnoff subsection claims.
- **Lecture 8 supplement:** only memory-mapped I/O, polling evidence, interrupt setup, DMA, and volatile/persistent-memory foundations are core. Protocol detail, signal integrity, priority inversion, cache coherence, and emerging-memory content is enrichment.
- **Lecture 11:** slides 1–44 are core pipeline preparation. Multiple issue and speculation on slides 45–58 are enrichment, not readiness requirements.
- **Lecture 12:** OSTEP’s Address Spaces chapter was added because code/data/heap/stack and address-space abstraction were present in the lecture but not sufficiently supported by the earlier reading list.

## Verified module map

| Module | Core evidence and boundary | Question levels | Hands-on |
|---|---|---|---|
| 1 · Introduction and data representation | Tarnoff Ch. 1 §§1.1–1.5; Ch. 2 §§2.1–2.4, 2.7; binary/hex videos; lecture slides 4–23 | Remember → Analyze | None; tool use is not required before concepts |
| 2 · Signed data, Boolean logic, and adders | Ch. 2 §§2.3–2.5; Ch. 3 §§3.1–3.3; Ch. 5 §§5.2–5.3; Ch. 8 §8.1; two’s-complement, addition, gate, and truth-table videos | Remember → Analyze | Required half-adder build |
| 3 · Boolean algebra and simplification | Ch. 5 §§5.1–5.7; Ch. 6 §§6.1–6.3; simplification, SOP, and DeMorgan videos | Understand → Evaluate | Required Boolean-path build |
| 4 · Karnaugh maps | Ch. 7 §§7.1–7.3; K-map introduction, grouping, and four-variable videos | Remember → Evaluate | Required minimized-circuit implementation |
| 5 · Combinational logic | Ch. 5 §5.1; Ch. 8 §§8.3–8.6; combinational, decoder, and multiplexer videos | Remember → Evaluate | Required multiplexer build |
| 6 · Sequential logic | Ch. 10 §§10.1–10.5; Ch. 11 §§11.1–11.2; timing, counter, and state-machine videos | Remember → Analyze | Required state-bit build |
| 7 · Memory organization and buses | Ch. 12 §§12.2–12.3.4; memory-device organization video | Remember → Evaluate | Required address-decoder build |
| 8 · Memory-mapped I/O and polling | Ch. 15 §§15.9.1–15.9.3; OSTEP I/O Devices §36; I/O, polling, and interrupt videos | Understand → Evaluate | No premature assembly requirement |
| 9 · Detailed I/O and memory | Ch. 12 §12.4; Ch. 15 §§15.9.1–15.9.4; polling, interrupt, and DMA videos; advanced slides marked enrichment | Remember → Evaluate | No additional required artifact |
| 10 · Memory hierarchy and cache | Ch. 13 §§13.1, 13.4; hierarchy/cache videos | Remember → Evaluate | No circuit substitute for cache behavior |
| 11 · CPU components and execution | Ch. 15 §§15.2–15.6; CPU transcript; lecture register/RTL/control evidence | Remember → Analyze | Required ALU-slice build |
| 12 · Pipelining | Ch. 15 §15.8; pipeline video; core slides 1–44 | Remember → Evaluate | No reduced pipeline simulator presented as hardware |
| 13 · x86 and assembly | Ch. 15 §15.2.5; Ch. 16 §§16.2.1–16.2.3; Ch. 17 §§17.1–17.4.3; OSTEP Address Spaces §13; register/stack/function/flags videos | Remember → Evaluate | Required register/arithmetic trace plus four optional traces |

## Assessment structure

- Each module has **eight** questions. Five distinct attempts form the readiness checkpoint; completing all eight provides the broader confidence set.
- The selected-response bank spans **Remember, Understand, Apply, Analyze, and Evaluate**. **Create** is assessed through guided circuit construction and assembly-state work because selecting an option is not credible evidence of creating an artifact.
- Answer positions are deterministically balanced across the 104-item bank (26 in each position) to remove an authoring-order cue.
- Every response reveals the correct answer, an explanation and justification, a concise takeaway, mapped source buttons, and lecture-slide locators where available.
- These are formative questions, not copied homework or project answers. Required/optional labs use prerequisite or analogous artifacts and keep Canvas as the authority for graded work.

## Maintenance rule

Do not add a lesson claim, question, or lab by keyword matching. Read the bounded source text, inspect the lecture slide, and read the video transcript. Record only evidence that directly teaches the stated concept or tested reasoning. If the current sources are insufficient, narrow the explanation/item or add a direct authoritative open source. Run `npm test`, the manifest verifier, the packaged VSIX smoke checks, an accessibility review, and an instructor content review before classroom release.
