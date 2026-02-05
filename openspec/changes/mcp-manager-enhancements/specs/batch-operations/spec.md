## ADDED Requirements

### Requirement: Batch tool execution

The mcp-manager SHALL support executing multiple MCP tools in a single invocation when the task contains a `BATCH:` directive with a JSON array of tool specifications.

#### Scenario: Execute two tools in batch

- **WHEN** task contains `BATCH: [{"tool": "screenshot"}, {"tool": "get_title"}]`
- **THEN** mcp-manager executes both tools sequentially and returns results as an array

#### Scenario: Batch with parameters

- **WHEN** task contains `BATCH: [{"tool": "click", "params": {"selector": "#btn"}}, {"tool": "screenshot"}]`
- **THEN** mcp-manager executes click with selector param, then screenshot, returning both results

#### Scenario: Partial batch failure

- **WHEN** one tool in batch fails but others succeed
- **THEN** mcp-manager returns array with success results and error details for failed tool
- **THEN** mcp-manager indicates which tool(s) failed in the response

### Requirement: Batch result format

The mcp-manager SHALL return batch results as a JSON array preserving execution order, with each element containing the tool name, status, and result or error.

#### Scenario: Successful batch result format

- **WHEN** batch of 2 tools completes successfully
- **THEN** result is `[{"tool": "tool1", "status": "success", "result": ...}, {"tool": "tool2", "status": "success", "result": ...}]`

#### Scenario: Mixed success/failure result format

- **WHEN** first tool succeeds and second tool fails
- **THEN** result is `[{"tool": "tool1", "status": "success", "result": ...}, {"tool": "tool2", "status": "error", "error": "..."}]`

### Requirement: Batch size limit

The mcp-manager SHALL accept batches of up to 10 tools. Batches exceeding 10 tools SHALL be rejected with an error message.

#### Scenario: Batch within limit

- **WHEN** batch contains 5 tools
- **THEN** all 5 tools are executed

#### Scenario: Batch exceeds limit

- **WHEN** batch contains 15 tools
- **THEN** mcp-manager returns error "Batch size exceeds limit of 10 tools"
