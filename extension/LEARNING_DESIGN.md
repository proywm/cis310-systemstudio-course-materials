# CIS 310 Learning Center: Design and Evidence

## Purpose

The Learning Center reduces the distance between reading source material and knowing what to do next. It gives a student one recommended pre-class action, focused open-book reading, an official author video, a small amount of retrieval practice, explanatory feedback, a related packaged lecture, and a transparent path back to review. It is formative support inside the active course tool, not a gradebook, adaptive tutor, or mastery-certification system.

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

The design combines established student-support patterns: a clean starting point, short text and video lessons, customizable practice, different feedback timing for guided practice and quizzes, answer explanations, related lessons, saved questions, distributed review, a study sequence, descriptive progress evidence, and a visible help path. Each pattern is implemented specifically for CIS 310 materials and evaluated against learning-science evidence and student needs.

| Observed pattern | CIS 310 adaptation | Intended student benefit |
|---|---|---|
| Simple dashboard and personalized suggestions | One expanded **Start Here** group and the next incomplete lecture preparation | Less scanning and less uncertainty about where to begin |
| Video lessons and study schedule | A 13-module **Read → Watch → Try 3 questions** path, ordered by the course sequence | Make pre-class preparation concrete and keep the required text ahead of the slides |
| Lesson library | Focused Tarnoff chapter sections, an official author video, and the packaged lecture for every topic | Let a student move among primary explanation, audiovisual reinforcement, and class framing |
| Custom sessions by amount or topic | Five, 10, or 15 questions across six course topics | A bounded commitment and student control |
| Practice and quiz modes | Immediate explanation in practice; explanation withheld until quiz completion | Support during learning and a more independent retrieval check |
| Explanations and related lessons | Original text explanation, one-sentence takeaway, mapped open-book section, official author video, and packaged lecture | Connect an answer to the underlying concept without claiming a bespoke video explanation for every question |
| Flagging and review filters | Save for review; due, saved, topic, and recommended filters | Make unresolved items easy to find again |
| Adaptive/spaced flashcard review | Transparent 1, 2, 4, 7, 14, and 30-day local schedule | Revisit material over time rather than only once |
| Progress and pacing summaries | Coverage, practice accuracy, due items, practice days, and confidence mismatches | Show evidence of effort and guide the next study action |
| Human-help escalation | Local deterministic FAQ chat, U-M Maizey course-tutor handoff, optional error reflection, and a structured Canvas Questions Before Class draft | Turn confusion into a specific next step, a source-grounded tutor dialogue, or an actionable instructor question without implying live expert staffing |

The extension does not guarantee an exam score, grade increase, mastery, or learning outcome. It also excludes estimated course scores, peer comparison, competitive ranking, mandatory streaks, cloud accounts, and automated deadline reminders. Those features can introduce false precision, anxiety, privacy costs, or another source of course deadlines. Canvas remains the only authority for deadlines, grades, and submission.

## Open-book and author-video pathway

The required open text is David Tarnoff's *Computer Organization and Design Fundamentals*. Each of the 13 presentation resources maps to one or two focused chapter readings, one video from Tarnoff's official Intermation channel or ETSU OER series, one readiness prompt, and exactly three related retrieval questions. This changes the default sequence from “open the slides” to:

1. **Read:** open the assigned book chapter/sections and self-mark completion;
2. **Watch:** use the author video as a second explanation and self-mark completion;
3. **Retrieve:** answer three mapped questions without reopening the source; and
4. **Bring uncertainty:** take one unresolved point or confident miss to class or to the instructor.

The extension links to authoritative sources instead of redistributing the book or downloading videos. This avoids stale copies and copyright ambiguity. It also means book/video access leaves VS Code and is governed by the external site's privacy and accessibility behavior. The packaged lecture PDFs remain local and no Google Drive link is used.

## Learning-science rationale

- Retrieval practice can improve later retention more than repeated study. Each session asks the student to retrieve before showing an explanation.
- Repeated and distributed retrieval supports longer-term retention. Correct responses move through an explicit review schedule; a miss returns the question to near-term review.
- Corrective feedback matters. Practice mode provides immediate explanatory feedback; quiz mode delays it only until the short session ends.
- Confidence judgments can reveal calibration gaps. A high-confidence miss is surfaced for review; a correct-but-uncertain answer is treated as useful evidence that the concept still deserves attention.
- Interleaving can improve discrimination among related problem types. Recommended sessions rotate among course topics when appropriate rather than exhausting one category by default.
- Worked explanations and metacognitive prompts can help novices bridge concepts and procedures. Each item includes a hint, explanation, takeaway, related lesson, and optional error category.

The implemented scheduler and recommendation weights are conservative instructional heuristics, not a validated cognitive model. They should be evaluated and revised using course evidence.

## Cognitive-overhead decisions

- Only **Start Here** is expanded by default; specialized tools remain grouped and collapsed.
- The primary action is the next incomplete Read → Watch → Try module; a five-question recommended session is the second action and customization is secondary.
- Questions appear one at a time with one required choice and one confidence choice.
- Explanations use a stable structure: outcome, explanation, takeaway, related lesson, optional reflection, next.
- Setup, Digital, assembly, learning, and help are separate groups so a tool failure is not mistaken for a content failure.
- Student-facing course files open as rendered documents, not raw Markdown.
- Sessions remain skippable; practice does not block access to assignments, tools, or Canvas.
- Status labels use neutral language such as **building**, **review**, and **steady**, not pass/fail or mastered/not mastered.

## Progress model and privacy

Progress is stored in VS Code's local extension storage. The record contains self-reported reading/video completion, question-level attempt counts, correctness, confidence, hint use, review date, saved state, optional reflection categories, and a bounded recent-attempt log. It is not transmitted to Canvas, the instructor, an AI provider, or an analytics service. Students can reset it from the dashboard.

The chat-style help entry does not change this boundary. Local FAQ questions are processed in the extension and are not retained. Selecting U-M Maizey or the Canvas question queue opens a U-M service outside the local extension boundary; its U-M privacy notice and course rules apply. The extension does not contain a faculty LLM credential, Canvas token, or automatic posting authority.

The dashboard is descriptive. Accuracy means correct responses divided by local attempts. Coverage means unique questions encountered. Practice days count local calendar dates with an attempt. Topic labels summarize those same attempts. None is a grade, accommodation decision, mastery estimate, or prediction of future performance.

## Content and classroom validation checklist

Before classroom release, the instructor should:

1. verify every reading section, author video, question, option, explanation, and lecture mapping against the Fall 2026 materials;
2. check that no practice item exposes a graded assignment answer or hidden assessment content;
3. run keyboard, screen-reader, contrast, zoom, and reduced-motion checks on each Learning Center screen;
4. smoke-test the packaged VSIX on Windows, macOS, and Linux;
5. pilot the language and session length with a small student group;
6. compare pre/post concept evidence and confidence calibration without treating dashboard labels as outcomes; and
7. revise or retire questions that are ambiguous, misleading, or poorly discriminating.

## Sources

- David Tarnoff, [Computer Organization and Design Fundamentals](https://faculty.etsu.edu/tarnoff/138292/)
- East Tennessee State University, [Computer Organization and Design Fundamentals OER series](https://dc.etsu.edu/computer-organization-design-oer/)
- David Tarnoff, [Intermation author-video channel](https://www.youtube.com/@Intermation)
- Karpicke & Roediger (2007), [Repeated retrieval during learning is the key to long-term retention](https://doi.org/10.1016/j.jml.2006.09.004)
- Butler, Karpicke, & Roediger (2007), [The effect of type and timing of feedback on learning from multiple-choice tests](https://doi.org/10.1037/1076-898X.13.4.273)
- Cepeda et al. (2006), [Distributed practice in verbal recall tasks: A review and quantitative synthesis](https://doi.org/10.1037/0033-2909.132.3.354)
- Carpenter et al. (2019), [Using spacing to enhance diverse forms of learning](https://doi.org/10.1016/j.cedpsych.2018.12.001)
- Rohrer & Taylor (2007), [The shuffling of mathematics problems improves learning](https://doi.org/10.1002/acp.1598)
