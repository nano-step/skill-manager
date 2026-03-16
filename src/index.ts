import { Command } from "commander";
import chalk from "chalk";
import { MANAGER_VERSION, detectOpenCodePaths } from "./utils";
import { loadCatalog, loadMergedCatalog, loadPrivateCatalog } from "./registry";
import { loadState, migrateV4State } from "./state";
import { installSkill, removeSkill, updateSkill } from "./installer";
import { listRemoteSkills } from "./remote-registry";
import { loadAuthConfig, saveAuthConfig, removeAuthConfig, resolveToken } from "./auth";

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
    .command("version")
    .description("Show skill-manager version")
    .action(() => {
      console.log(MANAGER_VERSION);
    });

  program
    .command("login")
    .description("Authenticate with GitHub to access private skills")
    .option("--token <token>", "GitHub personal access token")
    .action(async (options: { token?: string }) => {
      if (!options.token) {
        console.error(chalk.red("Please provide a token with --token <token>"));
        console.error(chalk.gray("Create a token at: https://github.com/settings/tokens"));
        console.error(chalk.gray("Required scope: repo (for private repositories)"));
        process.exit(1);
      }

      const config = await loadAuthConfig();
      config.token = options.token;
      await saveAuthConfig(config);

      console.log(chalk.green("✓ Token saved successfully"));
      console.log(chalk.gray("  Config: ~/.config/skill-manager/config.json"));
    });

  program
    .command("logout")
    .description("Remove stored GitHub token")
    .action(async () => {
      await removeAuthConfig();
      console.log(chalk.green("✓ Token removed"));
    });

  program
    .command("list")
    .description("Show available skills from the catalog")
    .action(async () => {
      const paths = await detectOpenCodePaths();
      await migrateV4State(paths.configDir, paths.stateFilePath, paths.skillsDir);

      const token = await resolveToken();
      const liveRemoteSkills = token ? await listRemoteSkills() : [];
      const bundledPrivate = loadPrivateCatalog(paths.packageSkillsDir);
      const liveNames = new Set(liveRemoteSkills.map((s) => s.name));
      const remoteSkills = [
        ...liveRemoteSkills,
        ...bundledPrivate.filter((s) => !liveNames.has(s.name)),
      ];
      const catalog = await loadMergedCatalog(paths.packageSkillsDir, remoteSkills);
      const state = await loadState(paths.stateFilePath);

      if (catalog.length === 0) {
        console.log(chalk.yellow("No skills found in catalog."));
        return;
      }

      console.log(chalk.bold("\nAvailable Skills:\n"));

      const nameWidth = 22;
      const versionWidth = 10;
      const sourceWidth = 10;
      const statusWidth = 14;

      console.log(
        chalk.gray(
          "  " +
            "Name".padEnd(nameWidth) +
            "Version".padEnd(versionWidth) +
            "Source".padEnd(sourceWidth) +
            "Status".padEnd(statusWidth) +
            "Description",
        ),
      );
      console.log(chalk.gray("  " + "─".repeat(nameWidth + versionWidth + sourceWidth + statusWidth + 30)));

      for (const entry of catalog) {
        const skill = entry.manifest;
        const installed = state.skills[skill.name];
        let status: string;
        if (installed) {
          status = chalk.green("installed");
        } else if (entry.source === "private" && !liveNames.has(skill.name)) {
          status = chalk.yellow("login required");
        } else {
          status = chalk.gray("not installed");
        }
        const sourceLabel = entry.source === "private" ? chalk.magenta("private") : chalk.blue("public");
        console.log(
          "  " +
            chalk.cyan(skill.name.padEnd(nameWidth)) +
            skill.version.padEnd(versionWidth) +
            sourceLabel.padEnd(sourceWidth + 10) +
            status.padEnd(statusWidth + 10) +
            skill.description,
        );
      }

      console.log("");
      const hasUnauthPrivate = catalog.some((e) => e.source === "private" && !liveNames.has(e.manifest.name));
      if (hasUnauthPrivate) {
        console.log(chalk.gray("Tip: Run 'skill-manager login --token <github-token>' to install private skills."));
        console.log("");
      }
    });

  program
    .command("install [name]")
    .description("Install a skill from the catalog")
    .option("--all", "Install all available skills")
    .option("--force", "Force reinstall even if same version is installed")
    .action(async (name: string | undefined, options: { all?: boolean; force?: boolean }) => {
      const paths = await detectOpenCodePaths();
      await migrateV4State(paths.configDir, paths.stateFilePath, paths.skillsDir);

      if (options.all) {
        const token = await resolveToken();
        const remoteSkills = token ? await listRemoteSkills() : [];
        const catalog = await loadMergedCatalog(paths.packageSkillsDir, remoteSkills);

        if (catalog.length === 0) {
          console.log(chalk.yellow("No skills found in catalog."));
          return;
        }
        for (const entry of catalog) {
          await installSkill(entry.manifest.name, paths, options.force);
        }
      } else if (name) {
        await installSkill(name, paths, options.force);
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
    .option("--force", "Force update even if same version is installed")
    .action(async (name: string | undefined, options: { force?: boolean }) => {
      const paths = await detectOpenCodePaths();
      await migrateV4State(paths.configDir, paths.stateFilePath, paths.skillsDir);

      if (name) {
        await updateSkill(name, paths, options.force);
      } else {
        const state = await loadState(paths.stateFilePath);
        const installed = Object.keys(state.skills);
        if (installed.length === 0) {
          console.log(chalk.yellow("No skills installed. Use 'skill-manager install <name>' first."));
          return;
        }
        for (const skillName of installed) {
          await updateSkill(skillName, paths, options.force);
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
