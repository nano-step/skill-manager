# Changelog

All notable changes to this project will be documented in this file.


## [5.8.0] — 2026-05-19

### Added
- feat(sync-skill-to-manager): sync v1.0.0 → v2.0.0
- feat(od-workflow): sync v0.1.0 → v0.1.1
- feat(od-workflow): add v0.1.0
- feat(open-design-mcp): add v0.1.0
- feat(harness-init): add to private catalog v0.1.0
- feat(blackbox-testing): add to private catalog v1.0.0
- feat(e2e-case-planner): add to private catalog v1.0.0
- feat(sync-skill-to-manager): add v1.0.0
- feat(enhance-prompt): add v1.0.0 skill + catalog entry
- feat: add rri-t-testing v1.1.0 and pr-code-reviewer v3.4.0 skills
- feat(pr-code-reviewer): upgrade to v3.3.0 + bump manager to v5.7.0
- feat(pr-code-reviewer): add 3-layer verification pipeline to reduce false positives
- feat: show private skills in list without auth
- feat: auto-merge MCP server config on skill install
- feat: add version subcommand
- feat: add private skill distribution via GitHub token auth
- feat: add rtk skill
- feat: add nano-brain skill
- feat: add mermaid-validator skill
- feat: add pdf skill
- feat: add rtk-setup skill
- feat: add blog-workflow skill
- feat: add security-workflow skill
- feat: add idea-workflow skill
- feat: add reddit-workflow skill
- feat: add team-workflow skill
- feat: add ui-ux-pro-max skill
- feat: add skill-creator skill
- feat: add comprehensive-feature-builder skill
- feat(workflows): add workflow feature for prerequisite tool execution

### Fixed
- fix: remove leaked private skills from public bundle
- fix(nano-brain): v2.1.1 — fix reindex workdir rule
- fix: remove private skills from bundled package
- fix: always show private skills in list using bundled catalog as baseline

### Changed
- refactor: v5 multi-skill registry with skill-* naming throughout
- refactor: rename to @nano-step/skill-manager and fix installer bugs
- refactor: rename internal mcp-* to agent-skill-* naming
- refactor: rename package from opencode-mcp-manager to agent-skill-manager

### Documentation
- docs: add database-inspector to private skills list in README
- docs: update README — split public/private skill lists
- docs: update README with full 17-skill catalog

### Other
- chore: sync open-design skills + bump to v5.7.14
- chore(open-design-mcp): sync v0.1.1 → v0.1.2
- chore(open-design-mcp): sync v0.1.0 -> v0.1.1
- chore: gitignore .claude/ local settings
- chore: sync package-lock to v5.7.4
- chore: bump to v5.7.4
- chore: bump to v5.7.2 — deep-design catalog update to v2.0.0
- chore: bump to v5.7.1
- chore: bump to v5.6.2
- chore: remove deprecated mcp-management skill (replaced by skill-management)
- chore: bump v5.4.2 — add database-inspector private skill
- chore: bump v5.4.1 — purge private skills from history
- chore: bump v5.4.0 — private skill distribution
- chore: bump v5.3.0 — add feature-analysis, mermaid-validator, nano-brain, rtk skills
- chore: bump v5.2.2 — add pdf skill
- chore: bump v5.2.1 — add rtk-setup skill
- chore: bump v5.2.0 — add 8 new skills to catalog
- chore: bump v5.1.0 — add rri-t-testing skill
- chore: bump v5.0.1 — clean references, add skill keywords
- chore: add .gitignore, remove node_modules and generated dirs from tracking

**Install:** `npm install @nano-step/skill-manager@5.8.0`

---

