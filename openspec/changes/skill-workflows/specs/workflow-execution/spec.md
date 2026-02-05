## ADDED Requirements

### Requirement: Workflow trigger detection

The mcp-manager SHALL check incoming tasks against all enabled workflow triggers before executing tools.

#### Scenario: Task matches workflow

- **WHEN** task "query the users table" is received and "database-safe-query" workflow has keyword trigger "query"
- **THEN** workflow is detected and prerequisites are considered

#### Scenario: Task matches no workflow

- **WHEN** task "take a screenshot" is received and no workflow triggers match
- **THEN** task executes normally without workflow intervention

#### Scenario: Disabled workflow ignored

- **WHEN** task matches a workflow that has enabled=false
- **THEN** workflow is NOT triggered

### Requirement: Prerequisite execution in enforce mode

When workflow mode is "enforce", mcp-manager SHALL execute all required prerequisites before the main action.

#### Scenario: All prerequisites run

- **WHEN** workflow has 3 required prerequisites and mode is "enforce"
- **THEN** all 3 prerequisites execute in step order before main action

#### Scenario: Prerequisites already completed

- **WHEN** prerequisites were completed earlier in session
- **THEN** prerequisites are skipped and main action executes immediately

#### Scenario: Optional prerequisite skipped

- **WHEN** prerequisite has required=false
- **THEN** prerequisite may be skipped based on context

### Requirement: Prerequisite execution in warn mode

When workflow mode is "warn", mcp-manager SHALL show a warning and allow the user to skip prerequisites.

#### Scenario: Warning shown

- **WHEN** workflow mode is "warn" and prerequisites not completed
- **THEN** warning message lists missing prerequisites and asks for confirmation

#### Scenario: User skips prerequisites

- **WHEN** user confirms to skip prerequisites
- **THEN** main action executes without prerequisites

### Requirement: Prerequisite execution in suggest mode

When workflow mode is "suggest", mcp-manager SHALL mention prerequisites but not block execution.

#### Scenario: Suggestion shown

- **WHEN** workflow mode is "suggest" and prerequisites not completed
- **THEN** message suggests running prerequisites but executes main action

### Requirement: Prerequisite failure handling

When a prerequisite fails, mcp-manager SHALL abort the workflow and report which step failed.

#### Scenario: Prerequisite fails

- **WHEN** prerequisite step 2 fails with error
- **THEN** workflow aborts
- **THEN** error report shows: "Workflow 'name' failed at step 2 (tool_name): error message"

#### Scenario: Prerequisite retry

- **WHEN** prerequisite fails
- **THEN** retry mechanism (3 attempts) applies to prerequisite

### Requirement: Workflow execution logging

The mcp-manager SHALL log workflow execution with clear messages indicating which workflow triggered and which prerequisites are running.

#### Scenario: Workflow start log

- **WHEN** workflow triggers
- **THEN** log shows: "Workflow 'database-safe-query' triggered. Running 3 prerequisites..."

#### Scenario: Prerequisite completion log

- **WHEN** prerequisite completes
- **THEN** log shows: "✓ Step 1: list_databases completed"

### Requirement: Multiple workflow handling

When multiple workflows match a task, mcp-manager SHALL use the first matching workflow and log a warning about conflicts.

#### Scenario: Multiple matches

- **WHEN** task matches workflows A and B
- **THEN** workflow A (first defined) is used
- **THEN** warning logged: "Multiple workflows matched. Using 'A'. Also matched: 'B'"
