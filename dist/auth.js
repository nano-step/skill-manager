"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAuthConfig = loadAuthConfig;
exports.saveAuthConfig = saveAuthConfig;
exports.removeAuthConfig = removeAuthConfig;
exports.resolveToken = resolveToken;
exports.getPrivateRepo = getPrivateRepo;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const child_process_1 = require("child_process");
const CONFIG_DIR = path_1.default.join(os_1.default.homedir(), ".config", "skill-manager");
const CONFIG_FILE = path_1.default.join(CONFIG_DIR, "config.json");
const PRIVATE_REPO = "nano-step/private-skills";
async function loadAuthConfig() {
    const exists = await fs_extra_1.default.pathExists(CONFIG_FILE);
    if (!exists) {
        return {};
    }
    try {
        const data = await fs_extra_1.default.readFile(CONFIG_FILE, "utf8");
        return JSON.parse(data);
    }
    catch {
        return {};
    }
}
async function saveAuthConfig(config) {
    await fs_extra_1.default.ensureDir(CONFIG_DIR);
    await fs_extra_1.default.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n", {
        encoding: "utf8",
        mode: 0o600,
    });
    await fs_extra_1.default.chmod(CONFIG_FILE, 0o600);
}
async function removeAuthConfig() {
    const exists = await fs_extra_1.default.pathExists(CONFIG_FILE);
    if (exists) {
        await fs_extra_1.default.remove(CONFIG_FILE);
    }
}
function getGhCliToken() {
    try {
        const token = (0, child_process_1.execSync)("gh auth token", { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
        return token || null;
    }
    catch {
        return null;
    }
}
async function resolveToken() {
    const config = await loadAuthConfig();
    if (config.token) {
        return config.token;
    }
    const envToken = process.env.GITHUB_TOKEN;
    if (envToken) {
        return envToken;
    }
    return getGhCliToken();
}
function getPrivateRepo() {
    return PRIVATE_REPO;
}
