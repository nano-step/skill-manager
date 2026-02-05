import path from "path";
import chalk from "chalk";
import fs from "fs-extra";
import {
  AGENT_ID,
  detectOpenCodePaths,
  readJsonFile,
  writeJsonFile,
} from "./utils";

export async function remove(): Promise<void> {
  const paths = await detectOpenCodePaths();

  const skillTargetDir = path.join(paths.skillsDir, "mcp-management");
  const commandTargetPath = path.join(paths.commandDir, "mcp-refresh.md");

  if (await fs.pathExists(skillTargetDir)) {
    await fs.remove(skillTargetDir);
  }

  if (await fs.pathExists(commandTargetPath)) {
    await fs.remove(commandTargetPath);
  }

  const agentConfig = await readJsonFile<Record<string, unknown>>(paths.agentConfigPath, {});
  if (Object.prototype.hasOwnProperty.call(agentConfig, AGENT_ID)) {
    const { [AGENT_ID]: _removed, ...rest } = agentConfig;
    await writeJsonFile(paths.agentConfigPath, rest);
  }

  if (await fs.pathExists(paths.versionFilePath)) {
    await fs.remove(paths.versionFilePath);
  }

  console.log(chalk.green("MCP Manager removed successfully."));
}
