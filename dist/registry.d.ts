import { SkillManifest, CatalogEntry } from "./utils";
export declare function loadCatalog(packageSkillsDir: string): Promise<SkillManifest[]>;
export declare function getSkillManifest(packageSkillsDir: string, name: string): Promise<SkillManifest | null>;
export declare function loadPrivateCatalog(packageSkillsDir: string): SkillManifest[];
export declare function loadMergedCatalog(packageSkillsDir: string, remoteSkills: SkillManifest[]): Promise<CatalogEntry[]>;
