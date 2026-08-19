# Measurement and Study-Design Research

## Purpose

This review translates established measurement and study-design guidance into a defensible evaluation package for SystemStudio AI. It supports the instruments in [`../../instruments/`](../../instruments/) and the pre-specified [`analysis plan`](../planning/analysis-plan.md).

The instruments are a pilot item bank, not a validated scale. Before classroom use, the project must obtain the appropriate institutional determination, conduct expert review and cognitive interviews, pilot the parallel assignments, and freeze the protocol.

## Evidence and design decisions

### Validity belongs to an interpretation and use

The *Standards for Educational and Psychological Testing* require the intended interpretation and use of scores to be stated and supported by relevant evidence. A high satisfaction score therefore cannot be treated as evidence of learning, accuracy, or faster feedback.

Project decision:

- use a scored near-transfer assignment for learning;
- use logs for elapsed time, attempts, and escalation;
- use blinded expert review for technical accuracy, evidence support, leakage, and safety; and
- use questionnaires for self-efficacy, perceived usefulness, usability, workload, and trust literacy.

Source: [AERA, APA, and NCME, *Standards for Educational and Psychological Testing* (2014)](https://www.testingstandards.net/uploads/7/6/6/4/76643089/standards_2014edition.pdf).

### Self-efficacy should be task-specific

Bandura's construction guidance argues that self-efficacy items should express judgments of capability for graded, domain-specific tasks rather than general confidence or self-esteem. Ramalingam and Wiedenbeck developed a programming-specific scale, but their original 32-item C++ instrument does not directly cover xv6 debugging, evidence interpretation, processor traces, or help seeking.

Project decision:

- use seven SystemStudio-specific capability items on a 0--100 confidence scale;
- repeat the exact items and anchors before and after the intervention;
- retain assignment performance as the learning outcome; and
- describe the self-efficacy composite as study-specific until it is validated.

Sources: [Bandura, “Guide for Constructing Self-Efficacy Scales”](https://bpb-us-e1.wpmucdn.com/websites.uta.edu/dist/1/4994/files/2021/07/Guide-for-Constructing-Self-Efficacy-Scales-Bandura2006.pdf); [Ramalingam and Wiedenbeck (1998), DOI 10.2190/C670-Y3C8-LTJ1-CT3P](https://doi.org/10.2190/C670-Y3C8-LTJ1-CT3P).

### Usefulness and ease of use are perceptions, not performance

Davis established perceived usefulness and perceived ease of use as distinct technology-acceptance constructs. These constructs can help diagnose adoption barriers but do not establish that explanations are correct or that students learned.

Project decision:

- include short, study-specific usefulness and ease-of-use modules;
- pair self-report with observed task success, retry behavior, and time; and
- do not label the adapted items as the validated Technology Acceptance Model scales.

Source: [Davis (1989), “Perceived Usefulness, Perceived Ease of Use, and User Acceptance of Information Technology,” DOI 10.2307/249008](https://doi.org/10.2307/249008).

### Trust should mean appropriate reliance

The trust-in-automation literature distinguishes trust from system performance. A student may report high trust in an inaccurate tool or low trust in an accurate one. Reproducing or modifying a published trust scale also requires checking its administration, scoring, and permissions.

Project decision:

- measure students' knowledge of evidence, uncertainty, and escalation with repeated trust-literacy items;
- administer a six-case behavioral calibration task in which the appropriate response is sometimes to proceed, verify, reject, or escalate;
- compare reliance decisions with actual case quality; and
- do not reproduce the Jian et al. 12-item scale in this repository.

Source: [Jian, Bisantz, and Drury (2000), “Foundations for an Empirically Determined Scale of Trust in Automated Systems,” DOI 10.1207/S15327566IJCE0401_04](https://doi.org/10.1207/S15327566IJCE0401_04).

### Workload is multidimensional

NASA-TLX assesses mental, physical, and temporal demand, perceived performance, effort, and frustration. NASA makes the instrument available for use and provides an administration manual.

Project decision:

- use the six unweighted Raw TLX ratings immediately after a study task;
- preserve the official 0--100 anchors and dimension definitions;
- report the six dimensions as well as the Raw TLX mean; and
- measure instructor workload separately with active-minute case logs.

Source: [NASA Task Load Index](https://www.nasa.gov/human-systems-integration-division/nasa-task-load-index-tlx/).

### Survey questions need pretesting

CDC's Collaborating Center for Question Design and Evaluation Research explains that cognitive interviews reveal how respondents comprehend, retrieve, judge, and map answers to response options. This is particularly important for terms such as “evidence,” “useful,” “AI explanation,” and “escalate.”

Project decision:

1. obtain content review from at least one systems-course instructor, one assessment specialist, and one accessibility reviewer;
2. conduct cognitive interviews with 5--8 students who are not in the graded pilot;
3. ask scripted comprehension, recall, judgment, and response probes;
4. revise ambiguous items and document every change; and
5. run a small technical pilot before freezing item wording and scoring.

The 5--8 interviews are a pragmatic development round, not an estimate for a population. Additional rounds should be conducted if substantial problems remain.

Source: [CDC/NCHS, Cognitive Interviewing](https://www.cdc.gov/nchs/ccqder/question-evaluation/cognitive-interviewing.html).

### Baseline-adjusted analysis is preferable for a controlled pilot

For a randomized pretest/posttest comparison, Vickers and Altman explain that analysis of covariance (ANCOVA) using the baseline measure is generally more precise than analyzing raw change scores. Morris provides an effect-size estimator for pretest/posttest/control-group designs based on the difference in changes divided by the pooled pretest standard deviation. Education-study standards also emphasize attrition, baseline equivalence, and outcome-measure quality.

Project decision:

- make post-intervention near-transfer score the primary outcome;
- estimate the condition effect with postscore ANCOVA controlling for baseline score and blocking factors;
- report adjusted difference, 95% confidence interval, and a standardized effect;
- report assignment and survey attrition by condition; and
- treat a small single-course pilot as feasibility evidence, not definitive proof.

Sources: [Vickers and Altman (2001), *BMJ*](https://www.bmj.com/content/323/7321/1123); [Morris (2008), DOI 10.1177/1094428106291059](https://doi.org/10.1177/1094428106291059); [What Works Clearinghouse Procedures and Standards Handbook, Version 5.0](https://ies.ed.gov/ncee/wwc/Handbooks).

## Institutional and privacy constraints

- U-M policy requires sound design, risk minimization, voluntary participation, and protection from coercion or undue influence. The instructor should not know who consented until grades are finalized when that separation is practicable.
- UM-Dearborn states that survey, educational-test, and benign-behavioral activities may fall in exemption categories but should still be submitted for an institutional determination. Investigators must not self-declare an exemption.
- FERPA protections apply when research data are linked to submissions, grades, or other education records. A study code must not be derived from student identifiers, and any linkage key must be held separately by an authorized data steward.
- The official UM-Dearborn end-of-semester evaluation is anonymous and released after final grades. Its common items can provide secondary context, but it is not a substitute for the study's task-level outcomes.

Sources: [U-M Policy for Research with Human Participants](https://spg.umich.edu/policy/303.05); [UM-Dearborn Human Subjects guidance](https://umdearborn.edu/research/office-research/more-help/human-subjects); [U.S. Department of Education FERPA regulations and de-identification provisions](https://studentprivacy.ed.gov/ferpa); [UM-Dearborn Electronic Course Evaluations](https://umdearborn.edu/digital-education/electronic-course-evaluations).

## What each evidence source can and cannot show

| Evidence source | Appropriate interpretation | Do not infer |
|---|---|---|
| Parallel pre/post assignment | Change in demonstrated performance on matched tasks | General mastery of the course from one task |
| Randomized condition contrast | Estimated effect in the tested activity, subject to design and uncertainty | Effect in every course or student population |
| Self-efficacy items | Perceived capability on named tasks | Actual competence |
| Usefulness/ease items | Student experience and adoption barriers | Technical accuracy or learning |
| Product telemetry | Attempts, timing, feature use, and escalation behavior | Motivation or understanding without corroboration |
| Expert response rubric | Technical and pedagogical quality of sampled responses | Every future model output |
| TA workload log | Active human time per observed case | Total course labor if unlogged work is omitted |
| Official course evaluation | Anonymous end-of-course perception in the responding group | Causal effect of SystemStudio AI |

## Required evidence before the classroom pilot

- institutional determination and approved consent/recruitment process;
- documented content review and cognitive-interview revisions;
- parallel-form review for content, difficulty, and scoring equivalence;
- graders trained on anchor responses and acceptable agreement;
- offline safety benchmark passed;
- accessibility and cross-platform usability checks completed; and
- frozen protocol, item IDs, primary outcome, exclusion rules, and analysis plan.
