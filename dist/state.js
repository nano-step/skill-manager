"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadState = loadState;
exports.saveState = saveState;
exports.migrateV4State = migrateV4State;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = require("./utils");
function createEmptyState() {
    return { version: 1, managerVersion: utils_1.MANAGER_VERSION, skills: {} };
}
async function loadState(stateFilePath) {
    const exists = await fs_extra_1.default.pathExists(stateFilePath);
    if (!exists) {
        return createEmptyState();
    }
    const data = await (0, utils_1.readJsonFile)(stateFilePath, createEmptyState());
    return data;
}
async function saveState(stateFilePath, state) {
    state.managerVersion = utils_1.MANAGER_VERSION;
    await (0, utils_1.writeJsonFile)(stateFilePath, state);
}
async function migrateV4State(configDir, stateFilePath, skillsDir) {
    const oldVersionFile = path_1.default.join(configDir, ".agent-skill-version.json");
    const [oldExists, newExists] = await Promise.all([
        fs_extra_1.default.pathExists(oldVersionFile),
        fs_extra_1.default.pathExists(stateFilePath),
    ]);
    if (!oldExists || newExists) {
        return;
    }
    console.log(chalk_1.default.cyan("Migrating from v4 state format..."));
    const state = createEmptyState();
    const skillPath = path_1.default.join(skillsDir, "skill-management", "SKILL.md");
    const mcpSkillPath = path_1.default.join(skillsDir, "mcp-management", "SKILL.md");
    const skillInstalled = await fs_extra_1.default.pathExists(skillPath) || await fs_extra_1.default.pathExists(mcpSkillPath);
    if (skillInstalled) {
        state.skills["skill-management"] = {
            version: "1.0.0",
            installedAt: new Date().toISOString(),
            location: configDir.includes(".config/opencode") ? "global" : "project",
        };
    }
    await (0, utils_1.writeJsonFile)(stateFilePath, state);
    await fs_extra_1.default.remove(oldVersionFile);
    console.log(chalk_1.default.green("Migration complete. State saved to .skill-manager.json"));
}
