export declare const PACKAGE_VERSION = "1.0.0";
export declare const AGENT_ID = "mcp-manager";
export interface OpenCodePaths {
    configDir: string;
    projectDir: string;
    commandDir: string;
    skillsDir: string;
    agentConfigPath: string;
    versionFilePath: string;
    templateSkillDir: string;
    templateCommandPath: string;
    templateAgentPath: string;
}
export interface InstallationState {
    installedVersion: string | null;
    skillInstalled: boolean;
    commandInstalled: boolean;
    agentInstalled: boolean;
}
export declare function detectOpenCodePaths(): Promise<OpenCodePaths>;
export declare function ensureDirExists(dirPath: string): Promise<void>;
export declare function readJsonFile<T>(filePath: string, fallback: T): Promise<T>;
export declare function writeJsonFile(filePath: string, data: unknown): Promise<void>;
export declare function readText(filePath: string): Promise<string>;
export declare function writeText(filePath: string, data: string): Promise<void>;
export declare function backupFile(filePath: string, suffix: string): Promise<string>;
export declare function fileDiffersFromTemplate(filePath: string, templatePath: string): Promise<boolean>;
export declare function directoryDiffersFromTemplate(dirPath: string, templateDir: string): Promise<boolean>;
export declare function getInstallationState(paths: OpenCodePaths): Promise<InstallationState>;
