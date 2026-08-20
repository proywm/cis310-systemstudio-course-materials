# Local Circuit Preflight Contracts

SystemStudio can run public, formative tests against a selected Digital `.dig` file before you submit in Canvas. These tests check observable behavior, not how you chose to build the circuit. They do not reveal a solution circuit and they are not a grade.

## How to run a preflight

1. Open **CIS 310 Home → Coursework and Final Presentation**.
2. Choose the implementation or final-presentation card.
3. Select **Run local circuit preflight**.
4. Choose the component contract and then its `.dig` file.
5. Read the complete pass/fail evidence in the SystemStudio output channel.
6. Fix the earliest mismatch, rerun, and preserve your own expected-versus-observed evidence.

## Public interface contracts

Use these exact top-level labels and widths for the subcircuit you want the automatic test to exercise. `C` is Digital's manual clock element label. Control precedence is reset, then load, then normal behavior.

| Contract | Inputs | Outputs | Behavior exercised |
|---|---|---|---|
| 4-bit load/reset register | `C` (clock), `LD` (1), `RST` (1), `D` (4) | `Q` (4) | reset, load, hold, replacement |
| 4-bit program counter | `C` (clock), `INC` (1), `LD` (1), `RST` (1), `D` (4) | `Q` (4) | reset, hold, increment, wraparound, explicit load |
| 4-bit-wide memory | `C` (clock), `CS` (1), `WE` (1), `Address` (4), `DataIn` (4) | `DataOut` (4) | write/read at multiple addresses and isolation between addresses |
| Four-register file | `C` (clock), `WE` (1), `WriteSel` (2), `WriteData` (4), `ReadSelA` (2), `ReadSelB` (2) | `ReadA` (4), `ReadB` (4) | selective writes, simultaneous independent reads, hold when write is disabled |
| 4-bit ALU | `S1` (1), `S0` (1), `Cin` (1), `A` (4), `B` (4) | `D` (4) | every required operation over all 16 × 16 input pairs, including modulo-16 overflow/underflow |

## Integrated 4-bit processor

The assignment specifies the processor components and 16-bit instruction assembly from four 4-bit memory reads, but it does not publish one universal opcode encoding or top-level port contract. Therefore, the extension does not pretend that one hidden black-box test can grade every valid processor design.

For Implementation 3 and the final presentation, add embedded Digital test cases that exercise the released ISA and program. At minimum, include evidence for reset, four-nibble fetch/IR assembly, sequential PC behavior, representative ALU/writeback behavior, memory behavior where used, and a taken/not-taken branch if branching is part of the released specification. SystemStudio runs those embedded tests with the unmodified Digital CLI and reports the actual output.

## Important boundary

A passing preflight means only that the selected file satisfied the named public contract or its own embedded tests. Canvas and instructor evaluation remain authoritative for architecture, documentation, explanation, released requirements, collaboration, deadlines, and scoring.
