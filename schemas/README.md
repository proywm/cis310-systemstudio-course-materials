# Proposed Data Schemas

These schemas are design artifacts for the senior-design team. They make course authority, evidence, and processor state explicit before implementation begins.

- `course-pack.schema.json` defines instructor-controlled course metadata, resources, operations, lessons, and hint policy.
- `evidence.schema.json` defines normalized observations from environment checks, compilers, tests, runtimes, and simulations.
- `processor-design.schema.json` defines the MVP text-backed 4-bit processor document used by the custom editor.

The schemas are intentionally conservative. Executable commands are structured as an executable plus argument array, not a shell command string. Implementations must add signature/integrity verification and semantic checks that JSON Schema alone cannot provide.
