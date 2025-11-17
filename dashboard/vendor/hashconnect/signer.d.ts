import { Client, Executable, SignerSignature, Transaction } from "@hashgraph/sdk";
import { DAppSigner } from "./dapp/DAppSigner";
export declare class HashConnectSigner extends DAppSigner {
    private readonly hederaClient;
    private openExtension;
    getClient(): Client;
    sign(messages: Uint8Array[]): Promise<SignerSignature[]>;
    signTransaction<T extends Transaction>(transaction: T): Promise<T>;
    call<RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>): Promise<OutputT>;
    populateTransaction<T extends Transaction>(transaction: T): Promise<T>;
}
