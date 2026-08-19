# CIS 310 Reading–Video–Practice Alignment Audit

Last verified: August 19, 2026

This audit checks whether every pre-class readiness prompt and every bundled practice question can be answered from both an assigned open-book section and an assigned David Tarnoff/Intermation video. It does not infer coverage from a title alone.

## Verification method

1. The full text of each assigned [Tarnoff open-book chapter](https://faculty.etsu.edu/tarnoff/138292/) was checked for the named concept and exact section number.
2. The author-video captions/transcripts were checked for the actual explanation or worked example. The official [ETSU OER series](https://dc.etsu.edu/computer-organization-design-oer/) and [Intermation author channel](https://www.youtube.com/@Intermation) are the only video sources used.
3. Questions that went beyond both assigned sources were replaced; a nearby source was added only when it directly teaches the tested concept.
4. `PracticeQuestion.sourceMap` records the specific reading and video indexes for every question. `PreClassModule.readinessSources` does the same for each readiness prompt.
5. Automated tests fail if a prompt lacks either source type or if an index points outside its lecture module.

Caption text was used only for verification and is not redistributed in this repository.

## Verified map

| Lecture | Readiness and practice coverage | Assigned reading | Assigned author video |
|---|---|---|---|
| 1 | Digital signals; `1010₂ = A₁₆`; instruction decoder | Ch. 1 §§1.2–1.7; Ch. 2 §2.7; Ch. 15 §§15.1–15.4 | Ep 001; Ep 006; Ep 079 |
| 2 | Unsigned 8-bit range; two’s-complement −5; one-bit sum/carry | Ch. 2 §§2.3–2.5; Ch. 3 §§3.1–3.3; Ch. 8 §8.1 | Ep 004; Ep 014; Ep 012 |
| 3 | Canonical SOP; absorption; DeMorgan’s theorem | Ch. 5 §§5.1–5.7; Ch. 6 §§6.1–6.3 | Ep 034; Ep 036; Ep 033 |
| 4 | Gray-code adjacency; largest power-of-two groups; edge wraparound | Ch. 7 §§7.1–7.3 | Ep 040; Ep 041; Ep 042 |
| 5 | Combinational behavior; 2-to-4 decoder; 4-to-1 mux select bits | Ch. 5 §5.1; Ch. 8 §§8.3–8.6 | Ep 026; Ep 029; ETSU OER Episode 6.09 |
| 6 | Clocked state; D flip-flop; state-bit count; counter width; next-state inputs | Ch. 10 §§10.1–10.5; Ch. 11 §§11.1–11.2 | Ep 058; Ep 061; Ep 064 |
| 7 | Address width; decoding; memory organization/capacity | Ch. 12 §§12.2–12.3.4 | Ep 068 |
| 8 | Status/configuration/data registers; polling cost; timer-status polling | Ch. 15 §§15.9.1–15.9.2 | Ep 087, with Ep 086 for I/O context |
| 8 supplement | Memory-mapped I/O; interrupt advantage; DMA | Ch. 12 §12.4; Ch. 15 §§15.9.1–15.9.4 | Ep 087; Ep 088; Introduction to DMA |
| 9 | Hierarchy tradeoff; temporal/spatial locality; cache miss/block fetch | Ch. 13 §§13.1 and 13.4 | Ep 067; Ep 073 |
| 10 | ALU; control unit; instruction register | Ch. 15 §§15.2–15.6 | Ep 079 |
| 11 | Three-stage pipeline cycle count; throughput; taken-branch flush | Ch. 15 §15.8 | Ep 085 |
| 12 | AX/AH/AL; ESP; EIP; CALL return address; zero flag | Ch. 15 §15.2.5; Ch. 16 §§16.2.1–16.2.3; Ch. 17 §§17.4.1–17.4.3 | Ep 080; Ep 081; Ep 082; Ep 083 |

The extension distinguishes readiness sources from additional references during preparation. After a practice response, it shows only the reading(s) and video(s) mapped to that particular question, with the relevant focus visible in the button text. External PDFs and videos may open at their beginning, so these are source-level mappings rather than page- or timestamp-specific deep links.

## Corrections made by this audit

- Corrected hexadecimal from Chapter 2 §§2.1–2.5 to §2.7.
- Corrected adders from Chapter 8 §8.2 (seven-segment displays) to §8.1.
- Removed Chapter 9 from Lecture 10 because it does not teach the tested CPU/ALU/control concepts.
- Replaced unsupported build-chain, ISA/microarchitecture, disk-latency, RTL-notation, slowest-pipeline-stage, data-hazard, virtual-memory, heap, and generic debugging questions with source-supported questions.
- Reworded the I/O-register question to match the assigned material’s status, configuration/control, and data terminology.
- Replaced the inferred “status before input data” question with the timer-status polling example explicitly shown in the mapped sources.
- Added targeted author videos where a single general video did not cover all readiness or practice items.
- Narrowed module titles and focus statements so they no longer promise POS, don’t-care, demultiplexer, register, SRAM/DRAM, interrupt, RTL-notation, segment, or addressing coverage beyond the listed preparation sources.
- Added an independent blind-student review: all 13 readiness prompts and 42 of the original 43 practice questions were directly supported by both mapped source types; the one partial item was the polling question replaced above.

## Maintenance rule

Do not add a readiness or practice item by matching keywords or relying on a video title. Verify the claim in the book text and the video itself, add both source indexes, and run `npm test`. If either source does not teach the concept sufficiently, revise the item or assign a direct authoritative source.
