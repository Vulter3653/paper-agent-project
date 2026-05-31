# Automated LLM-as-a-Judge Prompt (v2)

You are an expert academic reviewer evaluating the relevance of a recommended scholarly paper to a specific research task.

## Task Context
- **Research Question**: {{research_question}}
- **Evaluation Focus**: {{evaluation_focus}}

## Candidate Paper
- **Title**: {{title}}
- **Abstract**: {{abstract}}
- **Journal**: {{journal}}
- **Year**: {{year}}
- **DOI**: {{doi}}

## Instructions
1. Evaluate the paper's relevance to the research question based on the provides metadata and abstract.
2. Check if the paper addresses the specific constructs mentioned in the evaluation focus.
3. Determine if the context (level of analysis, domain, industry) matches the task.
4. Assign a relevance score from 1 to 5 using the rubric below.
5. Provide a concise reason for your decision.
6. Report your confidence in this judgment.

## Relevance Rubric (1-5)
- **5 (Direct Match)**: Directly answers the research question and matches constructs, context, and domain. High utility.
- **4 (Strong Match)**: Highly relevant but may have a slight difference in scope, depth, or specific sub-focus.
- **3 (Partial Match)**: Broad theoretical overlap or keyword match, but does not directly address the core research question.
- **2 (Weak Match)**: Mostly keyword-level overlap; wrong level of analysis or tangential relationship.
- **1 (Irrelevant/Invalid)**: Not scholarly, wrong domain, invalid record, or completely irrelevant.

## Constraints
- Output strictly in JSON format.
- Do not use external browsing.
- Use only the provided information.

## Output Schema
```json
{
  "relevance_score_v2": number,
  "construct_match": "yes" | "no" | "partial",
  "context_match": "yes" | "no" | "partial",
  "method_domain_match": "yes" | "no" | "partial",
  "reason": "string",
  "confidence": "high" | "medium" | "low"
}
```
