# CIS 310 Learning Center: Design and Evidence

## Purpose

The Learning Center reduces the distance between reading source material and knowing what to do next. It gives a student one recommended pre-class action, focused open-book reading, targeted official author videos, a small amount of retrieval practice, explanatory feedback, a related packaged lecture, and a transparent path back to review. It is formative support inside the active course tool, not a gradebook, adaptive tutor, or mastery-certification system.

## What the usability audit found

Before version 0.9.0, SystemStudio reduced installation and navigation overhead but still made students choose among several parallel tools. It organized presentations and assignments, yet the slides could remain the student's default or only study source. It did not provide focused pre-class book/video preparation, retrieval practice, confidence calibration, a review queue, or a visible record of learning attempts. The guided tutorial tracked tool completion rather than conceptual learning.

The prior CIS 310 student-evaluation review identified recurring needs that this release addresses:

- smaller, low-stakes practice opportunities with prompt explanations;
- concept-to-implementation bridges before circuit and assembly work;
- targeted prerequisite refreshers;
- less setup friction and clearer separation of tool problems from concept problems; and
- help paths that ask for expected behavior, observed evidence, and remaining uncertainty.

These findings inform the design; they do not imply that version 0.9.0 has already improved course outcomes. Classroom evaluation is still required.

## Student-centered practice patterns

The design combines established student-support patterns: a clean starting point, bounded reading targets, readiness-tagged author videos, customizable practice, different feedback timing for guided practice and quizzes, answer explanations, related lessons, saved questions, distributed review, a study sequence, descriptive progress evidence, and a visible help path. Each pattern is implemented specifically for CIS 310 materials and evaluated against learning-science evidence and student needs.

| Observed pattern | CIS 310 adaptation | Intended student benefit |
|---|---|---|
| Simple dashboard and personalized suggestions | One expanded **Start Here** group and the next incomplete lecture preparation | Less scanning and less uncertainty about where to begin |
| Video lessons and study schedule | A self-paced 13-module **Accessible lesson → Read → Watch → Practice 8 questions → Build/trace** path, with transcript-checked readiness sources separated from additional references | Make pre-class preparation concrete without implying every listed video is a short required lesson |
| Lesson library | A novice-facing responsive HTML explanation, focused Tarnoff sections, targeted official author videos, and the paired visual lecture for every topic | Provide direct text, examples, and source navigation instead of requiring students to infer concepts from slides alone |
| Custom sessions by amount or topic | Five, 10, or 15 questions across six course topics | A bounded commitment and student control |
| Practice and quiz modes | Immediate explanation in practice; explanation withheld until quiz completion | Support during learning and a more independent retrieval check |
| Explanations and related lessons | Original text explanation, one-sentence takeaway, mapped open-book focus, mapped official author-video focus, and packaged lecture | Connect an answer to the underlying concept without claiming a page- or timestamp-specific deep link when the source opens at document/video level |
| Guided deliberate practice | Seven circuit builds and five assembly traces, each mapped to lecture sources and structured as predict → construct/step → inspect → explain; required work is visible within its module | Bridge declarative lecture knowledge to visible signal or machine-state evidence without supplying a graded artifact |
| Full circuit construction | The complete upstream Digital application, transported into VS Code from a private Linux display or an extension-managed Docker Desktop runtime on Windows/macOS; native launch is an explicit fallback | Preserve the authentic component library, interaction model, file behavior, simulation, and dialogs instead of teaching a reduced substitute |
| Flagging and review filters | Save for review; due, saved, topic, and recommended filters | Make unresolved items easy to find again |
| Adaptive/spaced flashcard review | Transparent 1, 2, 4, 7, 14, and 30-day local schedule | Revisit material over time rather than only once |
| Progress and pacing summaries | Coverage, practice accuracy, due items, practice days, and confidence mismatches | Show evidence of effort and guide the next study action |
| Human-help escalation | Local deterministic FAQ chat, U-M Maizey course-tutor handoff, optional error reflection, and a structured Canvas Questions Before Class draft | Turn confusion into a specific next step, a source-grounded tutor dialogue, or an actionable instructor question without implying live expert staffing |

The extension does not guarantee an exam score, grade increase, mastery, or learning outcome. It excludes peer comparison, competitive ranking, mandatory streaks, cloud accounts, and invented deadlines. A separate manual calculator may apply the published 15/65/20 weights and two-lowest participation-item drop rule to scores a student copies from Canvas. It identifies the lowest rows by percentage and combines retained earned/possible points so unequal point values are not silently equalized. It remains labeled as a planning estimate—not an instructor evaluation, official Canvas grade, or prediction. Canvas remains the only authority for deadlines, grades, policies, and submission.

## Open-book and author-video pathway

The required open text is David Tarnoff's *Computer Organization and Design Fundamentals*, supplemented only where the course presentation needs a directly aligned open source (OSTEP for I/O devices and address spaces). Each of the 13 presentation resources maps to a novice-facing primary HTML lecture, focused readings, one or more transcript-checked videos from Tarnoff's official Intermation channel or ETSU OER series, an optional visual PDF archive, one readiness prompt, exactly eight related questions, and hands-on work where appropriate. Five distinct questions establish the readiness checkpoint; all eight form the confidence set. This changes the default sequence from “open the slides” to:

1. **Study the accessible lesson:** use the direct HTML explanation, objectives, key terms, worked examples, and self-check prompts; open the paired PDF when its visual framing helps;
2. **Read:** begin with the sources tagged for the readiness prompt, use additional references when useful, and self-mark the reading step;
3. **Watch:** begin with the author videos tagged for readiness, use the others as additional explanations, and self-mark the video step;
4. **Retrieve:** answer five mapped questions without reopening the source, then continue to eight for broader confidence-building practice;
5. **Build/trace:** construct and test the mapped circuit or inspect instruction-by-instruction machine state where the topic supports authentic hands-on work; and
6. **Bring uncertainty:** use an attempt-first lesson tutor prompt, or take one unresolved point or confident miss to class or to the instructor.

The extension links to authoritative sources instead of redistributing the book or downloading videos. This avoids stale copies and copyright ambiguity. It also means book/video access leaves VS Code and is governed by the external site's privacy and accessibility behavior. The buttons display the relevant section or concept focus, but the external PDF/video may open at its beginning; the interface therefore calls these **mapped sources**, not exact page or timestamp links. Primary HTML lectures and optional PDF archives remain local, and no Google Drive link is used.

## Learning-science rationale

- Retrieval practice can improve later retention more than repeated study. Each session asks the student to retrieve before showing an explanation.
- Repeated and distributed retrieval supports longer-term retention. Correct responses move through an explicit review schedule; a miss returns the question to near-term review.
- Corrective feedback matters. Practice mode provides immediate explanatory feedback; quiz mode delays it only until the short session ends.
- Confidence judgments can reveal calibration gaps. A high-confidence miss is surfaced for review; a correct-but-uncertain answer is treated as useful evidence that the concept still deserves attention.
- Interleaving can improve discrimination among related problem types. Recommended sessions rotate among course topics when appropriate rather than exhausting one category by default.
- Worked explanations and metacognitive prompts can help novices bridge concepts and procedures. Each item includes a hint, explanation, takeaway, related lesson, and optional error category.
- Scaffolding and worked-example fading support novices when a complete project is too large to diagnose. Guided labs begin with a bounded prerequisite or analogous example, require a prediction, and then shift the explanation back to the student; they do not bundle the larger graded solution.

The implemented scheduler and recommendation weights are conservative instructional heuristics, not a validated cognitive model. They should be evaluated and revised using course evidence.

## Cognitive-overhead decisions

- **Course Modules** keeps all 13 module titles visible; only the selected/next module needs to be expanded. Specialized tools remain grouped and collapsed.
- The primary action is the next incomplete Accessible lesson → Read → Watch → Practice → Build/trace module; readiness requires reading and video self-checks plus five distinct questions, and module completion also includes required hands-on work. All eight questions remain available as the confidence set.
- Questions appear one at a time with one required choice and one confidence choice.
- Explanations use a stable structure: outcome, explanation, takeaway, related lesson, optional reflection, next.
- Full Digital setup, real assembly execution, the non-assembler trace tutor, learning, and help are separately labeled so an environment failure is not mistaken for a concept failure.
- Student-facing course files open as rendered documents, not raw Markdown.
- Sessions remain skippable; practice does not block access to assignments, tools, or Canvas.
- Hands-on labs use one stable six-checkpoint pattern, create non-overwriting circuit files, open circuits in upstream Digital, and open formative code beside the explicitly labeled Instruction Trace Tutor. Actual assembler behavior is checked only through the real-toolchain command.
- Status labels use neutral language such as **building**, **review**, and **steady**, not pass/fail or mastered/not mastered.

## Progress model and privacy

Progress is stored in VS Code's local extension storage. The record contains self-reported reading/video completion, guided-lab and coursework-planning checkmarks, final-project self-evaluation, imported Canvas-calendar events, question-level attempt counts, correctness, confidence, hint use, review date, saved state, optional reflection categories, and a bounded recent-attempt log. It is not transmitted to Canvas, the instructor, an AI provider, or an analytics service. Students can reset local records from the relevant dashboard.

The chat-style help entry does not change this boundary. Local FAQ questions are processed in the extension and are not retained. Selecting U-M Maizey or the Canvas question queue opens a U-M service outside the local extension boundary; its U-M privacy notice and course rules apply. The extension does not contain a faculty LLM credential, Canvas token, or automatic posting authority.

The learning dashboard is descriptive. Accuracy means correct responses divided by local attempts. Coverage means unique questions encountered. Practice days count local calendar dates with an attempt. Topic labels summarize those same attempts. Coursework status and self-evaluation are also local student judgments. None is an instructor grade, accommodation decision, mastery certification, or official Canvas record. The manual grade estimator is kept in a visually separate section and displays its assumptions with every result.

## Content and classroom validation checklist

Before classroom release, the instructor should:

1. verify every reading section, author video, question, option, explanation, and lecture mapping against the Fall 2026 materials, following the [content alignment audit](CONTENT_ALIGNMENT_AUDIT.md);
2. check that no practice item exposes a graded assignment answer or hidden assessment content;
3. verify every guided lab against its reading/video/lecture mapping and confirm its artifact and constants remain distinct from graded deliverables;
4. complete each circuit lab in the upstream Digital application, run the real-toolchain assembly examples on their supported hosts, and separately verify each formative example in the Instruction Trace Tutor;
5. run keyboard, screen-reader, contrast, zoom, and reduced-motion checks on each Learning Center screen, while treating the streamed Digital canvas as graphical output rather than a screen-reader-equivalent circuit editor;
6. smoke-test the packaged VSIX on Windows, macOS, and Linux;
7. pilot the language and session length with a small student group;
8. compare pre/post concept evidence and confidence calibration without treating dashboard labels as outcomes; and
9. revise or retire questions or labs that are ambiguous, misleading, or poorly aligned.

## Sources

- David Tarnoff, [Computer Organization and Design Fundamentals](https://faculty.etsu.edu/tarnoff/138292/)
- East Tennessee State University, [Computer Organization and Design Fundamentals OER series](https://dc.etsu.edu/computer-organization-design-oer/)
- David Tarnoff, [Intermation author-video channel](https://www.youtube.com/@Intermation)
- Karpicke & Roediger (2007), [Repeated retrieval during learning is the key to long-term retention](https://doi.org/10.1016/j.jml.2006.09.004)
- Butler, Karpicke, & Roediger (2007), [The effect of type and timing of feedback on learning from multiple-choice tests](https://doi.org/10.1037/1076-898X.13.4.273)
- Cepeda et al. (2006), [Distributed practice in verbal recall tasks: A review and quantitative synthesis](https://doi.org/10.1037/0033-2909.132.3.354)
- Carpenter et al. (2019), [Using spacing to enhance diverse forms of learning](https://doi.org/10.1016/j.cedpsych.2018.12.001)
- Rohrer & Taylor (2007), [The shuffling of mathematics problems improves learning](https://doi.org/10.1002/acp.1598)
