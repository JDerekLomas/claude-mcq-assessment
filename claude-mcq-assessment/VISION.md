# Vision

**MCQMCP measures whether AI tutoring actually produces learning.**

## The Gap

LLMs are increasingly used for learning. But current evaluation measures:
- What the model knows (benchmarks like MMLU)
- User preference ("which response is better?")
- Engagement (time spent, satisfaction)

Missing: **Does interacting with this LLM make humans measurably smarter?**

## The Approach

MCQMCP provides standardized measurement infrastructure:

```
Any LLM ──→ MCQMCP ──→ Validated Assessment ──→ Measured Learning
```

### Three Pillars

**1. Scalable Item Generation**
- LLMs generate items from domain specs
- LLM "personas" provide synthetic calibration
- Human responses validate and refine

**2. Standardized Protocol**
- MCP tools for item retrieval and response logging
- `:::mcq` format for rendering in any UI
- Consistent data capture across integrations

**3. Psychometric Infrastructure**
- Item statistics (difficulty, discrimination)
- Learner ability estimates
- Reliability and validity analysis

## Use Cases

| Audience | Value |
|----------|-------|
| **Learners** | Progress tracking, adaptive difficulty |
| **Educators** | Validated item banks, learner analytics |
| **LLM Providers** | Benchmark tutoring effectiveness |
| **Researchers** | Study what makes AI tutoring work |

## What This Is Not

- **Not a tutoring system** — measurement only, tutoring happens in the LLM
- **Not a test publisher** — open infrastructure anyone can use
- **Not high-stakes** (yet) — starts with practice and formative assessment

## Key Research Questions

1. Do LLM personas predict human item difficulty?
2. Can we generate items at scale without sacrificing quality?
3. Does MCQ performance correlate with real understanding?
4. How do we prevent gaming when providers optimize for benchmarks?

## The Bet

If we can measure learning outcomes reliably:
- LLM providers have incentive to optimize for actual learning
- We can compare pedagogical approaches with data
- Assessment quality compounds as more humans respond

*The question isn't whether AI will be used for learning. It's whether we'll measure what humans actually learn.*
