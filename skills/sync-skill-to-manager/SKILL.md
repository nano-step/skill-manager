---
name: sync-skill-to-manager
description: "Sync a locally-developed OpenCode skill to the skill-manager npm package and (if private) the private-skills GitHub repo. Handles per-skill version bumps, public/private classification, build verification, and conventional-commit-style git push. Auto-publish to npm is handled downstream by nano-step/shared-workflows@v1 when the push to master lands. Use this skill whenever the user says 'sync skill', 'publish skill', 'push skill to manager', '/sync-skill-to-manager <name>', or asks to release/distribute a skill they just edited."
compatibility: "OpenCode with gh CLI authenticated as kokorolx. (npm publish is handled by the auto-publish workflow on master, not by this skill.)"
metadata:
  author: Sisyphus
  version: "2.0.0"
---

# sync-skill-to-manager

Distribute a local OpenCode skill to its publishing channels with one command. Picks up the source skill from the user's project or global config, classifies it as public or private, copies to the right repo(s), bumps per-skill versions, builds, commits, and pushes.

**npm publish is NOT this skill's job anymore.** The `nano-step/shared-workflows@v1 publish-stable` reusable workflow on `nano-step/skill-manager`'s `master` branch handles npm publish automatically when this skill's push lands — including bumping `skill-manager`'s own `package.json` version, generating `CHANGELOG.md`, tagging, and creating the GitHub Release. This skill stops at `git push`.

## TL;DR

```
/sync-skill-to-manager <skill-name>            # sync + commit + push (auto-publish takes over on master)
/sync-skill-to-manager <skill-name> --dry-run  # preview only
/sync-skill-to-manager <skill-name> --no-push  # local commit only (manual push later)
```

## Hard-coded paths (this skill is opinionated about layout)

| Var | Value |
|---|---|
| `SKILL_MANAGER_REPO` | `/Users/tamlh/workspaces/self/AI/Tools/skill-manager` |
| `PRIVATE_SKILLS_REPO` | `/Users/tamlh/workspaces/self/AI/Tools/private-skills` |
| `PRIVATE_CATALOG` | `${SKILL_MANAGER_REPO}/private-catalog.json` |

If those paths don't exist, abort with a clear error — don't try to "find" them.

## Source skill resolution

1. Project: `${PWD}/.opencode/skills/<name>/SKILL.md` (if it exists)
2. Global: `~/.config/opencode/skills/<name>/SKILL.md`
3. If both exist → ask the user which to use
4. If neither exists → abort

The "source skill" is the directory that contains `SKILL.md`. We always copy the **whole directory** (references/, assets/, scripts/, checklists/, CHANGELOG.md, etc.).

## Public vs private classification

Read `${PRIVATE_CATALOG}` once. Then:

| Condition | Classification |
|---|---|
| `<name>` IS in `private-catalog.json` | **private** |
| `<name>` is NOT in `private-catalog.json` AND `${SKILL_MANAGER_REPO}/skills/<name>/` exists | **public** |
| `<name>` exists in neither place (brand new) | **ASK USER**: public or private? |

## Routing rules (privacy-respecting)

| Source | Destination | What gets bundled in npm |
|---|---|---|
| Public skill | `${SKILL_MANAGER_REPO}/skills/<name>/` | YES — full skill files |
| Private skill | `${PRIVATE_SKILLS_REPO}/skills/<name>/` AND `private-catalog.json` entry | NO files — only the catalog entry. Users with a token fetch from GitHub at install time. |

**Privacy leak fix**: skill-manager's installer prefers local `skills/` over the GitHub private fetch. If a private skill is **physically present** in `${SKILL_MANAGER_REPO}/skills/`, it will install without auth. The sync MUST detect this and offer to remove the leaked copy:

```
⚠️  '<name>' is private but a copy exists at ${SKILL_MANAGER_REPO}/skills/<name>/.
   This bypasses authentication. Remove it? (yes/no)
```

Only proceed with the sync after the user decides.

## Workflow

Pre-flight runs the helper script `scripts/sync.sh` for the heavy lifting. The orchestrator (this skill) handles user prompts, classification decisions, and final summary. The helper handles file mirroring, build verification, and git operations. **No `npm` operations.**

### Step 1 — Pre-flight checks

Run `scripts/preflight.sh <name>`. It exits non-zero with a specific message if any check fails:

1. `${SKILL_MANAGER_REPO}` and `${PRIVATE_SKILLS_REPO}` exist
2. Source skill directory found
3. Source `SKILL.md` exists and has parseable YAML frontmatter
4. Source `skill.json` exists and is valid JSON with `name`, `version`, `description`
5. `gh auth status` shows `kokorolx` as active
6. Token-leak scan on source: `grep -rE 'gho_[A-Za-z0-9]{30,}|ghp_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}'` — abort if matches found
7. `git -C ${SKILL_MANAGER_REPO} status --porcelain` is empty (or only matches the files we're about to touch)
8. `git -C ${PRIVATE_SKILLS_REPO} status --porcelain` is empty (only checked if private)

(`npm whoami` is no longer checked — this skill does not publish to npm. That's handled by the auto-publish workflow on the server side using the org-level `NPM_TOKEN`.)

If any fails: report the exact failure and stop. Do not auto-fix.

### Step 2 — Classify and confirm

After preflight:

1. Check `private-catalog.json` for `<name>`
2. Check `${SKILL_MANAGER_REPO}/skills/<name>/` and `${PRIVATE_SKILLS_REPO}/skills/<name>/`
3. Resolve classification per the table above
4. **If brand-new**, ask: "New skill detected. Publish as public or private? (public/private)"
5. **If private leak detected**, ask: "Remove leaked copy at ${SKILL_MANAGER_REPO}/skills/<name>? (yes/no)"
6. Print a plan to the user:
   ```
   📦 sync plan for '<name>'
     Classification: <public|private>
     Source:    <resolved-source-path>  (v<source-version>)
     Targets:
       • <target-path-1>  (currently v<remote-version>)
       • <target-path-2>  (catalog entry only)
     Version action: <use-as-is | bump-patch | abort-source-behind>
     Commits:    <count> across <repo-count> repo(s)
     Push:       <yes|no>
     npm publish: (handled by auto-publish workflow on master push)
   Proceed? (yes/no)
   ```

### Step 3 — Version handling

Source-of-truth for version: source skill's `skill.json` (skill-manager reads this).

| Source vs remote `skill.json` version | Action |
|---|---|
| Source > remote | Use source as-is. Copy SKILL.md frontmatter version too. |
| Source == remote | Auto-bump patch in **source** (and propagate). Print "auto-bumped <name> v<X> → v<Y>". |
| Source < remote | **Abort** with: "Source v<X> is behind remote v<Y>. Pull or set source version manually." |

If the version is bumped, **also update**:
- `SKILL.md` YAML frontmatter `metadata.version`
- `skill.json` `version`
- `private-catalog.json` entry's `version` (private only)

Use `scripts/version-bump.sh` for the patch bump (semver-aware).

### Step 4 — Brand-new skill: README + catalog updates

If brand-new:
- **Public**: build the table row from `skill.json` `name` + `description` (truncated to one line). Insert into `${SKILL_MANAGER_REPO}/README.md`'s "Public Skills" table, alphabetized. Show diff. Ask confirm.
- **Private**: append entry to `private-catalog.json` (alphabetized) AND insert into the "Private Skills" table in README. Show diff. Ask confirm.

If user rejects the diff → still copy files but skip the README update (with a printed reminder).

### Step 5 — Copy files

```
public:
  rsync -a --delete <source>/ ${SKILL_MANAGER_REPO}/skills/<name>/
private:
  rsync -a --delete <source>/ ${PRIVATE_SKILLS_REPO}/skills/<name>/
  # If leak removal confirmed:
  rm -rf ${SKILL_MANAGER_REPO}/skills/<name>
```

`--delete` ensures removed source files are also removed from target (avoids stale files lingering across syncs).

Do NOT copy: `.git/`, `node_modules/`, `.checkpoints/`, `.DS_Store`. Use `--exclude` flags.

### Step 6 — Build skill-manager (smoke test)

```bash
cd ${SKILL_MANAGER_REPO}
npm run build
```

If build fails → abort. Do NOT commit broken state.

This step exists as a **local smoke test** — it catches TypeScript errors before pushing broken code to master. The auto-publish workflow on master will also build (via `prepublishOnly`), but failing fast locally is friendlier.

**`skill-manager`'s `package.json` version is NOT touched by this skill.** The auto-publish workflow inspects the conventional-commit message and patches/minors/majors the version itself. Adding our own bump here would cause double-bumps.

### Step 7 — Commit

Use `scripts/commit.sh` which runs (per repo) with conventional-commit messages:

**skill-manager** commit message templates:
- New public skill:    `feat(<name>): add v<X.Y.Z>`
- Updated public skill: `feat(<name>): sync v<old> → v<new>` (or `chore(<name>): sync v<X>` if patch only)
- New private skill (catalog only): `feat(<name>): add to private catalog v<X.Y.Z>`
- Updated private (catalog version bump only): `chore(<name>): bump catalog to v<X.Y.Z>`
- Privacy leak removal: `fix: remove leaked private skill <name> from public bundle`

These can be combined into a single commit when they belong together.

**Why the conventional-commit type matters now:** The auto-publish workflow translates types into semver bumps — `feat:` → minor bump on `skill-manager`, `fix:`/`chore:`/`docs:` → patch bump, anything with `!` or `BREAKING CHANGE` → major bump. Pick the type that reflects the impact on `@nano-step/skill-manager` users.

**private-skills** commit message:
- New: `feat(<name>): add v<X.Y.Z>`
- Update: `feat(<name>): sync v<old> → v<new>` (or `chore` if patch)

(The `private-skills` repo does not yet have its own auto-publish workflow — commit type there is informational only.)

NEVER add `Co-authored-by`, `Signed-off-by`, or AI attribution trailers (per workspace AGENTS.md).

### Step 8 — Push

If `--no-push` not set:

```bash
git -C ${SKILL_MANAGER_REPO} push
git -C ${PRIVATE_SKILLS_REPO} push   # only if private
```

The skill-manager remote is HTTPS+token. The private-skills remote uses both SSH (fetch) and HTTPS+token (push) — `git push` will use the push URL. Both rely on the embedded token or `gh auth setup-git`. If push fails on auth → STOP and surface the error verbatim.

**As soon as the push to `master` lands**, GitHub Actions fires `nano-step/skill-manager`'s `Publish Stable` workflow (calls `nano-step/shared-workflows@v1`). That workflow takes over: it inspects the commit, picks the semver bump, updates `package.json`, regenerates `CHANGELOG.md`, commits with `[skip ci]`, tags `vX.Y.Z`, runs `npm publish --tag latest`, and creates a GitHub Release. **You are done from this skill's perspective.**

### Step 9 — Summary

Print:
```
✅ sync complete for '<name>'

  Classification: <public|private>
  Source version: v<X.Y.Z>

  Commits:
    • skill-manager:  <sha-short> <subject>
    • private-skills: <sha-short> <subject>   (if applicable)

  Pushed:
    • https://github.com/nano-step/skill-manager/commit/<sha>
    • https://github.com/nano-step/private-skills/commit/<sha>   (if applicable)

  Auto-publish: triggered on push to master.
    Watch: https://github.com/nano-step/skill-manager/actions
    Once the run completes, install with:
      npx @nano-step/skill-manager update <name>
```

## Flags

| Flag | Effect |
|---|---|
| `--dry-run` | Print the full plan and exit. No writes, no git. |
| `--no-push` | Commit locally but don't push. (Auto-publish doesn't fire until you push.) |
| `--force` | Skip dirty-state check. Still requires explicit user `yes` confirmation. |
| `--source <path>` | Override source skill location (skip resolution). |
| `--classify public\|private` | Override classification (required for brand-new skills). |
| `--remove-leak` | Required when syncing a private skill that has a leaked copy in `skill-manager/skills/`. Removes the leaked copy as part of the commit. |

`--no-publish` was removed in v2.0.0 — this skill no longer publishes to npm. Auto-publish is now handled by `nano-step/shared-workflows@v1` on `nano-step/skill-manager`'s `master` branch.

## Error messages (be specific)

| Failure | Message |
|---|---|
| Source not found | `Source skill '<name>' not found in .opencode/skills or ~/.config/opencode/skills` |
| Both sources exist | (interactive prompt) |
| Source version behind | `Source v<X> is behind remote v<Y>. Pull latest or set source version manually.` |
| Token leak | `Token-like pattern detected in <file>:<line>. Refusing to sync. Remove the secret first.` |
| Dirty repo | `<repo> has uncommitted changes:\n<status output>\nCommit, stash, or pass --force.` |
| gh auth wrong account | `Expected gh active account 'kokorolx', got '<user>'. Run: gh auth switch -u kokorolx` |
| Build failed | `npm run build failed in skill-manager. Output:\n<output>\nNot committing.` |
| Push failed | `git push to <remote> failed:\n<output>\nManual intervention required.` |
| Privacy leak detected | (interactive prompt) |

## Anti-patterns (this skill MUST NOT do)

- Push without explicit user invocation of the skill (running the skill IS the consent — but `--no-push` overrides)
- Run `npm publish` — that's the auto-publish workflow's job. This skill must never call `npm publish`, `npm version`, or modify `skill-manager`'s top-level `package.json` `version` field.
- Add AI attribution / `Co-authored-by` to commits
- Commit private skill files into `${SKILL_MANAGER_REPO}/skills/`
- Bump per-skill (inside `skills/`) major or minor version automatically — only patch
- Skip the build step before committing (it's a smoke test for TS errors)
- Use `git push --force` ever
- Edit unrelated files in either repo

## Scripts

The orchestrator delegates the mechanical work to small bash scripts shipped alongside this skill:

- `scripts/sync.sh <name> [flags]` — main entry point; coordinates the others
- `scripts/preflight.sh <name>` — all pre-flight checks (exits non-zero on failure)
- `scripts/version-bump.sh <type> <skill-json-path>` — patch-only semver bump
- `scripts/commit.sh <repo> <message>` — conventional commit with no AI trailers

These are kept short and composable so the orchestrator can call them step-by-step and intercept on failure. See [scripts/README.md](scripts/README.md) for invocation details.
