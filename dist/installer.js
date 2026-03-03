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
const remote_registry_1 = require("./remote-registry");
async function installFromDir(manifest, sourceDir, paths, source) {
    const state = await (0, state_1.loadState)(paths.stateFilePath);
    const existing = state.skills[manifest.name];
    if (existing && existing.version === manifest.version) {
        console.log(chalk_1.default.yellow(`Skill "${manifest.name}" is already installed at v${manifest.version}.`));
        return;
    }
    await (0, utils_1.ensureDirExists)(paths.skillsDir);
    const targetSkillDir = path_1.default.join(paths.skillsDir, manifest.name);
    await fs_extra_1.default.copy(sourceDir, targetSkillDir, { overwrite: true });
    await (0, config_1.copyCommands)(manifest, sourceDir, paths.commandDir);
    await (0, config_1.mergeAgentConfig)(paths.agentConfigPath, manifest);
    state.skills[manifest.name] = {
        version: manifest.version,
        installedAt: new Date().toISOString(),
        location: paths.configDir.includes(".config/opencode") ? "global" : "project",
    };
    await (0, state_1.saveState)(paths.stateFilePath, state);
    const sourceLabel = source === "private" ? chalk_1.default.magenta(" (private)") : "";
    console.log(chalk_1.default.green(`✓ Installed ${manifest.name} v${manifest.version}${sourceLabel}`));
}
async function installSkill(name, paths) {
    const localManifest = await (0, registry_1.getSkillManifest)(paths.packageSkillsDir, name);
    if (localManifest) {
        const packageSkillDir = path_1.default.join(paths.packageSkillsDir, name);
        await installFromDir(localManifest, packageSkillDir, paths, "public");
        return;
    }
    const remoteManifest = await (0, remote_registry_1.getRemoteSkillManifest)(name);
    if (remoteManifest) {
        const tempDir = await (0, remote_registry_1.downloadSkillToTemp)(name);
        if (tempDir) {
            try {
                await installFromDir(remoteManifest, tempDir, paths, "private");
            }
            finally {
                await fs_extra_1.default.remove(tempDir);
            }
            return;
        }
    }
    const catalog = await (0, registry_1.loadCatalog)(paths.packageSkillsDir);
    const available = catalog.map((s) => s.name).join(", ");
    console.error(chalk_1.default.red(`Skill "${name}" not found in catalog.`));
    console.error(chalk_1.default.yellow(`Available public skills: ${available || "none"}`));
    console.error(chalk_1.default.gray("Run 'skill-manager login' to access private skills."));
    process.exit(1);
}
async function removeSkill(name, paths) {
    const state = await (0, state_1.loadState)(paths.stateFilePath);
    if (!state.skills[name]) {
        console.log(chalk_1.default.yellow(`Skill "${name}" is not installed.`));
        return;
    }
    const manifest = await (0, registry_1.getSkillManifest)(paths.packageSkillsDir, name);
    const installedManifestPath = path_1.default.join(paths.skillsDir, name, "skill.json");
    let installedManifest = null;
    if (await fs_extra_1.default.pathExists(installedManifestPath)) {
        try {
            const raw = await fs_extra_1.default.readFile(installedManifestPath, "utf8");
            installedManifest = JSON.parse(raw);
        }
        catch {
            installedManifest = null;
        }
    }
    const targetSkillDir = path_1.default.join(paths.skillsDir, name);
    if (await fs_extra_1.default.pathExists(targetSkillDir)) {
        await fs_extra_1.default.remove(targetSkillDir);
    }
    const effectiveManifest = manifest || installedManifest;
    if (effectiveManifest) {
        await (0, config_1.removeCommands)(effectiveManifest, paths.commandDir);
        await (0, config_1.removeAgentConfig)(paths.agentConfigPath, effectiveManifest);
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
    const installed = state.skills[name];
    const localManifest = await (0, registry_1.getSkillManifest)(paths.packageSkillsDir, name);
    if (localManifest) {
        if (installed.version === localManifest.version) {
            console.log(chalk_1.default.yellow(`Skill "${name}" is already at v${localManifest.version} (up to date).`));
            return;
        }
        const packageSkillDir = path_1.default.join(paths.packageSkillsDir, name);
        const targetSkillDir = path_1.default.join(paths.skillsDir, name);
        await fs_extra_1.default.copy(packageSkillDir, targetSkillDir, { overwrite: true });
        await (0, config_1.copyCommands)(localManifest, packageSkillDir, paths.commandDir);
        await (0, config_1.mergeAgentConfig)(paths.agentConfigPath, localManifest);
        state.skills[name] = {
            version: localManifest.version,
            installedAt: new Date().toISOString(),
            location: installed.location,
        };
        await (0, state_1.saveState)(paths.stateFilePath, state);
        console.log(chalk_1.default.green(`✓ Updated ${name} from v${installed.version} to v${localManifest.version}`));
        return;
    }
    const remoteManifest = await (0, remote_registry_1.getRemoteSkillManifest)(name);
    if (remoteManifest) {
        if (installed.version === remoteManifest.version) {
            console.log(chalk_1.default.yellow(`Skill "${name}" is already at v${remoteManifest.version} (up to date).`));
            return;
        }
        const tempDir = await (0, remote_registry_1.downloadSkillToTemp)(name);
        if (tempDir) {
            try {
                const targetSkillDir = path_1.default.join(paths.skillsDir, name);
                await fs_extra_1.default.copy(tempDir, targetSkillDir, { overwrite: true });
                await (0, config_1.copyCommands)(remoteManifest, tempDir, paths.commandDir);
                await (0, config_1.mergeAgentConfig)(paths.agentConfigPath, remoteManifest);
                state.skills[name] = {
                    version: remoteManifest.version,
                    installedAt: new Date().toISOString(),
                    location: installed.location,
                };
                await (0, state_1.saveState)(paths.stateFilePath, state);
                console.log(chalk_1.default.green(`✓ Updated ${name} from v${installed.version} to v${remoteManifest.version} (private)`));
            }
            finally {
                await fs_extra_1.default.remove(tempDir);
            }
            return;
        }
    }
    console.error(chalk_1.default.red(`Skill "${name}" not found in catalog. It may have been removed.`));
    process.exit(1);
}
