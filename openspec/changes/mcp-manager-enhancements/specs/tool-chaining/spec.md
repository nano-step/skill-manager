## ADDED Requirements

### Requirement: Sequential tool chaining

The mcp-manager SHALL support tool chaining via `CHAIN:` directive, where output from one tool can be passed as input to the next tool using variable binding.

#### Scenario: Simple two-tool chain

- **WHEN** task contains `CHAIN: [{"tool": "get_element", "params": {"selector": "#btn"}, "output_as": "el"}, {"tool": "click", "params": {"element": "$el"}}]`
- **THEN** mcp-manager executes get_element first
- **THEN** mcp-manager stores result in variable "el"
- **THEN** mcp-manager executes click with element param set to the stored result

#### Scenario: Three-tool chain

- **WHEN** chain contains tools A → B → C with variable bindings
- **THEN** tools execute in order A, B, C
- **THEN** each tool can reference outputs from any previous tool

### Requirement: Chain variable syntax

Variables in chain parameters SHALL be denoted with `$` prefix. The mcp-manager SHALL substitute `$varname` with the actual value from the referenced output.

#### Scenario: Variable substitution

- **WHEN** tool output is stored as "result" and next tool has param `{"data": "$result"}`
- **THEN** "$result" is replaced with actual output value before execution

#### Scenario: Nested variable substitution

- **WHEN** tool output is `{"id": 123, "name": "test"}` stored as "item"
- **WHEN** next tool has param `{"item_id": "$item.id"}`
- **THEN** "$item.id" is replaced with `123`

### Requirement: Chain failure handling

When a tool in a chain fails, the mcp-manager SHALL abort the chain and return a report indicating which step failed, the error, and any partial results from completed steps.

#### Scenario: Chain aborts on failure

- **WHEN** chain has tools A → B → C and tool B fails
- **THEN** tool C is NOT executed
- **THEN** response includes result from A, error from B, and note that C was skipped

#### Scenario: Chain failure report format

- **WHEN** chain fails at step 2 of 3
- **THEN** report includes `{"completed": [{"tool": "A", "result": ...}], "failed": {"tool": "B", "error": "..."}, "skipped": ["C"]}`

### Requirement: Chain size limit

The mcp-manager SHALL accept chains of up to 5 tools. Chains exceeding 5 tools SHALL be rejected with an error message.

#### Scenario: Chain within limit

- **WHEN** chain contains 4 tools
- **THEN** all 4 tools execute in sequence

#### Scenario: Chain exceeds limit

- **WHEN** chain contains 8 tools
- **THEN** mcp-manager returns error "Chain length exceeds limit of 5 tools"
