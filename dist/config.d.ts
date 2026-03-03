import { SkillManifest } from "./utils";
export declare function mergeAgentConfig(agentConfigPath: string, manifest: SkillManifest): Promise<void>;
export declare function removeAgentConfig(agentConfigPath: string, manifest: SkillManifest): Promise<void>;
export declare function mergeMcpConfig(opencodeJsonPath: string, manifest: SkillManifest): Promise<void>;
export declare function removeMcpConfig(opencodeJsonPath: string, manifest: SkillManifest): Promise<void>;
export declare function copyCommands(manifest: SkillManifest, packageSkillDir: string, commandDir: string): Promise<void>;
export declare function removeCommands(manifest: SkillManifest, commandDir: string): Promise<void>;
