## ADDED Requirements

### Requirement: Automatic retry on failure

The mcp-manager SHALL automatically retry failed tool executions up to 3 times before returning a failure report.

#### Scenario: Tool succeeds on first attempt

- **WHEN** tool execution succeeds on first attempt
- **THEN** result is returned immediately without retry

#### Scenario: Tool succeeds on retry

- **WHEN** tool execution fails on first attempt but succeeds on second attempt
- **THEN** successful result is returned
- **THEN** response includes note that retry was needed

#### Scenario: Tool fails all attempts

- **WHEN** tool execution fails on all 3 attempts
- **THEN** mcp-manager returns detailed failure report with all error messages

### Requirement: Retry backoff timing

The mcp-manager SHALL use simple backoff timing: immediate first retry, 1 second delay before second retry, 2 seconds delay before third retry.

#### Scenario: Backoff timing sequence

- **WHEN** tool fails and retries are attempted
- **THEN** first retry is immediate (0s delay)
- **THEN** second retry has 1 second delay
- **THEN** third retry has 2 second delay

### Requirement: Failure report format

When all retry attempts fail, the mcp-manager SHALL return a structured failure report containing: tool name, total attempts, each attempt's error message, and suggested next steps.

#### Scenario: Complete failure report

- **WHEN** tool "screenshot" fails all 3 attempts with different errors
- **THEN** report includes `{"tool": "screenshot", "attempts": 3, "errors": ["error1", "error2", "error3"], "suggestion": "..."}`

#### Scenario: Failure report with actionable suggestion

- **WHEN** tool fails due to "tool not found" error
- **THEN** suggestion includes "Run /mcp-refresh to update tool cache"

### Requirement: Retry scope

Retry logic SHALL apply to individual tool executions. In batch mode, each tool in the batch has its own independent retry attempts.

#### Scenario: Batch with individual retries

- **WHEN** batch contains tools A and B, and tool A fails first attempt but succeeds on retry
- **THEN** tool A result shows retry was used
- **THEN** tool B executes independently with its own retry budget
