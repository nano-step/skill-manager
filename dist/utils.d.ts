export declare const MANAGER_VERSION = "5.2.1";
export interface SkillManifest {
    name: string;
    version: string;
    description: string;
    compatibility?: string;
    agent?: {
        id: string;
        config: Record<string, unknown>;
    } | null;
    commands?: string[];
    tags?: string[];
}
export interface InstalledSkillInfo {
    version: string;
    installedAt: string;
    location: "global" | "project";
}
export interface ManagerState {
    version: number;
    managerVersion: string;
    skills: Record<string, InstalledSkillInfo>;
}
export interface OpenCodePaths {
    configDir: string;
    commandDir: string;
    skillsDir: string;
    agentConfigPath: string;
    stateFilePath: string;
    packageSkillsDir: string;
}
export declare function detectOpenCodePaths(): Promise<OpenCodePaths>;
export declare function ensureDirExists(dirPath: string): Promise<void>;
export declare function readJsonFile<T>(filePath: string, fallback: T): Promise<T>;
export declare function writeJsonFile(filePath: string, data: unknown): Promise<void>;
export declare function readText(filePath: string): Promise<string>;
export declare function writeText(filePath: string, data: string): Promise<void>;
