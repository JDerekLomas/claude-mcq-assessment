# Research Agenda

Critical questions that determine whether MCQMCP works.

## 1. Synthetic Calibration Validity

**Core question**: Do LLM personas predict human item difficulty?

**Why it matters**: If synthetic calibration fails, we can't scale item generation.

**Key experiments**:
- Generate items → synthetic calibration → human responses → measure correlation
- Vary persona designs (ability levels, domain framing) → compare prediction quality
- Identify item types where synthetic ≠ human

**Hypothesis**: r > 0.6 for factual domains; weaker for reasoning-heavy content.

---

## 2. Item Generation Quality

**Core question**: Can LLMs generate pedagogically sound items?

**Failure modes**: Trivial items, implausible distractors, ambiguous stems, factual errors.

**Key experiments**:
- Expert review of generated items → acceptance rate, failure taxonomy
- Compare generated vs human-authored on psychometric properties
- Test whether LLM self-critique catches errors

**Target**: >60% expert acceptance rate.

---

## 3. Construct Validity

**Core question**: Does MCQ performance reflect actual understanding?

**Concern**: MCQ tests recognition, not recall. Test-taking skills can substitute for knowledge.

**Key experiments**:
- Compare MCQ with constructed response on same content
- Measure transfer: MCQ → novel application task
- Retention: immediate vs delayed post-test
- Think-aloud protocols: what are learners actually doing?

**Hypothesis**: Moderate correlation (r ~ 0.5-0.7) between MCQ and deeper measures.

---

## 4. Gaming & Goodhart's Law

**Core question**: If providers optimize for MCQMCP, does measurement validity degrade?

**Risks**: Teaching to the test, item exposure to training data, narrow optimization.

**Mitigations**:
- Continuous item generation (hard to overfit)
- Secure item pools for validation
- Process measures (tutoring interactions) alongside outcomes
- Transfer/retention metrics, not just immediate performance

---

## 5. Fairness

**Core question**: Do generated items disadvantage certain groups?

**Key experiments**:
- DIF analysis by demographics (requires clone cooperation on data)
- Correlate linguistic complexity with DIF
- Test whether fairness-focused prompts reduce bias

---

## 6. Data Quality

**Reality check**: Human response data comes from messy, uncontrolled real-world usage.

**What we capture**: item_id, selected, correct, latency_ms, timestamp, user_id, session_id

**What we don't**: who the learner is, why they're using it, how seriously they're engaging, what instruction preceded

**Strategies**:
- Filter low-quality responses (too fast, patterned)
- Encourage clones to pass context
- Supplement with controlled studies
- Seek diverse deployments

---

## Research Priorities

| Priority | Area | Rationale |
|----------|------|-----------|
| 1 | Synthetic calibration | Core assumption; validate early |
| 2 | Item generation quality | Pipeline depends on it |
| 3 | Construct validity | Credibility requires evidence |
| 4 | Fairness | Ethical requirement |
| 5 | Gaming | Important once benchmarks exist |

---

## Collaboration Needed

This exceeds what one team can do:
- **Psychometricians**: IRT, DIF, validity frameworks
- **Learning scientists**: Transfer, retention, instructional design
- **NLP researchers**: Bias, prompt engineering
- **EdTech companies**: Real-world deployment data

*Research is not a detour from building—it's how we build something that works.*
