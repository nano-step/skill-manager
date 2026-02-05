## 1. Workflow Schema and Templates

- [x] 1.1 Define workflow JSON schema in `templates/skill/assets/workflow-schema.json`
- [x] 1.2 Create built-in workflow templates in `templates/skill/assets/workflow-templates.json` (database, browser, github)
- [x] 1.3 Update cache schema version to 4.0.0 in documentation

## 2. Workflow Command

- [x] 2.1 Create `templates/command-workflow.md` with list, add, edit, remove, enable, disable subcommands
- [x] 2.2 Document interactive workflow creation flow
- [x] 2.3 Document template-based workflow creation
- [x] 2.4 Add command reference to `templates/command.md`

## 3. Agent Prompt Updates

- [x] 3.1 Add workflow detection logic to `templates/agent.json` prompt_append
- [x] 3.2 Add prerequisite execution flow to agent prompt
- [x] 3.3 Add session state checking to agent prompt
- [x] 3.4 Add workflow logging format to agent prompt

## 4. Skill Documentation

- [x] 4.1 Create `templates/skill/references/workflows.md` with full workflow documentation
- [x] 4.2 Update `templates/skill/SKILL.md` with workflow section
- [x] 4.3 Update routing decision tree to include workflow check
- [x] 4.4 Add workflow examples to SKILL.md

## 5. Session State

- [x] 5.1 Document session state file format in workflows.md
- [x] 5.2 Add session state handling to agent prompt
- [x] 5.3 Document session timeout and cleanup behavior

## 6. Version and Documentation

- [x] 6.1 Update version in `templates/skill/SKILL.md` metadata to 4.0.0
- [x] 6.2 Update AGENTS.md with workflow capabilities
- [x] 6.3 Update README.md with workflow feature section
