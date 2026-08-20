import type { PracticeQuestion } from './practice';

/**
 * Evidence-mapped additions that bring every Fall 2026 module to eight items.
 * Create-level outcomes live in guided circuit/assembly labs, where students
 * produce and test an artifact; selected-response questions stop at Evaluate.
 */
export const EXPANDED_PRACTICE_QUESTIONS: readonly PracticeQuestion[] = [
  {
    id: 'arch-translation-order', topicId: 'architecture-data', resourceId: 'lecture-01', difficulty: 'application', bloomLevel: 'analyze',
    prompt: 'A C program has been preprocessed. Which remaining order correctly leads to an executable?',
    options: ['Linker → compiler → assembler', 'Compiler → assembler → linker', 'Assembler → linker → compiler', 'Compiler → linker → preprocessor'],
    correctIndex: 1,
    hint: 'The compiler produces assembly; the assembler then produces object code.',
    explanation: 'After preprocessing, the compiler produces assembly source, the assembler produces object code, and the linker combines object code with required libraries. The other orders ask a tool to consume a form it does not accept.',
    takeaway: 'Preprocess → compile → assemble → link is the source-to-executable path used in the lecture example.',
    sourceMap: { readingIndexes: [], videoIndexes: [], lectureSlides: [4, 5] }
  },
  {
    id: 'arch-isa-vs-microarchitecture', topicId: 'architecture-data', resourceId: 'lecture-01', difficulty: 'foundation', bloomLevel: 'understand',
    prompt: 'Why can different processor generations run software built for the same ISA?',
    options: ['They must use identical internal circuits', 'The ISA defines the software-visible operations while implementations may use different microarchitectures', 'Every compiler copies the older processor into the executable', 'The operating system converts every instruction into Boolean algebra at run time'],
    correctIndex: 1,
    hint: 'Separate the programmer-visible contract from the internal implementation.',
    explanation: 'An ISA is the software-visible contract for instructions and architectural state. Different microarchitectures may implement that contract differently, so identical internal circuits are not required for binary compatibility.',
    takeaway: 'ISA describes what software can rely on; microarchitecture describes how a processor implements it.',
    sourceMap: { readingIndexes: [], videoIndexes: [], lectureSlides: [5, 9, 10] }
  },
  {
    id: 'arch-msb-lsb', topicId: 'architecture-data', resourceId: 'lecture-01', difficulty: 'foundation', bloomLevel: 'remember',
    prompt: 'In the 8-bit pattern 1011 1000, which positions are the MSB and LSB?',
    options: ['The leftmost 1 is the MSB and the rightmost 0 is the LSB', 'The rightmost 0 is the MSB and the leftmost 1 is the LSB', 'The middle two bits are both the MSB', 'MSB and LSB are defined only for hexadecimal'],
    correctIndex: 0,
    hint: 'Significance follows positional weight.',
    explanation: 'The leftmost bit has the greatest positional weight and is the most significant bit; the rightmost bit has weight 2⁰ and is the least significant bit.',
    takeaway: 'Bit significance decreases from left to right in the usual written representation.',
    sourceMap: { readingIndexes: [1], videoIndexes: [1], lectureSlides: [18] }
  },
  {
    id: 'arch-binary-to-decimal', topicId: 'architecture-data', resourceId: 'lecture-01', difficulty: 'application', bloomLevel: 'apply',
    prompt: 'What decimal value is represented by unsigned binary 1001 1011?',
    options: ['139', '151', '155', '157'],
    correctIndex: 2,
    hint: 'Add the weights for bit positions 7, 4, 3, 1, and 0.',
    explanation: 'The 1-bits contribute 128 + 16 + 8 + 2 + 1 = 155. Each distractor results from omitting or misweighting at least one set bit.',
    takeaway: 'Unsigned binary-to-decimal conversion sums the powers of two at the set-bit positions.',
    sourceMap: { readingIndexes: [1], videoIndexes: [1], lectureSlides: [19, 20] }
  },
  {
    id: 'arch-decimal-to-binary', topicId: 'architecture-data', resourceId: 'lecture-01', difficulty: 'application', bloomLevel: 'apply',
    prompt: 'Which unsigned binary representation equals decimal 22?',
    options: ['10110', '11010', '11100', '10011'],
    correctIndex: 0,
    hint: '22 = 16 + 4 + 2.',
    explanation: 'The weights 16, 4, and 2 correspond to 10110₂. The alternative patterns represent different sums of powers of two.',
    takeaway: 'Choose the set of binary place weights whose sum equals the decimal value.',
    sourceMap: { readingIndexes: [1], videoIndexes: [1], lectureSlides: [21] }
  },
  {
    id: 'arch-binary-addition', topicId: 'architecture-data', resourceId: 'lecture-01', difficulty: 'application', bloomLevel: 'apply',
    prompt: 'What is the unsigned binary sum 1110 + 1111?',
    options: ['11101', '11001', '11110', '10111'],
    correctIndex: 0,
    hint: '14 + 15 = 29, or add from the least significant bit while carrying.',
    explanation: '1110₂ is 14 and 1111₂ is 15; their sum is 29, which is 11101₂. A fifth result bit is required because four bits can represent only through 15 unsigned.',
    takeaway: 'Binary addition follows the same carry principle as decimal addition and may widen the result.',
    sourceMap: { readingIndexes: [1], videoIndexes: [], lectureSlides: [22, 23] }
  },

  {
    id: 'data-signed-range', topicId: 'architecture-data', resourceId: 'lecture-02', difficulty: 'foundation', bloomLevel: 'remember',
    prompt: 'What is the range of an 8-bit two’s-complement integer?',
    options: ['−127 through +127', '−128 through +127', '−128 through +128', '0 through 255'],
    correctIndex: 1,
    hint: 'One sign pattern represents zero, so the negative side has one extra value.',
    explanation: 'An n-bit two’s-complement value ranges from −2ⁿ⁻¹ through 2ⁿ⁻¹−1. With eight bits this is −128 through +127; 0 through 255 is the unsigned range.',
    takeaway: 'Eight-bit signed and unsigned interpretations use the same patterns but different numeric ranges.',
    sourceMap: { readingIndexes: [1], videoIndexes: [1], lectureSlides: [5, 6, 7] }
  },
  {
    id: 'data-width-controls-meaning', topicId: 'architecture-data', resourceId: 'lecture-02', difficulty: 'application', bloomLevel: 'analyze',
    prompt: 'Why must the bit width be known before interpreting a two’s-complement pattern?',
    options: ['Width determines which bit is the sign bit and the available place weights', 'Width changes AND into OR', 'Width is used only when printing hexadecimal', 'Every pattern has the same signed value at every width'],
    correctIndex: 0,
    hint: 'Consider sign extension and the weight of the leftmost bit.',
    explanation: 'The most significant bit has negative weight in two’s-complement interpretation, and its position depends on the fixed width. Extending or truncating the same visible digits can therefore change the represented value.',
    takeaway: 'Always state the width when reasoning about signed binary values.',
    sourceMap: { readingIndexes: [1], videoIndexes: [1], lectureSlides: [4, 7] }
  },
  {
    id: 'logic-bitwise-and', topicId: 'architecture-data', resourceId: 'lecture-02', difficulty: 'application', bloomLevel: 'apply',
    prompt: 'What is 0101 1100 AND 0011 1010?',
    options: ['0111 1110', '0001 1000', '0110 0110', '1100 0101'],
    correctIndex: 1,
    hint: 'An output bit is 1 only where both input bits are 1.',
    explanation: 'Applying AND independently at each position gives 0001 1000. OR would instead produce 0111 1110, which is the first distractor.',
    takeaway: 'Bitwise logic applies the one-bit truth table independently to every aligned bit position.',
    sourceMap: { readingIndexes: [3], videoIndexes: [3], lectureSlides: [17, 18, 19] }
  },
  {
    id: 'logic-truth-row', topicId: 'architecture-data', resourceId: 'lecture-02', difficulty: 'foundation', bloomLevel: 'understand',
    prompt: 'For F = (A AND B) OR (NOT C), what is F when A=1, B=0, and C=0?',
    options: ['0 because A AND B is 0', '1 because NOT C is 1', 'Undefined because the terms disagree', 'The value depends on a clock'],
    correctIndex: 1,
    hint: 'Evaluate each parenthesized term before the final OR.',
    explanation: 'A AND B is 0, while NOT C is 1. OR produces 1 when either input is 1, so the complete expression is 1 and no clock is involved.',
    takeaway: 'Evaluate Boolean expressions in small, named intermediate steps.',
    sourceMap: { readingIndexes: [3], videoIndexes: [3, 4], lectureSlides: [17, 21, 22] }
  },
  {
    id: 'logic-full-adder-three-ones', topicId: 'architecture-data', resourceId: 'lecture-02', difficulty: 'application', bloomLevel: 'apply',
    prompt: 'For a full adder with A=1, B=1, and Cin=1, what are Sum and Cout?',
    options: ['Sum=0, Cout=0', 'Sum=0, Cout=1', 'Sum=1, Cout=0', 'Sum=1, Cout=1'],
    correctIndex: 3,
    hint: 'The three inputs total decimal 3, which is binary 11.',
    explanation: '1+1+1 equals binary 11. The low bit is Sum=1 and the high bit is Cout=1; a full adder preserves both bits of the one-column result.',
    takeaway: 'Interpret Cout·Sum as the two-bit result of adding A, B, and Cin.',
    sourceMap: { readingIndexes: [2], videoIndexes: [2], lectureSlides: [23, 27, 28, 29] }
  },

  {
    id: 'logic-sop-structure', topicId: 'combinational-logic', resourceId: 'lecture-03', difficulty: 'foundation', bloomLevel: 'remember',
    prompt: 'Which expression is in sum-of-products form?',
    options: ['(A+B)(C+D)', 'AB + A′C', 'A(B+C)', '(A+B)′'],
    correctIndex: 1,
    hint: 'Look for product terms joined by OR.',
    explanation: 'AB and A′C are product terms, and the plus symbol ORs those products. The first expression is product-of-sums, while the others are not written as an SOP.',
    takeaway: 'SOP means an OR of one or more ANDed literal terms.',
    sourceMap: { readingIndexes: [1], videoIndexes: [1], lectureSlides: [3, 4] }
  },
  {
    id: 'logic-sop-minterm', topicId: 'combinational-logic', resourceId: 'lecture-03', difficulty: 'application', bloomLevel: 'apply',
    prompt: 'Which minterm represents the output-1 row A=0, B=1, C=0?',
    options: ['ABC', 'A′BC′', 'AB′C', 'A′B′C′'],
    correctIndex: 1,
    hint: 'Complement a literal when that row assigns the input 0.',
    explanation: 'A=0 contributes A′, B=1 contributes B, and C=0 contributes C′, yielding A′BC′. That product is true for exactly the named row.',
    takeaway: 'A canonical SOP minterm contains every input, complemented exactly when its row value is 0.',
    sourceMap: { readingIndexes: [1], videoIndexes: [1], lectureSlides: [4, 10] }
  },
  {
    id: 'logic-factor-pair', topicId: 'combinational-logic', resourceId: 'lecture-03', difficulty: 'application', bloomLevel: 'analyze',
    prompt: 'Which step correctly simplifies AB + AB′?',
    options: ['AB + AB′ = A(B+B′) = A', 'AB + AB′ = B(A+A′) = B', 'AB + AB′ = A+B', 'AB + AB′ = 0'],
    correctIndex: 0,
    hint: 'Factor the literal shared by both product terms.',
    explanation: 'Both terms contain A, so distributivity gives A(B+B′). Complementarity makes B+B′=1, leaving A. The other answers factor the wrong literal or discard valid true cases.',
    takeaway: 'Factoring exposes complement pairs that collapse to 1.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0], lectureSlides: [6, 7, 8] }
  },
  {
    id: 'logic-equivalence-evidence', topicId: 'combinational-logic', resourceId: 'lecture-03', difficulty: 'application', bloomLevel: 'evaluate',
    prompt: 'What is the strongest finite check that two Boolean expressions of three inputs are equivalent?',
    options: ['They use the same number of symbols', 'Their outputs match for all eight input rows', 'They contain the same first literal', 'Both can be drawn with gates'],
    correctIndex: 1,
    hint: 'Equivalence means agreement for every possible input assignment.',
    explanation: 'Three inputs have 2³=8 assignments. Matching output on every row proves the two functions agree over the complete finite domain; visual similarity or gate count does not.',
    takeaway: 'A complete truth-table comparison is direct evidence of Boolean-function equivalence.',
    sourceMap: { readingIndexes: [0, 1], videoIndexes: [1], lectureSlides: [6, 10] }
  },
  {
    id: 'logic-demorgan-three-inputs', topicId: 'combinational-logic', resourceId: 'lecture-03', difficulty: 'application', bloomLevel: 'apply',
    prompt: 'Which expression is equivalent to the complement of A+B+C?',
    options: ['A′+B′+C′', 'A′B′C′', 'ABC', 'A+B+C'],
    correctIndex: 1,
    hint: 'Move the outer complement inward and swap OR for AND.',
    explanation: 'DeMorgan’s theorem complements every input and changes the OR into AND, producing A′B′C′. Merely complementing inputs without changing the operator is incorrect.',
    takeaway: 'When a complement crosses an OR/AND boundary, complement each operand and swap the operator.',
    sourceMap: { readingIndexes: [0], videoIndexes: [2], lectureSlides: [6, 7] }
  },

  {
    id: 'logic-kmap-group-sizes', topicId: 'combinational-logic', resourceId: 'lecture-04', difficulty: 'foundation', bloomLevel: 'remember',
    prompt: 'Which list contains only valid rectangular K-map group sizes?',
    options: ['1, 2, 4, 8', '1, 3, 6, 9', '2, 5, 10', '3, 4, 7'],
    correctIndex: 0,
    hint: 'Valid group sizes are powers of two.',
    explanation: 'K-map groups contain 2ⁿ adjacent cells, so 1, 2, 4, 8, and larger powers of two are valid. Sizes such as 3, 5, or 6 cannot eliminate variables systematically.',
    takeaway: 'Use rectangular power-of-two groups, preferably the largest valid groups.',
    sourceMap: { readingIndexes: [0], videoIndexes: [1], lectureSlides: [12, 13, 14] }
  },
  {
    id: 'logic-kmap-diagonal', topicId: 'combinational-logic', resourceId: 'lecture-04', difficulty: 'application', bloomLevel: 'analyze',
    prompt: 'Two 1-cells touch only at a corner in a K-map. May they form a two-cell group?',
    options: ['Yes, every visually close pair is adjacent', 'Yes, but only in four-variable maps', 'No, diagonal cells differ in more than one mapped direction and are not adjacent', 'No, because two-cell groups are never allowed'],
    correctIndex: 2,
    hint: 'Adjacency is horizontal or vertical, including edge wraparound—not diagonal.',
    explanation: 'A valid two-cell group must join horizontally or vertically adjacent cells whose labels differ by one bit. Corner-only contact is diagonal and therefore not a K-map adjacency.',
    takeaway: 'K-map adjacency is one-bit horizontal/vertical adjacency, with wraparound at opposite edges.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0, 1], lectureSlides: [10, 12] }
  },
  {
    id: 'logic-kmap-dont-care', topicId: 'combinational-logic', resourceId: 'lecture-04', difficulty: 'application', bloomLevel: 'evaluate',
    prompt: 'How should a don’t-care cell be used during K-map minimization?',
    options: ['It must always be treated as 1', 'It must always be treated as 0', 'Use it as 0 or 1 only when doing so helps form a simpler valid cover', 'It must be grouped by itself'],
    correctIndex: 2,
    hint: 'The output for that input combination is unspecified.',
    explanation: 'A don’t-care may be assigned whichever value helps simplify the implementation, but it need not be included. Treating every don’t-care rigidly as 0 or 1 can miss a larger group.',
    takeaway: 'Don’t-cares are optional simplification opportunities, not required 1-cells.',
    sourceMap: { readingIndexes: [0], videoIndexes: [2], lectureSlides: [23, 24, 25] }
  },
  {
    id: 'logic-kmap-whole-row', topicId: 'combinational-logic', resourceId: 'lecture-04', difficulty: 'application', bloomLevel: 'analyze',
    prompt: 'In a three-variable K-map with A as the row variable, all four cells in the A=1 row are grouped. What product term remains?',
    options: ['BC', 'A', 'A′', 'A+B+C'],
    correctIndex: 1,
    hint: 'Keep only variables that do not change anywhere inside the group.',
    explanation: 'B and C take every combination across the four columns and therefore disappear. A remains fixed at 1 for the entire group, so the implicant is A.',
    takeaway: 'A K-map group retains only literals whose values stay constant throughout that group.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0, 1], lectureSlides: [7, 10, 12] }
  },
  {
    id: 'logic-kmap-cover-check', topicId: 'combinational-logic', resourceId: 'lecture-04', difficulty: 'application', bloomLevel: 'evaluate',
    prompt: 'A proposed minimized SOP leaves one required 1-cell outside every group. What conclusion is justified?',
    options: ['The solution is still valid because only the largest group matters', 'The solution is invalid because every required 1-cell must be covered', 'The uncovered cell automatically becomes a don’t-care', 'The map must be reordered numerically'],
    correctIndex: 1,
    hint: 'Ask whether the proposed expression is true for every truth-table row that requires output 1.',
    explanation: 'Every required output-1 cell must belong to at least one selected group. An uncovered cell identifies an input assignment where the proposed SOP would incorrectly output 0.',
    takeaway: 'Validate a K-map cover for both legality of each group and coverage of every required 1-cell.',
    sourceMap: { readingIndexes: [0], videoIndexes: [1], lectureSlides: [12, 20, 21] }
  },

  {
    id: 'logic-active-low-decoder', topicId: 'combinational-logic', resourceId: 'lecture-05', difficulty: 'foundation', bloomLevel: 'understand',
    prompt: 'In an active-low decoder, how is the selected output normally indicated?',
    options: ['The selected line goes to 0 while the others remain 1', 'Every output goes to 1', 'The selected line oscillates with the clock', 'The binary input is copied to every output'],
    correctIndex: 0,
    hint: 'Active-low means the asserted state is the low logic level.',
    explanation: 'The selected output is asserted by going low, while unselected outputs remain high. “Active” describes assertion, not necessarily logic 1.',
    takeaway: 'Read bubbles, bars, and active-low labels before interpreting a device truth table.',
    sourceMap: { readingIndexes: [1], videoIndexes: [1], lectureSlides: [9, 11, 12] }
  },
  {
    id: 'logic-mux-select-d3', topicId: 'combinational-logic', resourceId: 'lecture-05', difficulty: 'application', bloomLevel: 'apply',
    prompt: 'For an 8-to-1 multiplexer, select lines S2S1S0=011 route which data input to Y?',
    options: ['D0', 'D3', 'D6', 'D7'],
    correctIndex: 1,
    hint: 'Interpret the select pattern as an unsigned binary index.',
    explanation: '011₂ equals decimal 3, so the multiplexer routes D3 to Y. The selected data value itself may be 0 or 1; the selector only chooses its source.',
    takeaway: 'Multiplexer select bits encode the index of the input forwarded to the output.',
    sourceMap: { readingIndexes: [1], videoIndexes: [2], lectureSlides: [15, 17] }
  },
  {
    id: 'logic-demux-direction', topicId: 'combinational-logic', resourceId: 'lecture-05', difficulty: 'foundation', bloomLevel: 'understand',
    prompt: 'Which statement distinguishes a demultiplexer from a multiplexer?',
    options: ['A demultiplexer routes one data input to one selected output', 'A demultiplexer stores its input across clock cycles', 'A demultiplexer adds two selected inputs', 'A demultiplexer always has one input and one output only'],
    correctIndex: 0,
    hint: 'Reverse the many-to-one data-routing direction of a multiplexer.',
    explanation: 'A demultiplexer takes one data source and routes it to one of several outputs according to select lines. It is a combinational router, not a storage or arithmetic component.',
    takeaway: 'MUX is many inputs to one output; DEMUX is one input to one selected output.',
    sourceMap: { readingIndexes: [1], videoIndexes: [2], lectureSlides: [19, 20, 21] }
  },
  {
    id: 'logic-seven-segment-driver', topicId: 'combinational-logic', resourceId: 'lecture-05', difficulty: 'application', bloomLevel: 'analyze',
    prompt: 'What does a hexadecimal seven-segment display driver compute?',
    options: ['A stored sequence of past digits', 'Seven segment-control outputs from the current input code', 'A cache address from a disk sector', 'A clock frequency from a Boolean expression'],
    correctIndex: 1,
    hint: 'The input is a digit code and each output controls one visible segment.',
    explanation: 'The driver is combinational: the current input code determines seven segment on/off outputs. It may be designed from a truth table and simplified per segment; it does not require stored history.',
    takeaway: 'A decoder/driver translates one input code into the output pattern required by a device.',
    sourceMap: { readingIndexes: [1], videoIndexes: [0], lectureSlides: [4, 5, 6, 7, 8] }
  },
  {
    id: 'logic-choose-routing-component', topicId: 'combinational-logic', resourceId: 'lecture-05', difficulty: 'application', bloomLevel: 'evaluate',
    prompt: 'A processor must choose one of four register values for a single ALU input bus. Which component best matches that requirement?',
    options: ['4-to-1 multiplexer', '1-to-4 demultiplexer', 'D flip-flop', '2-to-4 decoder used alone'],
    correctIndex: 0,
    hint: 'Several possible data sources must feed one destination.',
    explanation: 'A 4-to-1 multiplexer selects one of four data inputs and forwards it to one output bus. A decoder chooses a control line, while a demultiplexer routes one source toward many destinations.',
    takeaway: 'Choose components by data-flow direction: many-to-one selection calls for a multiplexer.',
    sourceMap: { readingIndexes: [1], videoIndexes: [2], lectureSlides: [14, 15, 18] }
  },

  {
    id: 'seq-hold-between-edges', topicId: 'sequential-logic', resourceId: 'lecture-06', difficulty: 'application', bloomLevel: 'analyze',
    prompt: 'A positive-edge-triggered D flip-flop stores Q=0. D changes to 1, but no rising edge occurs. What should Q do?',
    options: ['Immediately become 1', 'Remain 0 until the next active edge', 'Become undefined permanently', 'Toggle on every input change'],
    correctIndex: 1,
    hint: 'Separate a data-input change from the event that captures data.',
    explanation: 'An edge-triggered flip-flop samples D only at its active edge. Changing D between active edges does not update Q, so the previously stored 0 is retained.',
    takeaway: 'Use the clock event and the sampled D value together when reading a flip-flop timing trace.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0], lectureSlides: [13, 14, 16, 17] }
  },
  {
    id: 'seq-combinational-with-state', topicId: 'sequential-logic', resourceId: 'lecture-06', difficulty: 'foundation', bloomLevel: 'understand',
    prompt: 'Why can a sequential circuit produce different outputs for the same external input at different times?',
    options: ['Its behavior can also depend on stored current state', 'Boolean gates randomly change their truth tables', 'The address bus always changes the output', 'Sequential circuits ignore their inputs'],
    correctIndex: 0,
    hint: 'Two observations may share the same input but begin in different states.',
    explanation: 'Sequential behavior is determined by external inputs together with stored state. A different current state can therefore change the output or next state even when the current external input is identical.',
    takeaway: 'Sequential logic combines memory elements with combinational next-state/output logic.',
    sourceMap: { readingIndexes: [1], videoIndexes: [2], lectureSlides: [21, 22, 24] }
  },
  {
    id: 'seq-state-diagram-purpose', topicId: 'sequential-logic', resourceId: 'lecture-06', difficulty: 'application', bloomLevel: 'analyze',
    prompt: 'What information should a state diagram make traceable before a sequential circuit is built?',
    options: ['Only the physical gate coordinates', 'States and the input conditions that cause transitions', 'Only the clock generator brand', 'The hexadecimal address of every wire'],
    correctIndex: 1,
    hint: 'A state diagram is a behavioral model, not a placement drawing.',
    explanation: 'A state diagram names states and labels transitions with the conditions that cause movement between them; depending on the model it also identifies outputs. Gate placement comes later in implementation.',
    takeaway: 'Model behavior as states and transitions before deriving storage and next-state logic.',
    sourceMap: { readingIndexes: [1], videoIndexes: [2], lectureSlides: [24, 25, 26, 28] }
  },

  {
    id: 'memory-organization-capacity', topicId: 'memory-io', resourceId: 'lecture-07', difficulty: 'application', bloomLevel: 'apply',
    prompt: 'What total capacity does a 1024 × 8 memory organization provide?',
    options: ['1024 bits', '2048 bits', '8192 bits', '8192 bytes'],
    correctIndex: 2,
    hint: 'Multiply the number of locations by bits per location.',
    explanation: '1024 locations × 8 bits per location = 8192 bits, which is 1024 bytes. The × notation separates addressable locations from data width.',
    takeaway: 'Memory capacity in bits equals location count multiplied by bits stored per location.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0], lectureSlides: [9, 10, 22, 23] }
  },
  {
    id: 'memory-bus-roles', topicId: 'memory-io', resourceId: 'lecture-07', difficulty: 'foundation', bloomLevel: 'understand',
    prompt: 'Which mapping correctly describes processor-to-memory bus roles?',
    options: ['Address selects a location; data carries the value; control specifies actions such as read/write', 'Data selects a location; address carries the value; control supplies permanent storage', 'Control carries only hexadecimal digits; address supplies power', 'All three buses always carry identical bits'],
    correctIndex: 0,
    hint: 'Separate where, what, and which operation.',
    explanation: 'Address lines identify where to access, data lines carry the value being transferred, and control lines identify operations and timing such as read, write, and enable.',
    takeaway: 'Reason about a memory transaction as where (address), what (data), and action (control).',
    sourceMap: { readingIndexes: [0], videoIndexes: [0], lectureSlides: [14, 15, 16] }
  },
  {
    id: 'memory-chip-select-idle', topicId: 'memory-io', resourceId: 'lecture-07', difficulty: 'application', bloomLevel: 'analyze',
    prompt: 'Two memory devices share address and data buses. Why must an unaddressed device keep chip select inactive?',
    options: ['So it does not respond to or drive a transaction intended for the other device', 'So both devices overwrite the same value', 'To convert the address to decimal', 'To increase the processor clock frequency'],
    correctIndex: 0,
    hint: 'Only one device should own a selected bus transaction.',
    explanation: 'Address-decoding logic asserts chip select only for the intended device. Keeping other devices inactive prevents unintended writes and conflicting data-bus drivers.',
    takeaway: 'Chip select isolates devices that share buses and makes address decoding operational.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0], lectureSlides: [10, 11, 17, 25] }
  },
  {
    id: 'memory-address-space-size', topicId: 'memory-io', resourceId: 'lecture-07', difficulty: 'application', bloomLevel: 'apply',
    prompt: 'A processor exposes 20 address lines for byte-addressed memory. How large is its directly addressable space?',
    options: ['20 bytes', '1024 bytes', '1,048,576 bytes', '20,971,520 bytes'],
    correctIndex: 2,
    hint: 'Compute 2²⁰ address patterns.',
    explanation: 'Twenty binary address lines form 2²⁰ = 1,048,576 unique addresses. With one byte per address, the address space is 1 MiB.',
    takeaway: 'For byte addressing, m address bits name 2ᵐ bytes of address space.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0], lectureSlides: [19, 20, 21, 23] }
  },
  {
    id: 'memory-read-direction', topicId: 'memory-io', resourceId: 'lecture-07', difficulty: 'application', bloomLevel: 'analyze',
    prompt: 'During a memory read, which component should drive the requested value onto the data bus?',
    options: ['The selected memory device', 'Every memory device simultaneously', 'The processor address register', 'The clock generator'],
    correctIndex: 0,
    hint: 'The processor supplies an address and asks to receive data.',
    explanation: 'The processor supplies the address and read control; address decoding selects one device, which drives the stored value onto the data bus. Other devices must remain electrically inactive.',
    takeaway: 'Trace bus ownership as well as signal values during a memory transaction.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0], lectureSlides: [10, 11, 15, 16] }
  },

  {
    id: 'io-output-protocol-order', topicId: 'memory-io', resourceId: 'lecture-08', difficulty: 'application', bloomLevel: 'analyze',
    prompt: 'Which sequence best matches the lecture’s simple polled output protocol?',
    options: ['Wait until not busy → write DATA → write COMMAND → observe completion status', 'Write COMMAND → erase STATUS → change the program counter', 'Read DATA repeatedly → disable the address bus → write STATUS', 'Raise an interrupt → remove the device registers → write memory'],
    correctIndex: 0,
    hint: 'Do not issue work to a busy device, and provide the payload before starting the operation.',
    explanation: 'The host first waits for availability, supplies data, issues the command, and checks status for completion. The alternatives confuse device registers or remove required coordination.',
    takeaway: 'A device protocol is an ordered contract over status, data, and command/control registers.',
    sourceMap: { readingIndexes: [0, 1], videoIndexes: [1], lectureSlides: [7, 9] }
  },
  {
    id: 'io-fast-device-polling', topicId: 'memory-io', resourceId: 'lecture-08', difficulty: 'application', bloomLevel: 'evaluate',
    prompt: 'When can brief polling be preferable to sleeping and servicing an interrupt?',
    options: ['When the device is expected to finish faster than the scheduling and interrupt overhead', 'Whenever the device has no status register', 'Only when the CPU has stopped executing', 'Whenever every I/O operation transfers an entire disk'],
    correctIndex: 0,
    hint: 'Compare expected wait time with context-switch and interrupt-handling cost.',
    explanation: 'For a very fast device or very short wait, the fixed overhead of blocking, switching work, and later handling an interrupt can exceed the cost of a brief poll. This is a tradeoff, not a rule that polling is always better.',
    takeaway: 'Choose polling or interrupts by comparing waiting cost with notification overhead.',
    sourceMap: { readingIndexes: [0, 1], videoIndexes: [1, 2], lectureSlides: [11, 13, 15] }
  },
  {
    id: 'io-interrupt-overlap', topicId: 'memory-io', resourceId: 'lecture-08', difficulty: 'foundation', bloomLevel: 'understand',
    prompt: 'What useful overlap can interrupts enable while a slow device works?',
    options: ['The CPU can execute other ready work until the device signals completion', 'The device can eliminate its data register', 'The interrupted program finishes without executing', 'Main memory becomes nonvolatile'],
    correctIndex: 0,
    hint: 'Notification removes the need for continuous busy waiting.',
    explanation: 'After starting I/O, the OS can run other work and respond when the device interrupts. The device remains slow, but CPU time need not be consumed by continuous status checks.',
    takeaway: 'Interrupts improve utilization by decoupling device completion time from CPU busy waiting.',
    sourceMap: { readingIndexes: [0, 1], videoIndexes: [2], lectureSlides: [13, 14] }
  },
  {
    id: 'io-async-boundary', topicId: 'memory-io', resourceId: 'lecture-08', difficulty: 'application', bloomLevel: 'analyze',
    prompt: 'An application uses async/await for I/O. Which statement best describes the hardware/software boundary?',
    options: ['The async runtime may resume application work after the OS/driver receives a device completion event', 'async/await removes the device and operating system', 'The CPU stops using interrupts permanently', 'The source code directly toggles every device wire'],
    correctIndex: 0,
    hint: 'Application-level syntax can abstract lower-level notification rather than replace it.',
    explanation: 'Async/await expresses nonblocking control flow at the application/runtime layer. Drivers and the OS still coordinate with hardware, commonly using interrupts to report that an operation completed.',
    takeaway: 'Do not confuse an application programming abstraction with the hardware mechanism beneath it.',
    sourceMap: { readingIndexes: [1], videoIndexes: [2], lectureSlides: [16, 17, 18, 19] }
  },
  {
    id: 'io-register-diagnosis', topicId: 'memory-io', resourceId: 'lecture-08', difficulty: 'application', bloomLevel: 'evaluate',
    prompt: 'Software writes output data but never starts the device operation. Which omitted access is the most likely cause in the canonical interface?',
    options: ['A write to the command/control register', 'A read of the program stack', 'A cache-line replacement', 'A write to the instruction pointer'],
    correctIndex: 0,
    hint: 'DATA carries the payload, but another register requests the action.',
    explanation: 'Writing the data register supplies a payload but does not necessarily initiate work. The command/control register tells the device which operation to perform; status then reports progress.',
    takeaway: 'Diagnose I/O by assigning a distinct role to status, command/control, and data registers.',
    sourceMap: { readingIndexes: [0, 1], videoIndexes: [0, 1], lectureSlides: [7, 9, 10] }
  },

  {
    id: 'io-isr-short', topicId: 'memory-io', resourceId: 'lecture-08-supplement', difficulty: 'foundation', bloomLevel: 'understand',
    prompt: 'Why should an interrupt service routine generally remain short and nonblocking?',
    options: ['Long blocking work increases interrupt latency and delays other time-sensitive work', 'An ISR cannot read any register', 'Short code makes memory nonvolatile', 'A blocking ISR automatically enables DMA'],
    correctIndex: 0,
    hint: 'Consider what cannot proceed while high-priority handler work occupies the CPU.',
    explanation: 'An ISR runs in a constrained execution context and can delay other interrupts or scheduled work. It should capture the event and defer lengthy processing rather than block.',
    takeaway: 'Handle the urgent event in the ISR; defer non-urgent work to a safer context.',
    sourceMap: { readingIndexes: [1], videoIndexes: [1], lectureSlides: [16, 17, 18, 19] }
  },
  {
    id: 'io-volatile-boundary', topicId: 'memory-io', resourceId: 'lecture-08-supplement', difficulty: 'application', bloomLevel: 'evaluate',
    prompt: 'A variable is shared between normal code and an ISR. What does declaring it volatile not guarantee?',
    options: ['That reads and writes are automatically race-free and atomic', 'That the compiler must treat accesses as observable', 'That the variable may change outside the current flow', 'That the source can name the variable'],
    correctIndex: 0,
    hint: 'Visibility to the compiler is not the same as synchronization.',
    explanation: 'volatile constrains optimization around observable accesses, but it does not make a multi-step operation atomic or prevent races. Synchronization and data-width rules still matter.',
    takeaway: 'Use volatile for visibility semantics where appropriate, not as a substitute for concurrency control.',
    sourceMap: { readingIndexes: [], videoIndexes: [], lectureSlides: [17, 18] }
  },
  {
    id: 'io-interrupt-exception-classify', topicId: 'memory-io', resourceId: 'lecture-08-supplement', difficulty: 'application', bloomLevel: 'analyze',
    prompt: 'Which event is best classified as a hardware interrupt rather than a software exception?',
    options: ['A peripheral signals that an input transfer completed', 'An instruction divides by zero', 'A program executes an invalid opcode', 'A process requests an operating-system service instruction'],
    correctIndex: 0,
    hint: 'Look for an asynchronous signal originating outside the executing instruction stream.',
    explanation: 'A device-completion signal originates in a peripheral and is a hardware interrupt. Divide-by-zero and invalid-opcode conditions arise from instruction execution, while a system-service instruction is software initiated.',
    takeaway: 'Classify events by source: peripheral hardware, executing instruction fault, or explicit software request.',
    sourceMap: { readingIndexes: [1], videoIndexes: [1], lectureSlides: [19, 20, 21] }
  },
  {
    id: 'memory-volatile-persistent', topicId: 'memory-io', resourceId: 'lecture-08-supplement', difficulty: 'foundation', bloomLevel: 'understand',
    prompt: 'Which storage choice best fits configuration data that must survive power loss?',
    options: ['Persistent flash or EEPROM', 'A flip-flop that loses power', 'Only a CPU register', 'Volatile DRAM without backup'],
    correctIndex: 0,
    hint: 'The key requirement is retention after power is removed.',
    explanation: 'Flash and EEPROM are nonvolatile and retain information without power. Registers, ordinary flip-flops, SRAM, and DRAM are volatile and therefore do not meet the persistence requirement alone.',
    takeaway: 'Choose storage by required persistence as well as speed, capacity, cost, and endurance.',
    sourceMap: { readingIndexes: [0], videoIndexes: [], lectureSlides: [25, 26, 27, 28, 30] }
  },
  {
    id: 'io-dma-completion', topicId: 'memory-io', resourceId: 'lecture-08-supplement', difficulty: 'application', bloomLevel: 'analyze',
    prompt: 'After configuring DMA for a device-to-memory block transfer, what CPU behavior is most consistent with the model?',
    options: ['The CPU can do other work and later handle completion notification', 'The CPU must execute one move instruction for every byte', 'The CPU permanently gives up the memory bus', 'DMA converts all addresses into instruction opcodes'],
    correctIndex: 0,
    hint: 'DMA reduces per-item CPU work; it does not eliminate coordination.',
    explanation: 'The CPU configures the transfer, the DMA controller moves the block, and completion is commonly reported by an interrupt or status condition. The CPU need not copy every item itself.',
    takeaway: 'DMA changes who performs bulk data movement, not the need for setup and completion handling.',
    sourceMap: { readingIndexes: [1], videoIndexes: [2], lectureSlides: [39, 40, 41] }
  },

  {
    id: 'memory-hierarchy-order', topicId: 'memory-io', resourceId: 'lecture-09', difficulty: 'foundation', bloomLevel: 'remember',
    prompt: 'Which order runs from generally fastest/smallest to slower/larger storage?',
    options: ['Registers → cache → main memory → secondary storage', 'Secondary storage → registers → cache → main memory', 'Main memory → disk → registers → cache', 'Cache → disk → registers → main memory'],
    correctIndex: 0,
    hint: 'Begin with storage physically closest to the execution units.',
    explanation: 'Registers are closest and fastest, followed by cache, main memory, and then secondary storage. Capacity generally grows and cost per bit falls as latency increases down the hierarchy.',
    takeaway: 'The hierarchy combines different technologies rather than seeking one impossible ideal memory.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0], lectureSlides: [3, 4, 6, 15, 16, 17] }
  },
  {
    id: 'memory-cache-line-count', topicId: 'memory-io', resourceId: 'lecture-09', difficulty: 'application', bloomLevel: 'apply',
    prompt: 'A 32 KiB cache uses 64-byte blocks. Ignoring metadata, how many cache lines does it contain?',
    options: ['64', '256', '512', '2048'],
    correctIndex: 2,
    hint: 'Divide total data capacity in bytes by bytes per block.',
    explanation: '32 KiB is 32×1024 = 32768 bytes. Dividing by 64 bytes per line gives 512 lines.',
    takeaway: 'Number of cache lines equals cache data capacity divided by block size.',
    sourceMap: { readingIndexes: [0], videoIndexes: [1], lectureSlides: [22, 23, 24, 25] }
  },
  {
    id: 'memory-spatial-locality', topicId: 'memory-io', resourceId: 'lecture-09', difficulty: 'application', bloomLevel: 'analyze',
    prompt: 'A program reads array elements at consecutive addresses exactly once. Which locality is most directly exploited?',
    options: ['Spatial locality', 'Temporal locality only', 'Instruction decoding locality', 'Address-overflow locality'],
    correctIndex: 0,
    hint: 'The accesses are near one another even though each element is not reused.',
    explanation: 'Consecutive array elements are stored at nearby addresses, so one fetched cache block can supply several future accesses. Because each element is used once, temporal reuse is not the main benefit.',
    takeaway: 'Spatial locality predicts access to nearby addresses; temporal locality predicts reuse of recently accessed items.',
    sourceMap: { readingIndexes: [0], videoIndexes: [1], lectureSlides: [19, 23, 24] }
  },
  {
    id: 'memory-disk-access-components', topicId: 'memory-io', resourceId: 'lecture-09', difficulty: 'foundation', bloomLevel: 'understand',
    prompt: 'Which set contains the four disk-access-time components emphasized in the lecture?',
    options: ['Queuing, seek, rotational latency, and transfer', 'Decode, execute, writeback, and branch', 'Read, invert, add, and sign-extend', 'Hit, miss, register, and opcode'],
    correctIndex: 0,
    hint: 'Two components arise from waiting and mechanical positioning before data transfer.',
    explanation: 'The lecture separates queuing time, head seek time, rotational latency, and transfer time. Processor pipeline stages and arithmetic steps are unrelated categories.',
    takeaway: 'Diagnose storage latency by separating waiting, positioning, rotation, and data transfer.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0], lectureSlides: [8, 9, 10, 11, 12, 13] }
  },
  {
    id: 'memory-block-fetch-why', topicId: 'memory-io', resourceId: 'lecture-09', difficulty: 'application', bloomLevel: 'evaluate',
    prompt: 'Why does a cache normally fetch a block rather than only the one requested byte?',
    options: ['Nearby bytes are likely to be used soon, so one lower-level transfer can satisfy later accesses', 'Every processor instruction is exactly one cache block', 'Blocks make all misses impossible', 'A cache cannot store individual bytes inside a block'],
    correctIndex: 0,
    hint: 'Connect transfer granularity with spatial locality.',
    explanation: 'Programs often access nearby addresses. Fetching a block uses spatial locality so subsequent nearby accesses may hit, though it does not eliminate misses and instructions need not equal block size.',
    takeaway: 'Block transfer is a locality-based prediction whose benefit must outweigh unused-data and replacement costs.',
    sourceMap: { readingIndexes: [0], videoIndexes: [1], lectureSlides: [19, 22, 23, 24] }
  },

  {
    id: 'cpu-rtl-direction', topicId: 'processor', resourceId: 'lecture-10', difficulty: 'foundation', bloomLevel: 'understand',
    prompt: 'What does the RTL statement R1 ← R2 mean?',
    options: ['Copy the current value of R2 into R1', 'Copy R1 into R2', 'Add R1 and R2 and discard the result', 'Compare the physical sizes of the registers'],
    correctIndex: 0,
    hint: 'The arrow points toward the destination.',
    explanation: 'R1 is the destination and receives the value currently supplied by R2. RTL describes a data transfer, not a permanent renaming of either register.',
    takeaway: 'Read RTL as destination ← source or destination ← operation result.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0], lectureSlides: [13, 14] }
  },
  {
    id: 'cpu-five-stage-order', topicId: 'processor', resourceId: 'lecture-10', difficulty: 'foundation', bloomLevel: 'remember',
    prompt: 'Which order matches the five generic instruction-execution stages in the lecture?',
    options: ['Fetch → decode/register read → execute/address generation → memory → writeback', 'Decode → writeback → fetch → memory → execute', 'Memory → fetch → writeback → decode → execute', 'Fetch → memory → decode → writeback → execute'],
    correctIndex: 0,
    hint: 'An instruction must be obtained and interpreted before its operation can run.',
    explanation: 'The lecture orders the stages as IF, ID/RF, EX/AG, MEM, and WB. Not every instruction uses every stage identically, but this sequence organizes the datapath/control model.',
    takeaway: 'Use stage names to trace what data and control must be available at each point.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0], lectureSlides: [24, 25] }
  },
  {
    id: 'cpu-ir-versus-ip', topicId: 'processor', resourceId: 'lecture-10', difficulty: 'application', bloomLevel: 'analyze',
    prompt: 'Which pairing correctly distinguishes the instruction register from the instruction pointer?',
    options: ['IR holds the current instruction bits; IP holds an instruction address', 'IR stores all program data; IP performs arithmetic', 'IR is main memory; IP is the cache', 'IR and IP are two names for the same gate'],
    correctIndex: 0,
    hint: 'One provides what to decode; the other identifies where in the instruction stream.',
    explanation: 'The IR supplies the fetched instruction bits to decode/control, while the IP/PC supplies an address used to locate an instruction. They cooperate but store different kinds of information.',
    takeaway: 'Trace both instruction content (IR) and instruction-stream location (IP/PC).',
    sourceMap: { readingIndexes: [0], videoIndexes: [0], lectureSlides: [7, 8, 9, 23] }
  },
  {
    id: 'cpu-load-add-store-trace', topicId: 'processor', resourceId: 'lecture-10', difficulty: 'application', bloomLevel: 'analyze',
    prompt: 'For c ← a+b, why are two loads needed before the ADD in the lecture’s simple register machine?',
    options: ['The ALU operates on register operands, so a and b must first be brought from memory into registers', 'ADD can read only hexadecimal text files', 'The instruction pointer can store only one operand', 'Loads convert combinational logic into sequential logic'],
    correctIndex: 0,
    hint: 'Follow the data path from memory to the ALU inputs.',
    explanation: 'The example loads a and b into registers, adds the register values, and stores the result back to c. The separation exposes memory transfer actions versus ALU computation.',
    takeaway: 'Trace instructions by following operand location changes across memory, registers, ALU, and destination.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0], lectureSlides: [5, 6, 26, 27, 28, 29, 30, 31] }
  },

  {
    id: 'pipeline-five-stage-cycles', topicId: 'processor', resourceId: 'lecture-11', difficulty: 'application', bloomLevel: 'apply',
    prompt: 'In an ideal five-stage pipeline with no stalls, how many cycles are needed to complete six instructions?',
    options: ['6', '10', '11', '30'],
    correctIndex: 1,
    hint: 'Fill four additional stages, then complete one instruction per cycle.',
    explanation: 'An ideal k-stage pipeline completes n instructions in k+n−1 cycles. With k=5 and n=6, the result is 5+6−1=10 cycles.',
    takeaway: 'Pipeline timing includes fill time before steady one-per-cycle completion.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0], lectureSlides: [15, 16, 17, 18, 19] }
  },
  {
    id: 'pipeline-clock-slowest-stage', topicId: 'processor', resourceId: 'lecture-11', difficulty: 'application', bloomLevel: 'analyze',
    prompt: 'Pipeline stage delays are 150, 200, 120, 180, and 100 ps. Ignoring register overhead, what minimum clock period is required?',
    options: ['100 ps', '150 ps', '200 ps', '750 ps'],
    correctIndex: 2,
    hint: 'Every stage must finish within the same cycle.',
    explanation: 'The clock period cannot be shorter than the slowest stage, which is 200 ps. Adding all delays describes non-overlapped latency, not the pipeline clock period.',
    takeaway: 'An unbalanced slow stage limits the entire pipeline clock rate.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0], lectureSlides: [7, 8, 9, 20, 22] }
  },
  {
    id: 'pipeline-structural-hazard', topicId: 'processor', resourceId: 'lecture-11', difficulty: 'application', bloomLevel: 'analyze',
    prompt: 'Instruction fetch and a load need the same single-ported memory in one cycle. What kind of hazard is this?',
    options: ['Structural hazard', 'Data hazard', 'Control hazard', 'Signed-overflow hazard'],
    correctIndex: 0,
    hint: 'Two operations are competing for one hardware resource.',
    explanation: 'The conflict is structural because the datapath lacks enough memory ports/resources for both simultaneous uses. No operand dependency or unresolved branch is required.',
    takeaway: 'Structural hazards are resource conflicts; data hazards are dependencies; control hazards concern the next instruction path.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0], lectureSlides: [24, 25, 26] }
  },
  {
    id: 'pipeline-forwarding-purpose', topicId: 'processor', resourceId: 'lecture-11', difficulty: 'application', bloomLevel: 'understand',
    prompt: 'What is the purpose of forwarding in a processor pipeline?',
    options: ['Route a computed result directly to a dependent stage before normal register writeback', 'Predict every branch perfectly', 'Duplicate instruction memory permanently', 'Increase the signed range of each register'],
    correctIndex: 0,
    hint: 'A dependent instruction may need a result that exists but has not yet reached the register file.',
    explanation: 'Forwarding bypasses the normal writeback/read delay by carrying a computed result to the stage that needs it. It can remove some data stalls but cannot solve every load-use case.',
    takeaway: 'Forwarding changes result availability paths, not program dependencies.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0], lectureSlides: [27, 28, 29, 30, 31, 34] }
  },
  {
    id: 'pipeline-hazard-diagnosis', topicId: 'processor', resourceId: 'lecture-11', difficulty: 'application', bloomLevel: 'evaluate',
    prompt: 'A fetched instruction must be discarded because a preceding branch selected a different target. Which diagnosis is best?',
    options: ['Control hazard caused wrong-path fetch', 'Structural hazard caused insufficient ALUs', 'Data hazard caused an unavailable arithmetic result', 'Cache hit caused an early result'],
    correctIndex: 0,
    hint: 'The problem is uncertainty about which instruction address comes next.',
    explanation: 'A branch changes the instruction stream. Work fetched before the branch outcome may be on the wrong path and must be flushed, which is a control hazard.',
    takeaway: 'Classify a hazard by the condition that prevents correct next-cycle progress.',
    sourceMap: { readingIndexes: [0], videoIndexes: [0], lectureSlides: [38, 39, 40, 41, 42, 43] }
  },

  {
    id: 'asm-virtual-physical-map', topicId: 'assembly', resourceId: 'lecture-12', difficulty: 'foundation', bloomLevel: 'understand',
    prompt: 'Why can two processes both use the same virtual address without necessarily referring to the same physical RAM location?',
    options: ['The OS and hardware translate each process’s virtual addresses through its own mapping', 'Virtual addresses are always ignored', 'Every process owns a separate physical CPU', 'Hexadecimal notation duplicates RAM automatically'],
    correctIndex: 0,
    hint: 'The visible process address is an abstraction over physical memory.',
    explanation: 'Each process operates in a virtual address space. Address translation maps those virtual addresses to physical memory, so identical virtual numbers in different processes can resolve differently.',
    takeaway: 'Distinguish the address a process uses from the physical location selected after translation.',
    sourceMap: { readingIndexes: [3], videoIndexes: [], lectureSlides: [3, 4, 5] }
  },
  {
    id: 'asm-address-space-segments', topicId: 'assembly', resourceId: 'lecture-12', difficulty: 'application', bloomLevel: 'analyze',
    prompt: 'Which pairing correctly matches common process-address-space contents?',
    options: ['Code: machine instructions; data: static/global data; heap: dynamic allocations; stack: calls and local state', 'Code: cache lines; data: only device registers; heap: instructions; stack: disk sectors', 'Code and stack both contain only source comments', 'Heap and data are names for the processor clock'],
    correctIndex: 0,
    hint: 'Follow the role of each region rather than memorizing an exact address.',
    explanation: 'The text/code region holds instructions, the data region holds static program data, the heap supports dynamic allocation, and the stack supports call-related/local state. Exact layout varies, but these roles are distinct.',
    takeaway: 'Use segment purpose to reason about where program instructions and different lifetimes of data reside.',
    sourceMap: { readingIndexes: [2, 3], videoIndexes: [1, 2], lectureSlides: [7, 8, 9] }
  },
  {
    id: 'asm-source-machine-chain', topicId: 'assembly', resourceId: 'lecture-12', difficulty: 'application', bloomLevel: 'analyze',
    prompt: 'A debugger shows assembly text, hexadecimal machine bytes, and instruction addresses. How are these related?',
    options: ['Assembly mnemonics represent encoded machine instructions stored at addresses in the process address space', 'The hexadecimal bytes are unrelated random data', 'Instruction addresses name source-code line numbers only', 'Assembly text is executed directly without encoding'],
    correctIndex: 0,
    hint: 'Connect human-readable mnemonics to the bytes fetched by the processor.',
    explanation: 'The assembler encodes mnemonics and operands as machine-instruction bytes. Those bytes occupy memory addresses, and the instruction pointer selects which encoded instruction is fetched next.',
    takeaway: 'Debugging connects three views of one program: symbolic assembly, encoded bytes, and addressed machine state.',
    sourceMap: { readingIndexes: [2], videoIndexes: [0], lectureSlides: [8, 10, 13, 16, 17, 18, 19, 21, 22] }
  }
] as const;
