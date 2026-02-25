import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { ManagerState, MANAGER_VERSION, readJsonFile, writeJsonFile } from "./utils";

function createEmptyState(): ManagerState {
  return { version: 1, managerVersion: MANAGER_VERSION, skills: {} };
}

export async function loadState(stateFilePath: string): Promise<ManagerState> {
  const exists = await fs.pathExists(stateFilePath);
  if (!exists) {
    return createEmptyState();
  }

  const data = await readJsonFile<ManagerState>(stateFilePath, createEmptyState());
  return data;
}

export async function saveState(stateFilePath: string, state: ManagerState): Promise<void> {
  state.managerVersion = MANAGER_VERSION;
  await writeJsonFile(stateFilePath, state);
}

export async function migrateV4State(
  configDir: string,
  stateFilePath: string,
  skillsDir: string,
): Promise<void> {
  const oldVersionFile = path.join(configDir, ".agent-skill-version.json");
  const [oldExists, newExists] = await Promise.all([
    fs.pathExists(oldVersionFile),
    fs.pathExists(stateFilePath),
  ]);

  if (!oldExists || newExists) {
    return;
  }

  console.log(chalk.cyan("Migrating from v4 state format..."));

  const state = createEmptyState();

  const skillPath = path.join(skillsDir, "skill-management", "SKILL.md");
  const mcpSkillPath = path.join(skillsDir, "mcp-management", "SKILL.md");
  const skillInstalled = await fs.pathExists(skillPath) || await fs.pathExists(mcpSkillPath);

  if (skillInstalled) {
    state.skills["skill-management"] = {
      version: "1.0.0",
      installedAt: new Date().toISOString(),
      location: configDir.includes(".config/opencode") ? "global" : "project",
    };
  }

  await writeJsonFile(stateFilePath, state);
  await fs.remove(oldVersionFile);

  console.log(chalk.green("Migration complete. State saved to .skill-manager.json"));
}
