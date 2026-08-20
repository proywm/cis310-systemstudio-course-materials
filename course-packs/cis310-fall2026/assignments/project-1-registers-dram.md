> **Active Fall 2026 project reference.** Use this document to prepare and build incrementally. The matching Canvas assignment is authoritative for requirements, dates, points, allowed collaboration, file formats, demonstrations, and submission. **Submit your work in Canvas; SystemStudio does not submit it for you.**

# Assignment 1: Implementing Registers and DRAM in Digital Simulator

Now that you are beginning your journey into computer architecture, this assignment will focus on designing and implementing essential components of a CPU: **Registers** and **Dynamic RAM (DRAM)** using the **Digital** simulator by H. Neemann.

## Objective
By the end of this assignment, you will:
- Implement various types of **registers** (General Purpose Registers, Program Counter, Instruction Register).
- Design and integrate a **DRAM module** for memory storage.
- Simulate data transfer between registers and memory.
- Gain a fundamental understanding of data storage and retrieval within a CPU architecture.

---

## Step-by-Step Guide

### 1. Setting Up the Digital Simulator

1. **Create a New Project:**
   - Open **Digital** and start a new project.
   - Save the project as `Registers_DRAM`.
   
2. **Organize Your Workspace:**
   - Use separate subcircuits for different components.
   - Label each component appropriately (e.g., `PC`, `GPR`, `DRAM`).
   
---

### 2. Implementing Registers

#### a. General Purpose Registers (GPR)

1. **Purpose:**
   - Temporary storage for operands and computation results.
   
2. **Implementation:**
   - Create **four 4-bit registers** (`R0`, `R1`, `R2`, `R3`).
   - Add control signals for **Load (LD)**, **Store (ST)**, and **Clear (CLR)**.
   - Use a **multiplexer (MUX)** to select between different data sources when loading values into registers.
   - Ensure that each register can be written to and read from independently.

3. **Testing:**
   - Load values into each register and verify their content using output pins.

#### b. Program Counter (PC)

1. **Purpose:**
   - Keeps track of the next instruction to execute.
   
2. **Implementation:**
   - Use a **4-bit register** to store the current instruction address.
   - Connect an **Increment (INC) control signal** to update the PC value.
   - Use a **4-bit adder circuit** to implement the increment function:
     - Input A: Current PC value (stored in the register)
     - Input B: Constant `0001` (binary `1`)
     - Sum Output: New PC value (`PC + 1`)
     - Multiplexer (MUX) selects between the incremented value or a manually loaded value (for jumps).
   - Include control signals:
     - **Increment (INC)** → Selects `PC + 1` when `INC = 1`
     - **Load (LD)** → Loads a new address for jump operations when `LD = 1`
     - **Reset (RST)** → Clears PC to `0000` when `RST = 1`

3. **Testing:**
   - Verify that PC increments correctly when `INC = 1`.
   - Load a custom address into PC using `LD = 1` and check if the jump works.
   - Reset PC to `0000` using `RST = 1`.

#### c. Instruction Register (IR)

1. **Purpose:**
   - Stores the currently fetched instruction before execution.
   
2. **Implementation:**
   - Use a **4-bit register** for instruction storage.
   - Add control signals for **Load (LD)**.
   - Use a **multiplexer (MUX)** to select between different input sources when loading data into the instruction register.
   - Ensure that it can receive input from DRAM.

3. **Testing:**
   - Load different instruction values and verify the output.

---

### 3. Implementing DRAM Module

#### a. Memory Design

1. **Purpose:**
   - Provides data storage for instructions and operands.
   
2. **Implementation:**
   - Use a **4-bit wide, 16-address DRAM** component.
   - Design input pins for **Address**, **Data**, **Read/Write (R/W)**, and **Chip Select (CS)**.

3. **Testing:**
   - Write values to specific addresses and read them back.

#### b. Connecting Registers to DRAM

1. **Data Flow:**
   - The **Program Counter** provides addresses for instruction fetching.
   - The **Instruction Register** receives the fetched instruction.
   - The **General Purpose Registers** can store data from memory or ALU operations.
   
2. **Implementation:**
   - Use **multiplexers and tri-state buffers** to control data flow between registers and DRAM.
   - Design control logic to manage read/write operations.

3. **Testing:**
   - Load an instruction into DRAM, fetch it into IR, and verify the data transfer.

---

### 4. Submission Requirements

1. **Project File:** Prepare the circuit files and any repository link required by the current Canvas assignment.
2. **Documentation:** A brief report explaining:
   - Design choices for registers and DRAM.
   - Control signals used.
   - Test results with screenshots.
3. **Fall 2026 deadline and submission:** Open the current Project Assignment 1 page in Canvas. Submit the required files there and confirm that Canvas recorded the submission.
4. **Collaboration:** Confirm the current Fall 2026 collaboration and individual-report rules in Canvas before working with others.

### 5. Local formative preflight before Canvas

Open **Coursework and Final Presentation** in SystemStudio and choose **Run local circuit preflight**. The public suites can check your 4-bit load/reset register, program counter, and 16-address × 4-bit memory before you submit. Use the exact top-level port names, widths, and precedence rules in [Local circuit preflight contracts](LOCAL_CIRCUIT_PREFLIGHT.md).

Passing is private practice evidence only: it is not a grade, does not inspect your design process or report, and does not submit anything. Canvas requirements and instructor evaluation remain authoritative.

---

### Conclusion
By completing this assignment, you will develop a strong foundation in CPU design, specifically understanding how registers interact with memory. This will prepare you for more complex topics such as **ALU integration and control unit design** in future assignments.
