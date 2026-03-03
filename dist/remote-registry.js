"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRemoteSkills = listRemoteSkills;
exports.downloadSkillToTemp = downloadSkillToTemp;
exports.getRemoteSkillManifest = getRemoteSkillManifest;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const chalk_1 = __importDefault(require("chalk"));
const auth_1 = require("./auth");
async function githubFetch(url, token) {
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "skill-manager",
        },
    });
    if (response.status === 429) {
        console.error(chalk_1.default.yellow("GitHub API rate limit exceeded. Please wait and try again later."));
        return { data: null, status: 429 };
    }
    if (response.status === 403) {
        console.error(chalk_1.default.yellow("Access denied to private repository. Check your token permissions."));
        return { data: null, status: 403 };
    }
    if (response.status === 404) {
        return { data: null, status: 404 };
    }
    if (!response.ok) {
        return { data: null, status: response.status };
    }
    const data = (await response.json());
    return { data, status: response.status };
}
function isValidManifest(data) {
    if (typeof data !== "object" || data === null)
        return false;
    const obj = data;
    return (typeof obj.name === "string" &&
        typeof obj.version === "string" &&
        typeof obj.description === "string");
}
async function listRemoteSkills() {
    const token = await (0, auth_1.resolveToken)();
    if (!token) {
        return [];
    }
    const repo = (0, auth_1.getPrivateRepo)();
    const [owner, repoName] = repo.split("/");
    const url = `https://api.github.com/repos/${owner}/${repoName}/contents/skills`;
    const { data: items, status } = await githubFetch(url, token);
    if (!items || status !== 200) {
        return [];
    }
    const skills = [];
    for (const item of items) {
        if (item.type !== "dir")
            continue;
        const manifestUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/skills/${item.name}/skill.json`;
        const { data: fileContent, status: fileStatus } = await githubFetch(manifestUrl, token);
        if (!fileContent || fileStatus !== 200)
            continue;
        try {
            const content = Buffer.from(fileContent.content, "base64").toString("utf8");
            const manifest = JSON.parse(content);
            if (isValidManifest(manifest)) {
                skills.push(manifest);
            }
        }
        catch {
            console.error(chalk_1.default.yellow(`Warning: Failed to parse remote skill manifest for ${item.name}`));
        }
    }
    return skills.sort((a, b) => a.name.localeCompare(b.name));
}
async function downloadSkillToTemp(skillName) {
    const token = await (0, auth_1.resolveToken)();
    if (!token) {
        console.error(chalk_1.default.red("No GitHub token available. Run 'skill-manager login' first."));
        return null;
    }
    const repo = (0, auth_1.getPrivateRepo)();
    const [owner, repoName] = repo.split("/");
    const baseUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/skills/${skillName}`;
    const { data: items, status } = await githubFetch(baseUrl, token);
    if (!items || status !== 200) {
        if (status === 404) {
            console.error(chalk_1.default.red(`Remote skill "${skillName}" not found.`));
        }
        return null;
    }
    const tempDir = path_1.default.join(os_1.default.tmpdir(), `skill-manager-${skillName}-${Date.now()}`);
    await fs_extra_1.default.ensureDir(tempDir);
    try {
        await downloadDirectory(items, tempDir, owner, repoName, `skills/${skillName}`, token);
        return tempDir;
    }
    catch (error) {
        await fs_extra_1.default.remove(tempDir);
        console.error(chalk_1.default.red(`Failed to download skill "${skillName}": ${error}`));
        return null;
    }
}
async function downloadDirectory(items, targetDir, owner, repoName, basePath, token) {
    for (const item of items) {
        const targetPath = path_1.default.join(targetDir, item.name);
        if (item.type === "file") {
            const fileUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${item.path}`;
            const { data: fileContent, status } = await githubFetch(fileUrl, token);
            if (fileContent && status === 200) {
                const content = Buffer.from(fileContent.content, "base64");
                await fs_extra_1.default.writeFile(targetPath, content);
            }
        }
        else if (item.type === "dir") {
            await fs_extra_1.default.ensureDir(targetPath);
            const dirUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${item.path}`;
            const { data: subItems, status } = await githubFetch(dirUrl, token);
            if (subItems && status === 200) {
                await downloadDirectory(subItems, targetPath, owner, repoName, item.path, token);
            }
        }
    }
}
async function getRemoteSkillManifest(skillName) {
    const token = await (0, auth_1.resolveToken)();
    if (!token) {
        return null;
    }
    const repo = (0, auth_1.getPrivateRepo)();
    const [owner, repoName] = repo.split("/");
    const manifestUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/skills/${skillName}/skill.json`;
    const { data: fileContent, status } = await githubFetch(manifestUrl, token);
    if (!fileContent || status !== 200) {
        return null;
    }
    try {
        const content = Buffer.from(fileContent.content, "base64").toString("utf8");
        const manifest = JSON.parse(content);
        if (isValidManifest(manifest)) {
            return manifest;
        }
    }
    catch {
        return null;
    }
    return null;
}
