# Report Template

Save to `.opencode/reviews/{type}_{identifier}_{date}.md`.
Create `.opencode/reviews/` if it does not exist.

## Design Principle

**Short and meaningful.** People don't read long reports. Every section must earn its place.

- Critical + Warning = full detail (file, line, impact, fix)
- Improvements = one-liner with code suggestion
- Suggestions = count only (or brief list if < 3)
- Empty sections = omit entirely
- TL;DR at the top so the reader can stop after 3 lines if everything is clean

## Template

```markdown
# Code Review: PR #{number} — {pr_title}

## TL;DR

**{APPROVE | REQUEST CHANGES | COMMENT}** — {one sentence reason}

| Critical | Warnings | Improvements | Suggestions |
|----------|----------|--------------|-------------|
| {count}  | {count}  | {count}      | {count}     |

{If Phase 4.5 dropped findings: "🔍 Verification: {N} finding(s) dropped as false positives"}
{If Phase 4.5 verified all findings: "🔍 All findings verified"}
{If Phase 4.5 was skipped (no critical/warning): omit this line entirely}

## What This PR Does

{1-3 sentences. Start with action verb. Include business impact if clear.}

**Key Changes:**
- **{category}**: {brief description}
- **{category}**: {brief description}

## Ticket Alignment

> Only included when a Linear ticket is linked. Omit entirely if no ticket found.

**Ticket**: [{ticket_id}]({linear_url}) — {ticket_title}
**Status**: {ticket_status} | **Priority**: {ticket_priority}

### Acceptance Criteria Coverage

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | {criteria_text} | ✅ Met / ⚠️ Partial / ❌ Missing | {brief note} |

{If all criteria met: "All acceptance criteria addressed."}
{If gaps found: "**{count} criteria not fully addressed** — see details above."}
{If criteria are ambiguous: "⚠️ **Ambiguous acceptance criteria** — '{original_text}' can be interpreted as: (a) {interpretation_1}, (b) {interpretation_2}. This PR implements interpretation (a/b). Verify with ticket author."}

## Premise Check (DELETION changes only)

> Only included when the PR deletes existing behavior. Omit for additions/modifications.

| Question | Answer |
|----------|--------|
| Why was this code added originally? | {reason} |
| Is the underlying problem solved? | {yes/no — explanation} |
| Would fixing the logic be more correct? | {yes/no — explanation} |
| Cross-repo implications? | {backend config, API contracts, etc.} |

**Verdict**: {REMOVAL CORRECT / SHOULD FIX INSTEAD / NEEDS CLARIFICATION}

## Critical Issues (MUST FIX)

### 1. {Title}
**`{file}:{line}`** | {Security/Logic/Performance}
{What's wrong and what could go wrong.}
**Fix:** {Concrete suggestion or code snippet}

### 2. {Title}
...

## Warnings (SHOULD FIX)

### 1. {Title}
**`{file}:{line}`** | {Category}
{Issue description.}
**Fix:** {Suggestion}

## Code Improvements

> Opportunities to make the code better — cleaner, faster, more idiomatic.

- **`{file}:{line}`** — {description}. Consider: `{code_suggestion}`
- **`{file}:{line}`** — {description}

## Suggestions ({count})

{If ≤ 3, list as one-liners. If > 3, just show the count.}

- `{file}:{line}` — {brief}

## Files Changed

| File | Type | Summary |
|------|------|---------|
| `{path}` | {LOGIC/DELETION/STYLE/REFACTOR/NEW} | {one-liner} |
```

**Sections to OMIT unless they contain actionable findings:**
- Traced Dependencies
- nano-brain Memory Context
- Test Coverage Analysis
- Praise (include only if genuinely noteworthy — one line max)
- Change Classification table

## PR Summary Generation Guidelines

### What This PR Does (1-3 sentences)
- Start with action verb: "Adds", "Fixes", "Refactors", "Updates"
- Mention the feature/bug/improvement
- Include business impact if clear

### Key Changes categories
- `Feature`: New functionality
- `Bugfix`: Fixes broken behavior
- `Refactor`: Code restructuring without behavior change
- `Performance`: Speed/memory improvements
- `Security`: Security fixes or hardening
- `Docs`: Documentation updates
- `Tests`: Test additions/modifications
- `Config`: Configuration changes
- `Dependencies`: Package updates

### File-by-File Summary
- **What changed**: Factual description of the code change
- **Why it matters**: Impact on users, developers, or system
- **Key modifications**: Specific functions/classes/lines changed

## PR Summary Pseudocode

```javascript
// Generate PR Summary (GitHub Copilot style)
const prSummary = `
## PR Overview

### What This PR Does
${generateHighLevelSummary(prMetadata, changedFiles)}

### Key Changes
${categorizeChanges(changedFiles).map(c => `- **${c.category}**: ${c.description}`).join('\n')}

## File-by-File Summary

| File | Change Type | Summary |
|------|-------------|---------|
${changedFiles.map(f => `| \`${f.path}\` | ${f.changeType} | ${f.oneLinerSummary} |`).join('\n')}

### Detailed File Changes

${changedFiles.map(f => `
#### \`${f.path}\` (+${f.additions}/-${f.deletions})
**What changed**: ${f.whatChanged}
**Why it matters**: ${f.whyItMatters}
**Key modifications**:
${f.keyModifications.map(m => `- ${m}`).join('\n')}
`).join('\n')}
`;
```
