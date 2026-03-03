"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeAgentConfig = mergeAgentConfig;
exports.removeAgentConfig = removeAgentConfig;
exports.mergeMcpConfig = mergeMcpConfig;
exports.removeMcpConfig = removeMcpConfig;
exports.copyCommands = copyCommands;
exports.removeCommands = removeCommands;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const chalk_1 = __importDefault(require("chalk"));
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
async function mergeMcpConfig(opencodeJsonPath, manifest) {
    if (!manifest.mcp)
        return;
    const exists = await fs_extra_1.default.pathExists(opencodeJsonPath);
    if (!exists) {
        console.log(chalk_1.default.yellow(`Warning: ${opencodeJsonPath} not found. Skipping MCP config merge.`));
        return;
    }
    const config = await (0, utils_1.readJsonFile)(opencodeJsonPath, {});
    const mcp = (config.mcp || {});
    for (const [serverName, serverConfig] of Object.entries(manifest.mcp)) {
        if (mcp[serverName]) {
            console.log(chalk_1.default.yellow(`  MCP server "${serverName}" already configured — skipping (edit opencode.json manually if needed)`));
            continue;
        }
        mcp[serverName] = serverConfig;
        console.log(chalk_1.default.green(`  ✓ Added MCP server "${serverName}" to opencode.json (update connection strings!)`));
    }
    config.mcp = mcp;
    await (0, utils_1.writeJsonFile)(opencodeJsonPath, config);
}
async function removeMcpConfig(opencodeJsonPath, manifest) {
    if (!manifest.mcp)
        return;
    const exists = await fs_extra_1.default.pathExists(opencodeJsonPath);
    if (!exists)
        return;
    const config = await (0, utils_1.readJsonFile)(opencodeJsonPath, {});
    const mcp = (config.mcp || {});
    for (const serverName of Object.keys(manifest.mcp)) {
        if (Object.prototype.hasOwnProperty.call(mcp, serverName)) {
            delete mcp[serverName];
            console.log(chalk_1.default.green(`  ✓ Removed MCP server "${serverName}" from opencode.json`));
        }
    }
    config.mcp = mcp;
    await (0, utils_1.writeJsonFile)(opencodeJsonPath, config);
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
