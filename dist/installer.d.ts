import { OpenCodePaths } from "./utils";
export declare function installSkill(name: string, paths: OpenCodePaths, force?: boolean): Promise<void>;
export declare function removeSkill(name: string, paths: OpenCodePaths): Promise<void>;
export declare function updateSkill(name: string, paths: OpenCodePaths, force?: boolean): Promise<void>;
