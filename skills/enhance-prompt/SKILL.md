# Enhance Prompt

## Overview

Rewrites a user-supplied prompt into a clearer, more effective version suitable for sending to an LLM. Output is the enhanced prompt only — nothing else.

## When to Use

- User pastes a draft prompt and asks for a better version.
- User invokes this skill explicitly (e.g. `/enhance-prompt`).
- User says "enhance this", "improve this prompt", "rewrite this prompt".

**Do NOT use** when the user is asking you to *answer* the prompt — only when they want the prompt itself rewritten.

## The Task

Given the user's input prompt (referred to below as `${userInput}`), perform exactly this instruction:

> Generate an enhanced version of this prompt (reply with only the enhanced prompt — no conversation, explanations, lead-in, bullet points, placeholders, or surrounding quotes):
>
> ${userInput}

## Output Rules (strict)

The reply has exactly two parts, in this order:

1. **The enhanced prompt** — raw text, nothing wrapping it.
2. **A single confirmation line** on its own, after one blank line:
   `Proceed with this prompt? (yes / edit / no)`

Nothing else. No preamble, no explanation of what was changed, no summary, no trailing commentary.

For the enhanced prompt itself:
- No preamble ("Here's the enhanced prompt:", "Sure!", "Enhanced version:").
- No bullet points or numbered lists wrapping the prompt.
- No placeholders like `[your topic here]` — fill them in or omit.
- No surrounding quotes, backticks, or code fences.
- No markdown headings.

## Flow

1. Output the enhanced prompt + the confirmation line. **Stop. Do not start solving.**
2. Wait for the user's reply:
   - **yes / y / proceed / go** → treat the enhanced prompt as the new task and execute it now.
   - **edit / change …** → revise per their feedback, output the new version + confirmation line again, stop.
   - **no / cancel / stop** → abort. Do not act on either the original or enhanced prompt.
3. Only after explicit approval do you switch from "prompt rewriter" to "task executor."

## How to Enhance

Apply standard prompt-engineering improvements as appropriate:

- Clarify the task and the desired output format.
- Add role/context when it sharpens the request.
- Specify constraints (length, tone, audience, structure).
- Replace vague verbs ("look at", "deal with") with precise ones.
- Preserve the user's intent — do not invent new requirements they didn't ask for.
- Keep it as short as the task allows; do not pad.

## Example

Input:
```
write me something about dogs
```

Output (the entire reply):
```
Write a 200-word informative paragraph about domestic dogs aimed at a general adult audience. Cover their evolutionary origin from wolves, three or four notable behavioral traits, and one reason humans bond with them strongly. Use a warm, factual tone and avoid bullet points.

Proceed with this prompt? (yes / edit / no)
```

Then stop and wait. Do not write the paragraph until the user replies "yes".

## Common Mistakes

| Mistake | Fix |
|---|---|
| Wrapping output in quotes or code fences | Output raw text only |
| Adding "Here is the enhanced prompt:" | Delete it |
| Inserting `[topic]` placeholders | Use the user's actual subject; if missing, ask once before enhancing |
| Answering the prompt instead of rewriting it | Re-read: the deliverable is a *better prompt*, not a response to it |
| Inflating a one-line request into a multi-paragraph spec | Match enhancement depth to original scope |
