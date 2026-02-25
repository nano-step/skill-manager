"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SKILL_DIR_NAME = exports.AGENT_ID = exports.PACKAGE_VERSION = void 0;
exports.detectOpenCodePaths = detectOpenCodePaths;
exports.ensureDirExists = ensureDirExists;
exports.readJsonFile = readJsonFile;
exports.writeJsonFile = writeJsonFile;
exports.readText = readText;
exports.writeText = writeText;
exports.backupFile = backupFile;
exports.fileDiffersFromTemplate = fileDiffersFromTemplate;
exports.directoryDiffersFromTemplate = directoryDiffersFromTemplate;
exports.getInstallationState = getInstallationState;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const fs_extra_1 = __importDefault(require("fs-extra"));
exports.PACKAGE_VERSION = "4.0.0";
exports.AGENT_ID = "mcp-manager";
exports.SKILL_DIR_NAME = "mcp-management";
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
    const commandDir = path_1.default.join(configDir, "command");
    const skillsDir = path_1.default.join(configDir, "skills");
    const agentConfigPath = path_1.default.join(configDir, "oh-my-opencode.json");
    const packageRoot = path_1.default.join(__dirname, "..");
    const templateSkillDir = path_1.default.join(packageRoot, "templates", "skill");
    const templateCommandPath = path_1.default.join(packageRoot, "templates", "command-refresh.md");
    const templateAgentPath = path_1.default.join(packageRoot, "templates", "agent.json");
    const versionFilePath = path_1.default.join(configDir, ".agent-skill-version.json");
    return {
        configDir,
        projectDir: cwd,
        commandDir,
        skillsDir,
        agentConfigPath,
        versionFilePath,
        templateSkillDir,
        templateCommandPath,
        templateAgentPath,
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
async function backupFile(filePath, suffix) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = `${filePath}.${suffix}-${timestamp}.bak`;
    await fs_extra_1.default.copy(filePath, backupPath);
    return backupPath;
}
async function fileDiffersFromTemplate(filePath, templatePath) {
    const exists = await fs_extra_1.default.pathExists(filePath);
    if (!exists) {
        return false;
    }
    const [current, template] = await Promise.all([readText(filePath), readText(templatePath)]);
    return current.trim() !== template.trim();
}
async function listFilesRecursively(dirPath, baseDir) {
    const entries = await fs_extra_1.default.readdir(dirPath, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const fullPath = path_1.default.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await listFilesRecursively(fullPath, baseDir)));
        }
        else if (entry.isFile()) {
            files.push(path_1.default.relative(baseDir, fullPath));
        }
    }
    return files;
}
async function directoryDiffersFromTemplate(dirPath, templateDir) {
    const [dirExists, templateExists] = await Promise.all([
        fs_extra_1.default.pathExists(dirPath),
        fs_extra_1.default.pathExists(templateDir),
    ]);
    if (!dirExists) {
        return false;
    }
    if (!templateExists) {
        return true;
    }
    const [currentFiles, templateFiles] = await Promise.all([
        listFilesRecursively(dirPath, dirPath),
        listFilesRecursively(templateDir, templateDir),
    ]);
    currentFiles.sort();
    templateFiles.sort();
    if (currentFiles.length !== templateFiles.length) {
        return true;
    }
    for (let index = 0; index < currentFiles.length; index += 1) {
        if (currentFiles[index] !== templateFiles[index]) {
            return true;
        }
    }
    for (const relativePath of currentFiles) {
        const [currentBuffer, templateBuffer] = await Promise.all([
            fs_extra_1.default.readFile(path_1.default.join(dirPath, relativePath)),
            fs_extra_1.default.readFile(path_1.default.join(templateDir, relativePath)),
        ]);
        if (!currentBuffer.equals(templateBuffer)) {
            return true;
        }
    }
    return false;
}
async function getInstallationState(paths) {
    const skillPath = path_1.default.join(paths.skillsDir, exports.SKILL_DIR_NAME, "SKILL.md");
    const commandPath = path_1.default.join(paths.commandDir, "agent-skill-refresh.md");
    const [versionData, skillInstalled, commandInstalled] = await Promise.all([
        readJsonFile(paths.versionFilePath, {}),
        fs_extra_1.default.pathExists(skillPath),
        fs_extra_1.default.pathExists(commandPath),
    ]);
    const agentConfig = await readJsonFile(paths.agentConfigPath, {});
    const agents = agentConfig.agents;
    const agentInstalled = agents ? Object.prototype.hasOwnProperty.call(agents, exports.AGENT_ID) : false;
    return {
        installedVersion: typeof versionData.version === "string" ? versionData.version : null,
        skillInstalled,
        commandInstalled,
        agentInstalled,
    };
}
