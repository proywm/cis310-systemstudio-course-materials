# CIS 310 AI Tutor and Question-Queue Design

## Recommendation

Use **U-M Maizey in Canvas** as the generative tutor and keep SystemStudio's local FAQ as a deterministic first line of support. The extension should open the course tutor; it should not embed a faculty API key, proxy prompts through the instructor's account, or ask students for personal Canvas/API tokens.

This separation gives students three clear paths:

1. **Local FAQ chat:** private routing for setup, Digital, assembly, course navigation, submission checks, and known recurring problems.
2. **U-M Maizey tutor:** conversational, course-grounded hints and explanations with U-M authentication.
3. **Questions Before Class:** a structured Canvas discussion request that helps the instructor adjust the next lecture.

## What an AI tutor is

An AI tutor is not merely a chat box. A useful tutor maintains a learning dialogue: it diagnoses the learner's current model, selects a small next step, provides a hint or explanation, checks understanding, connects the answer to evidence, and escalates when the source or tool cannot support a reliable answer.

Evidence supports careful optimism rather than a blanket claim. A meta-analysis of 50 controlled intelligent-tutoring evaluations found positive effects across many systems. More recent generative-AI studies show that design matters: a large randomized mathematics study found that an unguarded general chatbot could weaken later unaided performance, while a guarded tutor reduced that harm; Tutor CoPilot found benefits when AI strengthened human tutors' use of guiding questions. Retrieval over course sources improves relevance but does not eliminate hallucinations. CIS 310 therefore uses source grounding, incremental hints, verification, and human escalation rather than unrestricted answer generation.

## Why Maizey is the preferred service

- U-M's Canvas Maizey integration indexes visible Announcements, Assignments, Files, Lecture Recordings, Modules, and Pages.
- Students access the tutor inside Canvas with their own U-M login.
- Academic Canvas projects do not require a shortcode and receive a course allocation intended to cover typical use; the published pricing page currently states Maizey is no-cost through June 30, 2027, subject to ITS terms.
- U-M states that course materials and prompt data are not used to train the offered models. The service still collects prompts, account/role information, technical logs, and usage information as described in its privacy notice.
- The instructor already received U-M announcements about the no-cost Canvas tutor, requested CIS 310 access in 2024, and was told that configuration access had been enabled. A Fall 2026 Digital Education message also lists Maizey among the AI-powered tools available in Canvas.

U-M GPT, Gemini, and Gemini Notebook are also available to active students. They are useful alternatives for general explanation or student-controlled source notebooks, but they are not the default CIS 310 tutor because Maizey supplies the centrally configured course boundary and Canvas source connection. A commercial third-party tutor would add procurement, account, accessibility, privacy, and equity work without solving a gap that U-M already covers.

## Student-support interaction patterns and limits

SystemStudio uses an easy-to-find chat entry, short explanations, related text/video sources, similar formative practice, targeted drills, confidence/progress evidence, and a human-help path. These are course-specific learning supports, not a claim of score improvement, grade improvement, mastery, or live expert staffing.

For CIS 310:

- conversational tutoring becomes a multi-turn, one-hint-at-a-time Maizey dialogue;
- similar questions come from the instructor-reviewed local practice bank by default; dynamically generated questions must be labeled unvalidated;
- video/text lessons use the required Tarnoff book, author videos, and packaged lectures;
- analytics remain local, descriptive, and non-graded; and
- human escalation uses the Canvas question queue and the existing course-support structure.

## Attempt-first and graded-work guardrails

The boundary depends on the activity, not simply on whether a question appears inside the extension:

- **Ungraded readiness/tutorial practice:** a student may use the tutor to learn, but the tutor first asks the student to commit to an answer and one reason. It withholds the answer or option letter on the first turn, then supplies one hint or critiques the attempt. After a genuine attempt it may explain the correct reasoning because the item is formative.
- **Homework, projects, quizzes, exams, reports, and other potentially graded work:** the tutor defaults to graded-task mode. It may ask a diagnostic question, cite a source, discuss one student-supplied step, debug visible evidence, or use an analogous example with different values. It does not produce final answers, completed truth tables/K-maps, wiring plans, `.dig` artifacts, end-to-end code, full traces, report prose, or a sequence of fragments that reconstructs the deliverable.
- **Unclear status:** the tutor asks where the item came from and uses the stricter boundary unless the supplied course context verifies that it is formative; a student's unsupported label is not sufficient. Canvas assignment instructions remain authoritative.

SystemStudio adds three layers: student-facing attempt-first language, a modal learning-coach checkpoint before opening Maizey, and the instructor-controlled Maizey system prompt. The local FAQ also intercepts obvious “give me the answer/do my assignment” requests and redirects them to a safe help format. These are educational and service-level safeguards, not digital-rights controls: the extension does not transmit or automatically paste a question into Maizey, cannot prevent copying, cannot control another AI website, and cannot guarantee that an external model will always comply. Instructor configuration, assignment-specific policy, source curation, adversarial testing, and student accountability are still required.

## Canvas Questions Before Class setup

Before release, the instructor should create and pin an ungraded Canvas discussion named **Questions Before Class**. If students should choose whether to reveal their name, configure it as **partially anonymous**. Canvas controls the identity display; SystemStudio cannot create anonymity by removing a name from copied text.

Copy the exact discussion URL into `systemstudioCis310.preClassDiscussionUrl`. The extension then:

1. asks for the upcoming lecture topic;
2. asks for the specific question, current understanding, point of confusion, and attempted evidence;
3. copies a consistently formatted draft; and
4. opens the configured Canvas discussion for review and posting.

The current implementation intentionally stops before posting. Fully automatic posting requires a U-M Canvas administrator to approve a scoped OAuth developer key or LTI registration. A distributed VS Code extension cannot safely conceal a Canvas client secret, and a shared faculty token must never be embedded. After institutional approval, direct posting could be implemented with only the discussion-entry scope and secure per-user authorization.

## Aggregate needs reflected in the FAQ

Past CIS 310 correspondence repeatedly involved:

- hidden or unpublished Canvas items and uncertainty about where to find videos or final instructions;
- ambiguity about expected output or assignment scope;
- Canvas file-type/link restrictions and uploads that were not fully submitted;
- saving multiple Digital circuits without overwriting work;
- composing adders and larger components from verified subcircuits;
- processor-analysis clock errors, including nested sequential components;
- students becoming stuck at a particular homework step and needing a faster escalation path; and
- deadline pressure after prolonged debugging or delayed help.

The local FAQ converts those themes into concise checklists without including student names, grades, health details, or private messages.

## Instructor release checklist

1. Enable and configure U-M Maizey in the Fall 2026 Canvas course.
2. Upload or publish only sources students are allowed to query; exclude answer keys, hidden tests, grades, accommodations, and private communications.
3. Paste and review `support/MAIZEY_SYSTEM_PROMPT.txt` in the Maizey app settings.
4. Enable returned data sources/citations and test at least one supported and one unsupported question per lecture.
5. Run adversarial guardrail tests: paste an ungraded multiple-choice item and request only its letter; request a full current homework solution, a completed circuit, end-to-end assembly code, and report prose; try role-change/prompt-injection wording; verify attempt-first tutoring or a bounded refusal each time.
6. Create the pinned partially anonymous **Questions Before Class** discussion and set its exact URL in extension configuration.
7. Put the exact Canvas Maizey link in `systemstudioCis310.maizeyTutorUrl`.
8. Tell students that anonymous means Canvas displays the anonymous option—not that the extension guarantees identity removal.
9. Pilot with students, monitor recurring misconceptions, and revise sources/FAQ/practice items. Do not treat chat counts or local accuracy as grades.

## Sources

- U-M ITS, [Canvas Maizey Integration](https://its.umich.edu/computing/ai/canvas-maizey-integration)
- U-M ITS, [New in Canvas Maizey](https://its.umich.edu/computing/ai/canvas-maizey-integration/new)
- U-M ITS, [AI Services Pricing](https://its.umich.edu/computing/ai/pricing)
- U-M ITS, [AI Services Privacy Notice](https://its.umich.edu/computing/ai/privacy-notice)
- U-M ITS, [Google Gemini and Gemini Notebook](https://its.umich.edu/computing/ai/google-gemini-and-gemini-notebook)
- U-M ITS, [Maizey System Prompts](https://its.umich.edu/computing/ai/maizey-system-prompt-library)
- Instructure, [Canvas Discussion Topics API](https://developerdocs.instructure.com/services/canvas/resources/discussion_topics)
- Instructure, [Canvas OAuth2 Overview](https://developerdocs.instructure.com/services/canvas/oauth2/file.oauth)
- Instructure, [View and Sort Discussion Replies](https://community.canvaslms.com/en/kb/articles/661292-how-do-i-view-and-sort-discussion-replies-as-a-student)
- Kulik & Fletcher (2016), [Effectiveness of Intelligent Tutoring Systems](https://eric.ed.gov/?id=EJ1090502)
- Bastani et al. (2025), [Generative AI without guardrails can harm learning](https://doi.org/10.1073/pnas.2422633122)
- Wang et al. (2024), [Tutor CoPilot](https://arxiv.org/abs/2410.03017)
- Li et al. (2025), [RAG for educational applications](https://doi.org/10.1016/j.caeai.2025.100417)
