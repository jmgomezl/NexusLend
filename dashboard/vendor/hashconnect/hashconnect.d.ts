import { Event } from "ts-typed-events";
import { AccountId, LedgerId, PublicKey, SignerSignature, Transaction, TransactionReceipt } from "@hashgraph/sdk";
import { DappMetadata, HashConnectConnectionState, SessionData } from "./types";
import { HashConnectSigner } from "./signer";
import { UserProfileHelper } from "./profiles";
/**
 * Main interface with hashpack
 */
export declare class HashConnect {
    readonly ledgerId: LedgerId;
    private readonly projectId;
    private readonly metadata;
    private readonly _debug;
    readonly connectionStatusChangeEvent: Event<HashConnectConnectionState>;
    readonly pairingEvent: Event<SessionData>;
    readonly disconnectionEvent: Event<void>;
    private readonly approveEvent;
    private core?;
    private _signClient?;
    private _authClient?;
    private _pairingString?;
    getUserProfile: typeof UserProfileHelper.getUserProfile;
    getMultipleUserProfiles: typeof UserProfileHelper.getMultipleUserProfiles;
    get pairingString(): string | undefined;
    get connectedAccountIds(): AccountId[];
    /**
     * Create a new HashConnect instance
     * @param ledgerId - LedgerId
     * @param projectId - string
     * @param metadata - {@link DappMetadata}
     * @param debug - boolean
     * @returns
     * @example
     * ```ts
     * const metadata = {
     *      name: "Example dApp",
     *      description: "Example dApp",
     *      icons: ["https://example.com/icon.png"],
     *      url: "https://example.com",
     * };
     * const hashconnect = new HashConnect(LedgerId.TESTNET, "<ProjectId>", metadata, true);
     * ```
     * @category Initialization
     */
    constructor(ledgerId: LedgerId, projectId: string, metadata: DappMetadata, _debug?: boolean);
    init(): Promise<void>;
    private _setupEvents;
    /**
     * Get a signer for an account
     * @param accountId
     * @returns {@link HashConnectSigner}
     * @example
     * ```ts
     * const signer = hashconnect.getSigner(accountId);
     * ```
     * @category Signers
     */
    getSigner(accountId: AccountId): HashConnectSigner;
    /**
     * Disconnect from hashpack
     * @returns
     * @example
     * ```ts
     * await hashconnect.disconnect();
     * ```
     * @category Initialization
     */
    private disconnecting;
    disconnect(): Promise<void>;
    /**
     * Send a transaction to hashpack for signing and execution
     * @param accountId
     * @param transaction
     * @returns TransactionResponse - {@link TransactionResponse}
     * @example
     * ```ts
     * const transactionResponse = await hashconnect.sendTransaction(
     *  accountId,
     *  transaction
     * );
     * ```
     * @category Transactions
     */
    sendTransaction(accountId: AccountId, transaction: Transaction): Promise<TransactionReceipt>;
    /**
     * Sign a transaction and return the signed transaction
     * @param accountId
     * @param message
     * @returns
     * @example
     * ```ts
     * const signerSignature = await hashconnect.signMessage(
     *   accountId,
     *   transaction
     * );
     * ```
     * @category Signatures
     */
    signAndReturnTransaction(accountId: AccountId, transaction: Transaction): Promise<Transaction>;
    /**
     * Sign a message. This is a convenience method that calls `getSigner` and then `sign` on the signer
     * @param accountId
     * @param message
     * @returns
     * @example
     * ```ts
     * const signerSignature = await hashconnect.signMessage(
     *   accountId,
     *   ["Hello World"]
     * );
     */
    signMessages(accountId: AccountId, message: string): Promise<SignerSignature[]>;
    /**
     * Sign a transaction. This is a convenience method that calls `getSigner` and then `signTransaction` on the signer
     * @param accountId
     * @param transaction
     * @returns
     * @example
     * ```ts
     * const transaction = new TransferTransaction()
     *  .addHbarTransfer(accountId, new Hbar(-1))
     *  .addHbarTransfer(toAccountId, new Hbar(1))
     *  .setNodeAccountIds(nodeAccoutIds)
     *  .setTransactionId(TransactionId.generate(accountId))
     *  .freeze();
     * const signedTransaction = await hashconnect.signTransaction(
     *  accountId,
     *  transaction
     * );
     * ```
     * @category Transactions
     */
    signTransaction(accountId: AccountId, transaction: Transaction): Promise<Transaction>;
    /**
     * Verify the server signature of an authentication request and generate a signature for the account
     * @param accountId
     * @param serverSigningAccount
     * @param serverSignature
     * @param payload
     * @returns
     * @example
     * ```ts
     * const { accountSignature } = await hashconnect.authenticate(
     *   accountId,
     *   serverSigningAccountId,
     *   serverSignature,
     *   {
     *     url: "https://example.com",
     *     data: { foo: "bar" },
     *   }
     * );
     * ```
     * @category Authentication
     */
    hashpackAuthenticate(accountId: AccountId, serverSigningAccount: AccountId, serverSignature: Uint8Array, payload: {
        url: string;
        data: any;
    }): Promise<{
        accountId: string;
        accountSignature: Uint8Array;
        serverSigningAccount: string;
        serverSignature: Uint8Array;
        isValid: boolean;
        error?: string | undefined;
    }>;
    /**
     * Local wallet stuff
     */
    private findLocalWallets;
    private connectToExtension;
    private _connectToIframeParent;
    /**
     * Opens the WalletConnect pairing modal.
     * @param themeMode - "dark" | "light"
     * @param backgroundColor - string (hex color)
     * @param accentColor - string (hex color)
     * @param accentFillColor - string (hex color)
     * @param borderRadius - string (css border radius)
     * @example
     * ```ts
     * hashconnect.openModal();
     * ```
     */
    openPairingModal(themeMode?: "dark" | "light", backgroundColor?: string, accentColor?: string, accentFillColor?: string, borderRadius?: string): Promise<void>;
    private generatePairingString;
    /**
     * Verify a signature on a message with a public key
     * @param message
     * @param signerSignature
     * @param publicKey
     * @returns
     * @example
     * ```ts
     * const verified = hashconnect.verifyMessageSignature("<message>", signerSignature);
     * ```
     * @category Signatures
     */
    verifyMessageSignature(message: string, signerSignature: SignerSignature[], publicKey: PublicKey): boolean;
}
