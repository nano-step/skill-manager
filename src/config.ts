import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { SkillManifest, readJsonFile, writeJsonFile, ensureDirExists } from "./utils";

export async function mergeAgentConfig(agentConfigPath: string, manifest: SkillManifest): Promise<void> {
  if (!manifest.agent) return;

  const config = await readJsonFile<Record<string, unknown>>(agentConfigPath, {});
  const agents = (config.agents || {}) as Record<string, unknown>;
  agents[manifest.agent.id] = manifest.agent.config;
  config.agents = agents;

  await writeJsonFile(agentConfigPath, config);
}

export async function removeAgentConfig(agentConfigPath: string, manifest: SkillManifest): Promise<void> {
  if (!manifest.agent) return;

  const exists = await fs.pathExists(agentConfigPath);
  if (!exists) return;

  const config = await readJsonFile<Record<string, unknown>>(agentConfigPath, {});
  const agents = (config.agents || {}) as Record<string, unknown>;

  if (Object.prototype.hasOwnProperty.call(agents, manifest.agent.id)) {
    delete agents[manifest.agent.id];
    config.agents = agents;
    await writeJsonFile(agentConfigPath, config);
  }
}

export async function mergeMcpConfig(opencodeJsonPath: string, manifest: SkillManifest): Promise<void> {
  if (!manifest.mcp) return;

  const exists = await fs.pathExists(opencodeJsonPath);
  if (!exists) {
    console.log(chalk.yellow(`Warning: ${opencodeJsonPath} not found. Skipping MCP config merge.`));
    return;
  }

  const config = await readJsonFile<Record<string, unknown>>(opencodeJsonPath, {});
  const mcp = (config.mcp || {}) as Record<string, unknown>;

  for (const [serverName, serverConfig] of Object.entries(manifest.mcp)) {
    if (mcp[serverName]) {
      console.log(
        chalk.yellow(
          `  MCP server "${serverName}" already configured — skipping (edit opencode.json manually if needed)`,
        ),
      );
      continue;
    }
    mcp[serverName] = serverConfig;
    console.log(chalk.green(`  ✓ Added MCP server "${serverName}" to opencode.json (update connection strings!)`));
  }

  config.mcp = mcp;
  await writeJsonFile(opencodeJsonPath, config);
}

export async function removeMcpConfig(opencodeJsonPath: string, manifest: SkillManifest): Promise<void> {
  if (!manifest.mcp) return;

  const exists = await fs.pathExists(opencodeJsonPath);
  if (!exists) return;

  const config = await readJsonFile<Record<string, unknown>>(opencodeJsonPath, {});
  const mcp = (config.mcp || {}) as Record<string, unknown>;

  for (const serverName of Object.keys(manifest.mcp)) {
    if (Object.prototype.hasOwnProperty.call(mcp, serverName)) {
      delete mcp[serverName];
      console.log(chalk.green(`  ✓ Removed MCP server "${serverName}" from opencode.json`));
    }
  }

  config.mcp = mcp;
  await writeJsonFile(opencodeJsonPath, config);
}

export async function copyCommands(
  manifest: SkillManifest,
  packageSkillDir: string,
  commandDir: string,
): Promise<void> {
  if (!manifest.commands || manifest.commands.length === 0) return;

  await ensureDirExists(commandDir);

  for (const cmd of manifest.commands) {
    const src = path.join(packageSkillDir, cmd);
    const dest = path.join(commandDir, cmd);
    const srcExists = await fs.pathExists(src);
    if (srcExists) {
      await fs.copy(src, dest, { overwrite: true });
    }
  }
}

export async function removeCommands(manifest: SkillManifest, commandDir: string): Promise<void> {
  if (!manifest.commands || manifest.commands.length === 0) return;

  for (const cmd of manifest.commands) {
    const cmdPath = path.join(commandDir, cmd);
    const exists = await fs.pathExists(cmdPath);
    if (exists) {
      await fs.remove(cmdPath);
    }
  }
}
