import path from "path";
import chalk from "chalk";
import fs from "fs-extra";
import {
  PACKAGE_VERSION,
  detectOpenCodePaths,
  ensureDirExists,
  readJsonFile,
  writeJsonFile,
  backupFile,
  fileDiffersFromTemplate,
  directoryDiffersFromTemplate,
  getInstallationState,
} from "./utils";

export async function update(): Promise<void> {
  const paths = await detectOpenCodePaths();
  await ensureDirExists(paths.commandDir);
  await ensureDirExists(paths.skillsDir);

  const skillTargetDir = path.join(paths.skillsDir, "agent-skill-management");
  const commandTargetPath = path.join(paths.commandDir, "agent-skill-refresh.md");

  await ensureDirExists(skillTargetDir);

  const state = await getInstallationState(paths);
  if (state.installedVersion === PACKAGE_VERSION) {
    console.log(chalk.green("Agent skill manager is already up to date."));
    return;
  }

  const [skillCustomized, commandCustomized] = await Promise.all([
    directoryDiffersFromTemplate(skillTargetDir, paths.templateSkillDir),
    fileDiffersFromTemplate(commandTargetPath, paths.templateCommandPath),
  ]);

  if (skillCustomized || commandCustomized) {
    console.log(chalk.yellow("Detected customized files. Backups will be created before update."));
  }

  if (await fs.pathExists(skillTargetDir)) {
    console.log(chalk.yellow("Backing up existing skill directory before update."));
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = `${skillTargetDir}.backup-${timestamp}.bak`;
    await fs.copy(skillTargetDir, backupDir, { overwrite: true });
  }
  if (await fs.pathExists(commandTargetPath)) {
    await backupFile(commandTargetPath, "backup");
  }
  if (await fs.pathExists(paths.agentConfigPath)) {
    await backupFile(paths.agentConfigPath, "backup");
  }

  await fs.copy(paths.templateSkillDir, skillTargetDir, { overwrite: true });

  const commandTemplate = await fs.readFile(paths.templateCommandPath, "utf8");
  await fs.writeFile(commandTargetPath, commandTemplate, "utf8");

  const agentTemplate = await readJsonFile<Record<string, unknown>>(paths.templateAgentPath, {});
  const agentConfig = await readJsonFile<Record<string, unknown>>(paths.agentConfigPath, {});
  const merged = { ...agentConfig, ...agentTemplate };

  await writeJsonFile(paths.agentConfigPath, merged);
  await writeJsonFile(paths.versionFilePath, { version: PACKAGE_VERSION, updatedAt: new Date().toISOString() });

  console.log(chalk.green("Agent skill manager updated successfully."));
}
