# sync-skill-to-manager scripts

Helper scripts invoked by the skill orchestrator. Each script does one thing and exits with a clear non-zero status on failure.

| Script | Purpose | Usage |
|---|---|---|
| `sync.sh` | Main orchestrator. Coordinates the others. | `sync.sh <skill-name> [flags]` |
| `preflight.sh` | All pre-flight checks (paths, gh auth, leak scan, git state). | `preflight.sh <skill-name>` |
| `version-bump.sh` | Patch-bump version in `skill.json` + `SKILL.md` frontmatter. | `version-bump.sh <skill-json> <skill-md>` |
| `commit.sh` | Conventional-commit wrapper that disables AI/co-author trailers. | `commit.sh <repo> <message> [<file>...]` |

**v2.0.0**: `npm publish` is no longer performed by these scripts. It is handled by the `nano-step/shared-workflows@v1 publish-stable` reusable workflow on `nano-step/skill-manager`'s `master` branch. These scripts stop at `git push`.

## Flags supported by `sync.sh`

| Flag | Effect |
|---|---|
| `--dry-run` | Print the plan and exit. No writes. |
| `--no-push` | Commit locally only. (Auto-publish doesn't fire until you push.) |
| `--force` | Bypass dirty-state checks. |
| `--source <path>` | Override source skill path. |
| `--classify public\|private` | Override classification (required for brand-new skills). |
| `--remove-leak` | Required when syncing a private skill that has a leaked copy in `skill-manager/skills/`. Removes the leaked copy as part of the commit. |

`--no-publish` was removed in v2.0.0. Passing it now prints a deprecation warning and is otherwise a no-op (since publishing is no longer in scope).

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | Operational failure (build error, push fail, dirty repo, etc.) |
| 2 | Argument error |
| 3 | Ambiguous source (skill exists in both project and global) — caller must pass `--source` |

## Hard-coded paths

These scripts are opinionated about where the repos live. Edit the constants at the top of each script if your layout differs.

```
SKILL_MANAGER_REPO=/Users/tamlh/workspaces/self/AI/Tools/skill-manager
PRIVATE_SKILLS_REPO=/Users/tamlh/workspaces/self/AI/Tools/private-skills
```
