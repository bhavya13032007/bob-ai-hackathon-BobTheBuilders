# Solution Overview

## What We Built

CareerSetu AI is an intelligent, AI-powered internship recommendation platform built for the PM Internship Scheme. It matches candidates to highly relevant internships using a hybrid AI matching engine that evaluates semantic skills, geospatial proximity, and education constraints. Instead of just offering a numbered score, it uses an LLM to generate plain-language explanations of exactly why an internship is a good fit, building trust and guiding candidates on where to improve.

## How It Works

1. **Candidate Profile Creation:** A candidate provides their basic details, skills, location, and verified certificates.
2. **Hybrid Matching Engine:** When the candidate requests internships, the system scores active internships against their profile using TF-IDF and fuzzy string matching for skills, and the Haversine formula for geographic proximity.
3. **AI Explanation Generation:** The system sends the matched profile and job requirements to IBM Watsonx.ai, which synthesizes a natural language explanation of the match.
4. **Diversity Re-Ranking:** The top results undergo Maximal Marginal Relevance (MMR) re-ranking to ensure the candidate sees a diverse spread of sectors and companies, avoiding a monolithic wall of identical roles.
5. **Display Results:** The candidate is presented with 3-5 curated, highly-relevant internships, each accompanied by a clear "Why this match?" panel.

## Architecture Diagram

> See [`architecture.md`](architecture.md) for the detailed diagram.

```
[User] → [React Frontend] → [FastAPI Backend] → [Hybrid Matching Engine]
                                   ↓                    ↓
                          [PostgreSQL DB]     [IBM Watsonx.ai (Granite)]
```

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **Hybrid Skill Matching** | Relying solely on exact matches misses typos and semantic similarities. Combining TF-IDF with RapidFuzz creates a highly fault-tolerant skill evaluator. |
| **Strict 3s Watsonx Timeout** | We ensure that the LLM is a value-add, not a bottleneck. If the LLM request times out, we silently fall back to a deterministic text template to keep the UX fast and unbroken. |
| **MMR Diversity Re-ranking** | Returning the highest raw scores might yield 10 identical IT roles at the same company. MMR ensures candidates are exposed to opportunities across varied sectors. |

## IBM Technologies Used

- **IBM Watsonx.ai:** We used the `ibm/granite-13b-instruct-v2` foundation model via REST/Python API to dynamically generate "Why this match?" explanations. We pass the candidate's skills and the internship requirements to the model, and it synthesizes a 1-2 sentence human-readable rationale that is rendered directly in the candidate's UI.
