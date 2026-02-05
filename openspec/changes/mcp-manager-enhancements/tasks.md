## 1. Agent Prompt Updates

- [x] 1.1 Add batch operations syntax and handling to `templates/agent.json` prompt_append
- [x] 1.2 Add retry mechanism (3 attempts, backoff timing) to agent prompt
- [x] 1.3 Add direct passthrough detection (double underscore pattern) to agent prompt
- [x] 1.4 Add tool chaining syntax and variable substitution to agent prompt
- [x] 1.5 Add failure report format specification to agent prompt

## 2. Skill Documentation Updates

- [x] 2.1 Update `templates/skill/SKILL.md` with batch operations section and examples
- [x] 2.2 Update `templates/skill/SKILL.md` with retry mechanism documentation
- [x] 2.3 Update `templates/skill/SKILL.md` with direct passthrough section
- [x] 2.4 Update `templates/skill/SKILL.md` with tool chaining section and examples
- [x] 2.5 Update routing decision tree in SKILL.md to include passthrough check first

## 3. Reference Documentation

- [x] 3.1 Update `templates/skill/references/error-handling.md` with retry mechanism details
- [x] 3.2 Update `templates/skill/references/tool-execution.md` with batch execution patterns
- [x] 3.3 Update `templates/skill/references/tool-execution.md` with chaining patterns
- [x] 3.4 Add failure report examples to error-handling.md

## 4. Command Updates

- [x] 4.1 Update `templates/command.md` to document auto-refresh suggestion on cache miss

## 5. Version and Documentation

- [x] 5.1 Update version in `templates/skill/SKILL.md` metadata to 3.0.0
- [x] 5.2 Update AGENTS.md with new capabilities documentation
- [x] 5.3 Update README.md with new features section
