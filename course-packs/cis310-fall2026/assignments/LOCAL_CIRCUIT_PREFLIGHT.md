# Local Circuit Preflight Contracts

SystemStudio runs public formative tests against a selected Digital `.dig` file before Canvas submission. Tests check observable behavior and never distribute a solution circuit. They are not grades.

## Run a preflight

1. Open **CIS 310 Home → Coursework and Final Presentation**.
2. Choose an implementation or final-presentation card.
3. Select **Run local circuit preflight**, choose the component, and select its `.dig` file.
4. Fix the earliest mismatch, rerun, and preserve your own expected-versus-observed evidence.
5. If you need help, select **Ask tutor for a design hint**. The prompt shares only this public contract; your circuit stays local. The tutor must ask for your attempt and may give one hint, not a finished design.

## Public interfaces

`C` is Digital’s manual clock label. Clocked storage changes on a rising edge.

| Contract | Inputs | Outputs | Public behavior |
|---|---|---|---|
| `Register4` | `C`, `LD`, `RST`, `D[3:0]` | `Q[3:0]` | reset, load, hold; reset priority |
| `PC4` | `C`, `INC`, `LD`, `RST`, `D[3:0]` | `Q[3:0]` | reset → load → increment → hold; modulo-16 wrap |
| `IR8` | `C`, `LD`, `RST`, `D[7:0]` | `Q[7:0]` | complete-instruction reset, load, and hold |
| `InstructionMemory16x8` | `Address[3:0]` | `Instruction[7:0]` | `95 A3 24 EE 7E 35`, then ten `00` words |
| `DataMemory16x4` | `C`, `CS`, `WE`, `Address[3:0]`, `DataIn[3:0]` | `DataOut[3:0]` | clocked writes, reads, address isolation, disabled-write hold |
| `RegisterFile4x4` | `C`, `WE`, `WriteSel[1:0]`, `WriteData[3:0]`, `ReadSelA[1:0]`, `ReadSelB[1:0]` | `ReadA[3:0]`, `ReadB[3:0]` | selected writes, two independent reads, disabled-write hold |
| `ALU4` | `S1`, `S0`, `Cin`, `A[3:0]`, `B[3:0]` | `D[3:0]` | all eight controls over all 2,048 input combinations |

## Integrated processor interface

The integrated public preflight uses these top-level ports:

- inputs: `C`, `RST`;
- outputs: `PC[3:0]`, `State[1:0]`, `IR[7:0]`, `ReadA[3:0]`, `ReadB[3:0]`, `ALUOut[3:0]`, `DataOut[3:0]`, `RFWE`, and `DMemWE`.

Expose `State` as `FETCH=0`, `DECODE=1`, `EXECUTE=2`, `WRITEBACK=3`, even if your internal FSM uses one-hot encoding. Initialize instruction memory with the published six-word image. The 25 vectors verify reset plus 24 edges for `LDI R1,5`; `LDI R2,3`; `ADD R2,R1`; `STORE R2,14`; `LOAD R3,14`; and `SUB R3,R1`.

At completion, `PC=6`, `R1=5`, `R2=8`, `R3=3`, and data-memory address 14 contains 8. The suite also checks that register and data-memory write enables occur only in their designated states.

## Boundary

A pass means only that the selected file satisfied the named public contract. Canvas and instructor evaluation remain authoritative for architecture, student-designed tests, documentation, explanation, collaboration, deadlines, and scoring. SystemStudio does not upload the circuit or send it to the tutor.
