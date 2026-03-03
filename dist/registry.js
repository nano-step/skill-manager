"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCatalog = loadCatalog;
exports.getSkillManifest = getSkillManifest;
exports.loadMergedCatalog = loadMergedCatalog;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const chalk_1 = __importDefault(require("chalk"));
function isValidManifest(data) {
    if (typeof data !== "object" || data === null)
        return false;
    const obj = data;
    return (typeof obj.name === "string" &&
        typeof obj.version === "string" &&
        typeof obj.description === "string");
}
async function loadCatalog(packageSkillsDir) {
    const exists = await fs_extra_1.default.pathExists(packageSkillsDir);
    if (!exists) {
        return [];
    }
    const entries = await fs_extra_1.default.readdir(packageSkillsDir, { withFileTypes: true });
    const catalog = [];
    for (const entry of entries) {
        if (!entry.isDirectory())
            continue;
        const manifestPath = path_1.default.join(packageSkillsDir, entry.name, "skill.json");
        const manifestExists = await fs_extra_1.default.pathExists(manifestPath);
        if (!manifestExists)
            continue;
        try {
            const raw = await fs_extra_1.default.readFile(manifestPath, "utf8");
            const data = JSON.parse(raw);
            if (!isValidManifest(data)) {
                console.error(chalk_1.default.yellow(`Warning: Skipping ${entry.name} — skill.json missing required fields (name, version, description)`));
                continue;
            }
            catalog.push(data);
        }
        catch {
            console.error(chalk_1.default.yellow(`Warning: Skipping ${entry.name} — failed to parse skill.json`));
        }
    }
    return catalog.sort((a, b) => a.name.localeCompare(b.name));
}
async function getSkillManifest(packageSkillsDir, name) {
    const manifestPath = path_1.default.join(packageSkillsDir, name, "skill.json");
    const exists = await fs_extra_1.default.pathExists(manifestPath);
    if (!exists)
        return null;
    try {
        const raw = await fs_extra_1.default.readFile(manifestPath, "utf8");
        const data = JSON.parse(raw);
        if (!isValidManifest(data))
            return null;
        return data;
    }
    catch {
        return null;
    }
}
async function loadMergedCatalog(packageSkillsDir, remoteSkills) {
    const localCatalog = await loadCatalog(packageSkillsDir);
    const localNames = new Set(localCatalog.map((s) => s.name));
    const entries = localCatalog.map((manifest) => ({
        manifest,
        source: "public",
    }));
    for (const manifest of remoteSkills) {
        if (!localNames.has(manifest.name)) {
            entries.push({ manifest, source: "private" });
        }
    }
    return entries.sort((a, b) => a.manifest.name.localeCompare(b.manifest.name));
}
