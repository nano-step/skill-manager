import path from "path";
import os from "os";
import fs from "fs-extra";
import { execSync } from "child_process";

export interface AuthConfig {
  token?: string;
}

const CONFIG_DIR = path.join(os.homedir(), ".config", "skill-manager");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
const PRIVATE_REPO = "nano-step/private-skills";

export async function loadAuthConfig(): Promise<AuthConfig> {
  const exists = await fs.pathExists(CONFIG_FILE);
  if (!exists) {
    return {};
  }
  try {
    const data = await fs.readFile(CONFIG_FILE, "utf8");
    return JSON.parse(data) as AuthConfig;
  } catch {
    return {};
  }
}

export async function saveAuthConfig(config: AuthConfig): Promise<void> {
  await fs.ensureDir(CONFIG_DIR);
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n", {
    encoding: "utf8",
    mode: 0o600,
  });
  await fs.chmod(CONFIG_FILE, 0o600);
}

export async function removeAuthConfig(): Promise<void> {
  const exists = await fs.pathExists(CONFIG_FILE);
  if (exists) {
    await fs.remove(CONFIG_FILE);
  }
}

function getGhCliToken(): string | null {
  try {
    const token = execSync("gh auth token", { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
    return token || null;
  } catch {
    return null;
  }
}

export async function resolveToken(): Promise<string | null> {
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

export function getPrivateRepo(): string {
  return PRIVATE_REPO;
}
