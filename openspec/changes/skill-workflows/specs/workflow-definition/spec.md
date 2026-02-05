## ADDED Requirements

### Requirement: Workflow schema structure

The system SHALL support workflow definitions with the following structure: name, enabled flag, description, triggers object, prerequisites array, and mode.

#### Scenario: Valid workflow definition

- **WHEN** a workflow is defined with name "database-safe-query", triggers for category "database", and 3 prerequisites
- **THEN** the workflow is stored in `.opencode/mcp-tools.json` under the `workflows` key

#### Scenario: Workflow with all fields

- **WHEN** a workflow includes enabled, description, triggers, prerequisites, and mode fields
- **THEN** all fields are persisted and retrievable

### Requirement: Trigger definition

Workflows SHALL support three trigger types: category (string), tools (array of tool names), and keywords (array of strings). A workflow triggers when ANY trigger condition matches.

#### Scenario: Category trigger match

- **WHEN** task targets a tool in category "database" and workflow has `triggers.category: "database"`
- **THEN** the workflow is triggered

#### Scenario: Tool trigger match

- **WHEN** task uses tool "execute_query" and workflow has `triggers.tools: ["execute_query"]`
- **THEN** the workflow is triggered

#### Scenario: Keyword trigger match

- **WHEN** task contains word "select" and workflow has `triggers.keywords: ["select"]`
- **THEN** the workflow is triggered

#### Scenario: No trigger match

- **WHEN** task does not match any trigger conditions
- **THEN** the workflow is NOT triggered

### Requirement: Prerequisite definition

Each prerequisite SHALL have: step number, tool name, description, and required flag. Prerequisites execute in step order.

#### Scenario: Prerequisite with all fields

- **WHEN** prerequisite has step=1, tool="list_tables", description="List tables", required=true
- **THEN** prerequisite is valid and executable

#### Scenario: Optional prerequisite

- **WHEN** prerequisite has required=false
- **THEN** prerequisite may be skipped without blocking workflow

### Requirement: Workflow modes

Workflows SHALL support three modes: "enforce" (auto-run prerequisites), "warn" (show warning, allow skip), "suggest" (mention only).

#### Scenario: Enforce mode

- **WHEN** workflow mode is "enforce"
- **THEN** prerequisites execute automatically before main action

#### Scenario: Warn mode

- **WHEN** workflow mode is "warn"
- **THEN** warning is shown and user can choose to skip prerequisites

#### Scenario: Suggest mode

- **WHEN** workflow mode is "suggest"
- **THEN** prerequisites are mentioned but execution is not blocked

### Requirement: Cache schema version

Adding workflows SHALL increment the cache schema version to "4.0.0".

#### Scenario: Version update

- **WHEN** workflows section is added to cache
- **THEN** version field is "4.0.0"
