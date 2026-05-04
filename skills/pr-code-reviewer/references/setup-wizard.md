# Setup Wizard (Phase -2)

Runs once when no `.opencode/code-reviewer.json` exists, or when user runs `/review --setup`.

## Wizard Flow

Ask each question conversationally. Accept number or name. If the user says "both" or lists multiple, select all that apply.

---

### Question 1: Frontend framework

```
What frontend framework does this project use?

  1. Nuxt 3
  2. Next.js
  3. Vue 3 (SPA, no SSR)
  4. React (CRA / Vite)
  5. None (API-only project)
```

→ Maps to `stack.frontend`: `"nuxt"` | `"nextjs"` | `"vue"` | `"react"` | `null`

---

### Question 2: Backend framework

```
What backend framework?

  1. Express
  2. NestJS
  3. Fastify
  4. None (frontend-only project)
```

→ Maps to `stack.backend`: `"express"` | `"nestjs"` | `"fastify"` | `null`

---

### Question 3: ORM / database access

```
How does the project access the database?

  1. TypeORM
  2. Prisma
  3. Sequelize
  4. Raw SQL / query builder
  5. No database
```

→ Maps to `stack.orm`: `"typeorm"` | `"prisma"` | `"sequelize"` | `"raw"` | `null`

---

### Question 4: Language

```
TypeScript, JavaScript, or mixed?

  1. TypeScript (strict)
  2. TypeScript (loose / partial)
  3. JavaScript
  4. Mixed
```

→ Maps to `stack.language`: `"typescript-strict"` | `"typescript"` | `"javascript"` | `"mixed"`

---

### Question 5: State management (skip if backend-only)

```
Frontend state management?

  1. Pinia
  2. Vuex
  3. Redux / Zustand
  4. React hooks only
  5. None / not applicable
```

→ Maps to `stack.state`: `"pinia"` | `"vuex"` | `"redux"` | `"hooks"` | `null`

---

---

### Question 6: Agent knowledge base

```
Does your workspace have an AGENTS.md or a .agents/ knowledge folder?

  1. Yes — I have AGENTS.md + .agents/ folder at workspace root
  2. Yes — I have only AGENTS.md (no .agents/ folder)
  3. No — I don't have any of these
```

If yes:
- Ask for the **workspace root path** (the folder that contains all repos).
  Example: `/Users/tamlh/workspaces/NUSTechnology/Projects/zengamingx`
- Auto-detect by going one level up from the current repo and checking for `AGENTS.md`.
- Verify: check if `.agents/_repos/` and `.agents/_domains/` directories exist.

→ Maps to `agents.workspace_root`, `agents.has_repos_dir`, `agents.has_domains_dir`

---

## Saving the Config

After all questions, write `.opencode/code-reviewer.json`:

```json
{
  "version": "3.3.0",
  "stack": {
    "frontend": "nuxt",
    "backend": "express",
    "orm": "typeorm",
    "language": "typescript",
    "state": "pinia"
  },
  "agents": {
    "workspace_root": "/Users/tamlh/workspaces/NUSTechnology/Projects/zengamingx",
    "has_agents_md": true,
    "has_repos_dir": true,
    "has_domains_dir": true
  },
  "workspace": {
    "name": "",
    "github": {
      "owner": "",
      "default_base": "main"
    },
    "linear": {
      "enabled": true,
      "extract_from": ["branch_name", "pr_description", "pr_title"],
      "fetch_comments": true
    }
  },
  "output": {
    "directory": ".opencode/reviews",
    "filename_pattern": "{type}_{identifier}_{date}"
  },
  "report": {
    "verbosity": "compact",
    "show_suggestions": false,
    "show_improvements": true
  }
}
```

Then show a confirmation:

```
✅ Setup complete! Code reviewer configured for:
   Frontend:  Nuxt 3
   Backend:   Express
   ORM:       TypeORM
   Language:  TypeScript
   State:     Pinia

Knowledge base:
   ✅ AGENTS.md found at workspace root
   ✅ .agents/_repos/ — 37 repo files
   ✅ .agents/_domains/ — 7 domain files

Framework rules that will be applied:
   • references/framework-rules/vue-nuxt.md
   • references/framework-rules/express.md
   • references/framework-rules/typeorm.md
   • references/framework-rules/typescript.md

Config saved to: .opencode/code-reviewer.json
Run /review PR#123 to start your first review.
```

---

## Framework Rule File Mapping

| Stack value | Rule file | Applies to agent |
|-------------|-----------|-----------------|
| `frontend: "nuxt"` or `"vue"` | `framework-rules/vue-nuxt.md` | Quality + Security |
| `frontend: "nextjs"` | `framework-rules/nextjs.md` | Quality + Security |
| `frontend: "react"` | `framework-rules/react.md` | Quality + Security |
| `backend: "express"` | `framework-rules/express.md` | Security + Quality |
| `backend: "nestjs"` | `framework-rules/nestjs.md` | Security + Quality |
| `orm: "typeorm"` | `framework-rules/typeorm.md` | Security + Quality |
| `orm: "prisma"` | `framework-rules/prisma.md` | Security + Quality |
| `language: "typescript*"` | `framework-rules/typescript.md` | Quality |

Load ONLY the files that match the configured stack. Do not load all framework rules.

---

## Re-running Setup

Users can reset at any time:

```
/review --setup
```

This overwrites `.opencode/code-reviewer.json` entirely. Warn the user before overwriting existing config.
