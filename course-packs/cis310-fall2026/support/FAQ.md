# CIS 310 Frequently Asked Questions

These answers address recurring, anonymized themes in prior CIS 310 student questions. They do not reproduce private correspondence. Canvas remains authoritative for Fall 2026 deadlines, released instructions, grades, and submission requirements.

## Where do I begin?

Open **Start Here** in SystemStudio. Complete the next **Read → Watch → Try 3 questions** module, then open the matching Canvas module for current instructions. Use the packaged lecture as the instructor's framing, not as a replacement for the required open book.

## I cannot see an assignment, lecture video, or final-demonstration instructions in Canvas.

Confirm that you opened the Fall 2026 course, refresh the page, and check **Modules**, **Assignments**, **Announcements**, and the Canvas **To Do** list. A course-navigation tab may be hidden even when a published item is reachable through Modules. If the item is still unavailable, send its exact name and where it was referenced through **Ask a Question Before Class**.

## What exactly do I submit?

Open the current Canvas assignment and check all required file types, naming rules, links, screenshots, reports, collaboration rules, and submission attempts. Packaged assignment references are study aids; they do not override the live Canvas item. If Canvas rejects a required file type, capture the exact error and ask the instructional team before the deadline.

## The expected program output or assignment scope is unclear.

Do not silently choose an interpretation. Quote the ambiguous sentence, state the two interpretations you see, explain how their outputs differ, and use **Ask a Question Before Class**. This is especially important when a task could mean processing one user-supplied value versus producing a complete range or table.

## How do I know Canvas received my work?

Uploading a file is not always the final submission step. Complete **Submit Assignment**, reopen the assignment, and confirm that Canvas displays a recorded submission, timestamp, or receipt. Keep that confirmation. Do not rely only on a local file, Git commit, or upload preview.

## How do I create more than one Digital circuit without overwriting a file?

Use **Create a new blank Digital circuit** and give every file a distinct descriptive name. SystemStudio will not overwrite an existing target. In Digital, use **Save As** when branching an existing design. Confirm the title and file path before editing.

## How should I build a larger adder or processor component?

Write the expected input/output behavior first. Build and test the smallest component, save it as a named subcircuit, then connect verified components one layer at a time. A circuit opening successfully is not evidence that every input case works.

## Is there a guided circuit or assembly walkthrough?

Yes. Open **Learn and Practice → Build with guided labs** or run **CIS 310: Open Hands-on Circuit and Assembly Labs**. The Lecture 2 half-adder lab first asks for all four predicted Sum/Carry rows, creates a fresh non-overwriting `.dig` file, then walks through labeled pins, the Sum and Carry paths, simulation evidence, preview, and explanation. Additional circuit labs cover a Boolean gate path, multiplexer, stored bit, address decoder, and a small arithmetic/logic selector.

Five assembly paths open original example code beside the embedded machine-state panel: register arithmetic, flags/branching, an array loop, a stack frame, and virtual input. Predict first and inspect the requested register, flag, memory, stack, EIP, output, or trace evidence. These are formative prerequisite or analogous labs—not completed graded assignment artifacts.

## Digital says a flip-flop must be connected to the clock, but I see clock wires.

The unconnected element may be inside a nested subcircuit. Check every flip-flop and register, verify that the signal reaches the clock pin rather than data or enable, and analyze the smallest sequential subcircuit that reproduces the error. Include the exact diagnostic and a screenshot in a help request.

## I am stuck partway through a homework question.

Record five pieces of evidence: what you expected, what happened, the exact line/truth-table row/register/error, one change you tried, and the decision you need help making. Use the local FAQ for routing, U-M Maizey for one source-grounded hint, office hours for sustained help, or **Ask a Question Before Class** when the issue would benefit the class.

## What is the AI tutor?

U-M Maizey is the optional course-grounded conversational tutor inside Canvas. Ask it to diagnose your uncertainty, give one hint, explain a related example, or check your reasoning. It may be wrong. Open and verify the source it cites, and do not use it to generate a graded submission.

## Can I paste a SystemStudio practice question into the AI tutor?

You may use the tutor to learn from an ungraded readiness or tutorial question, but answer first. State your choice and one reason, then request a hint or feedback. Asking the tutor for the answer before attempting the question defeats the retrieval activity even when it is not an academic-integrity violation. For homework, projects, quizzes, exams, reports, or other graded work, follow the exact Canvas AI rule. The tutor should not generate a final answer, finished circuit, complete program, report, or submission-ready artifact.

SystemStudio shows a learning-coach checkpoint before opening Maizey, but it cannot control another AI website or guarantee that an external model will follow course rules. You remain responsible for the assistance you use and the work you submit. When the boundary is unclear, ask the instructor before using AI.

## Does the extension use the instructor's private AI account or API key?

No. The extension opens the U-M Maizey course tutor, where each student authenticates with a U-M account. The local FAQ does not call an AI service. SystemStudio does not contain a shared Canvas token or a faculty LLM key.

## Can I ask something anonymously before class?

Choose **Ask a Question Before Class**, select the anonymous preference, and prepare the post. The extension copies the draft and opens Canvas. The post is anonymous only if the instructor configured that discussion for partial or full anonymity and Canvas shows the anonymous choice. If Canvas does not show it, do not assume the post is anonymous.

## Which assembly environment should I choose?

Use **Irvine32 Classroom** for the textbook-style MASM/Irvine subset, **NASM IA-32** for NASM syntax, or **Auto-detect** when unsure. The embedded teaching interpreter works consistently across Windows, macOS, Linux, and Remote SSH. It is not a full native assembler or operating-system toolchain.

## Where can I get human help?

Use instructor/TA office hours and the Engineering Learning Center when appropriate. Send a specific evidence-based question early. The AI tutor and local FAQ supplement human support; they do not make deadline exceptions, grade work, or replace the instructional team.
