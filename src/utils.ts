import path from "path";
import os from "os";
import fs from "fs-extra";

export const MANAGER_VERSION = "5.6.1";

export interface SkillManifest {
  name: string;
  version: string;
  description: string;
  compatibility?: string;
  agent?: {
    id: string;
    config: Record<string, unknown>;
  } | null;
  mcp?: Record<string, Record<string, unknown>> | null;
  commands?: string[];
  tags?: string[];
}

export interface CatalogEntry {
  manifest: SkillManifest;
  source: "public" | "private";
}

export interface InstalledSkillInfo {
  version: string;
  installedAt: string;
  location: "global" | "project";
}

export interface ManagerState {
  version: number;
  managerVersion: string;
  skills: Record<string, InstalledSkillInfo>;
}

export interface OpenCodePaths {
  configDir: string;
  commandDir: string;
  skillsDir: string;
  agentConfigPath: string;
  stateFilePath: string;
  packageSkillsDir: string;
  opencodeJsonPath: string;
}

export async function detectOpenCodePaths(): Promise<OpenCodePaths> {
  const homeConfig = path.join(os.homedir(), ".config", "opencode");
  const cwd = process.cwd();
  const projectConfig = path.join(cwd, ".opencode");

  const hasHomeConfig = await fs.pathExists(homeConfig);
  const hasProjectConfig = await fs.pathExists(projectConfig);

  if (!hasHomeConfig && !hasProjectConfig) {
    throw new Error("OpenCode config not found. Expected ~/.config/opencode or .opencode in project.");
  }

  const configDir = hasProjectConfig ? projectConfig : homeConfig;
  const opencodeJsonPath = hasProjectConfig
    ? path.join(cwd, "opencode.json")
    : path.join(configDir, "opencode.json");

  return {
    configDir,
    commandDir: path.join(configDir, "command"),
    skillsDir: path.join(configDir, "skills"),
    agentConfigPath: path.join(configDir, "oh-my-opencode.json"),
    stateFilePath: path.join(configDir, ".skill-manager.json"),
    packageSkillsDir: path.join(__dirname, "..", "skills"),
    opencodeJsonPath,
  };
}

export async function ensureDirExists(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  const exists = await fs.pathExists(filePath);
  if (!exists) {
    return fallback;
  }
  const data = await fs.readFile(filePath, "utf8");
  return JSON.parse(data) as T;
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export async function readText(filePath: string): Promise<string> {
  return fs.readFile(filePath, "utf8");
}

export async function writeText(filePath: string, data: string): Promise<void> {
  await fs.writeFile(filePath, data, "utf8");
}
