"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.install = install;
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const utils_1 = require("./utils");
async function install() {
    const paths = await (0, utils_1.detectOpenCodePaths)();
    await (0, utils_1.ensureDirExists)(paths.commandDir);
    await (0, utils_1.ensureDirExists)(paths.skillsDir);
    const skillTargetDir = path_1.default.join(paths.skillsDir, utils_1.SKILL_DIR_NAME);
    const commandTargetPath = path_1.default.join(paths.commandDir, "agent-skill-refresh.md");
    await fs_extra_1.default.copy(paths.templateSkillDir, skillTargetDir, { overwrite: true });
    const commandTemplate = await (0, utils_1.readText)(paths.templateCommandPath);
    await (0, utils_1.writeText)(commandTargetPath, commandTemplate);
    const agentTemplate = await (0, utils_1.readJsonFile)(paths.templateAgentPath, {});
    const agentConfig = await (0, utils_1.readJsonFile)(paths.agentConfigPath, {});
    const agents = (agentConfig.agents || {});
    const templateAgents = (agentTemplate.agents || agentTemplate);
    agentConfig.agents = { ...agents, ...templateAgents };
    await (0, utils_1.writeJsonFile)(paths.agentConfigPath, agentConfig);
    await (0, utils_1.writeJsonFile)(paths.versionFilePath, { version: utils_1.PACKAGE_VERSION, installedAt: new Date().toISOString() });
    const state = await (0, utils_1.getInstallationState)(paths);
    if (!state.skillInstalled || !state.commandInstalled || !state.agentInstalled) {
        throw new Error("Installation verification failed. Some files were not installed.");
    }
    if (Object.keys(agentConfig).length > 0 && Object.prototype.hasOwnProperty.call(agentConfig, utils_1.AGENT_ID)) {
        console.log(chalk_1.default.yellow("agent-skill-manager agent already existed; configuration was updated."));
    }
    console.log(chalk_1.default.green("Agent skill manager installed successfully."));
}
