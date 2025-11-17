import { Signer, AccountBalance, AccountId, AccountInfo, Executable, Key, LedgerId, SignerSignature, Transaction, TransactionRecord } from '@hashgraph/sdk';
import { SignClient } from '@walletconnect/sign-client/dist/types/client';
export declare class DAppSigner implements Signer {
    private readonly accountId;
    readonly client: SignClient;
    readonly topic: string;
    private readonly ledgerId;
    constructor(accountId: AccountId, client: SignClient, topic: string, ledgerId?: LedgerId);
    request<T>(request: {
        method: string;
        params: any;
    }): Promise<T>;
    getAccountId(): AccountId;
    getAccountKey(): Key;
    getLedgerId(): LedgerId;
    getNetwork(): {
        [key: string]: string | AccountId;
    };
    getMirrorNetwork(): string[];
    getAccountBalance(): Promise<AccountBalance>;
    getAccountInfo(): Promise<AccountInfo>;
    getAccountRecords(): Promise<TransactionRecord[]>;
    sign(data: Uint8Array[], signOptions?: Record<string, any>): Promise<SignerSignature[]>;
    signTransaction<T extends Transaction>(transaction: T): Promise<T>;
    checkTransaction<T extends Transaction>(transaction: T): Promise<T>;
    populateTransaction<T extends Transaction>(transaction: T): Promise<T>;
    call<RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>): Promise<OutputT>;
}
