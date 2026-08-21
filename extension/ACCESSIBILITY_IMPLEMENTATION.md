# Digital accessibility implementation

Last reviewed: August 20, 2026

## Standard and source basis

SystemStudio's student-facing lesson reader is designed toward U-M's WCAG 2.1 Level AA requirement. The implementation was checked against:

- the instructor-supplied export of the UM-Dearborn Digital Accessibility Course;
- the [UM-Dearborn Digital Accessibility Requirements Overview](https://umdearborn.edu/sites/default/files/unmanaged/pdf/digital-education/digital-accessibility-topics-overview.pdf);
- U-M's [Course Content accessibility roadmap](https://accessibility.umich.edu/compliance-roadmap/course-content); and
- U-M's [website and web-application checklist](https://accessibility.umich.edu/how-to/web-content-sites-apps/checklist).

This document records design evidence and known boundaries. It is not a certification of conformance.

## Accessible lesson alternative

Each of the 13 visual lecture PDFs now has a substantial HTML lecture in the extension and a Canvas-ready export. The HTML is the primary lecture format; each page includes:

- one page title (`h1`) followed by sequential `h2` and `h3` headings;
- a concise overview, measurable learning objectives, and plain-language definitions;
- prose descriptions of the important relationships otherwise communicated through slide diagrams;
- at least two worked examples with ordered steps;
- three self-check prompts and three source-bounded AI-tutor prompts;
- descriptive controls for the presentation, each reading, each video, practice, and mapped hands-on work; and
- an exact presentation slide range plus a scope boundary so the alternative does not silently add unsupported material.

The HTML lecture is intentionally not another PDF. It reflows at narrow widths and zoom, uses a readable line length, inherits the student's VS Code theme, and contains machine-readable text. The generated Canvas body begins at `h2` because Canvas supplies the page-title `h1`; it includes no script, stylesheet, image, iframe, or layout table. A standalone version includes a language declaration, one `h1`, a skip link, and previous/next navigation.

The deterministic Canvas bundle is generated with `npm run export:canvas`. Its manifest records SHA-256 values for all 13 Canvas bodies and standalone documents. Generation and automated structural checks do not replace Panorama, screen-reader, keyboard, zoom/reflow, or instructor content review before publication.

## Interface measures

- Semantic landmarks: `header`, labeled `nav`, `main`, `section`, `aside`, and `footer`.
- A keyboard-accessible skip link and native buttons for every interactive control.
- Logical DOM and tab order, with no automatic focus jump, keyboard trap, timer, carousel, or hover-only content.
- Clearly visible `:focus-visible` outlines and forced-colors support.
- Relative text sizing, responsive reflow, text wrapping, and reduced-motion handling.
- No color-only status, image-of-text, layout table, or undescribed image in the lesson reader.
- Descriptive, standalone control text instead of “click here,” exposed URLs, or icon-only actions.
- Plain-text readings of equations and bit relationships rather than unexplained visual notation alone.
- A restrictive Content Security Policy and allowlisted message parser.

## AI tutor boundary

Tutor buttons do not send course or student data to an instructor-owned model. They copy a visible, lesson-specific prompt and open the configured U-M tutor. Each prompt names the module, bounds the source set, requires a student attempt, requests one hint or analogous example at a time, and prohibits completion of graded work.

## Known boundaries and required follow-up

- The existing presentation PDFs are untagged and have not been certified as correctly ordered or independently WCAG-conformant. They are optional visual archives, not the primary lecture format. If the original PowerPoint sources become available, check them with Microsoft Accessibility Checker; review every Canvas HTML page with Panorama.
- Each assigned video still requires accurate synchronized captions and a reviewed transcript. A video's presence in the content map does not certify its captions.
- The complete Digital application is a streamed upstream Swing desktop. Its pixel canvas does not expose equivalent screen-reader semantics through noVNC. The textual circuit lessons, predictions, signal tables, and instructor accommodation process remain necessary alternatives; the extension explicitly discloses this limitation.
- U-M Codex CLI, Canvas, YouTube, the open textbook site, Docker Desktop, and upstream Digital are external products with their own accessibility status.

## Manual acceptance checks before the semester

1. Use Tab, Shift+Tab, Enter, and Space to operate every lesson control and confirm a visible, logical focus sequence.
2. Read all 13 lessons with NVDA on Windows and VoiceOver on macOS; confirm heading navigation, definition lists, ordered examples, and button names.
3. Test at 200% and 400% zoom and in a narrow editor column; confirm no horizontal reading or clipped control is required.
4. Test a VS Code high-contrast theme and operating-system forced-colors mode.
5. Review every linked video's captions against speech and ensure important visual-only information has an audio description or nearby text alternative.
6. Run Microsoft Accessibility Checker on the source slide decks and Panorama on the Canvas course materials. Remediate the originals where possible and retain the HTML alternative.
7. Invite a Disability and Accessibility Services or Digital Accessibility reviewer to test the student workflow, especially the Digital circuit activity boundary.
