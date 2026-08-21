export interface LessonTerm {
  term: string;
  definition: string;
}

export interface LessonSection {
  heading: string;
  paragraphs: readonly string[];
  points?: readonly string[];
}

export interface LessonExample {
  title: string;
  setup: string;
  steps: readonly string[];
  conclusion: string;
}

export interface LessonNarrative {
  resourceId: string;
  lectureLabel: string;
  title: string;
  overview: string;
  objectives: readonly string[];
  terms: readonly LessonTerm[];
  sections: readonly LessonSection[];
  examples: readonly LessonExample[];
  selfChecks: readonly string[];
  tutorPrompts: readonly string[];
  slideEvidence: string;
  scopeBoundary: string;
}

/**
 * Novice-facing alternatives to the visual lecture PDFs. Every claim is bounded
 * by the named slide ranges and the reading/video map in learningResources.ts.
 * The prose describes important visual relationships in words so that the
 * lesson remains useful without seeing the slide diagrams.
 */
export const LESSON_NARRATIVES: readonly LessonNarrative[] = [
  {
    resourceId: 'lecture-01', lectureLabel: 'Lecture 1', title: 'Introduction and Data Representation',
    overview: 'This lesson connects a program that a person writes to the binary values and hardware operations a processor can execute. It then develops the number-system skills needed throughout the course: reading positional values, converting among binary, decimal, and hexadecimal, and carrying during addition.',
    objectives: [
      'Trace the path from C source code through preprocessing, compilation, assembly, linking, and execution.',
      'Distinguish an instruction-set architecture from one processor implementation.',
      'Convert short unsigned values among binary, decimal, and hexadecimal.',
      'Add binary or hexadecimal values while recording carries and any extra result bit.'
    ],
    terms: [
      { term: 'Instruction-set architecture (ISA)', definition: 'The software-visible contract that defines instructions, registers, and other behavior a compatible processor provides.' },
      { term: 'Microarchitecture', definition: 'A particular internal organization that implements an ISA.' },
      { term: 'Most significant bit (MSB)', definition: 'The written bit with the greatest positional weight.' },
      { term: 'Hexadecimal', definition: 'Base-16 notation using digits 0 through 9 and A through F; one digit represents four binary bits.' }
    ],
    sections: [
      {
        heading: 'From source code to hardware',
        paragraphs: [
          'A high-level statement cannot be executed directly by logic gates. The preprocessor expands directives and included text; the compiler translates the resulting program into assembly; the assembler encodes assembly as object code; and the linker combines object code with required libraries to form an executable. The executable contains machine instructions that conform to an ISA.',
          'These layers divide a difficult problem into stable interfaces. A programmer can use a language without wiring a processor, while a processor designer can change the internal microarchitecture without changing the ISA behavior expected by compatible software.'
        ]
      },
      {
        heading: 'Why assembly appears in this course',
        paragraphs: [
          'Assembly exposes instructions and processor-visible state more directly than a high-level language. It is useful when inspecting compiler output, interacting closely with devices, understanding interrupts, or reasoning about new hardware features. The goal is not to memorize an instruction manual; it is to read small examples and explain how instructions affect registers, memory, and control flow.'
        ]
      },
      {
        heading: 'Positional number systems',
        paragraphs: [
          'In unsigned binary, the bit positions from right to left have weights 1, 2, 4, 8, and so on. To find the decimal value, add the weights whose bits are 1. To convert a positive decimal integer to binary, repeatedly divide by 2 and read the remainders from last to first.',
          'Hexadecimal is a compact view of binary. Group a binary pattern into sets of four bits from the right, then replace each group with one hexadecimal digit. This direct grouping is why hexadecimal is preferable to long binary strings when viewing addresses or machine bytes.'
        ]
      }
    ],
    examples: [
      {
        title: 'Convert binary 1011 0010 to decimal and hexadecimal',
        setup: 'Treat the pattern as an unsigned eight-bit value and write the weights 128, 64, 32, 16, 8, 4, 2, and 1 above the bits before adding.',
        steps: ['Count only weights whose bit is 1: 128 + 32 + 16 + 2 = 178.', 'Split the same bits into 1011 and 0010 from the right.', '1011 is 11, written B; 0010 is 2.'],
        conclusion: 'Binary 1011 0010, decimal 178, and hexadecimal B2 are three notations for the same value.'
      },
      {
        title: 'Add binary 1110 and 1111 column by column',
        setup: 'Work right to left. In each column add A, B, and the carry entering that column.',
        steps: ['The one column totals 1, so write 1 and carry 0.', 'The two column totals 2, so write 0 and carry 1; each remaining column totals 3, so write 1 and carry 1.', 'Read the four stored bits as 1101 and preserve the final carry as a fifth bit.'],
        conclusion: 'The wider result is 11101 (decimal 29). A four-bit destination stores 1101 and reports the leftover carry separately.'
      },
      {
        title: 'Add hexadecimal B2 and 9F',
        setup: 'Carry when a hexadecimal column reaches 16.',
        steps: ['The low column is 2 + F = 17, so write 1 and carry 1.', 'The high column is B + 9 + 1 = 21, so write 5 and carry 1.', 'Place the final carry at the left.'],
        conclusion: 'The hexadecimal result is 151. In decimal, 178 + 159 = 337, and 337 = 1×256 + 5×16 + 1.'
      }
    ],
    selfChecks: ['Why can two different processor generations run the same ISA-compatible executable?', 'Which binary place weights are present in 0101 1010?', 'Why is hexadecimal easier to translate to binary than decimal is?'],
    tutorPrompts: ['Help me trace one C statement through compiler, assembler, linker, and processor without skipping a layer.', 'Give me a new eight-bit binary conversion problem, ask me to attempt it, and check my place weights.', 'Explain ISA versus microarchitecture using an analogy and then ask me to classify two examples.'],
    slideEvidence: 'Lecture 1 PDF, slides 4–14 and 17–32.',
    scopeBoundary: 'Basic CPU instruction execution is intentionally deferred to Lecture 10; it is not required to understand this first lesson.'
  },
  {
    resourceId: 'lecture-02', lectureLabel: 'Lecture 2', title: 'Signed Data, Boolean Logic, and Adders',
    overview: 'This lesson explains how a fixed set of bits can represent positive or negative integers, then connects one-bit Boolean operations to the gates that perform binary addition. The central habit is to state the bit width and trace each output from a truth table.',
    objectives: [
      'State the unsigned and two’s-complement range for a fixed bit width.',
      'Form and interpret the two’s complement of a binary or hexadecimal value.',
      'Evaluate AND, OR, NOT, and XOR one bit position at a time.',
      'Predict the Sum and Carry-out of a one-bit half adder or full adder.'
    ],
    terms: [
      { term: 'Bit width', definition: 'The fixed number of bits used to store or operate on a value.' },
      { term: 'Two’s complement', definition: 'A fixed-width signed representation in which negation is formed by complementing every bit and adding one.' },
      { term: 'Truth table', definition: 'A complete listing of output values for every possible input combination.' },
      { term: 'Carry-out', definition: 'The higher-order bit produced when a one-column binary sum is two or three.' }
    ],
    sections: [
      {
        heading: 'Width determines range and meaning',
        paragraphs: [
          'With n bits, unsigned values range from 0 through 2 to the power n minus 1. Two’s-complement values range from negative 2 to the power n minus 1 through positive 2 to the power n minus 1 minus 1. For eight bits, those ranges are 0 through 255 unsigned and negative 128 through positive 127 signed.',
          'The written pattern alone is not enough to determine the value: 1111 1011 is 251 if unsigned but negative 5 if interpreted as eight-bit two’s complement. Always record both width and interpretation.'
        ]
      },
      {
        heading: 'Negation and subtraction',
        paragraphs: [
          'To represent negative 5 in eight bits, begin with positive 5 as 0000 0101, invert the bits to 1111 1010, and add one to obtain 1111 1011. Applying the same operation again returns positive 5. This representation lets subtraction use the same adder hardware as addition: ten minus five can be evaluated as ten plus negative five.',
          'A carry out of the most significant position is not itself the signed answer. The stored fixed-width pattern must be interpreted using the signed range and the sign bit.'
        ]
      },
      {
        heading: 'Boolean gates become an adder',
        paragraphs: [
          'AND produces 1 only when both inputs are 1. OR produces 1 when at least one input is 1. XOR produces 1 when the two inputs differ, and NOT reverses one bit. A half adder therefore uses XOR for Sum and AND for Carry.',
          'A full adder adds A, B, and an incoming carry. Its Sum is A XOR B XOR Carry-in. Its Carry-out is true when at least two of the three input bits are true. A truth table is the evidence connecting those equations to a gate circuit.'
        ]
      }
    ],
    examples: [
      {
        title: 'Represent negative 31 using eight bits',
        setup: 'Use the fixed-width two’s-complement procedure.',
        steps: ['Positive 31 is 0001 1111.', 'Invert all eight bits to get 1110 0000.', 'Add one to get 1110 0001.'],
        conclusion: 'Eight-bit 1110 0001 represents negative 31. Keeping all eight positions is essential.'
      },
      {
        title: 'Build the half-adder truth table before choosing gates',
        setup: 'List 00, 01, 10, and 11, then write each two-bit result as Carry followed by Sum.',
        steps: ['00 produces 00.', '01 and 10 produce 01.', '11 produces 10.', 'Sum is 1 exactly when the inputs differ, while Carry is 1 exactly when both inputs are 1.'],
        conclusion: 'The table proves Sum = A XOR B and Carry = A AND B.'
      },
      {
        title: 'Complete one full-adder row and generalize it',
        setup: 'Let A=1, B=0, and Carry-in=1, then compare with all eight input rows.',
        steps: ['The selected row totals 2, written binary 10, so Carry-out=1 and Sum=0.', 'Across all rows, Sum is 1 when an odd number of inputs are 1.', 'Carry-out is 1 when at least two inputs are 1.'],
        conclusion: 'Sum = A XOR B XOR Carry-in; Carry-out can be written (A AND B) OR (Carry-in AND (A XOR B)).'
      }
    ],
    selfChecks: ['What two values can eight-bit 1000 0000 represent under unsigned and signed interpretations?', 'Why does a half adder need two outputs?', 'Which full-adder input rows make Carry-out equal to 1?'],
    tutorPrompts: ['Give me a fixed-width two’s-complement problem with different values, ask me to show each step, and check it.', 'Ask me to predict one full-adder row before explaining Sum and Carry-out.', 'Help me distinguish carry and signed overflow using an analogous eight-bit example.'],
    slideEvidence: 'Lecture 2 PDF, slides 3–12 and 14–31.',
    scopeBoundary: 'The lesson builds and verifies a half adder as preparation; it does not supply a graded full-adder or multi-bit-adder design.'
  },
  {
    resourceId: 'lecture-03', lectureLabel: 'Lecture 3', title: 'Boolean Algebra and Circuit Simplification',
    overview: 'This lesson turns truth-table behavior into structured Boolean expressions and shows how algebraic laws can reduce an expression without changing its function. Every simplification should name a law and be checked against the original behavior.',
    objectives: [
      'Recognize sum-of-products (SOP) and product-of-sums (POS) form.',
      'Construct canonical SOP terms from truth-table rows where the output is 1.',
      'Use complement, identity, distributive, and DeMorgan laws in an explicit sequence.',
      'Verify that a simplified expression remains equivalent to the original.'
    ],
    terms: [
      { term: 'Literal', definition: 'A Boolean variable or its complement, such as A or NOT A.' },
      { term: 'Product term', definition: 'Literals combined by AND.' },
      { term: 'Sum-of-products (SOP)', definition: 'One or more product terms combined by OR.' },
      { term: 'Equivalent functions', definition: 'Expressions that produce the same output for every possible input row.' }
    ],
    sections: [
      {
        heading: 'From truth-table rows to expressions',
        paragraphs: [
          'For canonical SOP, use each row whose output is 1. Within that row, write a product containing every input: use the uncomplemented variable when its row value is 1 and the complemented variable when its row value is 0. OR all resulting minterms together.',
          'For canonical POS, begin with output-0 rows and form sum terms. SOP and POS are structured descriptions of the same function; they are not automatically minimal.'
        ]
      },
      {
        heading: 'Simplification is an equivalence argument',
        paragraphs: [
          'Boolean algebra laws permit one expression to be replaced by an equivalent expression. For example, AB plus A times NOT B can be factored as A times the quantity B plus NOT B. The complement law makes that quantity 1, and the identity law leaves A.',
          'DeMorgan’s theorem requires two changes together: complement every operand and swap AND with OR. Moving a complement bar inward without changing the operator produces a different function.'
        ]
      },
      {
        heading: 'Why simpler circuits matter',
        paragraphs: [
          'A simpler expression may require fewer gates, fewer gate inputs, fewer logic levels, and fewer connections. These changes can reduce cost and delay. The slide deck also names fan-in, fan-out, interconnection complexity, and hazards as design considerations; minimization is therefore about an implementation, not just shorter notation.',
          'A final truth-table comparison is a strong finite check: for three inputs, evaluate all eight rows and confirm that original and simplified outputs match.'
        ]
      }
    ],
    examples: [
      {
        title: 'Build a canonical SOP expression from a truth table',
        setup: 'Let X be 1 at ABC = 001, 011, 100, and 110. Write one product for each output-1 row, complementing every variable whose row value is 0.',
        steps: ['001 contributes (NOT A)(NOT B)C.', '011 contributes (NOT A)BC.', '100 contributes A(NOT B)(NOT C).', '110 contributes AB(NOT C).', 'OR the four products to obtain the canonical SOP expression.'],
        conclusion: 'Every output-1 row contributes exactly one product that is false for all other rows. The expression is correct but not yet minimal.'
      },
      {
        title: 'Reduce that canonical SOP expression with named laws',
        setup: 'Start with (NOT A)(NOT B)C + (NOT A)BC + A(NOT B)(NOT C) + AB(NOT C). Pair terms that differ only in B.',
        steps: ['Factor the first pair as (NOT A)C((NOT B)+B) and the second as A(NOT C)((NOT B)+B).', 'Use the complement law: (NOT B)+B = 1.', 'Use the identity law to obtain (NOT A)C + A(NOT C).', 'Recognize the remaining pattern as A XOR C and verify it against all eight original rows.'],
        conclusion: 'Four three-literal products become two two-literal products, and B disappears because it changes inside each paired group without changing X.'
      }
    ],
    selfChecks: ['Why must a canonical minterm contain every input variable?', 'What two changes occur when DeMorgan’s theorem moves a complement inward?', 'What evidence would convince you that a simplification is correct?'],
    tutorPrompts: ['Give me a three-input truth-table row and ask me to construct its canonical SOP minterm.', 'Show me one Boolean simplification step at a time and require me to name the law before continuing.', 'Give me two small expressions and help me design a truth-table equivalence check without answering it first.'],
    slideEvidence: 'Lecture 3 PDF, slides 2–12.',
    scopeBoundary: 'Examples use new expressions and explain the method; they do not simplify current homework expressions.'
  },
  {
    resourceId: 'lecture-04', lectureLabel: 'Lecture 4', title: 'Karnaugh Maps',
    overview: 'A Karnaugh map reorganizes a truth table so that adjacent cells differ in exactly one input bit. Grouping adjacent 1-cells lets changing variables disappear, producing a smaller SOP expression through a repeatable visual procedure.',
    objectives: [
      'Place truth-table outputs into a two-, three-, or four-variable K-map using Gray-code order.',
      'Identify horizontal, vertical, and wraparound adjacency.',
      'Choose power-of-two groups that cover every required 1-cell.',
      'Translate each group into the literals that remain constant and use don’t-care cells only when beneficial.'
    ],
    terms: [
      { term: 'Gray-code order', definition: 'An ordering in which neighboring labels differ by one bit, commonly 00, 01, 11, 10.' },
      { term: 'Implicant group', definition: 'A rectangular power-of-two set of adjacent cells used to form one simplified term.' },
      { term: 'Wraparound adjacency', definition: 'The first and last row or column are neighbors because their labels differ in one bit.' },
      { term: 'Don’t-care cell', definition: 'An input condition whose output is irrelevant and may be treated as 0 or 1 to improve simplification.' }
    ],
    sections: [
      {
        heading: 'Why the map is not ordinary binary order',
        paragraphs: [
          'A truth table lists combinations; a K-map places the same outputs in Gray-code order. The order 00, 01, 11, 10 ensures that movement to a neighboring cell changes only one variable. Because opposite edges also differ by one bit, left and right edges are adjacent, as are top and bottom edges.',
          'This layout makes a Boolean rule visible: if a variable changes inside a group while the output stays 1, that variable is unnecessary in the group’s product term.'
        ]
      },
      {
        heading: 'Grouping procedure',
        paragraphs: [
          'Groups must be rectangles containing 1, 2, 4, 8, or another power-of-two number of cells. Make groups as large as possible because each doubling removes another changing literal. Every required 1 must be covered, groups may overlap, and diagonal cells are not adjacent.',
          'For each group, inspect every input variable. Keep a variable only if it has the same value throughout the group; complement it if that constant value is 0. OR the resulting product terms to obtain an SOP expression.'
        ]
      },
      {
        heading: 'Using don’t-cares responsibly',
        paragraphs: [
          'A don’t-care is an input combination that the design does not use or for which either output is acceptable. Include an X in a group when it creates a larger or fewer group; otherwise ignore it. A don’t-care does not mean the circuit output will physically be unknown—it means the specification permits either value there.',
          'After minimization, compare the expression or circuit with all required truth-table rows. The map assists optimization, but the required rows remain the behavioral contract.'
        ]
      }
    ],
    examples: [
      {
        title: 'Minimize F(A,B,C) = Σm(2,3,4,5,6,7)',
        setup: 'Use AB rows in Gray-code order 00, 01, 11, 10 and C columns 0, 1.',
        steps: ['Group rows 01 and 11 across both C columns; B stays 1 while A and C change, so this group contributes B.', 'Group rows 11 and 10 across both columns; A stays 1 while B and C change, so this group contributes A.', 'Overlap in row 11 is legal; OR the surviving terms.'],
        conclusion: 'F = A + B. A required 0-cell at A=0, B=0 also checks the result.'
      },
      {
        title: 'Recognize a group that wraps across the map edge',
        setup: 'For F(A,B,C) = Σm(0,1,4,5), the 1s occupy AB rows 00 and 10 across both C columns.',
        steps: ['Rows 00 and 10 differ only in B and therefore are adjacent across the top/bottom boundary.', 'Across the four cells, A stays 0 while B and C change.', 'Keep only the constant complemented literal.'],
        conclusion: 'The wraparound rectangle contributes NOT A; a rectangle may look split on paper while representing one adjacent group.'
      }
    ],
    selfChecks: ['Why does K-map column order use 00, 01, 11, 10?', 'Which variables survive when translating a group into a term?', 'When should a don’t-care be left unused?'],
    tutorPrompts: ['Describe a small K-map in text and ask me to identify valid groups using row and column labels.', 'Give me one group’s cell labels and ask which literals remain constant.', 'Help me compare two legal coverings by number of terms and literals without solving a graded K-map.'],
    slideEvidence: 'Lecture 4 PDF, slides 3–25.',
    scopeBoundary: 'The guided lab implements a new minimized function; no current homework K-map or circuit is reproduced.'
  },
  {
    resourceId: 'lecture-05', lectureLabel: 'Lecture 5', title: 'Combinational Logic and Data Selection',
    overview: 'This lesson studies reusable combinational components. Their outputs depend only on current inputs: decoders activate one selected output, multiplexers select one input, demultiplexers route one input to a selected output, and display drivers translate a code into segment controls.',
    objectives: [
      'Distinguish combinational behavior from stored-state behavior.',
      'Relate n selector bits to 2 to the power n selectable choices.',
      'Trace a decoder, multiplexer, or demultiplexer for a stated input pattern.',
      'Explain how truth tables and K-maps support a seven-segment display driver.'
    ],
    terms: [
      { term: 'Combinational circuit', definition: 'A circuit whose output is a function only of its present inputs.' },
      { term: 'Decoder', definition: 'A component that interprets a binary input code and activates one corresponding output.' },
      { term: 'Multiplexer (MUX)', definition: 'A data selector that forwards one of several inputs to a single output.' },
      { term: 'Demultiplexer (DEMUX)', definition: 'A data distributor that routes one input to one selected output.' }
    ],
    sections: [
      {
        heading: 'No stored history',
        paragraphs: [
          'A combinational component has no memory element or feedback path that stores prior state. If its inputs settle to the same values, its output should settle to the same value regardless of what happened earlier. This separates the components in this lesson from latches and flip-flops introduced next.',
          'Reusable blocks hide a gate-level implementation behind a behavioral contract. You should be able to explain both the contract and one way gates can implement it.'
        ]
      },
      {
        heading: 'Selecting an output versus selecting an input',
        paragraphs: [
          'A decoder uses an n-bit code to choose one of 2 to the power n outputs. In memory systems, that one-hot selection can enable one row or device. Pay attention to active-high versus active-low notation: an active-low selected output is asserted at 0, not 1.',
          'A multiplexer does the opposite kind of routing: select bits choose which data input reaches one output. A four-input MUX requires two select bits. A demultiplexer takes one data input and sends it to one selected output while the others remain inactive.'
        ]
      },
      {
        heading: 'Display drivers as a design example',
        paragraphs: [
          'A seven-segment display represents a hexadecimal digit by controlling seven light segments. For each segment, a truth table states whether that segment should be on for each input code. A K-map can minimize that segment’s Boolean function, and gates implement the result.',
          'The important design chain is specification to truth table, truth table to minimized expression, and expression to gates. The display is one application of the same workflow used for larger combinational components.'
        ]
      }
    ],
    examples: [
      {
        title: 'Trace a four-input multiplexer',
        setup: 'Hold D3 D2 D1 D0 at 0, 1, 0, 1 and sweep S1 S0 through all four codes.',
        steps: ['00 selects D0, so Y=1.', '01 selects D1, so Y=0.', '10 selects D2, so Y=1.', '11 selects D3, so Y=0.', 'Change an unselected input and confirm that Y does not change.'],
        conclusion: 'A multiplexer answers which input reaches Y. Exactly one data term is enabled by the select code.'
      },
      {
        title: 'Trace a 1-of-4 decoder in both polarities',
        setup: 'Sweep A1 A0 through 00, 01, 10, and 11. Compare an active-high decoder with an active-low implementation.',
        steps: ['00 asserts Y0: active-high outputs are 1000; active-low outputs are 0111.', '01 asserts Y1: active-high 0100; active-low 1011.', '10 asserts Y2: active-high 0010; active-low 1101.', '11 asserts Y3: active-high 0001; active-low 1110.', 'Relate each active-high output to its address minterm.'],
        conclusion: 'Exactly one output is asserted per code, but the asserted voltage depends on polarity. Check polarity before wiring a chip select.'
      }
    ],
    selfChecks: ['How can you tell a component has combinational rather than sequential behavior?', 'How many select bits does an eight-input MUX require?', 'What changes when a decoder’s outputs are active-low?'],
    tutorPrompts: ['Give me a MUX trace with new data values and require me to identify the selected input first.', 'Quiz me on decoder versus multiplexer versus demultiplexer using short scenarios.', 'Walk me through the specification-to-gates process for one imaginary display segment using different rows.'],
    slideEvidence: 'Lecture 5 PDF, slides 2–22.',
    scopeBoundary: 'The module’s guided two-to-one selector is a small practice structure, not a project ALU or processor data path.'
  },
  {
    resourceId: 'lecture-06', lectureLabel: 'Lecture 6', title: 'Memory Cells and Sequential Logic',
    overview: 'Combinational gates calculate from current inputs; sequential circuits also remember a present state. This lesson develops one stored bit, clock-controlled updates, flip-flops, state tables, state diagrams, and the relationship between present state and next state.',
    objectives: [
      'Identify feedback as the mechanism that permits a stable stored bit.',
      'Distinguish latch behavior from edge-triggered flip-flop behavior.',
      'Read a timing diagram using data, clock, and output evidence.',
      'Relate a state table or state diagram to current state, input, next state, and output.'
    ],
    terms: [
      { term: 'State', definition: 'Stored information that summarizes relevant past behavior.' },
      { term: 'Latch', definition: 'A storage element whose state may respond while an enable condition is active.' },
      { term: 'Edge-triggered flip-flop', definition: 'A storage element that samples input at a specified clock transition.' },
      { term: 'Next-state logic', definition: 'Combinational logic that computes the value to be stored at the next update event.' }
    ],
    sections: [
      {
        heading: 'How a circuit remembers',
        paragraphs: [
          'Feedback sends an output back into the circuit so that a stable logic value can persist after the initiating input changes. A practical memory cell must not only hold a value; it must also provide controlled ways to write a new value and read the stored output.',
          'An SR storage element exposes set and reset behavior. A D storage element provides one data input and is designed so the stored output follows a defined data value at the permitted update time, avoiding an ambiguous input combination at its interface.'
        ]
      },
      {
        heading: 'Clock and timing evidence',
        paragraphs: [
          'Synchronous sequential circuits restrict state updates to clock events. For a rising-edge D flip-flop, changing D between rising edges should not immediately change Q; Q updates to the sampled D value at the configured edge. A timing diagram should therefore be read around each active clock event.',
          'Do not infer correctness from a single final output. Record D immediately before the edge, the edge itself, and Q immediately after it. That ordered evidence distinguishes stored-state behavior from a loose wire or combinational path.'
        ]
      },
      {
        heading: 'From one bit to a state machine',
        paragraphs: [
          'A sequential circuit combines flip-flops with combinational gates. Its next state depends on current state and inputs; its outputs depend on state and, for some designs, current inputs. A state table lists these relationships, while a state diagram presents states and transitions graphically.',
          'Counters are a familiar example: the stored bit pattern names the current count, and next-state logic produces the following pattern at each clock event. Excitation tables help determine what flip-flop inputs are required to cause a desired transition.'
        ]
      }
    ],
    examples: [
      {
        title: 'Read a D flip-flop from a timing sequence',
        setup: 'Use a rising-edge D flip-flop starting at Q=0. Record D, the clock event, Q before, and Q after at every step.',
        steps: ['D changes to 1 with no edge: Q stays 0.', 'A rising edge samples D=1: Q becomes 1.', 'D changes to 0 with no edge: Q stays 1.', 'A falling edge occurs: Q still stays 1 because this device ignores it.', 'The next rising edge samples D=0: Q becomes 0.', 'Another rising edge with D still 0 stores 0 again.'],
        conclusion: 'The no-edge rows prove storage. If Q follows D immediately, the circuit behaves like a transparent latch rather than a rising-edge flip-flop.'
      },
      {
        title: 'Build the state table for a two-bit enabled counter',
        setup: 'Let S1 S0 hold a modulo-4 count and EN control whether the state holds or increments.',
        steps: ['For EN=0, map 00→00, 01→01, 10→10, and 11→11.', 'For EN=1, map 00→01, 01→10, 10→11, and 11→00.', 'Treat next S0 and next S1 as ordinary Boolean functions of EN, S1, and S0.', 'Minimization gives next S0 = EN XOR S0 and next S1 = S1 XOR (EN AND S0).'],
        conclusion: 'Sequential logic is combinational next-state logic wrapped around storage. The 11→00 row also demonstrates the modulo behavior required by the four-bit program counter.'
      }
    ],
    selfChecks: ['What observation proves that Q is stored rather than a direct copy of D?', 'What information belongs in a state table row?', 'Why is a clock useful when many storage elements must update together?'],
    tutorPrompts: ['Give me a short D flip-flop timing sequence in words and ask me to predict Q at each edge.', 'Help me distinguish present state, input, next state, and output in a small two-state example.', 'Ask me diagnostic questions about why changing D did not change Q before giving a hint.'],
    slideEvidence: 'Lecture 6 PDF, slides 4–15 and 22–32.',
    scopeBoundary: 'The required lab observes one bit only; Homework 2 state-machine and project register work remain student-created.'
  },
  {
    resourceId: 'lecture-07', lectureLabel: 'Lecture 7', title: 'Memory Organization and Buses',
    overview: 'This lesson scales stored bits into an addressable memory device. It explains rows and word width, address decoding, data/address/control buses, chip select, memory maps, and how a full processor address is divided between device selection and location selection.',
    objectives: [
      'Relate address-line count to the number of addressable locations.',
      'Distinguish address, data, and control signals during a memory transfer.',
      'Explain read enable, write enable, and chip select, including active-low notation.',
      'Divide an address into device-select bits and within-device address bits.'
    ],
    terms: [
      { term: 'Memory word', definition: 'The fixed-width group of bits stored at one addressable location.' },
      { term: 'Address bus', definition: 'Processor-controlled lines that identify the location or device involved in a transfer.' },
      { term: 'Data bus', definition: 'Lines carrying the value being read from or written to memory.' },
      { term: 'Chip select', definition: 'A control signal that enables one memory device to respond while other devices remain idle.' }
    ],
    sections: [
      {
        heading: 'Rows, columns, and decoding',
        paragraphs: [
          'A memory device can be pictured as an array. Each row is one addressable location, and the number of columns is the number of bits stored in that location. An address decoder converts the binary address into one selected row while leaving the others inactive.',
          'With m address lines, a device can select 2 to the power m locations. Data width is a separate quantity: a memory with ten address lines and eight data lines has 1,024 locations, each holding eight bits.'
        ]
      },
      {
        heading: 'One transfer uses three signal groups',
        paragraphs: [
          'The address bus states where the transfer occurs. The data bus carries the value. Control lines state what operation is requested and whether the device should participate. The lecture’s memory interface uses active-low read enable, write enable, and chip select signals, so an asserted signal is represented by 0.',
          'For a read, the processor selects the device and location, asserts read, and receives data. For a write, it selects the device and location, supplies data, and asserts write. Conflicting read and write requests must be avoided.'
        ]
      },
      {
        heading: 'Memory maps and address decoding',
        paragraphs: [
          'A processor’s memory space contains every address it can generate. A memory map assigns ranges of that space to memory devices, code, data, or other components. Address decoding ensures that only the device assigned to the current range responds.',
          'When a small device occupies part of a larger address space, low-order address bits commonly choose a location inside the device while high-order bits decide whether that device is selected. The range boundaries follow from the fixed high-order pattern and all possible low-order values.'
        ]
      }
    ],
    examples: [
      {
        title: 'Find device capacity from signal widths',
        setup: 'Read capacity as number of locations times bits per location; address lines determine the first factor and data lines the second.',
        steps: ['12 address and 16 data lines give 4,096×16 = 65,536 bits = 8 KiB.', '10 address and 8 data lines give 1,024×8 = 8,192 bits = 1 KiB.', '4 address and 8 data lines give 16×8 = 128 bits, matching the instructional memory in Implementation 1.', '28 address and 8 data lines give 256 MiB.'],
        conclusion: 'Capacity grows exponentially with address width and linearly with data width. Keep locations and width as separate quantities until the final multiplication.'
      },
      {
        title: 'Split an address into device-select and local bits',
        setup: 'Analyze the 20-bit range 0x20000 through 0x27FFF.',
        steps: ['Write both endpoints in binary and observe that the high five bits are fixed at 00100.', 'Use those fixed bits to select the device.', 'The remaining 15 bits vary from all zeros to all ones and therefore select 32,768 local locations.', 'Check the inclusive range: 0x27FFF − 0x20000 + 1 = 0x8000 = 32,768.'],
        conclusion: 'High bits select the aligned device range while low bits select a location within it. The inclusive subtraction check catches off-by-one errors.'
      }
    ],
    selfChecks: ['What does each of the address, data, and control buses contribute to a write?', 'How many locations can nine address lines select?', 'Why should only one device’s output drive a shared data bus during a read?'],
    tutorPrompts: ['Give me new address-line and data-line widths and ask me to compute locations and total bits.', 'Describe a memory read in scrambled steps and ask me to place address, control, and data actions in order.', 'Help me reason about high and low address bits for an analogous device without solving my project address map.'],
    slideEvidence: 'Lecture 7 PDF, slides 9–26.',
    scopeBoundary: 'The guided two-to-four decoder teaches device selection but does not build the project memory subsystem.'
  },
  {
    resourceId: 'lecture-08', lectureLabel: 'Lecture 8', title: 'Memory-Mapped I/O and Polling',
    overview: 'This lesson explains how software controls an external device through a small register interface. It compares polling with interrupt notification and then connects hardware completion events to nonblocking, asynchronous program structure.',
    objectives: [
      'Distinguish a device’s software-visible interface from its internal implementation.',
      'Trace status, command, and data-register actions in a simple I/O request.',
      'Compare polling and interrupts by processor work, latency, and overhead.',
      'Explain how asynchronous code separates starting an operation from handling its completion.'
    ],
    terms: [
      { term: 'Status register', definition: 'A device register reporting conditions such as busy, ready, complete, or error.' },
      { term: 'Command register', definition: 'A device register through which software requests an operation.' },
      { term: 'Polling', definition: 'Repeatedly reading status until a condition changes.' },
      { term: 'Interrupt service routine (ISR)', definition: 'Operating-system or device-handling code invoked in response to an interrupt.' }
    ],
    sections: [
      {
        heading: 'A small interface hides a complex device',
        paragraphs: [
          'Operating systems and drivers need a stable way to control many different devices. The lecture models a device interface with status, command, and data registers. Software reads status, transfers data through the data register, and writes a command; the device’s firmware and internal hardware implement the requested behavior.',
          'When device registers are memory-mapped, ordinary address-based loads and stores access them. The address identifies a device register rather than normal RAM, but the processor still issues a bus transaction.'
        ]
      },
      {
        heading: 'Polling is simple but consumes attention',
        paragraphs: [
          'A polled output sequence first waits until the device is not busy, writes data, writes a command, and then checks for completion. A polled input sequence similarly checks readiness and reads returned data. Polling can be appropriate when the expected wait is very short or predictable.',
          'For a slow device, repeated status reads spend processor cycles asking the same question. The lecture compares this to checking email continuously instead of waiting for a notification.'
        ]
      },
      {
        heading: 'Interrupts and asynchronous programming',
        paragraphs: [
          'With interrupts, the operating system can start an I/O request, block the requesting process, and run other work. When the device finishes, it raises an interrupt; the processor transfers control to an ISR, which handles completion and wakes the waiting process.',
          'Interrupts have overhead, so they are not automatically best for every fast event. At a higher programming level, callbacks, promises, or async/await let an application initiate I/O and continue useful work. The runtime and operating system connect the eventual hardware notification to the program’s completion handler.'
        ]
      }
    ],
    examples: [
      {
        title: 'Trace a polled output request',
        setup: 'Use memory-mapped STATUS, DATA, and COMMAND registers to send one value.',
        steps: ['Two STATUS reads return BUSY=1, so the processor must not write yet.', 'A third STATUS read returns BUSY=0.', 'Write the value to DATA, then write the opcode to COMMAND to start the operation.', 'Read STATUS while BUSY=1.', 'A final STATUS read returns BUSY=0 and ERR=0, proving successful completion.'],
        conclusion: 'Order matters: COMMAND before DATA starts with a stale operand, while skipping the final status read hides errors. Repeated busy reads are the direct cost of polling.'
      },
      {
        title: 'Choose polling or interrupts from latency evidence',
        setup: 'Assume a 1 GHz processor and about 300 cycles of interrupt overhead.',
        steps: ['A 50 ns register-level device costs about 50 polling cycles, so polling is cheaper than a 300-cycle interrupt.', 'A 1 ms serial operation would burn about 1,000,000 polling cycles, so an interrupt is preferable.', 'A 10 ms mechanical-disk wait would burn about 10,000,000 polling cycles.', 'Also consider event rate: a device that interrupts continuously may justify deliberate polling.'],
        conclusion: 'The crossover occurs when expected wait approaches interrupt overhead. The decision depends on latency and event rate, not a universal rule.'
      }
    ],
    selfChecks: ['What information belongs in status, command, and data registers?', 'Why can an interrupt improve utilization while the requesting process is blocked?', 'Why might a very fast device still be polled?'],
    tutorPrompts: ['Give me a device-register protocol and ask me to order its status, data, and command actions.', 'Present a new latency scenario and ask me to justify polling or interrupts.', 'Help me separate hardware interrupt behavior, OS handling, and application-level async/await.'],
    slideEvidence: 'Lecture 8 PDF, slides 5–21.',
    scopeBoundary: 'The lesson introduces device interaction and asynchronous reasoning; current project I/O behavior remains a student design task.'
  },
  {
    resourceId: 'lecture-08-supplement', lectureLabel: 'Lecture 8 supplement', title: 'Detailed I/O and Memory',
    overview: 'This supplemental lesson consolidates the system path among CPU, memory, and I/O. Its required core is intentionally narrow: register-level I/O, interrupts, DMA, safe shared-state reasoning, and the difference between volatile and persistent memory. Protocol details and emerging technologies are enrichment.',
    objectives: [
      'Trace one register-level or memory-mapped I/O interaction through CPU, bus, and device.',
      'Explain what an interrupt handler should do and why it should remain short.',
      'Describe how DMA reduces per-item processor work for a block transfer.',
      'Select volatile or persistent storage from a retention requirement.'
    ],
    terms: [
      { term: 'Direct memory access (DMA)', definition: 'Hardware-supported block transfer between a device and memory after processor setup.' },
      { term: 'Volatile memory', definition: 'Storage such as SRAM or DRAM that loses contents when power is removed.' },
      { term: 'Persistent memory', definition: 'Storage such as flash or EEPROM that retains contents without power.' },
      { term: 'volatile qualifier', definition: 'A language-level indication that an access is observable and may change outside ordinary program flow; it is not a lock or atomicity guarantee.' }
    ],
    sections: [
      {
        heading: 'Register-level control and abstraction',
        paragraphs: [
          'A device may expose registers directly on a bus, while a driver or API provides a more portable interface. The lower level gives precise control; the higher level hides device-specific addresses and bit patterns. Both describe the same interaction at different abstraction levels.',
          'Common serial protocols such as SPI, I2C, UART, and CAN are shown as enrichment examples. Their electrical signaling and detailed transaction formats are not readiness requirements in this module.'
        ]
      },
      {
        heading: 'Interrupt discipline and shared state',
        paragraphs: [
          'An interrupt causes the processor to suspend ordinary execution, save enough context, and run a handler chosen through an interrupt mechanism. A handler should finish urgent device work quickly and defer longer processing so that other events and application work are not delayed.',
          'A variable shared with an ISR may need volatile access semantics so the compiler does not treat it as unchanging. However, volatile does not make a multi-step update atomic and does not prevent races. Synchronization and data-width guarantees are separate concerns.'
        ]
      },
      {
        heading: 'DMA and memory choice',
        paragraphs: [
          'For a block transfer, the processor can configure a DMA controller with source, destination, and length, then do other work while the controller moves data. Completion still requires coordination, commonly through status or an interrupt. DMA reduces repeated processor copy operations; it does not remove setup or correctness requirements.',
          'Use volatile storage for active code and working data when power is available. Use persistent storage for firmware, configuration, or logs that must survive power loss. Practical design also considers speed, capacity, power, cost, and write endurance.'
        ]
      }
    ],
    examples: [
      {
        title: 'Compare programmed I/O and DMA for the same transfer',
        setup: 'Move a 4 KiB block as 1,024 four-byte word transfers.',
        steps: ['Programmed I/O makes the processor read each word, write it to memory, and execute loop overhead.', 'DMA adds destination and length setup, then the controller performs all 1,024 transfers while the processor does other work.', 'Programmed I/O completes when the loop exits; DMA completes through an interrupt followed by a status check.', 'DMA still competes with the processor for memory bandwidth.'],
        conclusion: 'DMA changes who performs bulk movement, not whether it occurs. The processor still owns setup, completion, and the rule that software must not consume the buffer early.'
      },
      {
        title: 'Match data to storage using retention and endurance',
        setup: 'Choose storage separately for active samples, calibration data, and boot code.',
        steps: ['Use SRAM or DRAM for a continuously updated active sample buffer: it is fast and does not need power-off retention.', 'Use flash or EEPROM for a calibration constant written almost never.', 'For a calibration value retuned every few minutes, account for flash wear; consider FRAM, battery-backed RAM, or buffered infrequent flash writes.', 'Use ROM or flash for boot code that survives power loss and is not normally rewritten.'],
        conclusion: 'Retention alone is insufficient. A correct choice also considers speed, frequency of writes, endurance, power, and cost.'
      }
    ],
    selfChecks: ['What work remains for the processor when DMA moves the data?', 'What does volatile fail to guarantee for a shared variable?', 'Which memory characteristics matter beyond whether power is retained?'],
    tutorPrompts: ['Ask me to trace CPU, DMA, memory, and device responsibilities in a new block-transfer scenario.', 'Give me a shared ISR variable scenario and help me separate visibility from atomicity.', 'Give me three data-retention requirements and ask me to choose volatile or persistent storage with reasons.'],
    slideEvidence: 'Lecture 8 supplement PDF, core slides 3–6, 8–10, 12–21, 25–30, and 39–42.',
    scopeBoundary: 'Slides on protocol electrical details, priority inversion, cache coherence, advanced allocation, and emerging memory are labeled enrichment rather than readiness content.'
  },
  {
    resourceId: 'lecture-09', lectureLabel: 'Lecture 9', title: 'Memory Hierarchy and Cache',
    overview: 'No single storage technology is simultaneously fastest, largest, cheapest, and persistent. A memory hierarchy combines technologies and relies on locality so a small, fast level can serve many processor accesses while larger, slower levels hold the full working set.',
    objectives: [
      'Order common storage levels by typical proximity, speed, and capacity.',
      'Separate queuing, seek, rotational, and transfer components of disk access.',
      'Distinguish temporal locality from spatial locality.',
      'Compute cache-line count and explain hits, misses, placement, replacement, and write policy.'
    ],
    terms: [
      { term: 'Memory hierarchy', definition: 'An organization of storage levels that balances access time, capacity, and cost.' },
      { term: 'Temporal locality', definition: 'Recently accessed information is likely to be accessed again soon.' },
      { term: 'Spatial locality', definition: 'Information near a recently accessed address is likely to be accessed soon.' },
      { term: 'Cache block or line', definition: 'The unit of data transferred between memory and a cache and stored in one cache entry.' }
    ],
    sections: [
      {
        heading: 'Why the hierarchy exists',
        paragraphs: [
          'Registers are very fast and very small. Caches are larger but still close to the processor. Main memory provides much more capacity with greater latency, and secondary storage provides persistence and still more capacity with far greater latency. Moving frequently needed information upward reduces average access time without paying the cost of making every bit equally fast.',
          'Mechanical disk access illustrates the gap: a request can wait in a queue, move the head to a track, wait for rotation to bring the sector under the head, and finally transfer the data.'
        ]
      },
      {
        heading: 'Locality makes caching useful',
        paragraphs: [
          'Temporal locality appears when a loop reuses instructions or data. Spatial locality appears when a program visits adjacent array elements. A cache fetches a block rather than a single byte because nearby bytes are often needed next. Locality is a prediction, so it improves many workloads but does not eliminate misses.',
          'A hit finds the requested block at the current level. A miss requires retrieving it from a lower level, choosing a place for it, and possibly evicting an existing block.'
        ]
      },
      {
        heading: 'Cache design questions',
        paragraphs: [
          'Cache capacity divided by block size gives the number of lines when metadata is ignored. A complete cache design also specifies how memory blocks map to cache locations, which block is replaced when the permitted locations are full, and how writes eventually update lower-level memory.',
          'Larger blocks can capture more spatial locality but consume more transfer bandwidth and may bring unused data. Larger caches can reduce capacity misses but usually affect cost and access behavior. These are tradeoffs, not independent improvements.'
        ]
      }
    ],
    examples: [
      {
        title: 'Count cache lines and split block and offset bits',
        setup: 'Use a 32 KiB cache, 64-byte blocks, and 32-bit byte addresses; ignore metadata.',
        steps: ['32 KiB is 32,768 bytes.', 'A 64-byte block is 2^6 bytes, so the low 6 address bits are the block offset.', '32,768 ÷ 64 gives 512 cache lines.', 'The remaining 26 address bits identify the memory block before placement and tag/index division.'],
        conclusion: 'Capacity and block size determine line count; block size determines offset width; associativity then determines which lines a block may occupy.'
      },
      {
        title: 'Count hits and misses on an access sequence',
        setup: 'Use four initially empty, direct-mapped, one-word lines and accesses 0, 1, 2, 0, 1, 3, 0. Place block b in line b mod 4.',
        steps: ['Blocks 0, 1, and 2 miss on their first references.', 'The next references to 0 and 1 hit because both remain resident.', 'Block 3 misses on its first reference.', 'The final reference to 0 hits, giving 3 hits in 7 accesses, about 43%.', 'At 1 cycle per hit and 100 per miss, the stated assumptions give roughly 57 cycles average.'],
        conclusion: 'A short trace is dominated by compulsory misses. Always report the access trace and timing assumptions alongside a hit rate.'
      }
    ],
    selfChecks: ['Why is executing directly from a mechanical disk impractical?', 'What is the difference between a cache hit and a miss?', 'How can increasing block size both help and hurt?'],
    tutorPrompts: ['Give me an access sequence and ask me to identify temporal and spatial locality with evidence.', 'Give me new cache capacity and block-size values and check my line-count calculation.', 'Help me reason about one cache design tradeoff without claiming that one option is always best.'],
    slideEvidence: 'Lecture 9 PDF, slides 3–25.',
    scopeBoundary: 'The lesson develops cache concepts and calculations; it does not require implementing a cache circuit in the guided lab tool.'
  },
  {
    resourceId: 'lecture-10', lectureLabel: 'Lecture 10', title: 'CPU Components and Instruction Execution',
    overview: 'This lesson brings earlier circuit components together as a processor. Registers hold working values, an ALU performs selected operations, the instruction register holds instruction bits, the instruction pointer locates the instruction stream, and the control unit sequences data transfers and updates.',
    objectives: [
      'Identify the roles of registers, ALU, instruction register, instruction pointer, and control unit.',
      'Read simple register-transfer language (RTL) statements as source, operation, and destination.',
      'Separate arithmetic/logic computation from the control signal that selects it.',
      'Trace fetch, decode/register read, execute/address generation, memory, and writeback actions.'
    ],
    terms: [
      { term: 'Register-transfer language (RTL)', definition: 'A notation describing values transferred among registers and operations applied during a control step.' },
      { term: 'Arithmetic/logic unit (ALU)', definition: 'The combinational processor component that computes selected arithmetic or logical results.' },
      { term: 'Instruction register (IR)', definition: 'A register holding the current fetched instruction bits for decoding and execution.' },
      { term: 'Control unit', definition: 'The state-based logic that sequences processor actions according to the current instruction.' }
    ],
    sections: [
      {
        heading: 'The processor is coordinated data movement',
        paragraphs: [
          'A simple processor loads values from memory into registers, computes on register values, and stores results back to memory. The ALU provides operations, but it does not decide which operation should happen. The control unit interprets the instruction and generates signals that select sources, destinations, ALU function, memory action, and update timing.',
          'The instruction register answers “what instruction is currently being interpreted?” The instruction pointer or program counter answers “where is the current or next instruction located?” They cooperate but do not store the same information.'
        ]
      },
      {
        heading: 'RTL names one hardware action precisely',
        paragraphs: [
          'The statement R1 receives R2 means the current value from R2 is copied into R1 at the controlled update; it does not rename either register. The statement R3 receives R1 plus R2 means the ALU combines the two source values and the result is stored in R3.',
          'RTL helps separate a programmer-visible instruction from the smaller microoperations required inside the processor. A load may calculate an address, read memory, and update a register across several control steps.'
        ]
      },
      {
        heading: 'Five generic instruction stages',
        paragraphs: [
          'Instruction fetch obtains instruction bits. Decode and register read interpret fields and obtain operands. Execute performs an ALU operation or calculates an address. Memory accesses a data operand when required. Writeback stores a result in a register. Different instruction types use these resources differently, but the stage names organize the trace.',
          'To explain an instruction, name both the data path and the control decision: which values move, which component transforms them, where the result goes, and when state changes.'
        ]
      }
    ],
    examples: [
      {
        title: 'Trace c = a + b through the datapath',
        setup: 'Variables a, b, and c are in memory. Use MAR and registers R1, R2, and R3.',
        steps: ['MAR ← address(a); assert MAR load.', 'R1 ← M[MAR]; assert memory read and R1 load.', 'MAR ← address(b), then R3 ← M[MAR].', 'R2 ← R1 + R3; select ADD in the ALU and enable R2.', 'MAR ← address(c).', 'M[MAR] ← R2; assert memory write.'],
        conclusion: 'Only one step is arithmetic; the others move data. The control unit must produce the load, read, ALU-select, and write signals in the proper order.'
      },
      {
        title: 'Read one RTL statement as control decisions',
        setup: 'Decompose R4 ← R1 XOR R2.',
        steps: ['Select R1 on register-file read port A.', 'Select R2 on read port B.', 'Select XOR on the ALU function lines.', 'Select R4 as the write address and assert write-enable at the active clock edge.'],
        conclusion: 'RTL is compact, but every symbol maps to hardware and control. Without write-enable, the ALU result can be correct while R4 never changes.'
      }
    ],
    selfChecks: ['How do the IR and instruction pointer differ?', 'Why can’t an ALU by itself execute a complete instruction?', 'Which generic stages does a register-to-register ADD need, and which data-memory action can it skip?'],
    tutorPrompts: ['Give me one simple RTL statement and ask me to identify sources, operation, destination, and control needs.', 'Ask me to trace a new load-add-store example one hardware action at a time.', 'Help me distinguish instruction-level behavior from internal microoperations using a small analogous instruction.'],
    slideEvidence: 'Lecture 10 PDF, slides 3–14 and 22–31.',
    scopeBoundary: 'The guided one-bit ALU selector illustrates operation selection; it is deliberately smaller than the graded register-file, ALU, and processor projects.'
  },
  {
    resourceId: 'lecture-11', lectureLabel: 'Lecture 11', title: 'Processor Pipelining',
    overview: 'Pipelining overlaps instruction stages so several instructions can be in progress at once. It primarily improves throughput, not the latency of one instruction, and its clock is limited by the slowest stage. Hazards explain when ideal overlap is not safe.',
    objectives: [
      'Trace multiple instructions through fetch, decode, execute, memory, and writeback by cycle.',
      'Distinguish throughput from individual-instruction latency.',
      'Determine a pipeline clock period from stage delays.',
      'Classify structural, data, and control hazards and explain stalls, forwarding, or flushing.'
    ],
    terms: [
      { term: 'Pipeline', definition: 'An organization that overlaps stages of different instructions.' },
      { term: 'Throughput', definition: 'The rate at which completed instructions emerge.' },
      { term: 'Latency', definition: 'The elapsed time for one instruction to pass through all required stages.' },
      { term: 'Hazard', definition: 'A condition that prevents the next instruction from safely advancing in the intended cycle.' }
    ],
    sections: [
      {
        heading: 'Overlap and clock timing',
        paragraphs: [
          'A five-stage pipeline treats instruction processing like an assembly line: while one instruction executes, another decodes and another fetches. After the pipeline fills, an ideal design can complete about one instruction per cycle even though each instruction still passes through multiple stages.',
          'Every active stage must finish within the same clock period, so the slowest stage determines the minimum period, plus any pipeline-register overhead. If stages are unbalanced, the faster stages wait and ideal speedup is not reached.'
        ]
      },
      {
        heading: 'Three hazard categories',
        paragraphs: [
          'A structural hazard occurs when two simultaneous actions need one hardware resource, such as instruction fetch and data access competing for a single-ported memory. A data hazard occurs when a later instruction needs a value a prior instruction has not made available. A control hazard occurs when the next instruction address depends on an unresolved branch.',
          'The classification identifies the cause, which guides the response. More hardware can address some resource conflicts. A stall waits. Forwarding sends a computed result directly to a dependent stage before register writeback. Wrong-path instructions after a branch may need to be flushed.'
        ]
      },
      {
        heading: 'Limits of forwarding and scheduling',
        paragraphs: [
          'Forwarding works only after the required value exists. A load-use dependency may still require a stall because loaded data becomes available too late for the immediately following instruction. Reordering independent instructions can sometimes fill that delay without changing program meaning.',
          'Slides 45 through 58 discuss multiple issue, speculation, and out-of-order execution as optional enrichment. Readiness in this course stops at the five-stage model and its core hazards.'
        ]
      }
    ],
    examples: [
      {
        title: 'Chart six instructions through a five-stage pipeline',
        setup: 'Use Fetch, Decode, Execute, Memory, and Writeback with no stalls.',
        steps: ['Instruction 1 occupies F,D,X,M,W in cycles 1–5.', 'Instruction 2 begins in cycle 2 and finishes in cycle 6; each later instruction begins one cycle after the prior one.', 'Instruction 6 occupies F in cycle 6 and W in cycle 10.', 'The total is 5 + (6−1) = 10 cycles, compared with 30 without overlap.', 'If stage delays are 300, 200, 300, 250, and 200 ps, the shared clock period is at least the slowest 300 ps plus register overhead.'],
        conclusion: 'Pipelining improves throughput, not single-instruction latency, and the slowest stage sets the ideal clock ceiling.'
      },
      {
        title: 'Distinguish a forwardable hazard from a required stall',
        setup: 'Compare ADD R1,R2,R3 followed by SUB R4,R1,R5 with LOAD R1,0(R2) followed by the same SUB.',
        steps: ['The ADD result exists after Execute in cycle 3 and the SUB needs it in Execute in cycle 4, so execute-to-execute forwarding can avoid a stall.', 'The LOAD value appears only after Memory in cycle 4, but the immediately following SUB needs it in Execute during that same cycle.', 'Forwarding cannot send a value backward in time, so the load-use pair needs one bubble and then forwarding.', 'An independent instruction may be scheduled into the bubble when program meaning allows it.'],
        conclusion: 'Name the hazard, then compare producer-ready and consumer-needed timing. Classification alone does not prove the remedy.'
      }
    ],
    selfChecks: ['Why can throughput improve even if one instruction’s latency does not?', 'What determines the pipeline clock period?', 'Why can a load-use hazard remain after forwarding paths are added?'],
    tutorPrompts: ['Give me a short pipeline timing problem and ask me to draw the cycle-stage table in text.', 'Describe a new pipeline conflict and make me classify it before discussing a remedy.', 'Help me compare stall, forwarding, and flush using cause-and-effect questions.'],
    slideEvidence: 'Lecture 11 PDF, core slides 3–44; slides 45–58 are enrichment.',
    scopeBoundary: 'Multiple issue, speculation, and out-of-order execution are optional context, not preparation requirements or practice-test targets.'
  },
  {
    resourceId: 'lecture-12', lectureLabel: 'Lecture 12', title: 'Address Spaces, x86 Registers, and Assembly',
    overview: 'This lesson connects a running process’s virtual address space to physical memory and then connects assembly instructions to machine bytes, addresses, registers, flags, and the stack. The goal is to predict one state change at a time and verify it in a trace or real toolchain.',
    objectives: [
      'Distinguish a process virtual address from its mapped physical location.',
      'Explain the roles of code, static data, heap, and stack regions.',
      'Identify x86 data registers, the instruction pointer, stack pointer, and arithmetic flags.',
      'Trace MOV, arithmetic, compare/branch, CALL, and RET effects on machine state.'
    ],
    terms: [
      { term: 'Virtual address space', definition: 'The process-visible range of addresses mapped by hardware and the operating system to memory resources.' },
      { term: 'Instruction pointer (EIP)', definition: 'The x86 register holding the address used to locate the next instruction to execute.' },
      { term: 'Stack pointer (ESP)', definition: 'The x86 register identifying the current top of the stack.' },
      { term: 'Flags', definition: 'Condition bits such as zero, sign, carry, and overflow that record properties of an operation result.' }
    ],
    sections: [
      {
        heading: 'A process sees an address-space abstraction',
        paragraphs: [
          'Two processes can both use the same virtual address because each process has its own mapping. The operating system and memory-management hardware translate those virtual addresses to physical locations. The numeric virtual address is therefore not a universal physical RAM coordinate.',
          'The code or text region holds machine instructions; static data holds global or static program values; the heap supports dynamic allocation; and the stack supports calls and temporary local state. Exact layout varies, but these purposes remain useful for reasoning.'
        ]
      },
      {
        heading: 'Source, bytes, addresses, and registers are related views',
        paragraphs: [
          'An assembler encodes a mnemonic and operands as machine-instruction bytes. The bytes occupy virtual addresses in the code region. A debugger can show the assembly text, encoded hexadecimal bytes, instruction addresses, and current register contents side by side.',
          'EIP identifies the next instruction location. General-purpose registers hold operands and results. ESP identifies the stack top. Flags record properties of arithmetic or comparison so a later conditional jump can select control flow.'
        ]
      },
      {
        heading: 'Trace one instruction before running many',
        paragraphs: [
          'For MOV, identify source and destination and predict the destination value. For ADD or SUB, predict the result and which flags may change. CMP updates flags as if subtraction occurred but does not store the arithmetic result in either operand. A conditional jump reads relevant flags and may update EIP.',
          'CALL transfers control while saving a return address on the stack; RET uses that saved address to continue at the caller. A useful debug record includes before-state, instruction, after-state, and evidence. The course NASM/GDB workflow assembles and links actual ELF32 source, then reads registers, EFLAGS, stack, memory, and Intel disassembly from an actual debugger session. A conceptual instruction trace remains useful for prediction, but it is not build evidence.'
        ]
      }
    ],
    examples: [
      {
        title: 'Trace registers and flags instruction by instruction',
        setup: 'Start with EAX=0 and EBX=0, then execute MOV EAX,7; ADD EAX,5; MOV EBX,12; CMP EAX,EBX.',
        steps: ['MOV sets EAX to 7 and leaves flags unchanged.', 'ADD produces EAX=12 with ZF=0 and SF=0.', 'MOV sets EBX=12 and again leaves the prior flags unchanged.', 'CMP computes 12−12 without storing it, so EAX and EBX remain 12 while ZF becomes 1.', 'Contrast CMP with SUB: the flags could match, but SUB would write the zero result into its destination.'],
        conclusion: 'Record both registers and flags. The destination state, not the flags alone, distinguishes CMP from SUB.'
      },
      {
        title: 'Follow ESP and EIP across CALL and RET',
        setup: 'Let ESP=0x00FFF000, place a five-byte CALL at 0x08048400, and put the procedure at 0x08048500.',
        steps: ['CALL pushes return address 0x08048405, decreases ESP to 0x00FFEFFC, and sets EIP to 0x08048500.', 'PUSH EBP decreases ESP again to 0x00FFEFF8 and places saved EBP above the return address.', 'POP EBP restores ESP to 0x00FFEFFC so the return address is on top.', 'RET pops 0x08048405 into EIP and restores ESP to 0x00FFF000.'],
        conclusion: 'ESP must be restored before RET. An unmatched push makes RET treat saved data as an instruction address, so the crash appears at the return rather than at the original stack mistake.'
      }
    ],
    selfChecks: ['Why can identical virtual addresses in two processes map differently?', 'How do assembly text, machine bytes, and instruction addresses describe one program?', 'What evidence distinguishes CMP from SUB?'],
    tutorPrompts: ['Give me a new three-instruction register trace and ask for my before/after table one instruction at a time.', 'Help me classify code, static data, heap, and stack examples without assuming exact addresses.', 'Ask me to predict EIP and ESP across a small CALL and RET before explaining the stack changes.'],
    slideEvidence: 'Lecture 12 PDF, slides 2–25.',
    scopeBoundary: 'Tutor interactions use analogous examples and trace reasoning; they must not produce current homework code, completed traces, or submission-ready assembly.'
  }
] as const;

const NARRATIVE_BY_ID = new Map(LESSON_NARRATIVES.map((lesson) => [lesson.resourceId, lesson]));

export function lessonNarrative(resourceId: string): LessonNarrative | undefined {
  return NARRATIVE_BY_ID.get(resourceId);
}

export function lessonTutorPrompt(resourceId: string, promptIndex: number): string | undefined {
  const lesson = lessonNarrative(resourceId);
  const prompt = lesson?.tutorPrompts[promptIndex];
  if (!lesson || !prompt) return undefined;
  return [
    `I am studying ${lesson.lectureLabel}: ${lesson.title} in CIS 310.`,
    prompt,
    'Use only the CIS 310 sources available in the course tutor. If the named lesson or mapped source is unavailable, say so and ask me to paste the relevant excerpt before relying on it.',
    'Ask for my attempt first, give one hint or analogous example at a time, and do not complete graded work.'
  ].join(' ');
}
