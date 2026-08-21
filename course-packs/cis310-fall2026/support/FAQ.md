# CIS 310 Frequently Asked Questions

These answers address recurring, anonymized themes in prior CIS 310 student questions. They do not reproduce private correspondence. Canvas remains authoritative for Fall 2026 deadlines, released instructions, grades, and submission requirements.

## Who are the instructor and GSI, and where is the class?

CIS 310 section 001 meets Mondays and Wednesdays, 10:00–11:45 a.m., in ELB 1329. The instructor is Dr. Probir Roy (`probirr@umich.edu`), whose office is CIS Building, Room 230. Instructor office hours are Mondays and Wednesdays, 9:30–10:00 a.m. and 12:00–1:00 p.m., or by appointment. No Graduate Student Instructor or grader is currently assigned or confirmed for CIS 310; check Canvas and department announcements for any future staffing update.

## Where do I begin?

Open **Course Modules** in SystemStudio. Complete the next **Accessible lesson → Read → Watch → Practice → Build/debug** module, then open the matching Canvas module for current instructions. Five distinct attempts complete the preparation checkpoint; all eight provide broader practice. These counts do not certify readiness or mastery. Use the packaged lecture as the instructor's visual framing, not as a replacement for the required open book or its paired lesson text.

## Where is the text alternative to a presentation?

Expand the lecture under **Course Modules** and choose **Open accessible HTML lecture**, or open **Course Materials → Accessible HTML lectures — primary**. Each responsive page provides objectives, key terms, direct explanations, worked examples, self-checks, source evidence, and previous/next navigation. The untagged presentation PDF remains available only as an optional visual archive; SystemStudio does not claim that it is independently remediated.

If a diagram, circuit, equation, video, or simulator interaction is still inaccessible, identify the lecture and item and contact the instructor promptly for an equivalent format or activity. The streamed Digital canvas is specifically disclosed as graphical and is not a screen-reader-equivalent circuit editor.

## I cannot see an assignment, lecture video, or final-demonstration instructions in Canvas.

Confirm that you opened the Fall 2026 course, refresh the page, and check **Modules**, **Assignments**, **Announcements**, and the Canvas **To Do** list. A course-navigation tab may be hidden even when a published item is reachable through Modules. If the item is still unavailable, send its exact name and where it was referenced through **Ask a Question Before Class**.

## What exactly do I submit?

Open the current Canvas assignment and check all required file types, naming rules, links, screenshots, reports, collaboration rules, and submission attempts. Packaged assignment references are study aids; they do not override the live Canvas item. If Canvas rejects a required file type, capture the exact error and ask the instructional team before the deadline.

## The expected program output or assignment scope is unclear.

Do not silently choose an interpretation. Quote the ambiguous sentence, state the two interpretations you see, explain how their outputs differ, and use **Ask a Question Before Class**. This is especially important when a task could mean processing one user-supplied value versus producing a complete range or table.

## How do I know Canvas received my work?

Uploading a file is not always the final submission step. Complete **Submit Assignment**, reopen the assignment, and confirm that Canvas displays a recorded submission, timestamp, or receipt. Keep that confirmation. Do not rely only on a local file, Git commit, or upload preview.

## How do I create more than one Digital circuit without overwriting a file?

Use **Create a new blank Digital circuit** and give every file a distinct descriptive name. SystemStudio will not overwrite an existing target and opens it in the complete upstream Digital simulator. Use Digital’s **Save As** when branching an existing design. Confirm the title and file path before editing.

## How should I build a larger adder or processor component?

Write the expected input/output behavior first. Build and test the smallest component, save it as a named subcircuit, then connect verified components one layer at a time. A circuit opening successfully is not evidence that every input case works.

## Is there a guided circuit or assembly walkthrough?

Yes. Expand the matching **Course Modules** entry and choose its build activity, use **Practice and Progress → Build with guided labs**, or run **CIS 310: Open Hands-on Circuit and Assembly Labs**. The Lecture 2 half-adder lab first asks for all four predicted Sum/Carry rows, creates a fresh non-overwriting `.dig` file, and opens Full Digital. It then walks through labeled pins, the Sum and Carry paths, simulation evidence, optional official preview, and explanation. Additional circuit labs cover a Boolean gate path, multiplexer, stored bit, address decoder, and a small arithmetic/logic selector.

## Is the circuit editor a simplified copy of Digital?

No. SystemStudio runs the unmodified upstream Digital v0.31 application. Linux/Remote SSH hosts transport Digital’s real Swing desktop into the VS Code tab; Windows and macOS stream the same application from an extension-managed Docker Desktop container. The native desktop window is an explicit fallback. The read-only preview is generated separately by Digital’s official exporter.

The transported desktop is a graphical canvas: it forwards keyboard and pointer input but does not expose component-level Swing semantics to a VS Code screen reader. It is not a screen-reader-equivalent circuit editor. If this creates an access barrier, contact the instructor promptly for an accessible alternative and evaluate native Digital with the assistive technology available on your platform.

## What is the Instruction Trace Tutor?

Five assembly paths open original example code beside the Instruction Trace Tutor: register arithmetic, flags/branching, an array loop, a stack frame, and virtual input. Predict first and inspect the requested teaching-model register, flag, memory, stack, EIP, output, or trace evidence. These are formative visualization labs—not assembler verification or completed graded artifacts.

## Digital says a flip-flop must be connected to the clock, but I see clock wires.

The unconnected element may be inside a nested subcircuit. Check every flip-flop and register, verify that the signal reaches the clock pin rather than data or enable, and analyze the smallest sequential subcircuit that reproduces the error. Include the exact diagnostic and a screenshot in a help request.

## I am stuck partway through a homework question.

Record five pieces of evidence: what you expected, what happened, the exact line/truth-table row/register/error, one change you tried, and the decision you need help making. Use the local FAQ for routing, the published U-M Maizey App for one course-grounded hint, U-M GPT for a student-typed general troubleshooting prompt, office hours for sustained help, or **Ask a Question Before Class** when the issue would benefit the class.

## What is the AI tutor?

U-M Maizey is the preferred course-grounded conversational tutor after the instructor indexes visible Canvas sources and publishes a student-facing App. Ask it to diagnose your uncertainty, give one hint, explain a related example, or check your reasoning. It may be wrong. Open and verify the source it cites, and do not use it to generate a graded submission. A Maizey Project `detail/overview` page is an instructor-management page, not the student chat.

SystemStudio also links to U-M GPT, the university-supported general assistant available to active students. It receives only what the student deliberately submits and has no automatic Canvas, grade, or local-file access. It is not course-grounded unless the relevant allowed source is included in the prompt, so Maizey remains preferred when available.

## Can Maizey help install or repair the course tools?

Yes, after the instructor enables the CIS 310 Canvas Maizey integration and indexes the current SystemStudio setup guide and FAQ. Orbit can copy a short sanitized diagnostic for the student to review, and Maizey can explain what it means, distinguish a host requirement from a course-container dependency, recommend one documented next step, and describe what successful verification should show.

Maizey cannot inspect or control the laptop, install software, start Docker Desktop, authorize administrator or virtualization changes, run commands, or confirm that setup succeeded. Those actions and checks remain local in SystemStudio. Never paste passwords, Duo codes, tokens, private files, grades, unrestricted logs, or another student's work.

## Can I paste a SystemStudio practice question into the AI tutor?

You may use the tutor to learn from an ungraded preparation, practice, or tutorial question, but answer first. State your choice and one reason, then request a hint or feedback. Asking the tutor for the answer before attempting the question defeats the retrieval activity even when it is not an academic-integrity violation. For homework, projects, quizzes, exams, reports, or other graded work, follow the exact Canvas AI rule. The tutor should not generate a final answer, finished circuit, complete program, report, or submission-ready artifact.

SystemStudio shows a learning-coach checkpoint before either U-M AI route and does not send a prompt automatically. It cannot control another AI website or guarantee that an external model will follow course rules. You remain responsible for the assistance you use and the work you submit. When the boundary is unclear, ask the instructor before using AI.

## Does the extension use the instructor's private AI account or API key?

No. Maizey and U-M GPT use each student's U-M authentication. The local FAQ does not call an AI service. SystemStudio does not contain a shared Canvas token, faculty LLM key, or private instructor-hosted model endpoint and does not attach student files automatically.

## Can I ask something anonymously before class?

Choose **Ask a Question Before Class**, select the anonymous preference, and prepare the post. The extension copies the draft and opens Canvas. The post is anonymous only if the instructor configured that discussion for partial or full anonymity and Canvas shows the anonymous choice. If Canvas does not show it, do not assume the post is anonymous.

## Which assembly environment should I choose?

Use the **Actual NASM Debug Workbench** for claims about compilation or program behavior. It invokes actual NASM, GNU `ld`, an ELF32 executable, and GDB: host tools on x86 Linux or the portable course container on Windows/macOS. The separately labeled **Instruction Trace Tutor** is only an optional source-level visualization and is not proof that NASM accepts a file.

## How do I run unit tests before Canvas submission?

Open **Student Unit Test Center**. Digital files that contain upstream `Testcase`
components and NASM files named `*.test.asm` appear in VS Code's Testing view.
Digital tests run through Digital's official CLI; NASM tests assemble, link, and
execute actual ELF32 code, where exit status 0 passes and a nonzero status fails.
Use Assignment Mission Control for the published register, PC, memory,
register-file, ALU, and integrated-processor contracts. These are private
formative checks—not grades, rubric decisions, or Canvas submissions.

## Where can I get human help?

Use the listed instructor office hours, any GSI office hours announced in Canvas, and the Engineering Learning Center when appropriate. Send a specific evidence-based question early. The AI tutor and local FAQ supplement human support; they do not make deadline exceptions, grade work, or replace the instructional team.
