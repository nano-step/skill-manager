import path from "path";
import os from "os";
import fs from "fs-extra";

export const PACKAGE_VERSION = "4.0.0";
export const AGENT_ID = "mcp-manager";
export const SKILL_DIR_NAME = "mcp-management";

export interface OpenCodePaths {
  configDir: string;
  projectDir: string;
  commandDir: string;
  skillsDir: string;
  agentConfigPath: string;
  versionFilePath: string;
  templateSkillDir: string;
  templateCommandPath: string;
  templateAgentPath: string;
}

export interface InstallationState {
  installedVersion: string | null;
  skillInstalled: boolean;
  commandInstalled: boolean;
  agentInstalled: boolean;
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
  const commandDir = path.join(configDir, "command");
  const skillsDir = path.join(configDir, "skills");
  const agentConfigPath = path.join(configDir, "oh-my-opencode.json");

  const packageRoot = path.join(__dirname, "..");
  const templateSkillDir = path.join(packageRoot, "templates", "skill");
  const templateCommandPath = path.join(packageRoot, "templates", "command-refresh.md");
  const templateAgentPath = path.join(packageRoot, "templates", "agent.json");
  const versionFilePath = path.join(configDir, ".agent-skill-version.json");

  return {
    configDir,
    projectDir: cwd,
    commandDir,
    skillsDir,
    agentConfigPath,
    versionFilePath,
    templateSkillDir,
    templateCommandPath,
    templateAgentPath,
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

export async function backupFile(filePath: string, suffix: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `${filePath}.${suffix}-${timestamp}.bak`;
  await fs.copy(filePath, backupPath);
  return backupPath;
}

export async function fileDiffersFromTemplate(filePath: string, templatePath: string): Promise<boolean> {
  const exists = await fs.pathExists(filePath);
  if (!exists) {
    return false;
  }
  const [current, template] = await Promise.all([readText(filePath), readText(templatePath)]);
  return current.trim() !== template.trim();
}

async function listFilesRecursively(dirPath: string, baseDir: string): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursively(fullPath, baseDir)));
    } else if (entry.isFile()) {
      files.push(path.relative(baseDir, fullPath));
    }
  }

  return files;
}

export async function directoryDiffersFromTemplate(dirPath: string, templateDir: string): Promise<boolean> {
  const [dirExists, templateExists] = await Promise.all([
    fs.pathExists(dirPath),
    fs.pathExists(templateDir),
  ]);

  if (!dirExists) {
    return false;
  }

  if (!templateExists) {
    return true;
  }

  const [currentFiles, templateFiles] = await Promise.all([
    listFilesRecursively(dirPath, dirPath),
    listFilesRecursively(templateDir, templateDir),
  ]);

  currentFiles.sort();
  templateFiles.sort();

  if (currentFiles.length !== templateFiles.length) {
    return true;
  }

  for (let index = 0; index < currentFiles.length; index += 1) {
    if (currentFiles[index] !== templateFiles[index]) {
      return true;
    }
  }

  for (const relativePath of currentFiles) {
    const [currentBuffer, templateBuffer] = await Promise.all([
      fs.readFile(path.join(dirPath, relativePath)),
      fs.readFile(path.join(templateDir, relativePath)),
    ]);
    if (!currentBuffer.equals(templateBuffer)) {
      return true;
    }
  }

  return false;
}

export async function getInstallationState(paths: OpenCodePaths): Promise<InstallationState> {
  const skillPath = path.join(paths.skillsDir, SKILL_DIR_NAME, "SKILL.md");
  const commandPath = path.join(paths.commandDir, "agent-skill-refresh.md");

  const [versionData, skillInstalled, commandInstalled] = await Promise.all([
    readJsonFile<{ version?: string }>(paths.versionFilePath, {}),
    fs.pathExists(skillPath),
    fs.pathExists(commandPath),
  ]);

  const agentConfig = await readJsonFile<Record<string, unknown>>(paths.agentConfigPath, {});
  const agents = (agentConfig as any).agents as Record<string, unknown> | undefined;
  const agentInstalled = agents ? Object.prototype.hasOwnProperty.call(agents, AGENT_ID) : false;

  return {
    installedVersion: typeof versionData.version === "string" ? versionData.version : null,
    skillInstalled,
    commandInstalled,
    agentInstalled,
  };
}
