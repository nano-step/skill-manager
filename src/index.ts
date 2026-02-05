import { Command } from "commander";
import chalk from "chalk";
import { install } from "./install";
import { update } from "./update";
import { remove } from "./remove";

export async function run(): Promise<void> {
  const program = new Command();

  program
    .name("opencode-mcp-manager")
    .description("Install or manage the MCP Manager subagent")
    .option("--update", "Update existing MCP Manager installation")
    .option("--remove", "Remove MCP Manager installation")
    .parse(process.argv);

  const options = program.opts<{ update?: boolean; remove?: boolean }>();

  if (options.update && options.remove) {
    console.error(chalk.red("Cannot use --update and --remove together."));
    process.exit(1);
  }

  if (options.remove) {
    await remove();
    return;
  }

  if (options.update) {
    await update();
    return;
  }

  await install();
}
