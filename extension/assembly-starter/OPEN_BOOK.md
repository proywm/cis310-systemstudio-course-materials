<!-- systemstudio-open-assembly-book: 0.20 -->
# Open NASM Reading Map

Paul A. Carter’s [*PC Assembly Language*](https://pacman128.github.io/pcasm/)
is the open 32-bit NASM reference. Its source is licensed CC BY-NC-SA 4.0.
The original PDF is untagged, so SystemStudio’s structured HTML lesson is the
primary accessible introduction; use these focused book sections as supporting
detail.

| Course focus | Carter sections | Workbench program |
|---|---|---|
| IA-32 registers, source layout, build pipeline | 1.2.5, 1.3, 1.4 | `RegisterArithmetic.asm` |
| Integer representation and flags | 2.1 | `FlagsBranch.asm` |
| Comparisons, branches, loops | 2.2–2.3 | `FlagsBranch.asm`, `LoopSum.asm` |
| Stack, calls, and calling conventions | 4.2–4.5 | `StackCall.asm` |
| Recursion | 4.8.1 | `BinarySearchRecursive.asm` |
| Arrays and indirect addressing | 5.1 | all three search programs |

Use the [official NASM manual](https://www.nasm.us/doc/) for precise syntax.
Do not treat a reference-manual example as a current assignment requirement;
Canvas is authoritative.
