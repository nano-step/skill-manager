## ADDED Requirements

### Requirement: Direct tool passthrough

When a task specifies an exact tool name (containing `__` separator), the mcp-manager SHALL bypass semantic category routing and execute the tool directly.

#### Scenario: Exact tool name provided

- **WHEN** task is "Use MetaMCP_chrome-devtools__take_screenshot"
- **THEN** mcp-manager skips category lookup
- **THEN** mcp-manager executes MetaMCP_chrome-devtools__take_screenshot directly

#### Scenario: Partial tool name uses routing

- **WHEN** task is "take a screenshot"
- **THEN** mcp-manager uses semantic routing to find appropriate tool

### Requirement: Passthrough pattern detection

The mcp-manager SHALL detect passthrough requests by identifying tool names that match MCP naming conventions: containing double underscore (`__`) separator.

#### Scenario: Double underscore detection

- **WHEN** task contains "MetaMCP_github__get_pull_request"
- **THEN** pattern is detected as exact tool name
- **THEN** passthrough mode is activated

#### Scenario: Regular text not detected

- **WHEN** task contains "get the pull request details"
- **THEN** no passthrough pattern detected
- **THEN** semantic routing is used

### Requirement: Passthrough with parameters

Direct passthrough SHALL support inline parameters specified after the tool name in JSON format.

#### Scenario: Passthrough with JSON params

- **WHEN** task is `MetaMCP_github__get_pull_request {"owner": "foo", "repo": "bar", "pull_number": 123}`
- **THEN** tool is executed with provided parameters

#### Scenario: Passthrough without params

- **WHEN** task is `MetaMCP_chrome__take_screenshot`
- **THEN** tool is executed with empty/default parameters

### Requirement: Passthrough error handling

When passthrough tool execution fails, the mcp-manager SHALL apply the same retry mechanism as routed tools (up to 3 attempts).

#### Scenario: Passthrough with retry

- **WHEN** passthrough tool fails on first attempt
- **THEN** retry mechanism activates (up to 3 attempts)
- **THEN** failure report is returned if all attempts fail

### Requirement: Passthrough validation

When passthrough is attempted but tool does not exist, the mcp-manager SHALL return an error with suggestion to check tool name or run `/mcp-refresh`.

#### Scenario: Invalid passthrough tool

- **WHEN** task specifies "NonExistent__fake_tool"
- **THEN** mcp-manager returns error "Tool 'NonExistent__fake_tool' not found"
- **THEN** error includes suggestion to verify tool name or refresh cache
