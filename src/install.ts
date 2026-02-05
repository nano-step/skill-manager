import path from "path";
import chalk from "chalk";
import fs from "fs-extra";
import {
  AGENT_ID,
  PACKAGE_VERSION,
  detectOpenCodePaths,
  ensureDirExists,
  readJsonFile,
  writeJsonFile,
  readText,
  writeText,
  getInstallationState,
} from "./utils";

export async function install(): Promise<void> {
  const paths = await detectOpenCodePaths();
  await ensureDirExists(paths.commandDir);
  await ensureDirExists(paths.skillsDir);

  const skillTargetDir = path.join(paths.skillsDir, "agent-skill-management");
  const commandTargetPath = path.join(paths.commandDir, "agent-skill-refresh.md");

  await fs.copy(paths.templateSkillDir, skillTargetDir, { overwrite: true });

  const commandTemplate = await readText(paths.templateCommandPath);
  await writeText(commandTargetPath, commandTemplate);

  const agentTemplate = await readJsonFile<Record<string, unknown>>(paths.templateAgentPath, {});
  const agentConfig = await readJsonFile<Record<string, unknown>>(paths.agentConfigPath, {});
  const merged = { ...agentConfig, ...agentTemplate };

  await writeJsonFile(paths.agentConfigPath, merged);

  await writeJsonFile(paths.versionFilePath, { version: PACKAGE_VERSION, installedAt: new Date().toISOString() });

  const state = await getInstallationState(paths);
  if (!state.skillInstalled || !state.commandInstalled || !state.agentInstalled) {
    throw new Error("Installation verification failed. Some files were not installed.");
  }

  if (Object.keys(agentConfig).length > 0 && Object.prototype.hasOwnProperty.call(agentConfig, AGENT_ID)) {
    console.log(chalk.yellow("agent-skill-manager agent already existed; configuration was updated."));
  }

  console.log(chalk.green("Agent skill manager installed successfully."));
}
