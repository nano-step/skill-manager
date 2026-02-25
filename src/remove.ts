import path from "path";
import chalk from "chalk";
import fs from "fs-extra";
import {
  AGENT_ID,
  SKILL_DIR_NAME,
  detectOpenCodePaths,
  readJsonFile,
  writeJsonFile,
} from "./utils";

export async function remove(): Promise<void> {
  const paths = await detectOpenCodePaths();

  const skillTargetDir = path.join(paths.skillsDir, SKILL_DIR_NAME);
  const commandTargetPath = path.join(paths.commandDir, "agent-skill-refresh.md");

  if (await fs.pathExists(skillTargetDir)) {
    await fs.remove(skillTargetDir);
  }

  if (await fs.pathExists(commandTargetPath)) {
    await fs.remove(commandTargetPath);
  }

  const agentConfig = await readJsonFile<Record<string, unknown>>(paths.agentConfigPath, {});
  const agents = (agentConfig.agents || {}) as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(agents, AGENT_ID)) {
    delete agents[AGENT_ID];
    agentConfig.agents = agents;
    await writeJsonFile(paths.agentConfigPath, agentConfig);
  }

  if (await fs.pathExists(paths.versionFilePath)) {
    await fs.remove(paths.versionFilePath);
  }

  console.log(chalk.green("Agent skill manager removed successfully."));
}
