"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = update;
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const utils_1 = require("./utils");
async function update() {
    const paths = await (0, utils_1.detectOpenCodePaths)();
    await (0, utils_1.ensureDirExists)(paths.commandDir);
    await (0, utils_1.ensureDirExists)(paths.skillsDir);
    const skillTargetDir = path_1.default.join(paths.skillsDir, "agent-skill-management");
    const commandTargetPath = path_1.default.join(paths.commandDir, "agent-skill-refresh.md");
    await (0, utils_1.ensureDirExists)(skillTargetDir);
    const state = await (0, utils_1.getInstallationState)(paths);
    if (state.installedVersion === utils_1.PACKAGE_VERSION) {
        console.log(chalk_1.default.green("Agent skill manager is already up to date."));
        return;
    }
    const [skillCustomized, commandCustomized] = await Promise.all([
        (0, utils_1.directoryDiffersFromTemplate)(skillTargetDir, paths.templateSkillDir),
        (0, utils_1.fileDiffersFromTemplate)(commandTargetPath, paths.templateCommandPath),
    ]);
    if (skillCustomized || commandCustomized) {
        console.log(chalk_1.default.yellow("Detected customized files. Backups will be created before update."));
    }
    if (await fs_extra_1.default.pathExists(skillTargetDir)) {
        console.log(chalk_1.default.yellow("Backing up existing skill directory before update."));
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupDir = `${skillTargetDir}.backup-${timestamp}.bak`;
        await fs_extra_1.default.copy(skillTargetDir, backupDir, { overwrite: true });
    }
    if (await fs_extra_1.default.pathExists(commandTargetPath)) {
        await (0, utils_1.backupFile)(commandTargetPath, "backup");
    }
    if (await fs_extra_1.default.pathExists(paths.agentConfigPath)) {
        await (0, utils_1.backupFile)(paths.agentConfigPath, "backup");
    }
    await fs_extra_1.default.copy(paths.templateSkillDir, skillTargetDir, { overwrite: true });
    const commandTemplate = await fs_extra_1.default.readFile(paths.templateCommandPath, "utf8");
    await fs_extra_1.default.writeFile(commandTargetPath, commandTemplate, "utf8");
    const agentTemplate = await (0, utils_1.readJsonFile)(paths.templateAgentPath, {});
    const agentConfig = await (0, utils_1.readJsonFile)(paths.agentConfigPath, {});
    const merged = { ...agentConfig, ...agentTemplate };
    await (0, utils_1.writeJsonFile)(paths.agentConfigPath, merged);
    await (0, utils_1.writeJsonFile)(paths.versionFilePath, { version: utils_1.PACKAGE_VERSION, updatedAt: new Date().toISOString() });
    console.log(chalk_1.default.green("Agent skill manager updated successfully."));
}
