## 1. Rules System Foundation

- [ ] 1.1 Create `templates/skill/assets/rules-schema.json` with JSON schema for rules definitions
- [ ] 1.2 Update cache schema documentation for v5.0.0 with `rules` object
- [ ] 1.3 Add rules display logic to `templates/agent.json` prompt (show recommendations during routing)

## 2. Skill Generation Command

- [ ] 2.1 Create `templates/command-skill-generate.md` with generate, add-rule, remove-rule, list-rules subcommands
- [ ] 2.2 Document category selection and tool metadata extraction
- [ ] 2.3 Document interactive mode wizard flow

## 3. Template Engine

- [ ] 3.1 Create `templates/skill/assets/skill-template.md` as base template for generated skills
- [ ] 3.2 Create `templates/skill/assets/reference-template.md` for generated reference files
- [ ] 3.3 Document template variable substitution in skill generation

## 4. Context7 Integration

- [ ] 4.1 Document Context7 API usage for rule fetching in `templates/skill/references/skill-generation.md`
- [ ] 4.2 Add `--fetch-rules` flag documentation to command
- [ ] 4.3 Document rule attribution and source tracking

## 5. Agent Prompt Updates

- [ ] 5.1 Add skill generation awareness to `templates/agent.json` prompt
- [ ] 5.2 Add rules recommendation display format to agent prompt
- [ ] 5.3 Update routing decision tree to include rules check

## 6. Skill Documentation

- [ ] 6.1 Create `templates/skill/references/skill-generation.md` with full documentation
- [ ] 6.2 Update `templates/skill/SKILL.md` with skill generation section
- [ ] 6.3 Add skill generation examples to SKILL.md

## 7. Version and Documentation

- [ ] 7.1 Update version in `templates/skill/SKILL.md` metadata to 5.0.0
- [ ] 7.2 Update AGENTS.md with skill generation capabilities
- [ ] 7.3 Update README.md with skill generation feature section
