import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { OpenCodePaths, MANAGER_VERSION, ensureDirExists } from "./utils";
import { getSkillManifest, loadCatalog } from "./registry";
import { loadState, saveState } from "./state";
import { mergeAgentConfig, removeAgentConfig, copyCommands, removeCommands } from "./config";

export async function installSkill(name: string, paths: OpenCodePaths): Promise<void> {
  const manifest = await getSkillManifest(paths.packageSkillsDir, name);
  if (!manifest) {
    const catalog = await loadCatalog(paths.packageSkillsDir);
    const available = catalog.map((s) => s.name).join(", ");
    console.error(chalk.red(`Skill "${name}" not found in catalog.`));
    console.error(chalk.yellow(`Available skills: ${available || "none"}`));
    process.exit(1);
  }

  const state = await loadState(paths.stateFilePath);
  const existing = state.skills[name];
  if (existing && existing.version === manifest.version) {
    console.log(chalk.yellow(`Skill "${name}" is already installed at v${manifest.version}.`));
    return;
  }

  await ensureDirExists(paths.skillsDir);

  const packageSkillDir = path.join(paths.packageSkillsDir, name);
  const targetSkillDir = path.join(paths.skillsDir, name);
  await fs.copy(packageSkillDir, targetSkillDir, { overwrite: true });

  await copyCommands(manifest, packageSkillDir, paths.commandDir);
  await mergeAgentConfig(paths.agentConfigPath, manifest);

  state.skills[name] = {
    version: manifest.version,
    installedAt: new Date().toISOString(),
    location: paths.configDir.includes(".config/opencode") ? "global" : "project",
  };
  await saveState(paths.stateFilePath, state);

  console.log(chalk.green(`✓ Installed ${name} v${manifest.version}`));
}

export async function removeSkill(name: string, paths: OpenCodePaths): Promise<void> {
  const state = await loadState(paths.stateFilePath);
  if (!state.skills[name]) {
    console.log(chalk.yellow(`Skill "${name}" is not installed.`));
    return;
  }

  const manifest = await getSkillManifest(paths.packageSkillsDir, name);

  const targetSkillDir = path.join(paths.skillsDir, name);
  if (await fs.pathExists(targetSkillDir)) {
    await fs.remove(targetSkillDir);
  }

  if (manifest) {
    await removeCommands(manifest, paths.commandDir);
    await removeAgentConfig(paths.agentConfigPath, manifest);
  }

  delete state.skills[name];
  await saveState(paths.stateFilePath, state);

  console.log(chalk.green(`✓ Removed ${name}`));
}

export async function updateSkill(name: string, paths: OpenCodePaths): Promise<void> {
  const state = await loadState(paths.stateFilePath);
  if (!state.skills[name]) {
    console.error(chalk.red(`Skill "${name}" is not installed. Use 'skill-manager install ${name}' first.`));
    process.exit(1);
  }

  const manifest = await getSkillManifest(paths.packageSkillsDir, name);
  if (!manifest) {
    console.error(chalk.red(`Skill "${name}" not found in catalog. It may have been removed.`));
    process.exit(1);
  }

  const installed = state.skills[name];
  if (installed.version === manifest.version) {
    console.log(chalk.yellow(`Skill "${name}" is already at v${manifest.version} (up to date).`));
    return;
  }

  const packageSkillDir = path.join(paths.packageSkillsDir, name);
  const targetSkillDir = path.join(paths.skillsDir, name);
  await fs.copy(packageSkillDir, targetSkillDir, { overwrite: true });

  await copyCommands(manifest, packageSkillDir, paths.commandDir);
  await mergeAgentConfig(paths.agentConfigPath, manifest);

  state.skills[name] = {
    version: manifest.version,
    installedAt: new Date().toISOString(),
    location: installed.location,
  };
  await saveState(paths.stateFilePath, state);

  console.log(chalk.green(`✓ Updated ${name} from v${installed.version} to v${manifest.version}`));
}
