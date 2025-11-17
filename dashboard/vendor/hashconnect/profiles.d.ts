import { UserProfile } from "./types";
export declare class UserProfileHelper {
    static cache: UserProfile[];
    /**
     * Get a user profile from the HashConnect API
     * @param accountId
     * @param network (optional)
     * @returns
     * @example
     * ```ts
     * const userProfile = await hashconnect.getUserProfile("0.0.12345");
     * ```
     * @category User Profiles
     */
    static getUserProfile(accountId: string, network?: "mainnet" | "testnet"): Promise<UserProfile>;
    /**
     * Get multiple user profiles from the HashConnect API
     * @param accountIds []
     * @param network (optional)
     * @returns
     * @example
     * ```ts
     * const userProfiles = await hashconnect.getMultipleUserProfiles(["0.0.12345", "0.0.12346"]);
     * ```
     * @category User Profiles
     */
    static getMultipleUserProfiles(accountIds: string[], network?: "mainnet" | "testnet"): Promise<UserProfile[]>;
}
