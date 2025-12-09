# Roadmap

Phased plan for building measurement infrastructure.

## Phase 1: Foundation
**Goal**: Working MCP server any Claude UI can integrate.

- MCP server with HTTP+SSE transport
- Item bank storage (Postgres)
- Core tools: `get_item`, `list_topics`, `log_response`
- Response logging with session tracking
- Reference integration + documentation

**Milestone**: Developers can connect, serve items, log responses.

---

## Phase 2: Classical Psychometrics
**Goal**: Automated item statistics from response data.

- P-value (difficulty), point-biserial (discrimination)
- Distractor analysis, response time stats
- Analytics API for items and banks
- Per-user progress and mastery tracking

**Milestone**: Learning engineers can access item statistics via API.

---

## Phase 3: Forms & Reliability
**Goal**: Structured assessments with psychometric rigor.

- Fixed forms (ordered item sets)
- Cronbach's alpha, SEM, score distributions
- Mastery classification with cut scores
- Form equivalence via anchor items

**Milestone**: Educators can create forms and get reliability estimates.

---

## Phase 4: IRT Calibration
**Goal**: Item Response Theory for adaptive testing.

- 1PL/2PL/3PL model calibration
- Ability estimation (MLE, EAP)
- Item and test information functions
- Calibration versioning

**Milestone**: Items have IRT parameters; users get ability estimates with confidence.

---

## Phase 5: Adaptive Assessment
**Goal**: Optimal item selection based on learner ability.

- Simple adaptive (difficulty adjustment)
- Full CAT (max information selection)
- Content balancing, exposure control
- Stopping rules

**Milestone**: Personalized item selection that efficiently estimates ability.

---

## Phase 6: Synthetic Calibration
**Goal**: Estimate item statistics before human data.

- LLM persona design (novice → expert)
- Synthetic response generation pipeline
- Synthetic vs human validation framework
- Calibration adjustment models

**Milestone**: New items get immediate estimates; improve as human data arrives.

---

## Phase 7: Item Generation
**Goal**: Generate quality items from domain specs.

- Domain specification format
- LLM item generation with quality filters
- Human review workflow
- Pipeline: spec → generate → calibrate → review → bank

**Milestone**: Specify domain, get hundreds of calibrated items.

---

## Phase 8: Learning Benchmarks
**Goal**: Standardized measurement across LLM providers.

- Pre/post methodology, learning gain metrics
- Cross-provider comparison framework
- Public benchmark dashboard
- Research data access

**Milestone**: Published benchmark comparing LLM tutoring effectiveness.

---

## Phase 9: Advanced Measurement
**Goal**: Beyond basic MCQ.

- Multiple-select, ordering, matching, fill-in-blank
- Constructed response with LLM scoring
- Performance tasks, code execution
- Validity studies (transfer, retention)

---

## Dependencies

| Risk | Mitigation |
|------|------------|
| Synthetic calibration fails | Validate early; be transparent |
| Providers don't adopt | Demonstrate learning outcome differentiation |
| Item security | Continuous generation; secure pools |
| Gaming benchmarks | Diverse items; transfer measures |

Phases 1-3 are sequential. Phases 4-5 and 6-7 can partially parallelize. Phase 8 requires critical mass of data.
