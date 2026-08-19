> **Fall 2026 course workspace — instructor review required.** This reference was imported from the Fall 2025 archive. The current Fall 2026 Canvas assignment is authoritative for requirements, dates, points, allowed collaboration, file formats, and submission. **Submit your work in Canvas; SystemStudio does not submit it for you.**
>
> Source title: `cis310_Assignment3.md.txt`  
> Source last modified: `2025-08-26T18:47:17.000Z`  
> Source file: https://drive.google.com/file/d/1hWgrQOFSuGKXWa5SfC2F07ERtmIoa-K9/view

# Assignment 3: Implementing a 4-bit Processor

Building on your previous assignments, this assignment challenges you to integrate the essential components of a 4-bit processor. You will incorporate a **Program Counter (PC)**, **Instruction Memory**, extended **Instruction Registers (IRs)** to assemble 16-bit instructions from a 4-bit wide memory (over 4 cycles), an **Instruction Decoder**, the **Register File**, and the **ALU**.

---

## Objective

By the end of this assignment, you will:
- Integrate the main components of a basic 4-bit processor.
- Use a **Program Counter (PC)** to sequence through instructions stored in **Instruction Memory**.
- Assemble 16-bit instructions using four 4-bit **Instruction Registers (IRs)** over 4 cycles.
- Decode the 16-bit instruction to generate control signals.
- Utilize the **Register File** and **ALU** to execute arithmetic and control operations.
- Simulate a simple program that demonstrates data processing and control flow.

---

## 1. Setting Up the Project in Digital Simulator

1. **Create a New Project:**
   - Open **Digital** (by H. Neemann) and start a new project.
   - Save the project as `4bitProcessor`.

2. **Organize Your Workspace:**
   - Create separate subcircuits for each major component:
     - **Program Counter (PC)**
     - **Instruction Memory**
     - **Instruction Registers (IRs)**
     - **Instruction Decoder**
     - **Register File**
     - **ALU**
   - Clearly label all inputs, outputs, and control signals.

---

## 2. Integrating the Processor Components

### 2.1 Program Counter (PC)

- **Purpose:**
  - The PC holds the address of the current instruction in the Instruction Memory.
- **Implementation:**
  - Use a 4-bit register to implement the PC.
- **Testing:**
  - Verify that the PC increments correctly and can load a specific address when needed.

### 2.2 Instruction Memory

- **Purpose:**
  - Store the processor's instructions.
- **Implementation:**
  - Use a 4-bit wide memory block.
  - Design it with 16 addresses to hold your program instructions.
  - The PC provides the address to the Instruction Memory for fetching instructions.
- **Testing:**
  - Load a simple program into memory and verify that the correct instruction is fetched using the PC.

### 2.3 Extended Instruction Registers (IRs)

- **Purpose:**
  - To construct a full 16-bit instruction from a 4-bit wide Instruction Memory over 4 cycles.
- **Implementation:**
  - Use 4 separate 4-bit instruction registers (IR0, IR1, IR2, IR3).
  - Each cycle, read a 4-bit segment from Instruction Memory.
  - After 4 cycles, combine the 4 segments to form a complete 16-bit instruction.
- **Control Signals:**
  - Include a control signal to indicate when to latch new data into each IR.
- **Testing:**
  - Verify that after 4 cycles, the complete 16-bit instruction is correctly assembled.

### 2.4 Instruction Decoder

- **Purpose:**
  - Decode the 16-bit instruction into control signals that drive the Register File, ALU, and other components.
- **Implementation:**
  - Design combinational logic that interprets the bits of the instruction.
  - Generate control signals such as:
    - **ALU operation code**
    - **Register selections** for reading and writing in the Register File
- **Testing:**
  - Apply sample 16-bit instructions and verify that the correct control signals are generated.

### 2.5 Register File and ALU

- **Reference:**
  - Review **Assignment 2** for the detailed implementation of the Register File and ALU.
- **Integration:**
  - Connect the outputs of the Register File (Read Data 1 and Read Data 2) to the ALU inputs.
  - Feed the ALU result back into the Register File for operations that require storing computed values.
  - Use the decoded signals to control the read/write operations and the ALU functions.
- **Testing:**
  - Perform operations such as addition, subtraction, increment, and decrement.
  - Verify that data is correctly processed and output as expected.

---

## 3. Integrating the Complete Processor

1. **Interconnect Components:**
   - **PC → Instruction Memory:** The PC provides the address for instruction fetching.
   - **Instruction Memory → IRs:** Route the 4-bit output to the Instruction Registers over 4 cycles.
   - **IRs → Instruction Decoder:** Combine the 4-bit segments into a 16-bit instruction and decode it.
   - **Decoder → Register File/ALU:** Use the decoded signals to control the operations of the Register File and ALU.
   - Optionally, feed the ALU result back into the Register File.
2. **Control Flow:**
   - Ensure the processor properly sequences through fetch, decode, and execute phases.
   - Use the PC to manage instruction addresses and control branching.
3. **Testing the Full Processor:**
   - Load a simple program that includes arithmetic operations and branching.
   - Simulate the processor step-by-step and verify:
     - Correct instruction fetch and assembly in the IRs.
     - Proper decoding of the 16-bit instruction.
     - Accurate execution by the Register File and ALU.
     - Correct updating of the PC for sequential or branch operations.

---

## 4. Submission Requirements

1. **Project File:**
   - Prepare the `4bitProcessor` circuit files and any repository link required by the current Canvas assignment.
2. **Documentation:**
   - Provide a report detailing:
     - **Design Choices:** Explanation of how you integrated the PC, Instruction Memory, IRs, Instruction Decoder, Register File, and ALU.
     - **Control Signals:** Description of how the instruction is decoded and how control signals are generated.
     - **Testing:** Include screenshots the correct operation of each component and the full processor.
3. **Fall 2026 deadline and submission:** Open the current Project Assignment 3 page in Canvas. Submit the required files there and confirm that Canvas recorded the submission.
4. **Collaboration (confirm in Fall 2026 Canvas):**
   - Follow the current Canvas rules for group size, individual work, and contribution reporting.

---

## Conclusion

This assignment requires you to integrate several key components to build a functioning 4-bit processor. Through this project, you will gain a deeper understanding of how the PC, Instruction Memory, extended IRs, decoding logic, Register File, and ALU interact to execute a program. This foundational knowledge is critical as you move on to more advanced topics in computer architecture.

**Happy Building and Good Luck!**
