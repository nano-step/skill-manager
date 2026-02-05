# Agent Skill Error Handling Reference
# Scope: recovery flows, templates, and decisioning.
# Do not include routing logic, cache schema, or result summarization here.

## Error Classes
1. Tool not found
2. Execution failure
3. Timeout
4. Cache missing or invalid
5. Partial success
6. Invalid parameters

## Automatic Retry Mechanism

The agent-skill-manager automatically retries failed tool executions before returning errors.

### Retry Configuration
- Maximum attempts: 3
- Backoff delays: 0s (immediate), 1s, 2s
- Applies to: All tool executions (single, batch, chain, passthrough)

### Retry Behavior
1. First attempt fails → Immediate retry (0s delay)
2. Second attempt fails → Wait 1s, then retry
3. Third attempt fails → Return failure report

### Failure Report Format
When all retry attempts fail, return structured report:
```json
{
  "tool": "tool_name",
  "attempts": 3,
  "errors": [
    "Attempt 1: connection timeout",
    "Attempt 2: connection timeout",
    "Attempt 3: service unavailable"
  ],
  "suggestion": "Check network connectivity or try again later"
}
```

### Retry Scope in Batch/Chain
- **Batch mode**: Each tool has independent retry budget
- **Chain mode**: Failed tool retries before aborting chain
- Partial results preserved when possible

### Non-Retryable Errors
Some errors should NOT trigger retry:
- Invalid parameters (user error)
- Tool not found (cache issue)
- Permission denied (auth issue)

For these, return error immediately with actionable suggestion.

## Tool Not Found Recovery
Symptoms:
- Tool id does not exist in registry or cache.
- Prefix is unknown or misspelled.

Recovery steps:
1. Suggest likely tool names based on prefix and category.
2. Provide a short list (3-5 options) from the matched category.
3. If prefix unknown, suggest known prefixes.
4. Offer to run discovery or refresh cache.

Template:
```
Error: Tool not found: <tool-id>
Suggestions: <tool-a>, <tool-b>, <tool-c>
Next: confirm the intended tool or run /agent-skill-refresh.
```

## Execution Failure Handling
Symptoms:
- Tool exists but returns error.
- Element not found, API error, invalid resource.

Recovery steps:
1. Report the error message verbatim.
2. Include context (tool name, key params).
3. Propose next actions (snapshot, retry, refine filters).
4. Avoid re-running without user confirmation.

Template:
```
Error: <message>
Tool: <tool-id>
Params: <key params>
Suggestions:
1) <action>
2) <action>
Next: confirm retry or provide new parameters.
```

## Timeout Handling
Symptoms:
- Tool exceeds configured timeout.
- Partial output may be returned.

Recovery steps:
1. Report timeout duration.
2. If partial results exist, summarize them.
3. Suggest narrower scope or smaller payload.
4. Offer retry with adjusted parameters.

Template:
```
Timeout: <tool-id> after <ms>ms
Partial: <summary or none>
Suggestions: narrow scope, reduce output, retry
Next: confirm retry with new parameters
```

## Cache Missing Recovery
Symptoms:
- `.opencode/agent-skill-tools.json` missing.
- Cache file invalid or unreadable.

Recovery steps:
1. Inform that cache is missing or invalid.
2. Recommend /agent-skill-refresh to regenerate.
3. Proceed with dynamic tool discovery if possible.

Template:
```
Cache missing or invalid at .opencode/agent-skill-tools.json
Suggestion: run /agent-skill-refresh
Fallback: dynamic discovery enabled
```

## Invalid Parameters
Symptoms:
- Required parameters missing.
- Parameter type mismatch.

Recovery steps:
1. State which parameters are missing or invalid.
2. Show expected parameter names and types.
3. Ask for clarification or corrected values.

Template:
```
Error: invalid parameters for <tool-id>
Missing: <param-a>, <param-b>
Expected: <param-a: string>, <param-b: number>
Next: provide missing values
```

## Partial Success Handling
Symptoms:
- Tool completes with warnings.
- Mixed success in batch operations.

Recovery steps:
1. Report success items and failures separately.
2. Provide counts and identifiers.
3. Suggest retry for failed subset only.

Template:
```
Partial success: 3 succeeded, 2 failed
Succeeded: [id1, id2, id3]
Failed: [id4, id5]
Next: retry failed items with adjusted params
```

## Fallback Procedures
Fallback hierarchy:
1. Cached tool lookup (fast)
2. Dynamic tool registry lookup
3. Ask for clarification or alternative approach

For browser tools:
- If element not found, use take_snapshot to refresh uids.
- If click fails repeatedly, try scroll or hover before clicking.

For GitHub tools:
- If repository not found, verify owner/repo spelling.
- If rate-limited, reduce query frequency and request retry later.

For GraphQL tools:
- If schema fetch fails, verify endpoint and auth.
- If type not found, re-check filter_types output.

For Docs tools:
- If library resolution fails, request full package name.
- If query returns no matches, broaden query terms.

## Error Response Templates
Generic error:
```
Status: failure
Error: <message>
Tool: <tool-id>
Context: <key params>
Next: <suggested action>
```

Browser error:
```
Status: failure
Error: element not found
Tool: MetaMCP_chrome-devtools__click
Params: uid=<uid>
Next: run take_snapshot to refresh uids
```

GitHub error:
```
Status: failure
Error: 404 repository not found
Tool: MetaMCP_github-zengaming__get_pull_request
Params: owner=<owner>, repo=<repo>, pull_number=<n>
Next: confirm repository name or access rights
```

GraphQL error:
```
Status: failure
Error: field not found
Tool: MetaMCP_graphql-tools__get_field_details
Params: field_name=<field>
Next: list available fields with filter_queries
```

Docs error:
```
Status: failure
Error: library not resolved
Tool: MetaMCP_context7__resolve-library-id
Params: libraryName=<name>
Next: provide full package name or repo
```

## Recovery Decision Tree
Decision tree (text form):
1. Is tool id invalid?
   - Yes -> suggest alternatives and refresh cache.
   - No -> continue.
2. Did execution timeout?
   - Yes -> summarize partial output and retry with narrower scope.
   - No -> continue.
3. Did execution return a known error?
   - Yes -> apply category-specific recovery.
   - No -> continue.
4. Are params missing/invalid?
   - Yes -> request corrected params.
   - No -> continue.
5. Is cache missing?
   - Yes -> recommend /agent-skill-refresh and use dynamic discovery.
   - No -> continue.
6. Unknown failure
   - Provide generic error template and ask for clarification.

## Recovery Checklist
- [ ] Identify error class
- [ ] Provide concise error summary
- [ ] Include tool id and key params
- [ ] Suggest concrete next steps
- [ ] Avoid automatic retries without confirmation
