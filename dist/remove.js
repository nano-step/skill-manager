"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = remove;
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const utils_1 = require("./utils");
async function remove() {
    const paths = await (0, utils_1.detectOpenCodePaths)();
    const skillTargetDir = path_1.default.join(paths.skillsDir, "mcp-management");
    const commandTargetPath = path_1.default.join(paths.commandDir, "mcp-refresh.md");
    if (await fs_extra_1.default.pathExists(skillTargetDir)) {
        await fs_extra_1.default.remove(skillTargetDir);
    }
    if (await fs_extra_1.default.pathExists(commandTargetPath)) {
        await fs_extra_1.default.remove(commandTargetPath);
    }
    const agentConfig = await (0, utils_1.readJsonFile)(paths.agentConfigPath, {});
    if (Object.prototype.hasOwnProperty.call(agentConfig, utils_1.AGENT_ID)) {
        const { [utils_1.AGENT_ID]: _removed, ...rest } = agentConfig;
        await (0, utils_1.writeJsonFile)(paths.agentConfigPath, rest);
    }
    if (await fs_extra_1.default.pathExists(paths.versionFilePath)) {
        await fs_extra_1.default.remove(paths.versionFilePath);
    }
    console.log(chalk_1.default.green("MCP Manager removed successfully."));
}
