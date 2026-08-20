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
        setup: 'Treat the pattern as an unsigned eight-bit value.',
        steps: ['The 1-bits have weights 128, 32, 16, and 2.', 'Their decimal sum is 178.', 'Group 1011 and 0010; these groups are hexadecimal B and 2.'],
        conclusion: 'The same bit pattern can be written as binary 1011 0010, decimal 178, or hexadecimal B2.'
      },
      {
        title: 'Add binary 1110 and 1111',
        setup: 'Work from the least significant bit and preserve every carry.',
        steps: ['The values are decimal 14 and 15.', 'Their sum is decimal 29.', 'Decimal 29 is binary 11101, so a fifth bit is required.'],
        conclusion: 'A fixed four-bit destination would retain only 1101 and report a carry; a wider result is 11101.'
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
        title: 'Evaluate one full-adder row',
        setup: 'Let A equal 1, B equal 0, and Carry-in equal 1.',
        steps: ['The input total is decimal 2.', 'Decimal 2 is binary 10.', 'The low result bit is Sum equal to 0; the high result bit is Carry-out equal to 1.'],
        conclusion: 'Writing Carry-out followed by Sum gives 10, preserving the complete one-column result.'
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
        title: 'Create one canonical minterm',
        setup: 'A truth-table output is 1 for A equal to 0, B equal to 1, and C equal to 0.',
        steps: ['A is 0, so use NOT A.', 'B is 1, so use B.', 'C is 0, so use NOT C.', 'AND the three literals.'],
        conclusion: 'The minterm is (NOT A) AND B AND (NOT C), true for exactly that input row.'
      },
      {
        title: 'Simplify AB plus A(NOT B)',
        setup: 'The two terms share A.',
        steps: ['Factor A to obtain A times (B plus NOT B).', 'Use the complement law: B plus NOT B equals 1.', 'Use the identity law: A times 1 equals A.'],
        conclusion: 'The simpler expression A has the same truth table as the original expression.'
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
        title: 'Translate a four-cell group',
        setup: 'In a three-variable map, a group contains all four cells where A is 1 while B and C take every combination.',
        steps: ['A remains 1 in all four cells.', 'B changes, so B disappears.', 'C changes, so C disappears.'],
        conclusion: 'The entire group contributes the single product term A.'
      },
      {
        title: 'Recognize an edge group',
        setup: 'The first and last columns are labeled 00 and 10.',
        steps: ['The labels differ only in the first bit.', 'Those columns are adjacent despite appearing on opposite edges.', 'A rectangle may wrap across the boundary if its cells satisfy the normal grouping rules.'],
        conclusion: 'The drawn rectangle may look split, but it represents one adjacent group.'
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
        setup: 'Let select bits S1 S0 equal 10, with D0 through D3 equal 1, 0, 1, 0.',
        steps: ['The select code 10 is decimal 2.', 'The selected input is D2.', 'D2 is 1, so output Y is 1; unselected inputs do not affect Y.'],
        conclusion: 'A MUX answers “which input reaches Y?” rather than “which output is enabled?”'
      },
      {
        title: 'Trace a two-to-four active-high decoder',
        setup: 'Let address bits A1 A0 equal 01.',
        steps: ['The code 01 is decimal 1.', 'Output Y1 is selected.', 'Y0, Y2, and Y3 remain 0.'],
        conclusion: 'Exactly one output is 1 for each valid input code in this active-high decoder.'
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
        title: 'Observe a D flip-flop holding state',
        setup: 'Q initially stores 0. D changes to 1, but no active clock edge occurs.',
        steps: ['D is the requested next value.', 'Without the configured edge, the storage event has not happened.', 'Q remains at its present value 0.', 'At the next rising edge, Q becomes 1.'],
        conclusion: 'The difference between D and Q before the edge is direct evidence that the element stores state.'
      },
      {
        title: 'Describe a divide-by-two sequence',
        setup: 'A flip-flop is configured so its next state is the complement of its present state.',
        steps: ['Start with Q equal to 0.', 'First active edge stores 1.', 'Second active edge stores 0.', 'One full output cycle therefore takes two input clock edges.'],
        conclusion: 'The output frequency is half the input clock frequency because Q toggles once per edge.'
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
        setup: 'A memory has 12 address lines and 16 data lines.',
        steps: ['Twelve address lines select 2 to the power 12, or 4,096, locations.', 'Sixteen data lines make each location 16 bits wide.', 'Total data capacity is 4,096 times 16 bits, or 65,536 bits.'],
        conclusion: 'Address width determines location count; data width determines bits per location.'
      },
      {
        title: 'Separate device and local address bits',
        setup: 'A processor has a 16-bit address and a selected device contains 1,024 locations.',
        steps: ['1,024 equals 2 to the power 10, so ten low-order bits select a location.', 'The remaining six high-order bits can participate in device selection.', 'Holding those six bits fixed defines one aligned 1,024-address range.'],
        conclusion: 'The same address simultaneously selects a device range and a row within that device.'
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
        setup: 'A program needs to send one value to a device.',
        steps: ['Read status until BUSY is false.', 'Write the value to the data register.', 'Write the operation to the command register.', 'Read status until completion or error is reported.'],
        conclusion: 'The status checks protect the protocol, but repeated checks occupy processor time.'
      },
      {
        title: 'Choose polling or an interrupt',
        setup: 'Device A completes in a few processor cycles; Device B may take milliseconds.',
        steps: ['For Device A, interrupt and context-switch overhead may exceed the short wait.', 'For Device B, polling would waste many cycles.', 'A reasonable initial choice is brief polling for A and interrupt-driven completion for B.'],
        conclusion: 'The decision depends on expected latency, event rate, and handling overhead—not on a universal rule.'
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
        title: 'Plan a DMA input transfer',
        setup: 'A device will deliver a 4 KiB block into memory.',
        steps: ['The processor configures the device and DMA destination/length.', 'The DMA controller performs the repeated transfers.', 'The processor runs other work during transfer.', 'A completion event causes software to verify status and consume the buffer.'],
        conclusion: 'DMA changes who performs bulk movement, while the processor remains responsible for setup and completion handling.'
      },
      {
        title: 'Choose storage for two data types',
        setup: 'A sensor has a temporary sample buffer and a calibration value that must survive power loss.',
        steps: ['The active sample buffer needs fast runtime access, so volatile RAM is suitable.', 'The calibration value needs retention, so flash or EEPROM is suitable.', 'If the calibration changes often, write endurance must also be considered.'],
        conclusion: 'Retention is the first distinction, followed by performance and endurance tradeoffs.'
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
        title: 'Count lines in a cache',
        setup: 'A 32 KiB cache uses 64-byte blocks and metadata is ignored.',
        steps: ['32 KiB equals 32 times 1,024, or 32,768 bytes.', 'Divide 32,768 by 64 bytes per block.', 'The result is 512 cache lines.'],
        conclusion: 'Capacity and block size determine line count; associativity determines how those lines are organized into sets.'
      },
      {
        title: 'Classify locality in an array loop',
        setup: 'A loop reads A[0], A[1], A[2], and A[3], then repeats the loop.',
        steps: ['Consecutive elements demonstrate spatial locality.', 'Repeating the loop demonstrates temporal reuse of the same elements.', 'A block containing several adjacent elements can help both patterns.'],
        conclusion: 'One access sequence can exhibit both spatial and temporal locality for different reasons.'
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
        title: 'Trace c receives a plus b',
        setup: 'Variables a and b are in memory and the ALU operates on registers.',
        steps: ['Load a into register R1.', 'Load b into register R3.', 'Use the ALU to compute R1 plus R3 and store the result in R2.', 'Store R2 into memory location c.'],
        conclusion: 'The trace separates memory transfers from the arithmetic operation.'
      },
      {
        title: 'Interpret one RTL statement',
        setup: 'R4 receives R1 XOR R2.',
        steps: ['R1 and R2 are source registers.', 'XOR is the selected ALU operation.', 'R4 is the destination state element.', 'The control unit must select all three roles and permit R4 to update.'],
        conclusion: 'RTL is concise, but each symbol corresponds to a data path or control action.'
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
        title: 'Find an ideal completion count',
        setup: 'Six instructions enter an ideal five-stage pipeline with no stalls.',
        steps: ['The first instruction needs five cycles to pass through five stages.', 'Each of the remaining five instructions completes one cycle later.', 'Total cycles equal 5 plus 6 minus 1, which is 10.'],
        conclusion: 'The pipeline fill cost is four extra cycles beyond the six steady completions.'
      },
      {
        title: 'Classify a dependency',
        setup: 'ADD writes R1, and the next SUB reads R1.',
        steps: ['The instructions require the same value in producer-consumer order.', 'This is a data hazard, not a resource or branch conflict.', 'If the ADD result exists in time, forwarding can feed SUB directly; otherwise a stall is needed.'],
        conclusion: 'Classification alone does not prove the remedy; stage timing determines whether forwarding is sufficient.'
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
          'CALL transfers control while saving a return address on the stack; RET uses that saved address to continue at the caller. A trace should record before-state, instruction, after-state, and evidence. SystemStudio’s Instruction Trace Tutor is a learning model, not an assembler; real NASM or exact Windows MASM/Irvine execution is separate.'
        ]
      }
    ],
    examples: [
      {
        title: 'Trace MOV and ADD',
        setup: 'EAX begins at 0. Execute MOV EAX, 7 followed by ADD EAX, 5.',
        steps: ['MOV replaces EAX with 7.', 'ADD reads the current 7 and adds 5.', 'EAX becomes 12.', 'The result is neither zero nor negative, so zero and sign flags are clear in this bounded example.'],
        conclusion: 'Name the exact instruction responsible for each observed state change.'
      },
      {
        title: 'Trace a call boundary',
        setup: 'EIP points to a CALL and ESP points to the current stack top.',
        steps: ['CALL places the return address on the stack and adjusts ESP.', 'EIP changes to the procedure entry.', 'The procedure may save registers or establish a frame.', 'RET obtains the saved return address and resumes the caller.'],
        conclusion: 'The saved return address connects stack behavior to control flow.'
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
