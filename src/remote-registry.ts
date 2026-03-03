import path from "path";
import os from "os";
import fs from "fs-extra";
import chalk from "chalk";
import { SkillManifest } from "./utils";
import { resolveToken, getPrivateRepo } from "./auth";

interface GitHubContentItem {
  name: string;
  path: string;
  type: "file" | "dir";
  download_url: string | null;
}

interface GitHubFileContent {
  content: string;
  encoding: string;
}

async function githubFetch<T>(url: string, token: string): Promise<{ data: T | null; status: number }> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "skill-manager",
    },
  });

  if (response.status === 429) {
    console.error(chalk.yellow("GitHub API rate limit exceeded. Please wait and try again later."));
    return { data: null, status: 429 };
  }

  if (response.status === 403) {
    console.error(chalk.yellow("Access denied to private repository. Check your token permissions."));
    return { data: null, status: 403 };
  }

  if (response.status === 404) {
    return { data: null, status: 404 };
  }

  if (!response.ok) {
    return { data: null, status: response.status };
  }

  const data = (await response.json()) as T;
  return { data, status: response.status };
}

function isValidManifest(data: unknown): data is SkillManifest {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.name === "string" &&
    typeof obj.version === "string" &&
    typeof obj.description === "string"
  );
}

export async function listRemoteSkills(): Promise<SkillManifest[]> {
  const token = await resolveToken();
  if (!token) {
    return [];
  }

  const repo = getPrivateRepo();
  const [owner, repoName] = repo.split("/");
  const url = `https://api.github.com/repos/${owner}/${repoName}/contents/skills`;

  const { data: items, status } = await githubFetch<GitHubContentItem[]>(url, token);
  if (!items || status !== 200) {
    return [];
  }

  const skills: SkillManifest[] = [];

  for (const item of items) {
    if (item.type !== "dir") continue;

    const manifestUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/skills/${item.name}/skill.json`;
    const { data: fileContent, status: fileStatus } = await githubFetch<GitHubFileContent>(manifestUrl, token);

    if (!fileContent || fileStatus !== 200) continue;

    try {
      const content = Buffer.from(fileContent.content, "base64").toString("utf8");
      const manifest: unknown = JSON.parse(content);

      if (isValidManifest(manifest)) {
        skills.push(manifest);
      }
    } catch {
      console.error(chalk.yellow(`Warning: Failed to parse remote skill manifest for ${item.name}`));
    }
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

export async function downloadSkillToTemp(skillName: string): Promise<string | null> {
  const token = await resolveToken();
  if (!token) {
    console.error(chalk.red("No GitHub token available. Run 'skill-manager login' first."));
    return null;
  }

  const repo = getPrivateRepo();
  const [owner, repoName] = repo.split("/");
  const baseUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/skills/${skillName}`;

  const { data: items, status } = await githubFetch<GitHubContentItem[]>(baseUrl, token);
  if (!items || status !== 200) {
    if (status === 404) {
      console.error(chalk.red(`Remote skill "${skillName}" not found.`));
    }
    return null;
  }

  const tempDir = path.join(os.tmpdir(), `skill-manager-${skillName}-${Date.now()}`);
  await fs.ensureDir(tempDir);

  try {
    await downloadDirectory(items, tempDir, owner, repoName, `skills/${skillName}`, token);
    return tempDir;
  } catch (error) {
    await fs.remove(tempDir);
    console.error(chalk.red(`Failed to download skill "${skillName}": ${error}`));
    return null;
  }
}

async function downloadDirectory(
  items: GitHubContentItem[],
  targetDir: string,
  owner: string,
  repoName: string,
  basePath: string,
  token: string,
): Promise<void> {
  for (const item of items) {
    const targetPath = path.join(targetDir, item.name);

    if (item.type === "file") {
      const fileUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${item.path}`;
      const { data: fileContent, status } = await githubFetch<GitHubFileContent>(fileUrl, token);

      if (fileContent && status === 200) {
        const content = Buffer.from(fileContent.content, "base64");
        await fs.writeFile(targetPath, content);
      }
    } else if (item.type === "dir") {
      await fs.ensureDir(targetPath);
      const dirUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${item.path}`;
      const { data: subItems, status } = await githubFetch<GitHubContentItem[]>(dirUrl, token);

      if (subItems && status === 200) {
        await downloadDirectory(subItems, targetPath, owner, repoName, item.path, token);
      }
    }
  }
}

export async function getRemoteSkillManifest(skillName: string): Promise<SkillManifest | null> {
  const token = await resolveToken();
  if (!token) {
    return null;
  }

  const repo = getPrivateRepo();
  const [owner, repoName] = repo.split("/");
  const manifestUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/skills/${skillName}/skill.json`;

  const { data: fileContent, status } = await githubFetch<GitHubFileContent>(manifestUrl, token);
  if (!fileContent || status !== 200) {
    return null;
  }

  try {
    const content = Buffer.from(fileContent.content, "base64").toString("utf8");
    const manifest: unknown = JSON.parse(content);

    if (isValidManifest(manifest)) {
      return manifest;
    }
  } catch {
    return null;
  }

  return null;
}
