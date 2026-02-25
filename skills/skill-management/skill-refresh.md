# /skill-refresh

Re-index and categorize all available tools for intelligent routing.

## Purpose

Create a semantic tool index in `.opencode/skill-tools.json` by analyzing **all available tools** in the current agent context. Categorization is AI-only and based on tool names + descriptions (no prefixes).

## When to Run

- First time setup (cache doesn't exist)
- After adding/removing MCP servers or tools
- When routing seems incorrect or tools are missing
- Periodically to keep index fresh

## Auto-Refresh Triggers

The skill-manager will suggest running `/skill-refresh` automatically when:

- **Tool not found**: A requested tool doesn't exist in the cache
- **Cache missing**: The `.opencode/skill-tools.json` file doesn't exist
- **Cache stale**: The cache is older than 24 hours
- **Tool count mismatch**: Available tools differ from cached count

When you see a suggestion to refresh, run this command to update the cache.

## Execution Steps

### Step 1: Enumerate All Tools (Introspection)

List every tool available to the agent in its current context (functions/tools list). For each tool, extract:

- `tool_id` (exact tool name)
- `description` (tool description text)

Produce a full list; do not skip any tools.

### Step 2: Semantic Categorization (Single Holistic Pass)

Use the following prompt to categorize **all tools at once**:

```
You have access to the following tools. Analyze each tool's name and description,
then group them into semantic categories based on what they DO (not where they come from).

Tools:
- tool_id_1: "description 1"
- tool_id_2: "description 2"
...

For each category, provide:
1. name: Short identifier (lowercase, hyphenated)
2. description: One sentence describing the category's purpose
3. keywords: 5-10 words for routing user requests to this category
4. tools: List of tool IDs belonging to this category

Output as JSON.
```

### Step 3: Write Cache File (v2.0.0)

Write `.opencode/skill-tools.json` with this schema:

```json
{
  "version": "2.0.0",
  "generated_at": "2026-01-27T03:00:00Z",
  "tool_count": 75,
  "categories": {
    "browser-automation": {
      "name": "Browser Automation",
      "description": "Web page interaction, screenshots, DOM manipulation",
      "keywords": ["screenshot", "click", "navigate", "page", "browser", "element"],
      "tools": ["MetaMCP_chrome-devtools__take_screenshot", "MetaMCP_chrome-devtools__click"]
    }
  },
  "tools": {
    "MetaMCP_chrome-devtools__take_screenshot": {
      "category": "browser-automation",
      "description": "Take a screenshot of the page or element"
    }
  }
}
```

### Step 4: Report Summary

```
Skill Tools Index Refreshed:

Categories:
  - browser-automation: 25 tools
  - docs: 4 tools
  - github: 15 tools

Summary:
  - Total tools: 75
  - Categories: 3
  - Cache: .opencode/skill-tools.json
```
