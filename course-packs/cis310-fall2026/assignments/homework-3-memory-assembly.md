> **Active Fall 2026 study reference.** Use this document to prepare and practice. The matching Canvas assignment is authoritative for the released questions, dates, points, allowed collaboration, file formats, and submission. **Submit your work in Canvas; SystemStudio does not submit it for you.**

# CIS 310 Homework 3: Memory and Assembly Foundations

## Preparation

Review Lectures 8--10 and 12 on I/O, the memory hierarchy, the instruction cycle, address spaces, x86 registers, and assembly execution.

## Study tasks

1. Explain the memory hierarchy and why it is organized in levels.
2. Compare DRAM, SRAM, and cache RAM.
3. Explain seek time, rotational latency, and transfer time.
4. Describe the five stages of the instruction cycle used in the course material.
5. Distinguish virtual memory from physical memory.
6. Identify the four major segments in a process address space.
7. Explain the purpose of the x86 `EIP` register.
8. Identify opcode and operand examples in assembly instructions.
9. Describe common I/O operations.
10. Explain how hardware executes an assembly instruction and what roles registers play.
11. Explain how the stack segment supports local variables, parameters, and return information.

## Suggested SystemStudio workflow

1. Open the mapped accessible HTML lecture and identify the relevant concept or trace; use the optional visual PDF archive only when its diagram helps.
2. Explain the concept in your own words before writing the final response.
3. From **Assignment Mission Control**, choose **Start assembly search walkthrough**. Begin with linear search, then compare iterative and recursive binary search. These are formative examples, not answers to a released Canvas prompt.
4. Before running a program, predict its return index for a value at the first position, a middle position, the final position, and a missing value. For binary search, state why the array must be sorted.
5. Use the Instruction Trace Tutor to inspect registers, flags, addresses, loop/branch decisions, and—on the recursive version—stack frames. Loading a file in the tutor is visualization evidence, not assembler evidence.
6. Use **Build/run assembly** for real execution: NASM → ELF32 on supported x86 Linux, or exact Microsoft MASM + Irvine32 on a configured Windows machine. Record the build result and self-checking program output.
7. Change the target and repeat the found, absent, and boundary cases. Explain why linear search is O(n), binary search is O(log n), and recursive binary search uses additional call-stack space.
8. Return to the current Canvas assignment, confirm the released task and required files, submit there, and confirm the Canvas receipt.

## Submission

Open the current Homework 3 assignment in Fall 2026 Canvas, follow its submission instructions, and confirm the submission receipt there.
