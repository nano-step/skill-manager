"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = require("./utils");
const registry_1 = require("./registry");
const state_1 = require("./state");
const installer_1 = require("./installer");
async function run() {
    const args = process.argv.slice(2);
    if (args.includes("--update") || args.includes("--remove")) {
        console.log(chalk_1.default.yellow("\n⚠️  The --update and --remove flags were removed in v5.0.0."));
        console.log(chalk_1.default.yellow("Use subcommands instead:"));
        console.log(chalk_1.default.cyan("  skill-manager install <name>   # Install a skill"));
        console.log(chalk_1.default.cyan("  skill-manager remove <name>    # Remove a skill"));
        console.log(chalk_1.default.cyan("  skill-manager update [name]    # Update skill(s)"));
        console.log(chalk_1.default.cyan("  skill-manager list             # Show available skills"));
        console.log(chalk_1.default.cyan("  skill-manager installed        # Show installed skills\n"));
        process.exit(1);
    }
    const program = new commander_1.Command();
    program
        .name("skill-manager")
        .description("Install and manage AI agent skills for OpenCode")
        .version(utils_1.MANAGER_VERSION);
    program
        .command("list")
        .description("Show available skills from the catalog")
        .action(async () => {
        const paths = await (0, utils_1.detectOpenCodePaths)();
        await (0, state_1.migrateV4State)(paths.configDir, paths.stateFilePath, paths.skillsDir);
        const catalog = await (0, registry_1.loadCatalog)(paths.packageSkillsDir);
        const state = await (0, state_1.loadState)(paths.stateFilePath);
        if (catalog.length === 0) {
            console.log(chalk_1.default.yellow("No skills found in catalog."));
            return;
        }
        console.log(chalk_1.default.bold("\nAvailable Skills:\n"));
        const nameWidth = 22;
        const versionWidth = 10;
        const statusWidth = 14;
        console.log(chalk_1.default.gray("  " +
            "Name".padEnd(nameWidth) +
            "Version".padEnd(versionWidth) +
            "Status".padEnd(statusWidth) +
            "Description"));
        console.log(chalk_1.default.gray("  " + "─".repeat(nameWidth + versionWidth + statusWidth + 30)));
        for (const skill of catalog) {
            const installed = state.skills[skill.name];
            const status = installed ? chalk_1.default.green("installed") : chalk_1.default.gray("not installed");
            console.log("  " +
                chalk_1.default.cyan(skill.name.padEnd(nameWidth)) +
                skill.version.padEnd(versionWidth) +
                status.padEnd(statusWidth + 10) +
                skill.description);
        }
        console.log("");
    });
    program
        .command("install [name]")
        .description("Install a skill from the catalog")
        .option("--all", "Install all available skills")
        .action(async (name, options) => {
        const paths = await (0, utils_1.detectOpenCodePaths)();
        await (0, state_1.migrateV4State)(paths.configDir, paths.stateFilePath, paths.skillsDir);
        if (options.all) {
            const catalog = await (0, registry_1.loadCatalog)(paths.packageSkillsDir);
            if (catalog.length === 0) {
                console.log(chalk_1.default.yellow("No skills found in catalog."));
                return;
            }
            for (const skill of catalog) {
                await (0, installer_1.installSkill)(skill.name, paths);
            }
        }
        else if (name) {
            await (0, installer_1.installSkill)(name, paths);
        }
        else {
            console.error(chalk_1.default.red("Please specify a skill name or use --all."));
            console.error(chalk_1.default.yellow("Run 'skill-manager list' to see available skills."));
            process.exit(1);
        }
    });
    program
        .command("remove <name>")
        .description("Remove an installed skill")
        .action(async (name) => {
        const paths = await (0, utils_1.detectOpenCodePaths)();
        await (0, state_1.migrateV4State)(paths.configDir, paths.stateFilePath, paths.skillsDir);
        await (0, installer_1.removeSkill)(name, paths);
    });
    program
        .command("update [name]")
        .description("Update installed skill(s) to latest catalog version")
        .action(async (name) => {
        const paths = await (0, utils_1.detectOpenCodePaths)();
        await (0, state_1.migrateV4State)(paths.configDir, paths.stateFilePath, paths.skillsDir);
        if (name) {
            await (0, installer_1.updateSkill)(name, paths);
        }
        else {
            const state = await (0, state_1.loadState)(paths.stateFilePath);
            const installed = Object.keys(state.skills);
            if (installed.length === 0) {
                console.log(chalk_1.default.yellow("No skills installed. Use 'skill-manager install <name>' first."));
                return;
            }
            for (const skillName of installed) {
                await (0, installer_1.updateSkill)(skillName, paths);
            }
        }
    });
    program
        .command("installed")
        .description("Show currently installed skills")
        .action(async () => {
        const paths = await (0, utils_1.detectOpenCodePaths)();
        await (0, state_1.migrateV4State)(paths.configDir, paths.stateFilePath, paths.skillsDir);
        const state = await (0, state_1.loadState)(paths.stateFilePath);
        const catalog = await (0, registry_1.loadCatalog)(paths.packageSkillsDir);
        const installedNames = Object.keys(state.skills);
        if (installedNames.length === 0) {
            console.log(chalk_1.default.yellow("No skills installed."));
            console.log(chalk_1.default.gray("Run 'skill-manager list' to see available skills."));
            return;
        }
        console.log(chalk_1.default.bold("\nInstalled Skills:\n"));
        const nameWidth = 22;
        const versionWidth = 12;
        const catalogWidth = 12;
        console.log(chalk_1.default.gray("  " +
            "Name".padEnd(nameWidth) +
            "Installed".padEnd(versionWidth) +
            "Catalog".padEnd(catalogWidth) +
            "Installed At"));
        console.log(chalk_1.default.gray("  " + "─".repeat(nameWidth + versionWidth + catalogWidth + 24)));
        for (const name of installedNames.sort()) {
            const info = state.skills[name];
            const catalogSkill = catalog.find((s) => s.name === name);
            const catalogVersion = catalogSkill ? catalogSkill.version : "?";
            const needsUpdate = catalogSkill && catalogSkill.version !== info.version;
            const catalogDisplay = needsUpdate
                ? chalk_1.default.yellow(catalogVersion)
                : chalk_1.default.green(catalogVersion);
            const date = new Date(info.installedAt).toLocaleDateString();
            console.log("  " +
                chalk_1.default.cyan(name.padEnd(nameWidth)) +
                info.version.padEnd(versionWidth) +
                catalogDisplay.padEnd(catalogWidth + 10) +
                date);
        }
        console.log("");
    });
    await program.parseAsync(process.argv);
}
