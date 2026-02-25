# MCP Result Handling Reference
# Scope: summarization rules and response patterns.
# Do not include routing, cache, or error recovery content here.

## Result Types
1. Text or scalar results
2. Lists or collections
3. File operation results
4. Data query results
5. Screenshot or binary results
6. Structured objects

## Global Summarization Rules
- Always state success or failure clearly.
- Always include key identifiers (IDs, paths, URLs, uids).
- Always include counts for list-like results.
- Always include actionable next steps when applicable.
- Never dump raw large payloads into the response.

## Large Result Handling (>1000 chars)
When result size exceeds 1000 characters:
1. Provide a short summary (1-3 lines).
2. Include counts and key identifiers.
3. Offer a follow-up query or refined filter.
4. If a file was generated, include file path.

Example:
```
Result (large): 12,450 chars
Summary: Returned 325 items across 6 pages.
Key IDs: [101, 102, 103]
Next: Ask for a specific page or filter by label.
```

## File Operation Result Patterns
Pattern: read/write/create/delete/move

Required fields to report:
- Path(s)
- Size or line count (if available)
- Operation status

Example: read
```
Success: file read
Path: /tmp/output.log
Size: 4,892 chars (120 lines)
Next: specify line range for deeper inspection.
```

Example: write
```
Success: file written
Path: /tmp/report.json
Size: 1,204 chars
Next: open the file to review content.
```

Example: delete
```
Success: file deleted
Path: /tmp/old.png
Next: none
```

Example: move
```
Success: file moved
From: /tmp/a.txt
To: /tmp/archive/a.txt
Next: verify new location if needed.
```

## Data Query Result Patterns
Pattern: lists, rows, records, JSON arrays

Required fields:
- Count
- Key identifiers or first few items
- Filters used

Example: small list
```
Success: 3 items
IDs: [11, 12, 13]
Filter: state=open
Next: request details for a specific ID.
```

Example: large list
```
Success: 250 items
Sample: [id: 1, id: 2, id: 3]
Filter: label=bug, sort=updated
Next: narrow by date range or page.
```

Example: structured object
```
Success: retrieved PR #42
Repo: owner/repo
Status: open, checks=3
Next: request file list or reviews.
```

## Screenshot Result Patterns
Pattern: binary output + path

Required fields:
- Path or attachment name
- Whether full page or element
- If element: uid or selector

Example: full page
```
Success: screenshot captured
Path: /tmp/screen.png
Mode: fullPage
Next: request another region if needed.
```

Example: element
```
Success: element screenshot captured
Path: /tmp/button.png
Element: uid=btn-login
Next: use take_snapshot to verify other uids.
```

## Console/Network Result Patterns
Pattern: browser logs and network lists

Required fields:
- Count
- Severity or resource type
- Example snippet or first item id

Example: console errors
```
Success: 2 console errors
First: [msgid=14] "TypeError: ..."
Next: open specific message id for details.
```

Example: network list
```
Success: 18 network requests
Types: xhr=5, fetch=6, document=1
Next: open request id for full headers/body.
```

## Performance Trace Result Patterns
Required fields:
- Trace file path
- Whether autoStop occurred
- Insight names (if provided)

Example:
```
Success: trace recorded
Path: trace.json.gz
Insights: LCPBreakdown, DocumentLatency
Next: analyze specific insight by name.
```

## Documentation Query Result Patterns
Required fields:
- Library ID
- Match count or snippet count
- Example snippet or key excerpt

Example:
```
Success: docs retrieved
Library: /vercel/next.js
Matches: 4
Snippet: "useRouter" example with push()
Next: ask for detailed example or version-specific docs.
```

## GraphQL Result Patterns
Required fields:
- Count of items or types
- Sample names
- Endpoint used

Example: filter_queries
```
Success: 12 queries
Sample: [user, repo, search]
Endpoint: http://localhost:5555/graphql
Next: get_field_details for a specific query.
```

Example: get_type_details
```
Success: type User
Fields: 9
Sample: id, name, email
Next: fetch field details for specific field.
```

## Reasoning Result Patterns
Required fields:
- Thought count
- Final conclusion

Example:
```
Success: reasoning completed
Thoughts: 5
Conclusion: pick tool A due to lower latency.
Next: proceed with tool execution.
```

## Always Include in Responses
- Status: success or failure
- IDs or paths or URLs
- Counts for list results
- Next steps or suggestions

## Example Summary Formats
Format A (compact):
```
Success: 5 items (ids: 1,2,3...) | Next: request item details
```

Format B (structured):
```
Status: success
Count: 5
IDs: [1,2,3]
Next: request details
```

Format C (file-first):
```
Status: success
Path: /tmp/output.json
Size: 2,043 chars
Next: open file for review
```
