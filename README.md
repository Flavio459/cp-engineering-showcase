# CP Engineering Showcase

> Public portfolio showcase. The production/core engineering system and operational project data remain private.

**CP Engineering** explores how an engineering demand can be transformed into a traceable technical/commercial decision without hiding assumptions, missing information, risk, cost or revision history.

This public repository is a deliberately reduced demonstration built with **synthetic engineering data only**.

## Problem

Engineering projects often lose traceability between:

- the original demand;
- requirements and scope boundaries;
- risks and mitigations;
- concept alternatives;
- cost and commercial price;
- revision changes;
- the final human decision.

A dashboard that simply produces a score is not enough. The system must show **what is known, what is estimated, what is calculated, what is missing, and what changed**.

## Showcase flow

```text
Demand / Intake
  -> Requirements
  -> Scope
  -> Risks
  -> Concept
  -> Evaluation
  -> Cost
  -> Quote
  -> Decision Readiness
  -> Human Decision Gate
```

## What this demonstrates

- revision-aware engineering workflow;
- explicit provenance / data nature;
- requirement and scope traceability;
- risk as decision support, not automatic approval;
- separation between internal cost and commercial sale price;
- incomplete quote behavior when required values are unknown;
- decision-readiness signals instead of an opaque GO/NO-GO score;
- fail-closed human approval;
- simple deterministic domain logic with tests.

## Important engineering boundary

This repository is **not a certified engineering calculation package** and does not issue technical approval, legal compliance, safety certification or regulatory sign-off.

The demo is inspired by systematic engineering practice, but it does not reproduce proprietary textbooks, paid technical references, customer drawings, standards, manuals or copyrighted engineering material.

## Synthetic project

The live demo uses a fictional project:

**AX-17 Modular Inspection Fixture**

All companies, values, requirements, risks, costs and decisions in the demo are synthetic.

## Live demo

After GitHub Pages deployment:

`https://flavio459.github.io/cp-engineering-showcase/`

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Publication boundary

See [docs/PUBLICATION_BOUNDARY.md](docs/PUBLICATION_BOUNDARY.md).

## Run locally

No build step or paid service is required.

Open `index.html` through a static HTTP server.

For deterministic logic validation:

```bash
node test.js
```

## Technology

HTML · CSS · JavaScript · JSON · GitHub Actions

The private core uses a broader TypeScript / Next.js architecture with domain modules, repository abstractions, testing and durable-persistence work. Those implementation details remain separate from this public showcase.

## Author

Flávio Souza Barros  
Engineering × AI × Automation × Project Systems

## License / reuse

Source-visible for portfolio evaluation only. It is **not released under an open-source license**. See [LICENSE](LICENSE).
