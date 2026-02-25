import { Command } from "commander";
import chalk from "chalk";
import { MANAGER_VERSION, detectOpenCodePaths } from "./utils";
import { loadCatalog } from "./registry";
import { loadState, migrateV4State } from "./state";
import { installSkill, removeSkill, updateSkill } from "./installer";

export async function run(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes("--update") || args.includes("--remove")) {
    console.log(chalk.yellow("\n⚠️  The --update and --remove flags were removed in v5.0.0."));
    console.log(chalk.yellow("Use subcommands instead:"));
    console.log(chalk.cyan("  skill-manager install <name>   # Install a skill"));
    console.log(chalk.cyan("  skill-manager remove <name>    # Remove a skill"));
    console.log(chalk.cyan("  skill-manager update [name]    # Update skill(s)"));
    console.log(chalk.cyan("  skill-manager list             # Show available skills"));
    console.log(chalk.cyan("  skill-manager installed        # Show installed skills\n"));
    process.exit(1);
  }

  const program = new Command();
  program
    .name("skill-manager")
    .description("Install and manage AI agent skills for OpenCode")
    .version(MANAGER_VERSION);

  program
    .command("list")
    .description("Show available skills from the catalog")
    .action(async () => {
      const paths = await detectOpenCodePaths();
      await migrateV4State(paths.configDir, paths.stateFilePath, paths.skillsDir);
      const catalog = await loadCatalog(paths.packageSkillsDir);
      const state = await loadState(paths.stateFilePath);

      if (catalog.length === 0) {
        console.log(chalk.yellow("No skills found in catalog."));
        return;
      }

      console.log(chalk.bold("\nAvailable Skills:\n"));

      const nameWidth = 22;
      const versionWidth = 10;
      const statusWidth = 14;

      console.log(
        chalk.gray(
          "  " +
            "Name".padEnd(nameWidth) +
            "Version".padEnd(versionWidth) +
            "Status".padEnd(statusWidth) +
            "Description",
        ),
      );
      console.log(chalk.gray("  " + "─".repeat(nameWidth + versionWidth + statusWidth + 30)));

      for (const skill of catalog) {
        const installed = state.skills[skill.name];
        const status = installed ? chalk.green("installed") : chalk.gray("not installed");
        console.log(
          "  " +
            chalk.cyan(skill.name.padEnd(nameWidth)) +
            skill.version.padEnd(versionWidth) +
            status.padEnd(statusWidth + 10) +
            skill.description,
        );
      }

      console.log("");
    });

  program
    .command("install [name]")
    .description("Install a skill from the catalog")
    .option("--all", "Install all available skills")
    .action(async (name: string | undefined, options: { all?: boolean }) => {
      const paths = await detectOpenCodePaths();
      await migrateV4State(paths.configDir, paths.stateFilePath, paths.skillsDir);

      if (options.all) {
        const catalog = await loadCatalog(paths.packageSkillsDir);
        if (catalog.length === 0) {
          console.log(chalk.yellow("No skills found in catalog."));
          return;
        }
        for (const skill of catalog) {
          await installSkill(skill.name, paths);
        }
      } else if (name) {
        await installSkill(name, paths);
      } else {
        console.error(chalk.red("Please specify a skill name or use --all."));
        console.error(chalk.yellow("Run 'skill-manager list' to see available skills."));
        process.exit(1);
      }
    });

  program
    .command("remove <name>")
    .description("Remove an installed skill")
    .action(async (name: string) => {
      const paths = await detectOpenCodePaths();
      await migrateV4State(paths.configDir, paths.stateFilePath, paths.skillsDir);
      await removeSkill(name, paths);
    });

  program
    .command("update [name]")
    .description("Update installed skill(s) to latest catalog version")
    .action(async (name: string | undefined) => {
      const paths = await detectOpenCodePaths();
      await migrateV4State(paths.configDir, paths.stateFilePath, paths.skillsDir);

      if (name) {
        await updateSkill(name, paths);
      } else {
        const state = await loadState(paths.stateFilePath);
        const installed = Object.keys(state.skills);
        if (installed.length === 0) {
          console.log(chalk.yellow("No skills installed. Use 'skill-manager install <name>' first."));
          return;
        }
        for (const skillName of installed) {
          await updateSkill(skillName, paths);
        }
      }
    });

  program
    .command("installed")
    .description("Show currently installed skills")
    .action(async () => {
      const paths = await detectOpenCodePaths();
      await migrateV4State(paths.configDir, paths.stateFilePath, paths.skillsDir);
      const state = await loadState(paths.stateFilePath);
      const catalog = await loadCatalog(paths.packageSkillsDir);

      const installedNames = Object.keys(state.skills);
      if (installedNames.length === 0) {
        console.log(chalk.yellow("No skills installed."));
        console.log(chalk.gray("Run 'skill-manager list' to see available skills."));
        return;
      }

      console.log(chalk.bold("\nInstalled Skills:\n"));

      const nameWidth = 22;
      const versionWidth = 12;
      const catalogWidth = 12;

      console.log(
        chalk.gray(
          "  " +
            "Name".padEnd(nameWidth) +
            "Installed".padEnd(versionWidth) +
            "Catalog".padEnd(catalogWidth) +
            "Installed At",
        ),
      );
      console.log(chalk.gray("  " + "─".repeat(nameWidth + versionWidth + catalogWidth + 24)));

      for (const name of installedNames.sort()) {
        const info = state.skills[name];
        const catalogSkill = catalog.find((s) => s.name === name);
        const catalogVersion = catalogSkill ? catalogSkill.version : "?";
        const needsUpdate = catalogSkill && catalogSkill.version !== info.version;
        const catalogDisplay = needsUpdate
          ? chalk.yellow(catalogVersion)
          : chalk.green(catalogVersion);
        const date = new Date(info.installedAt).toLocaleDateString();

        console.log(
          "  " +
            chalk.cyan(name.padEnd(nameWidth)) +
            info.version.padEnd(versionWidth) +
            catalogDisplay.padEnd(catalogWidth + 10) +
            date,
        );
      }

      console.log("");
    });

  await program.parseAsync(process.argv);
}
