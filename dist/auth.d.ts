export interface AuthConfig {
    token?: string;
}
export declare function loadAuthConfig(): Promise<AuthConfig>;
export declare function saveAuthConfig(config: AuthConfig): Promise<void>;
export declare function removeAuthConfig(): Promise<void>;
export declare function resolveToken(): Promise<string | null>;
export declare function getPrivateRepo(): string;
