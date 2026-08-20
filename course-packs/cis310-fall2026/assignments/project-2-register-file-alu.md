> **Active Fall 2026 implementation reference.** Use this document to build and test incrementally. The matching Canvas assignment is authoritative for dates, points, allowed collaboration, required files, demonstrations, and submission. **Submit in Canvas; SystemStudio does not submit for you.**

# Implementation 2: Four-Register File and 4-bit ALU

This milestone builds the processor’s reusable computation path: two register operands are read, the ALU computes a 4-bit result, and one selected register can receive a result on a later rising edge.

## Learning objectives

- implement a four-register × 4-bit register file with two independent read ports and one synchronous write port;
- distinguish a register address from register data;
- implement and verify all eight published ALU control cases;
- reason about modulo-16 overflow and underflow; and
- connect observable behavior to the interface used by the cumulative processor.

## 1. Register-file contract

| Port | Width | Meaning |
|---|---:|---|
| `C` | 1 | Rising-edge write clock |
| `WE` | 1 | Write enable |
| `WriteSel` | 2 | Destination register `R0`–`R3` |
| `WriteData` | 4 | Value written on an enabled rising edge |
| `ReadSelA` | 2 | Register selected for `ReadA` |
| `ReadSelB` | 2 | Register selected for `ReadB` |
| `ReadA` | 4 | First combinational read result |
| `ReadB` | 4 | Second combinational read result |

Instantiate four tested `Register4` storage elements from Implementation 1. Decode `WriteSel` into four one-hot destination selects and combine each with the single `WE` signal. Do **not** introduce an unexplained eight-bit “per-register control word”; it is not part of the processor interface. Both read ports are independent multiplexers and may select the same register.

At a rising edge, exactly the selected register changes when `WE=1`; no register changes when `WE=0`. Read selection is combinational: changing `ReadSelA` or `ReadSelB` changes the corresponding output without a write edge.

## 2. ALU contract

The ALU has `A[3:0]`, `B[3:0]`, one-bit controls `S1`, `S0`, `Cin`, and output `D[3:0]`. Results wrap modulo 16.

| `S1 S0 Cin` | Required result `D` | Meaning |
|:---:|---|---|
| `000` | `A + B` | Add |
| `001` | `A + B + 1` | Add with a fixed carry-in of 1 |
| `010` | `A + NOT(B)` = `A - B - 1` modulo 16 | Subtract with borrow-in 1 |
| `011` | `A + NOT(B) + 1` = `A - B` modulo 16 | Subtract |
| `100` | `A` | Transfer A |
| `101` | `A + 1` | Increment A |
| `110` | `A - 1` | Decrement A |
| `111` | `A` | Transfer A through the all-ones-plus-carry path |

`ADDC` in the instructional ISA uses control `001`; it adds the literal carry-in `1`. The base processor does not retain a carry flag between instructions. If you expose carry or zero as optional evidence, define their meaning separately and do not make them an undeclared input to the required result.

An implementation may select `B`, `NOT(B)`, zero, or all ones as the adder’s second operand and then apply `Cin`. However, the public test checks only the specified input/output behavior, not a required internal topology.

## 3. Build and test sequence

1. Write a register-file test table before wiring the four-register subcircuit.
2. Write distinct values to all four registers and verify both read ports in different orders.
3. Hold `WE=0`, change `WriteData`, pulse the clock, and prove that no value changed.
4. Build the ALU and verify boundary cases such as `15+1→0`, `0-1→15`, and `3-5→14`.
5. Run every ALU control with several operand pairs, then run the exhaustive public suite.
6. Integrate register-file outputs with `ALU.A` and `ALU.B`; route `ALU.D` to `WriteData`; keep `WE=0` while inspecting a result, then assert it only for the intended write edge.

## 4. Evidence to preserve

- labeled register-file and ALU interfaces;
- a write/read table proving destination selection and two independent read ports;
- expected and observed ALU results for all eight controls, including wraparound;
- one complete read → compute → writeback → read-again sequence; and
- the current Canvas-required files, report, and screenshots.

## 5. Local formative preflight

Open **Coursework and Final Presentation → Run local circuit preflight**. The register-file suite checks selective writes, write-disable behavior, and both read ports. The ALU suite checks all eight controls over all 256 operand pairs—2,048 vectors. See [Local Circuit Preflight Contracts](LOCAL_CIRCUIT_PREFLIGHT.md).

Passing is private practice evidence only. It is not a grade, does not certify the internal architecture or report, and does not submit work to Canvas.
