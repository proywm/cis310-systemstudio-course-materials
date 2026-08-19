# Student-Evaluation Findings

## Purpose

This review asks a design-oriented question: **Where did students report needing help, and which of those needs could reasonably be addressed by a guided VS Code environment?**

The review is not intended to score the instructor, infer the views of nonrespondents, or treat every negative comment as equally representative. Its purpose is to convert recurring, actionable needs into testable product requirements.

## Source corpus and review method

- Source period: Fall 2019 through Winter 2026.
- Courses represented: CIS 310 (Computer Organization and Assembly Language), CIS 450/ECE 478 (Operating Systems), and CIS 578/ECE 578 (Advanced Operating Systems).
- Source type: 15 unique local PDF packages containing open-ended student comments. Some packages contained several cross-listed or combined sections.
- Duplicate control: an exact duplicate Winter 2024 report was counted once. For Winter 2026, the corrected CIS 310 report and separate CIS 450 report were used to avoid double-counting an accidentally appended course report.
- Analysis unit: a recurring concern or helpful practice appearing across course offerings, not the raw number of sentences containing a keyword.
- Privacy: no student names or raw evaluation documents are included in this repository.

The review separated three kinds of statements:

1. **Direct evidence:** students explicitly described a need, obstacle, or useful teaching practice.
2. **Design inference:** a proposed feature plausibly responds to that need.
3. **Unproven outcome:** a claim that the proposed feature actually improves learning or feedback time. These claims require evaluation and are not treated as established.

## Recurring student needs

### 1. Timely and explanatory formative feedback

Across multiple years and courses, students described grades or feedback arriving after later assignments had begun, near an exam, or too late to guide improvement. Some also distinguished a score from useful feedback: they wanted to understand what was wrong, why it was wrong, and what to try next.

**Needed help:** feedback at the point of failure, before the next dependent task.

**Design implication:** run instructor-authored checks locally or in a sandbox, identify observable failures, and provide evidence-linked formative guidance. The product should not assign final grades.

### 2. The transition from concepts to implementation

Students often reported that lectures introduced a concept but projects required a larger implementation jump. Examples included assembly programming, xv6 scheduler changes, synchronization, distributed-systems projects, and processor construction.

**Needed help:** a visible path from concept, to small example, to partial implementation, to complete project.

**Design implication:** divide each reference workflow into milestones with explicit prerequisites, small checks, progressive hints, and a clear description of the intended end state.

### 3. Development-environment and toolchain setup

The most concrete requests concerned C/C++, Docker, Makefiles, QEMU/xv6, Git/GitHub, Windows/macOS/Linux differences, assembly tools, IDE configuration, and circuit-simulation software. Students sometimes spent substantial project time determining whether a failure came from their code or from the environment.

**Needed help:** a reproducible toolchain, a preflight diagnosis, and platform-specific recovery guidance.

**Design implication:** provision course tools inside a versioned Dev Container or remote equivalent; detect missing host prerequisites; validate the environment before coursework begins; and keep course commands consistent across platforms.

### 4. Smaller, scaffolded practice with immediate explanations

Students repeatedly requested more examples, programming demonstrations, practice problems, short quizzes, in-class labs, and smaller assignments that build into a larger result. Positive comments often praised group practice, live coding, diagrams, and hands-on work.

**Needed help:** frequent low-stakes practice and feedback before high-stakes work.

**Design implication:** adopt a Magoosh-style loop: short concept explanation, worked analogy, diagnostic question, explanation of each answer, small implementation task, immediate check, and scheduled retry when needed.

### 5. Uneven prerequisite knowledge and course pacing

Students reported different prior exposure to C/C++, assembly, digital logic, Linux, and systems tooling. Some described lectures as moving too quickly or assuming knowledge they had not encountered in prerequisites.

**Needed help:** targeted prerequisite refreshers without forcing every student through the same remediation.

**Design implication:** use a short readiness check and recommend only the micro-lessons associated with demonstrated gaps. The tool should make recommendations, not label students by ability.

### 6. Clear requirements, sequencing, and success criteria

Comments described vague instructions, unclear final states, changing requirements, and mismatches among assignment instructions, rubrics, and TA expectations. This was particularly damaging when one project milestone depended on an earlier unverified implementation.

**Needed help:** one authoritative, versioned view of the assignment and its milestones.

**Design implication:** use instructor-authored course packs containing objectives, prerequisites, approved resources, rubric criteria, tests, deadlines, and version history. AI must not invent or reinterpret requirements.

### 7. A safer and more efficient help-seeking path

Some students praised instructor availability and office-hour help; others described slow email responses, uncertainty about whether to contact the instructor or TA, or reluctance to participate after an incorrect response in class.

**Needed help:** private low-stakes practice and a predictable escalation channel.

**Design implication:** let students request a hint privately and, when needed, create a concise help packet containing the question, relevant evidence, attempted fixes, and environment details. The student must approve what is shared.

## Positive practices to preserve

The product should amplify rather than replace practices students already found useful:

- collaborative problem solving;
- live coding and live circuit construction;
- diagrams and execution traces;
- practical assignments tied to concepts;
- multiple explanations or analogies;
- accessible office hours and patient one-on-one assistance; and
- repeated review that helps students remain oriented.

## Important nuance

The most severe cluster of concerns appeared in a Fall 2024 CIS 310 experimental project-based offering, including criticism of vague project requirements and being redirected to generic ChatGPT. That term should not be presented as representative of every offering. Later CIS 310 comments include improved reports of streamlined structure, hands-on work, useful materials, and strong assistance. However, the underlying needs---tool setup, scaffolding, explanatory feedback, and assignment clarity---also appear in other years and courses, so the design problem is broader than a single term.

The latest Winter 2026 CIS 450 comments continued to identify environment demonstrations, C/Makefile/Docker guidance, project pacing, and delayed feedback as needs. This makes CIS 450 a strong first implementation target for a VS Code-centered prototype.

## What the evidence supports

The evaluations support the claim that students have repeatedly requested:

- more immediate and explanatory formative feedback;
- clearer project scaffolding;
- more implementation examples and practice;
- better environment/tooling support; and
- more effective routes for obtaining help.

## What the evidence does not support

The evaluations do not establish that:

- students asked for an AI system;
- an AI tutor will be accurate or trusted;
- automated feedback will necessarily improve learning;
- the system can reliably return useful feedback within a specified number of hours; or
- software can correct course pacing, curriculum alignment, assignment quality, or classroom climate by itself.

Those are design hypotheses or limits that must remain explicit in the proposal and evaluation plan.
