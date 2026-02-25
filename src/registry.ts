import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { SkillManifest } from "./utils";

function isValidManifest(data: unknown): data is SkillManifest {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.name === "string" &&
    typeof obj.version === "string" &&
    typeof obj.description === "string"
  );
}

export async function loadCatalog(packageSkillsDir: string): Promise<SkillManifest[]> {
  const exists = await fs.pathExists(packageSkillsDir);
  if (!exists) {
    return [];
  }

  const entries = await fs.readdir(packageSkillsDir, { withFileTypes: true });
  const catalog: SkillManifest[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const manifestPath = path.join(packageSkillsDir, entry.name, "skill.json");
    const manifestExists = await fs.pathExists(manifestPath);
    if (!manifestExists) continue;

    try {
      const raw = await fs.readFile(manifestPath, "utf8");
      const data: unknown = JSON.parse(raw);

      if (!isValidManifest(data)) {
        console.error(chalk.yellow(`Warning: Skipping ${entry.name} — skill.json missing required fields (name, version, description)`));
        continue;
      }

      catalog.push(data);
    } catch {
      console.error(chalk.yellow(`Warning: Skipping ${entry.name} — failed to parse skill.json`));
    }
  }

  return catalog.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getSkillManifest(packageSkillsDir: string, name: string): Promise<SkillManifest | null> {
  const manifestPath = path.join(packageSkillsDir, name, "skill.json");
  const exists = await fs.pathExists(manifestPath);
  if (!exists) return null;

  try {
    const raw = await fs.readFile(manifestPath, "utf8");
    const data: unknown = JSON.parse(raw);
    if (!isValidManifest(data)) return null;
    return data;
  } catch {
    return null;
  }
}
