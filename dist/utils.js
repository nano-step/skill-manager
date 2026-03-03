"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MANAGER_VERSION = void 0;
exports.detectOpenCodePaths = detectOpenCodePaths;
exports.ensureDirExists = ensureDirExists;
exports.readJsonFile = readJsonFile;
exports.writeJsonFile = writeJsonFile;
exports.readText = readText;
exports.writeText = writeText;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const fs_extra_1 = __importDefault(require("fs-extra"));
exports.MANAGER_VERSION = "5.5.0";
async function detectOpenCodePaths() {
    const homeConfig = path_1.default.join(os_1.default.homedir(), ".config", "opencode");
    const cwd = process.cwd();
    const projectConfig = path_1.default.join(cwd, ".opencode");
    const hasHomeConfig = await fs_extra_1.default.pathExists(homeConfig);
    const hasProjectConfig = await fs_extra_1.default.pathExists(projectConfig);
    if (!hasHomeConfig && !hasProjectConfig) {
        throw new Error("OpenCode config not found. Expected ~/.config/opencode or .opencode in project.");
    }
    const configDir = hasProjectConfig ? projectConfig : homeConfig;
    const opencodeJsonPath = hasProjectConfig
        ? path_1.default.join(cwd, "opencode.json")
        : path_1.default.join(configDir, "opencode.json");
    return {
        configDir,
        commandDir: path_1.default.join(configDir, "command"),
        skillsDir: path_1.default.join(configDir, "skills"),
        agentConfigPath: path_1.default.join(configDir, "oh-my-opencode.json"),
        stateFilePath: path_1.default.join(configDir, ".skill-manager.json"),
        packageSkillsDir: path_1.default.join(__dirname, "..", "skills"),
        opencodeJsonPath,
    };
}
async function ensureDirExists(dirPath) {
    await fs_extra_1.default.ensureDir(dirPath);
}
async function readJsonFile(filePath, fallback) {
    const exists = await fs_extra_1.default.pathExists(filePath);
    if (!exists) {
        return fallback;
    }
    const data = await fs_extra_1.default.readFile(filePath, "utf8");
    return JSON.parse(data);
}
async function writeJsonFile(filePath, data) {
    await fs_extra_1.default.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}
async function readText(filePath) {
    return fs_extra_1.default.readFile(filePath, "utf8");
}
async function writeText(filePath, data) {
    await fs_extra_1.default.writeFile(filePath, data, "utf8");
}
