import { SkillManifest } from "./utils";
export declare function listRemoteSkills(): Promise<SkillManifest[]>;
export declare function downloadSkillToTemp(skillName: string): Promise<string | null>;
export declare function getRemoteSkillManifest(skillName: string): Promise<SkillManifest | null>;
