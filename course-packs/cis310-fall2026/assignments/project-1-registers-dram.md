> **Active Fall 2026 implementation reference.** Use this document to build and test incrementally. The matching Canvas assignment is authoritative for dates, points, allowed collaboration, required files, demonstrations, and submission. **Submit in Canvas; SystemStudio does not submit for you.**

# Implementation 1: Registers and Processor Memories

This milestone establishes the storage and fetch components reused by the cumulative 4-bit processor. The processor has a **4-bit data path** but an **8-bit instruction word**. These widths serve different purposes: registers, ALU values, and data-memory words are 4 bits; the instruction register carries opcode and operand fields and is therefore 8 bits.

## Learning objectives

After this milestone, you should be able to:

- explain rising-edge storage, load/hold behavior, reset priority, and synchronous writes;
- build a reusable 4-bit register and 4-bit program counter;
- store one complete 8-bit instruction in an instruction register;
- distinguish 16-address × 8-bit **instruction memory** from 16-address × 4-bit **data memory**; and
- test each component from expected behavior rather than from appearance.

## 1. Required component contracts

Keep each component in a named subcircuit. Use the exact public port labels if you want SystemStudio to run its local preflight.

### 1.1 `Register4`

| Port | Width | Meaning |
|---|---:|---|
| `C` | 1 | Rising-edge clock |
| `LD` | 1 | Load `D` on the rising edge |
| `RST` | 1 | Load zero on the rising edge; has priority over `LD` |
| `D` | 4 | Next value when loading |
| `Q` | 4 | Stored value |

The next-state rule at a rising edge is: `RST ? 0 : LD ? D : Q`. There is no separate “store” control: a register always stores its current state, exposes `Q` for reading, and changes only when its clocked rule permits.

Test reset, load, hold while `D` changes, and replacement of a previously stored value.

### 1.2 `PC4`

| Port | Width | Meaning |
|---|---:|---|
| `C` | 1 | Rising-edge clock |
| `INC` | 1 | Increment modulo 16 |
| `LD` | 1 | Load explicit address `D` |
| `RST` | 1 | Load address zero |
| `D` | 4 | Explicit address for a future jump or test |
| `Q` | 4 | Current instruction address |

Use the precedence `RST`, then `LD`, then `INC`, then hold. Addition is modulo 16, so incrementing `1111` produces `0000`. The Fall 2026 base processor uses sequential fetch; `LD` is retained as a tested extension point, not evidence that a jump instruction is required.

### 1.3 `IR8`

The instruction register uses the same load/hold/reset rule as `Register4`, but `D` and `Q` are 8 bits. You may use one 8-bit register or two 4-bit registers loaded **on the same rising edge**. Do not fetch the high and low halves on different cycles when using the required 8-bit instruction memory.

Public ports: `C`, `LD`, `RST`, `D[7:0]`, and `Q[7:0]`.

### 1.4 `InstructionMemory16x8`

Instruction memory has `Address[3:0]` and `Instruction[7:0]`. It stores 16 complete instructions; the 4-bit PC addresses an instruction, not a byte or nibble. Use a Digital ROM or a memory held read-only during processor execution.

For the public preflight image, initialize addresses 0–5 to `95 A3 24 EE 7E 35` in hexadecimal and addresses 6–15 to `00`. The meaning of this program is defined in Implementation 3.

### 1.5 `DataMemory16x4`

| Port | Width | Meaning |
|---|---:|---|
| `C` | 1 | Rising-edge write clock |
| `CS` | 1 | Selects the memory |
| `WE` | 1 | Active-high write enable |
| `Address` | 4 | One of 16 data addresses |
| `DataIn` | 4 | Value written when `CS=1` and `WE=1` at the rising edge |
| `DataOut` | 4 | Selected stored value while the memory is enabled |

This is an educational addressable-memory abstraction. It does not model transistor-level DRAM refresh or timing. In the cumulative processor, it stores 4-bit data for `LOAD` and `STORE`; it is not the 8-bit instruction ROM.

Test two different addresses, readback, and a clock edge with `WE=0` that must not alter a stored word.

## 2. Build sequence

1. Build and test `Register4` before reusing it.
2. Build `PC4`; verify hold, load, reset, consecutive increments, and wraparound.
3. Build `IR8`; prove that both nibbles load together and remain stable while `LD=0`.
4. Build `InstructionMemory16x8`; verify all 16 addresses and preserve the hexadecimal initialization table.
5. Build `DataMemory16x4`; verify clocked writes and address isolation.
6. Create a small fetch harness: connect `PC4.Q` to instruction-memory `Address`, connect `Instruction` to `IR8.D`, assert `INC` and `IR.LD` during a fetch edge, and confirm that the IR captures the old PC’s instruction while the PC advances for the next fetch.

## 3. Evidence to preserve

- a labeled circuit or block diagram for every subcircuit;
- an expected-versus-observed table that includes edge number and control inputs;
- evidence for register hold, PC wraparound, both memories, and one complete fetch;
- an explanation of why the instruction memory is 8 bits wide while the processor data path remains 4 bits; and
- the exact files and screenshots required by the current Canvas assignment.

## 4. Local formative preflight

Open **Coursework and Final Presentation → Run local circuit preflight**. Run the public contracts for `Register4`, `PC4`, `IR8`, `InstructionMemory16x8`, and `DataMemory16x4`. Exact labels, widths, program values, and edge rules are listed in [Local Circuit Preflight Contracts](LOCAL_CIRCUIT_PREFLIGHT.md).

A pass is private formative evidence only. It is not a grade, does not inspect the quality of your design or explanation, and does not submit anything. Open the current Canvas item before packaging your work and confirm its submission receipt afterward.
