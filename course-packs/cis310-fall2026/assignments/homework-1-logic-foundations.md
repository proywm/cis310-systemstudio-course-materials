> **Fall 2026 course workspace — instructor review required.** This reference was imported from the Fall 2025 archive. The current Fall 2026 Canvas assignment is authoritative for requirements, dates, points, allowed collaboration, file formats, and submission. **Submit your work in Canvas; SystemStudio does not submit it for you.**
>
> Source title: `CIS310-HW-1.md`  
> Source last modified: `2025-08-26T18:49:40.000Z`  
> Source file: https://drive.google.com/file/d/1UXgSeFrWlH-5geCrgXQrmf4R1rfLrgxU/view

# CIS 310 Homework 1: Logic Foundations

### **Topics Covered**

- Logic Gates and Truth Tables (Chapter 4)
- Boolean Algebra and Simplification (Chapter 5)
- Standard Boolean Expression Formats (Chapter 6)
- Karnaugh Maps and Minimization (Chapter 7)
- Combinational Logic Applications (Adders and Seven-Segment Displays) (Chapter 8)

---

### **Assignment Tasks**

#### **Part 1: Logic Gates and Truth Tables (15 Points)**

1. **Create Truth Tables (10 Points)**: For the following circuits, draw the truth table: 

   - A 3-input AND gate.
   - A circuit with one AND gate and one OR gate, where the output of the AND gate feeds into the OR gate.

2. **Gate Identification (5 Points)**: Identify the output for a 4-input NAND gate where the inputs are: A = 1, B = 0, C = 1, D = 1.

#### **Part 2: Boolean Algebra Simplification (25 Points)**

1. **Expression Simplification (15 Points)**: Simplify the following Boolean expressions using Boolean algebra laws:

   - \( A + A . B \)
   - \( A . (B + C) + B . C \)

2. **Verification with Truth Tables (10 Points)**: Create a truth table for the simplified expression in part 1(b) and compare it with the original.

#### **Part 3: Karnaugh Maps and Minimization (25 Points)**

1. **Karnaugh Map Construction (15 Points) **: Given the truth table below, construct a Karnaugh map and minimize the expression:

   | A | B | C | D | Output |
   |---|---|---|---|--------|
   | 0 | 0 | 0 | 0 |   0    |
   | 0 | 0 | 0 | 1 |   1    |
   | 0 | 0 | 1 | 0 |   1    |
   | 0 | 1 | 0 | 1 |   0    |
   | 1 | 1 | 1 | 1 |   1    |

2. **Derive Simplified Expression (10 Points) **: Write the minimized Boolean expression based on the Karnaugh map.

#### **Part 4: Combinational Logic Applications (35 Points)**

1. **2-bit Multiplier (15 Points )**:

### Objective
1. Understand how to multiply two 2-bit binary numbers:  
   - \( A = A_1 A_0 \)  
   - \( B = B_1 B_0 \)

2. Learn how the 4-bit product \( P = P_3 P_2 P_1 P_0 \) is formed by partial products and addition of bits.

### Instructions
- Study the truth table below.
- Note how each bit of the result \(P\) corresponds to the binary product of \(A\) and \(B\).

### Truth Table

| A1 | A0 | B1 | B0 | P3 | P2 | P1 | P0 | Decimal \(A \times B\) |
|----|----|----|----|----|----|----|----|------------------------|
| 0  | 0  | 0  | 0  | 0  | 0  | 0  | 0  | 0 × 0 = 0              |
| 0  | 0  | 0  | 1  | 0  | 0  | 0  | 0  | 0 × 1 = 0              |
| 0  | 0  | 1  | 0  | 0  | 0  | 0  | 0  | 0 × 2 = 0              |
| 0  | 0  | 1  | 1  | 0  | 0  | 0  | 0  | 0 × 3 = 0              |
| 0  | 1  | 0  | 0  | 0  | 0  | 0  | 0  | 1 × 0 = 0              |
| 0  | 1  | 0  | 1  | 0  | 0  | 0  | 1  | 1 × 1 = 1              |
| 0  | 1  | 1  | 0  | 0  | 0  | 1  | 0  | 1 × 2 = 2              |
| 0  | 1  | 1  | 1  | 0  | 0  | 1  | 1  | 1 × 3 = 3              |
| 1  | 0  | 0  | 0  | 0  | 0  | 0  | 0  | 2 × 0 = 0              |
| 1  | 0  | 0  | 1  | 0  | 0  | 1  | 0  | 2 × 1 = 2              |
| 1  | 0  | 1  | 0  | 0  | 1  | 0  | 0  | 2 × 2 = 4              |
| 1  | 0  | 1  | 1  | 0  | 1  | 1  | 0  | 2 × 3 = 6              |
| 1  | 1  | 0  | 0  | 0  | 0  | 0  | 0  | 3 × 0 = 0              |
| 1  | 1  | 0  | 1  | 0  | 0  | 1  | 1  | 3 × 1 = 3              |
| 1  | 1  | 1  | 0  | 0  | 1  | 1  | 0  | 3 × 2 = 6              |
| 1  | 1  | 1  | 1  | 1  | 0  | 0  | 1  | 3 × 3 = 9              |

   - Using the [Digital simulator](https://github.com/hneemann/Digital), Design a 2-bit multiplier circuit. (We discussed installation during lecture.)
   - **Step 1**: Derive the Boolean expressions for the P0, P1, P2, and P3 outputs using k-maps.
   - **Step 2**: Implement the cicuit in logic sumulator and verify its operation.

2. **4-Bit Full Adder Implementation (20 Points)**:

   - Using the [Digital simulator](https://github.com/hneemann/Digital), implement a 4-bit full adder. 
   - **Step 1**: Create the truth table for a full adder.
   - **Step 2**: Derive the Boolean expressions for the sum and carry outputs.
   - **Step 3**: Implement a single full adder in the simulator and verify its operation.
   - **Step 4**: Chain 4 full adders to create a 4-bit adder.
   - **Step 5**: Test the 4-bit adder with at least three input pairs and include screenshots of each step.

---

### **Submission Instructions**

- **File Formats**: Submit the following:
  - Truth tables, Boolean expressions and simulation screenshots in a single PDF.
  - Logic simulation files in a github repository (https://github.com/) and provide the repo link the PDF.
- **Fall 2026 deadline and submission:** Open the current Homework 1 assignment in Canvas. Do not use an archived date from this reference.
---

### **Grading Rubric**

| **Criteria**                    | **Excellent (90-100%)**                            | **Proficient (75-89%)**                | **Basic (50-74%)**                    | **Below Expectations (<50%)**         |
| ------------------------------- | -------------------------------------------------- | -------------------------------------- | ------------------------------------- | ------------------------------------- |
| **Logic Gates (10 Points)**     | Accurate truth tables and correct outputs.         | Minor errors in truth tables.          | Major errors in tables but attempted. | Incorrect or missing answers.         |
| **Boolean Algebra (20 Points)** | All expressions correctly simplified and verified. | Some minor errors in simplification.   | Partial simplification with errors.   | Incorrect or missing simplifications. |
| **Karnaugh Maps (20 Points)**   | Correct K-map and minimized expressions.           | Small mistakes in minimization.        | Partial maps with incomplete work.    | Incorrect maps or missing work.       |
| **Applications (30 Points)**    | Accurate designs and clear documentation.          | Minor issues in logic or presentation. | Circuit implemented but incomplete.   | Missing or incorrect implementations. |

---
