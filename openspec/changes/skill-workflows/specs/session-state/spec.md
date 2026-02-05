## ADDED Requirements

### Requirement: Session state file

The system SHALL store session state in `.opencode/.mcp-session.json` to track completed prerequisites.

#### Scenario: Session file created

- **WHEN** first prerequisite completes in a session
- **THEN** `.opencode/.mcp-session.json` is created with session_id and completed prerequisites

#### Scenario: Session file structure

- **WHEN** session state is written
- **THEN** file contains: session_id, started_at, and completed object keyed by workflow name

### Requirement: Prerequisite completion tracking

The system SHALL record each completed prerequisite with timestamp and result summary.

#### Scenario: Track completion

- **WHEN** prerequisite "list_tables" completes with result "Found 5 tables"
- **THEN** session state records: `{"list_tables": {"at": "timestamp", "result": "Found 5 tables"}}`

#### Scenario: Check completion status

- **WHEN** mcp-manager checks if prerequisite was completed
- **THEN** session state is read and prerequisite status is determined

### Requirement: Session scope

Session state SHALL be scoped to the current session and cleared when a new session starts.

#### Scenario: New session clears state

- **WHEN** new session starts (new session_id detected)
- **THEN** previous session state is cleared

#### Scenario: Same session preserves state

- **WHEN** multiple tasks execute in same session
- **THEN** completed prerequisites are preserved and reused

### Requirement: Session timeout

Session state SHALL be considered stale after 24 hours and cleared on next access.

#### Scenario: Stale session cleared

- **WHEN** session state is older than 24 hours
- **THEN** state is cleared and prerequisites must re-run

### Requirement: Result summary storage

Prerequisite results SHALL be summarized (max 200 chars) before storing to avoid bloating session file.

#### Scenario: Long result summarized

- **WHEN** prerequisite returns 5000 character result
- **THEN** only first 200 characters (or meaningful summary) are stored

#### Scenario: Short result stored fully

- **WHEN** prerequisite returns "3 databases found"
- **THEN** full result is stored

### Requirement: Session state read performance

Reading session state SHALL be fast (< 10ms) to avoid impacting workflow detection.

#### Scenario: Fast state check

- **WHEN** mcp-manager checks prerequisite completion
- **THEN** check completes in under 10ms

### Requirement: Concurrent access safety

Session state file SHALL handle concurrent read/write safely.

#### Scenario: Concurrent writes

- **WHEN** two prerequisites complete simultaneously
- **THEN** both completions are recorded without data loss
