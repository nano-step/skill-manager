import { SkillManifest } from "./utils";
export declare function loadCatalog(packageSkillsDir: string): Promise<SkillManifest[]>;
export declare function getSkillManifest(packageSkillsDir: string, name: string): Promise<SkillManifest | null>;
