import { ManagerState } from "./utils";
export declare function loadState(stateFilePath: string): Promise<ManagerState>;
export declare function saveState(stateFilePath: string, state: ManagerState): Promise<void>;
export declare function migrateV4State(configDir: string, stateFilePath: string, skillsDir: string): Promise<void>;
