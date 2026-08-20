> **Active Fall 2026 implementation reference.** Use this document to build and test incrementally. The matching Canvas assignment is authoritative for dates, points, allowed collaboration, required files, demonstrations, and submission. **Submit in Canvas; SystemStudio does not submit for you.**

# Implementation 3: Cumulative 4-bit Processor

Build one working multicycle processor from the components tested in Implementations 1 and 2. It is a **4-bit processor** because its general-purpose registers, ALU, and data-memory words are 4 bits. Its instruction word is 8 bits so one instruction can contain an opcode, register field, and operand field without turning the arithmetic data path into 8 bits.

## 1. Required architecture

| Component | Required width/role |
|---|---|
| Program counter | 4 bits; addresses one of 16 instructions |
| Instruction memory | 16 addresses × 8 bits; one complete instruction per address |
| Instruction register | 8 bits; loads the complete instruction on one fetch edge |
| Register file | Four registers × 4 bits; two reads and one write |
| ALU | 4-bit `A`, `B`, and `D`; control table from Implementation 2 |
| Data memory | 16 addresses × 4 bits; used by `LOAD` and `STORE` |
| Control unit | Four-state multicycle controller |

This is **not a pipeline**: only one instruction is active and no stages from different instructions overlap.

## 2. Instruction-set contract

Bit positions are written from most significant to least significant.

| Opcode/type | Encoding | Operation |
|---|---|---|
| R-type | `00 dd ss ff` | Apply ALU function `ff` to `R[dd]` and `R[ss]`; write result to `R[dd]` |
| `LOAD` | `01 dd aaaa` | `R[dd] ← DataMemory[aaaa]` |
| `LDI` | `10 dd iiii` | `R[dd] ← iiii` |
| `STORE` | `11 ss aaaa` | `DataMemory[aaaa] ← R[ss]` |

Register codes are `00=R0`, `01=R1`, `10=R2`, and `11=R3`.

For R-type instructions, `ff` maps to the ALU controls:

| `ff` | Mnemonic | ALU control | Effect |
|:---:|---|:---:|---|
| `00` | `ADD Rdd,Rss` | `000` | `R[dd] ← R[dd] + R[ss]` |
| `01` | `SUB Rdd,Rss` | `011` | `R[dd] ← R[dd] - R[ss]` |
| `10` | `ADDC Rdd,Rss` | `001` | `R[dd] ← R[dd] + R[ss] + 1` |
| `11` | `PASS Rdd` | `100` | `R[dd] ← R[dd]`; `ss` is ignored |

All arithmetic wraps modulo 16. The base ISA has no branch, jump, halt, or retained status flag. Do not claim those instructions work unless Canvas explicitly releases an extension with its encoding and tests.

## 3. Four-state control sequence

Expose `State[1:0]` for the public preflight: `FETCH=00`, `DECODE=01`, `EXECUTE=10`, and `WRITEBACK=11`.

| State | Required actions before/at the next rising edge |
|---|---|
| `FETCH` | Read `InstructionMemory[PC]`; assert `IR_LD` and `PC_INC`. On the edge, the IR captures the instruction and PC advances modulo 16. |
| `DECODE` | Interpret opcode/register/operand fields; select register-file read addresses; do not write architectural state. |
| `EXECUTE` | Produce the ALU result, immediate, or data-memory read. For `STORE` only, assert `DMemWE` so the selected data word is written on the edge leaving this state. |
| `WRITEBACK` | For R-type, `LOAD`, and `LDI`, select the correct writeback source and assert `RFWE`; the register changes on the edge returning to `FETCH`. `STORE` does not write a register. |

Reset must place `State=FETCH` and `PC=0`. Resetting other storage to zero is recommended for reproducible evidence. Gate writes by state: `DMemWE` may be 1 only for `STORE` during `EXECUTE`; `RFWE` may be 1 only for R-type/`LOAD`/`LDI` during `WRITEBACK`.

## 4. Datapath connections

1. Connect `PC` to instruction-memory `Address`; connect its 8-bit output to `IR.D`.
2. Decode `IR[7:6]` as opcode and `IR[5:4]` as destination/source register.
3. For R-type, use `IR[3:2]` as `ReadSelB` and `IR[1:0]` as the function; use `IR[5:4]` for `ReadSelA` and `WriteSel`.
4. For `LOAD`/`STORE`, use `IR[3:0]` as the 4-bit data-memory address.
5. For `LDI`, use `IR[3:0]` directly as the 4-bit immediate.
6. Use a writeback multiplexer with sources `ALUOut`, immediate, and `DataOut`.
7. For `STORE`, route `ReadA=R[ss]` to data-memory `DataIn`.
8. Expose the public evidence ports: `PC`, `State`, `IR`, `ReadA`, `ReadB`, `ALUOut`, `DataOut`, `RFWE`, and `DMemWE`.

## 5. Published preflight program

Initialize instruction memory as follows; unused addresses 6–15 are `00`.

| Address | Hex | Assembly | Expected architectural effect after writeback |
|:---:|:---:|---|---|
| `0` | `95` | `LDI R1,5` | `R1=5` |
| `1` | `A3` | `LDI R2,3` | `R2=3` |
| `2` | `24` | `ADD R2,R1` | `R2=8` |
| `3` | `EE` | `STORE R2,14` | `DataMemory[14]=8` |
| `4` | `7E` | `LOAD R3,14` | `R3=8` |
| `5` | `35` | `SUB R3,R1` | `R3=3` |

Hand-check each encoding before simulation. For example, `EE = 11 10 1110`: `STORE`, source `R2`, address 14. `35 = 00 11 01 01`: R-type destination `R3`, source `R1`, `SUB`.

One instruction requires four rising edges after reset. The public program therefore completes six instructions in 24 processor edges. After completion: `PC=6`, `R1=5`, `R2=8`, `R3=3`, and `DataMemory[14]=8`.

## 6. Incremental verification

1. Rerun every component preflight before integration.
2. Verify reset and one `FETCH`: the IR captures address 0 while the PC becomes 1.
3. Step one `LDI`; confirm `RFWE` is low until `WRITEBACK` and the selected register changes only on the return-to-`FETCH` edge.
4. Step `ADD`; record `ReadA=3`, `ReadB=5`, `ALUOut=8`, and then `R2=8`.
5. Step `STORE`; prove `DMemWE=1` only in `EXECUTE` and memory address 14 becomes 8 without a register write.
6. Step `LOAD`; prove the memory value becomes the writeback source and `R3=8`.
7. Step `SUB`; prove `8-5=3` and the final state matches the published result.
8. Run the 25-vector integrated public preflight and then add your own embedded tests for boundary and failure cases.

## 7. Evidence and submission

Preserve a block diagram, state/control table, instruction-memory image, edge-by-edge program trace, public preflight output, at least one additional student-designed test, and the current Canvas-required circuit/report/presentation artifacts. Explain why an 8-bit instruction register does not make the 4-bit data path an 8-bit processor.

The final-examination-week presentation demonstrates this same cumulative processor and its instructional-ISA program. A passing local preflight is formative; it is not a Canvas submission, grade, or substitute for explanation and design evidence.
