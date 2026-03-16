import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { OpenCodePaths, SkillManifest, ensureDirExists } from "./utils";
import { getSkillManifest, loadCatalog } from "./registry";
import { loadState, saveState } from "./state";
import {
  mergeAgentConfig,
  removeAgentConfig,
  mergeMcpConfig,
  removeMcpConfig,
  copyCommands,
  removeCommands,
} from "./config";
import { downloadSkillToTemp, getRemoteSkillManifest } from "./remote-registry";

async function installFromDir(
  manifest: SkillManifest,
  sourceDir: string,
  paths: OpenCodePaths,
  source: "public" | "private",
  force?: boolean,
): Promise<void> {
  const state = await loadState(paths.stateFilePath);
  const existing = state.skills[manifest.name];
  if (existing && existing.version === manifest.version && !force) {
    console.log(chalk.yellow(`Skill "${manifest.name}" is already installed at v${manifest.version}. Use --force to reinstall.`));
    return;
  }

  await ensureDirExists(paths.skillsDir);

  const targetSkillDir = path.join(paths.skillsDir, manifest.name);
  await fs.copy(sourceDir, targetSkillDir, { overwrite: true });

  await copyCommands(manifest, sourceDir, paths.commandDir);
  await mergeAgentConfig(paths.agentConfigPath, manifest);
  await mergeMcpConfig(paths.opencodeJsonPath, manifest);

  state.skills[manifest.name] = {
    version: manifest.version,
    installedAt: new Date().toISOString(),
    location: paths.configDir.includes(".config/opencode") ? "global" : "project",
  };
  await saveState(paths.stateFilePath, state);

  const sourceLabel = source === "private" ? chalk.magenta(" (private)") : "";
  const forceLabel = force && existing ? " (forced)" : "";
  console.log(chalk.green(`✓ Installed ${manifest.name} v${manifest.version}${sourceLabel}${forceLabel}`));
}

export async function installSkill(name: string, paths: OpenCodePaths, force?: boolean): Promise<void> {
  const localManifest = await getSkillManifest(paths.packageSkillsDir, name);
  if (localManifest) {
    const packageSkillDir = path.join(paths.packageSkillsDir, name);
    await installFromDir(localManifest, packageSkillDir, paths, "public", force);
    return;
  }

  const remoteManifest = await getRemoteSkillManifest(name);
  if (remoteManifest) {
    const tempDir = await downloadSkillToTemp(name);
    if (tempDir) {
      try {
        await installFromDir(remoteManifest, tempDir, paths, "private", force);
      } finally {
        await fs.remove(tempDir);
      }
      return;
    }
  }

  const catalog = await loadCatalog(paths.packageSkillsDir);
  const available = catalog.map((s) => s.name).join(", ");
  console.error(chalk.red(`Skill "${name}" not found in catalog.`));
  console.error(chalk.yellow(`Available public skills: ${available || "none"}`));
  console.error(chalk.gray("Run 'skill-manager login' to access private skills."));
  process.exit(1);
}

export async function removeSkill(name: string, paths: OpenCodePaths): Promise<void> {
  const state = await loadState(paths.stateFilePath);
  if (!state.skills[name]) {
    console.log(chalk.yellow(`Skill "${name}" is not installed.`));
    return;
  }

  const manifest = await getSkillManifest(paths.packageSkillsDir, name);
  const installedManifestPath = path.join(paths.skillsDir, name, "skill.json");
  let installedManifest: SkillManifest | null = null;

  if (await fs.pathExists(installedManifestPath)) {
    try {
      const raw = await fs.readFile(installedManifestPath, "utf8");
      installedManifest = JSON.parse(raw) as SkillManifest;
    } catch {
      installedManifest = null;
    }
  }

  const targetSkillDir = path.join(paths.skillsDir, name);
  if (await fs.pathExists(targetSkillDir)) {
    await fs.remove(targetSkillDir);
  }

  const effectiveManifest = manifest || installedManifest;
  if (effectiveManifest) {
    await removeCommands(effectiveManifest, paths.commandDir);
    await removeAgentConfig(paths.agentConfigPath, effectiveManifest);
    await removeMcpConfig(paths.opencodeJsonPath, effectiveManifest);
  }

  delete state.skills[name];
  await saveState(paths.stateFilePath, state);

  console.log(chalk.green(`✓ Removed ${name}`));
}

export async function updateSkill(name: string, paths: OpenCodePaths, force?: boolean): Promise<void> {
  const state = await loadState(paths.stateFilePath);
  if (!state.skills[name]) {
    console.error(chalk.red(`Skill "${name}" is not installed. Use 'skill-manager install ${name}' first.`));
    process.exit(1);
  }

  const installed = state.skills[name];

  const localManifest = await getSkillManifest(paths.packageSkillsDir, name);
  if (localManifest) {
    if (installed.version === localManifest.version && !force) {
      console.log(chalk.yellow(`Skill "${name}" is already at v${localManifest.version} (up to date). Use --force to override.`));
      return;
    }

    const packageSkillDir = path.join(paths.packageSkillsDir, name);
    const targetSkillDir = path.join(paths.skillsDir, name);
    await fs.copy(packageSkillDir, targetSkillDir, { overwrite: true });

    await copyCommands(localManifest, packageSkillDir, paths.commandDir);
    await mergeAgentConfig(paths.agentConfigPath, localManifest);
    await mergeMcpConfig(paths.opencodeJsonPath, localManifest);

    state.skills[name] = {
      version: localManifest.version,
      installedAt: new Date().toISOString(),
      location: installed.location,
    };
    await saveState(paths.stateFilePath, state);

    const forceLabel = force && installed.version === localManifest.version ? " (forced)" : "";
    console.log(chalk.green(`✓ Updated ${name} from v${installed.version} to v${localManifest.version}${forceLabel}`));
    return;
  }

  const remoteManifest = await getRemoteSkillManifest(name);
  if (remoteManifest) {
    if (installed.version === remoteManifest.version && !force) {
      console.log(chalk.yellow(`Skill "${name}" is already at v${remoteManifest.version} (up to date). Use --force to override.`));
      return;
    }

    const tempDir = await downloadSkillToTemp(name);
    if (tempDir) {
      try {
        const targetSkillDir = path.join(paths.skillsDir, name);
        await fs.copy(tempDir, targetSkillDir, { overwrite: true });

        await copyCommands(remoteManifest, tempDir, paths.commandDir);
        await mergeAgentConfig(paths.agentConfigPath, remoteManifest);
        await mergeMcpConfig(paths.opencodeJsonPath, remoteManifest);

        state.skills[name] = {
          version: remoteManifest.version,
          installedAt: new Date().toISOString(),
          location: installed.location,
        };
        await saveState(paths.stateFilePath, state);

        const remoteForceLabel = force && installed.version === remoteManifest.version ? " (forced)" : "";
        console.log(chalk.green(`✓ Updated ${name} from v${installed.version} to v${remoteManifest.version} (private)${remoteForceLabel}`));
      } finally {
        await fs.remove(tempDir);
      }
      return;
    }
  }

  console.error(chalk.red(`Skill "${name}" not found in catalog. It may have been removed.`));
  process.exit(1);
}
