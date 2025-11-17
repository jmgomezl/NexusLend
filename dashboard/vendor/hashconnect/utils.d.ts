import { AccountId, LedgerId, PrivateKey, PublicKey } from "@hashgraph/sdk";
import { SignClient } from "@walletconnect/sign-client/dist/types/client";
import { SignClientTypes, SessionTypes } from "@walletconnect/types";
export declare const executeWithRetriesAsync: <T>(func: (retryNum: number) => Promise<T>, shouldRetry: (err: any) => boolean, maxRetries?: number) => Promise<T>;
export declare class ChainIdHelper {
    static getChainIdFromProposal(proposal: SignClientTypes.EventArguments["session_proposal"]): string;
    static getChainIdFromSession(session: SessionTypes.Struct): string;
}
export declare class AuthenticationHelper {
    static mirrorNodeBaseUrlMainnet: string;
    static mirrorNodeBaseUrlTestnet: string;
    static mirrorNodeBaseUrlPreviewnet: string;
    static mirrorNodeAuthTokenMainnet: string;
    static mirrorNodeAuthTokenTestnet: string;
    static mirrorNodeAuthTokenPreviewnet: string;
    static getPublicKey(ledgerId: LedgerId, accountId: string): Promise<PublicKey>;
    signPayload(payload: any, privateKey: PrivateKey): Uint8Array;
    /**
     * Verify that the payload was signed by the account
     * @param accountId
     * @param accountSignature
     * @param payload
     * @returns
     * @example
     * ```ts
     * const { isValid, error } = await hashconnect.verifyAuthenticationSignatures(
     *   accountId,
     *   accountSignature,
     *   "Hello World",
     *   async (accountId) => {
     *     // Use custom logic to get the public key of the account
     *     // in this example we use the hedera public mirror node.
     *     const response = await fetch(
     *       `https://mainnet-public.mirrornode.hedera.com/api/v1/accounts/${accountId.toString()}`
     *     );
     *     const accountInfo = await response.json();
     *     return PublicKey.fromString(accountInfo.key.key);
     *   }
     * );
     * ```
     * @category Authentication
     * @category Signature Verification
     */
    static verifySignature(ledgerId: LedgerId, accountId: string, accountSignature: Uint8Array, payload: {
        url: string;
        data: any;
    }): Promise<{
        isValid: boolean;
        error?: string;
    }>;
    /**
     * Verify the signatures of an authentication request by verifying the account and server signatures
     * @param accountId
     * @param accountSignature
     * @param serverSigningAccountId
     * @param serverSignature
     * @param payload
     * @param getPublicKey
     * @returns
     * @example
     * ```ts
     * const { isValid, error } = await hashconnect.verifyAuthenticationSignatures(
     *   accountId,
     *   accountSignature,
     *   serverSigningAccountId,
     *   serverSignature,
     *   {
     *     url: "https://example.com",
     *     data: { foo: "bar" },
     *   },
     *   async (accountId) => {
     *     // Use custom logic to get the public key of the account
     *     // in this example we use the hedera public mirror node.
     *     const response = await fetch(
     *       `https://mainnet-public.mirrornode.hedera.com/api/v1/accounts/${accountId.toString()}`
     *     );
     *     const accountInfo = await response.json();
     *     return PublicKey.fromString(accountInfo.key.key);
     *   }
     * );
     * ```
     * @category Authentication
     */
    static verifyAuthenticationSignatures(ledgerId: LedgerId, accountId: string, accountSignature: Uint8Array, serverSigningAccountId: string, serverSignature: Uint8Array, payload: {
        url: string;
        data: any;
    }): Promise<{
        isValid: boolean;
        error?: string;
    }>;
}
export declare class SignClientHelper {
    static getSessionForAccount(signClient: SignClient, ledgerId: LedgerId, accountId: string): SessionTypes.Struct & {
        namespaces: {
            hedera: {
                accounts: string[];
                chains: string[];
            };
        };
    };
    static getSessionForTopic(signClient: SignClient, topic: string): SessionTypes.Struct & {
        namespaces: {
            hedera: {
                accounts: string[];
                chains: string[];
            };
        };
    };
    static sendAuthenticationRequest(signClient: SignClient, ledgerId: LedgerId, serverSigningAccount: AccountId, serverSignature: Uint8Array, accountId: string, payload: {
        url: string;
        data: any;
    }): Promise<Uint8Array>;
}
