## ADDED Requirements

### Requirement: List workflows command

The `/mcp-workflow list` command SHALL display all defined workflows with their name, description, enabled status, and trigger summary.

#### Scenario: List with workflows

- **WHEN** user runs `/mcp-workflow list` and 2 workflows exist
- **THEN** output shows both workflows with name, description, enabled status, and trigger count

#### Scenario: List with no workflows

- **WHEN** user runs `/mcp-workflow list` and no workflows exist
- **THEN** output shows "No workflows defined. Use `/mcp-workflow add` to create one."

### Requirement: Add workflow command

The `/mcp-workflow add <name>` command SHALL interactively create a new workflow by prompting for triggers, prerequisites, and mode.

#### Scenario: Interactive workflow creation

- **WHEN** user runs `/mcp-workflow add database-safe-query`
- **THEN** system prompts for: description, trigger category, trigger tools, trigger keywords, prerequisites, and mode

#### Scenario: Add from template

- **WHEN** user runs `/mcp-workflow add --template database`
- **THEN** workflow is created from built-in database template with default values

#### Scenario: Duplicate name rejected

- **WHEN** user runs `/mcp-workflow add existing-name` and workflow already exists
- **THEN** error is shown: "Workflow 'existing-name' already exists. Use `edit` to modify."

### Requirement: Edit workflow command

The `/mcp-workflow edit <name>` command SHALL allow modifying an existing workflow's properties.

#### Scenario: Edit existing workflow

- **WHEN** user runs `/mcp-workflow edit database-safe-query`
- **THEN** current values are shown and user can modify any field

#### Scenario: Edit non-existent workflow

- **WHEN** user runs `/mcp-workflow edit non-existent`
- **THEN** error is shown: "Workflow 'non-existent' not found."

### Requirement: Remove workflow command

The `/mcp-workflow remove <name>` command SHALL delete a workflow after confirmation.

#### Scenario: Remove with confirmation

- **WHEN** user runs `/mcp-workflow remove database-safe-query`
- **THEN** system asks for confirmation before deleting

#### Scenario: Remove non-existent

- **WHEN** user runs `/mcp-workflow remove non-existent`
- **THEN** error is shown: "Workflow 'non-existent' not found."

### Requirement: Enable/disable workflow commands

The `/mcp-workflow enable <name>` and `/mcp-workflow disable <name>` commands SHALL toggle the workflow's enabled flag without removing it.

#### Scenario: Disable workflow

- **WHEN** user runs `/mcp-workflow disable database-safe-query`
- **THEN** workflow's enabled flag is set to false
- **THEN** workflow no longer triggers but remains in cache

#### Scenario: Enable workflow

- **WHEN** user runs `/mcp-workflow enable database-safe-query`
- **THEN** workflow's enabled flag is set to true
- **THEN** workflow triggers normally

### Requirement: Built-in templates

The system SHALL provide built-in workflow templates for common patterns: database, browser, github.

#### Scenario: List available templates

- **WHEN** user runs `/mcp-workflow add --template` without a name
- **THEN** available templates are listed with descriptions

#### Scenario: Database template

- **WHEN** user runs `/mcp-workflow add --template database`
- **THEN** workflow is created with: triggers for database category, prerequisites for list_databases, list_tables, inspect_table, get_indexes
