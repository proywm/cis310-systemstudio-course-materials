# CIS 310 circuit-preflight validation

Validated August 20, 2026 with the checksum-pinned Digital 0.31 application used by SystemStudio.

## What was validated

The public preflight generator in `extension/src/core/circuitPreflight.ts` was exported to standalone Digital `Testcase` harnesses. Independently constructed reference circuits were kept outside the course repository so that working assignment solutions are not distributed to students.

| Public contract | Independent implementation | Result |
|---|---|---|
| 4-bit load/reset register | Register, two multiplexers, reset constant | Passed 5/5 vectors |
| 4-bit program counter | Register, incrementer, prioritized multiplexers | Passed 9/9 vectors, including modulo-16 wraparound |
| 8-bit instruction register | 8-bit register with prioritized reset/load/hold | Passed 5/5 vectors |
| 16-address × 8-bit instruction memory | ROM containing the published program | Passed 16/16 address checks |
| 16-address × 4-bit memory | Dual-access RAM with chip-select/write-enable control | Passed 7/7 vectors |
| Four-register × 4-bit register file | Independent dual-read/single-write register-file implementation | Passed 6/6 vectors |
| 4-bit ALU | Independent ROM oracle generated directly from the published operation table | Passed all 2,048 input combinations |

A complete independent processor was then implemented with a 4-bit PC/register file/ALU/data memory, 8-bit instruction memory/register, and four-state non-pipelined controller. Digital 0.31 passed the embedded 25-vector suite for the program `95 A3 24 EE 7E 35`: two immediate loads, addition, data-memory store/load, and subtraction. The final architectural state was `PC=6`, `R1=5`, `R2=8`, `R3=3`, and data-memory address 14 equal to 8. The same vectors are now exported as the public integrated preflight.

The retained instructor-only designs and deterministic generator are under `/home/user/tenureRef/build/private/cis310-preflight-validation`. They are intentionally excluded from the student repository.

## Defect found during independent validation

The first validation run caught a reversed `ReadA`/`ReadB` expected result in the final register-file vector. The public contract was corrected and all suites were regenerated and rerun. This was a test-harness defect, not a change made to accommodate a failing reference implementation.

## Reproduction

Export the public harnesses without exporting any solution circuit:

```sh
cd extension
npm run export:preflights -- /path/to/temporary/harnesses
```

Then use Digital's official CLI against an independently implemented student-interface circuit:

```sh
java -cp /path/to/Digital.jar CLI test \
  -circ /path/to/independent-circuit.dig \
  -tests /path/to/temporary/harnesses/register-4.dig \
  -verbose
```

The extension runs the same official CLI command locally. A passing local preflight is formative evidence only; it is not a Canvas submission or instructor grade and does not assess report quality, architecture, explanation, collaboration, or any unpublished rubric criterion.
