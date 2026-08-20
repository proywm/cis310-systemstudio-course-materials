# Build a half adder, then extend the pattern

Open **CIS 310: Open Hands-on Circuit and Assembly Labs**. Start with **Lecture 2 · Build and verify a half adder**:

1. Read the mapped §8.1 section and watch the mapped binary-addition author video.
2. Predict all four A/B → Carry/Sum rows.
3. Create a fresh, non-overwriting `.dig` file; it opens in the complete upstream Digital simulator.
4. Place and label A, B, Sum, and Carry; place XOR and AND; click each output port and then its destination input port.
5. Toggle A and B inside the workbench, simulate all four rows, and compare observed evidence with the prediction.
6. Drag components for clarity, save the Digital-compatible file, optionally open Digital’s official preview/tests, and explain why the output paths differ.

Continue with the Boolean-expression, multiplexer, stored-state, address-decoder, and small ALU-slice labs. These are smaller analogous builds; they do not provide the graded full-adder, register-file, ALU, or processor artifacts.

SystemStudio does not substitute a reduced circuit renderer. It runs upstream Digital v0.31. On supported headless Linux/Remote SSH hosts, the real Swing desktop is transported into the VS Code tab; Windows and macOS use Digital’s native window. Java is required.
