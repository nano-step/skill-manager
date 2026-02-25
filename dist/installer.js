"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installSkill = installSkill;
exports.removeSkill = removeSkill;
exports.updateSkill = updateSkill;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = require("./utils");
const registry_1 = require("./registry");
const state_1 = require("./state");
const config_1 = require("./config");
async function installSkill(name, paths) {
    const manifest = await (0, registry_1.getSkillManifest)(paths.packageSkillsDir, name);
    if (!manifest) {
        const catalog = await (0, registry_1.loadCatalog)(paths.packageSkillsDir);
        const available = catalog.map((s) => s.name).join(", ");
        console.error(chalk_1.default.red(`Skill "${name}" not found in catalog.`));
        console.error(chalk_1.default.yellow(`Available skills: ${available || "none"}`));
        process.exit(1);
    }
    const state = await (0, state_1.loadState)(paths.stateFilePath);
    const existing = state.skills[name];
    if (existing && existing.version === manifest.version) {
        console.log(chalk_1.default.yellow(`Skill "${name}" is already installed at v${manifest.version}.`));
        return;
    }
    await (0, utils_1.ensureDirExists)(paths.skillsDir);
    const packageSkillDir = path_1.default.join(paths.packageSkillsDir, name);
    const targetSkillDir = path_1.default.join(paths.skillsDir, name);
    await fs_extra_1.default.copy(packageSkillDir, targetSkillDir, { overwrite: true });
    await (0, config_1.copyCommands)(manifest, packageSkillDir, paths.commandDir);
    await (0, config_1.mergeAgentConfig)(paths.agentConfigPath, manifest);
    state.skills[name] = {
        version: manifest.version,
        installedAt: new Date().toISOString(),
        location: paths.configDir.includes(".config/opencode") ? "global" : "project",
    };
    await (0, state_1.saveState)(paths.stateFilePath, state);
    console.log(chalk_1.default.green(`✓ Installed ${name} v${manifest.version}`));
}
async function removeSkill(name, paths) {
    const state = await (0, state_1.loadState)(paths.stateFilePath);
    if (!state.skills[name]) {
        console.log(chalk_1.default.yellow(`Skill "${name}" is not installed.`));
        return;
    }
    const manifest = await (0, registry_1.getSkillManifest)(paths.packageSkillsDir, name);
    const targetSkillDir = path_1.default.join(paths.skillsDir, name);
    if (await fs_extra_1.default.pathExists(targetSkillDir)) {
        await fs_extra_1.default.remove(targetSkillDir);
    }
    if (manifest) {
        await (0, config_1.removeCommands)(manifest, paths.commandDir);
        await (0, config_1.removeAgentConfig)(paths.agentConfigPath, manifest);
    }
    delete state.skills[name];
    await (0, state_1.saveState)(paths.stateFilePath, state);
    console.log(chalk_1.default.green(`✓ Removed ${name}`));
}
async function updateSkill(name, paths) {
    const state = await (0, state_1.loadState)(paths.stateFilePath);
    if (!state.skills[name]) {
        console.error(chalk_1.default.red(`Skill "${name}" is not installed. Use 'skill-manager install ${name}' first.`));
        process.exit(1);
    }
    const manifest = await (0, registry_1.getSkillManifest)(paths.packageSkillsDir, name);
    if (!manifest) {
        console.error(chalk_1.default.red(`Skill "${name}" not found in catalog. It may have been removed.`));
        process.exit(1);
    }
    const installed = state.skills[name];
    if (installed.version === manifest.version) {
        console.log(chalk_1.default.yellow(`Skill "${name}" is already at v${manifest.version} (up to date).`));
        return;
    }
    const packageSkillDir = path_1.default.join(paths.packageSkillsDir, name);
    const targetSkillDir = path_1.default.join(paths.skillsDir, name);
    await fs_extra_1.default.copy(packageSkillDir, targetSkillDir, { overwrite: true });
    await (0, config_1.copyCommands)(manifest, packageSkillDir, paths.commandDir);
    await (0, config_1.mergeAgentConfig)(paths.agentConfigPath, manifest);
    state.skills[name] = {
        version: manifest.version,
        installedAt: new Date().toISOString(),
        location: installed.location,
    };
    await (0, state_1.saveState)(paths.stateFilePath, state);
    console.log(chalk_1.default.green(`✓ Updated ${name} from v${installed.version} to v${manifest.version}`));
}
