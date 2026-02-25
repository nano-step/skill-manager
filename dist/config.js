"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeAgentConfig = mergeAgentConfig;
exports.removeAgentConfig = removeAgentConfig;
exports.copyCommands = copyCommands;
exports.removeCommands = removeCommands;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const utils_1 = require("./utils");
async function mergeAgentConfig(agentConfigPath, manifest) {
    if (!manifest.agent)
        return;
    const config = await (0, utils_1.readJsonFile)(agentConfigPath, {});
    const agents = (config.agents || {});
    agents[manifest.agent.id] = manifest.agent.config;
    config.agents = agents;
    await (0, utils_1.writeJsonFile)(agentConfigPath, config);
}
async function removeAgentConfig(agentConfigPath, manifest) {
    if (!manifest.agent)
        return;
    const exists = await fs_extra_1.default.pathExists(agentConfigPath);
    if (!exists)
        return;
    const config = await (0, utils_1.readJsonFile)(agentConfigPath, {});
    const agents = (config.agents || {});
    if (Object.prototype.hasOwnProperty.call(agents, manifest.agent.id)) {
        delete agents[manifest.agent.id];
        config.agents = agents;
        await (0, utils_1.writeJsonFile)(agentConfigPath, config);
    }
}
async function copyCommands(manifest, packageSkillDir, commandDir) {
    if (!manifest.commands || manifest.commands.length === 0)
        return;
    await (0, utils_1.ensureDirExists)(commandDir);
    for (const cmd of manifest.commands) {
        const src = path_1.default.join(packageSkillDir, cmd);
        const dest = path_1.default.join(commandDir, cmd);
        const srcExists = await fs_extra_1.default.pathExists(src);
        if (srcExists) {
            await fs_extra_1.default.copy(src, dest, { overwrite: true });
        }
    }
}
async function removeCommands(manifest, commandDir) {
    if (!manifest.commands || manifest.commands.length === 0)
        return;
    for (const cmd of manifest.commands) {
        const cmdPath = path_1.default.join(commandDir, cmd);
        const exists = await fs_extra_1.default.pathExists(cmdPath);
        if (exists) {
            await fs_extra_1.default.remove(cmdPath);
        }
    }
}
