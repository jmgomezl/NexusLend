var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { LedgerId, PublicKey } from "@hashgraph/sdk";
export var executeWithRetriesAsync = function (func, shouldRetry, maxRetries) {
    if (maxRetries === void 0) { maxRetries = 5; }
    return __awaiter(void 0, void 0, void 0, function () {
        var retryNum, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    retryNum = 0;
                    _a.label = 1;
                case 1:
                    if (!(maxRetries > 0)) return [3 /*break*/, 6];
                    maxRetries--;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, func(retryNum)];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    err_1 = _a.sent();
                    if (maxRetries <= 0 || !shouldRetry(err_1)) {
                        throw err_1;
                    }
                    retryNum++;
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 1];
                case 6: throw new Error("Reached maximum retries and did not rethrow error... Should not have gotten here.");
            }
        });
    });
};
var ChainIdHelper = /** @class */ (function () {
    function ChainIdHelper() {
    }
    ChainIdHelper.getChainIdFromProposal = function (proposal) {
        if (!proposal.params.requiredNamespaces.hedera) {
            throw new Error("Expected hedera requiredNamespace");
        }
        if (!proposal.params.requiredNamespaces.hedera.chains ||
            proposal.params.requiredNamespaces.hedera.chains.length <= 0) {
            throw new Error("Expected hedera.chains to be populated with a value ending in :295, :296, :297, or :298");
        }
        return proposal.params.requiredNamespaces.hedera.chains[0];
    };
    ChainIdHelper.getChainIdFromSession = function (session) {
        debugger;
        if (!session.namespaces.hedera) {
            throw new Error("Expected hedera requiredNamespace");
        }
        if (!session.namespaces.hedera.chains ||
            session.namespaces.hedera.chains.length <= 0) {
            throw new Error("Expected hedera.chains to be populated with a value ending in :295, :296, :297, or :298");
        }
        return session.namespaces.hedera.chains[0];
    };
    return ChainIdHelper;
}());
export { ChainIdHelper };
export var AuthenticationHelper = /** @class */ (function () {
    function AuthenticationHelper() {
    }
    AuthenticationHelper.getPublicKey = function (ledgerId, accountId) {
        return __awaiter(this, void 0, void 0, function () {
            var ledgerIdStr, baseUrl, authToken, headers, url, json;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ledgerIdStr = ledgerId.toString();
                        baseUrl = ledgerIdStr === LedgerId.MAINNET.toString()
                            ? this.mirrorNodeBaseUrlMainnet
                            : ledgerIdStr === LedgerId.TESTNET.toString()
                                ? this.mirrorNodeBaseUrlTestnet
                                : this.mirrorNodeBaseUrlPreviewnet;
                        authToken = ledgerIdStr === LedgerId.MAINNET.toString()
                            ? this.mirrorNodeAuthTokenMainnet
                            : ledgerIdStr === LedgerId.TESTNET.toString()
                                ? this.mirrorNodeAuthTokenTestnet
                                : this.mirrorNodeAuthTokenPreviewnet;
                        headers = new Headers();
                        if (authToken) {
                            headers.append("Authorization", "Bearer ".concat(authToken));
                        }
                        url = "".concat(baseUrl, "/api/v1/accounts/").concat(accountId, "?limit=1&order=asc&transactiontype=cryptotransfer&transactions=false");
                        return [4 /*yield*/, executeWithRetriesAsync(function () { return __awaiter(_this, void 0, void 0, function () {
                                var response, json_;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, fetch(url, {
                                                headers: headers,
                                            })];
                                        case 1:
                                            response = _a.sent();
                                            if (response.status !== 200 && response.status !== 404) {
                                                throw new Error("Expected 200 or 404 status code from mirror node, got ".concat(response.status));
                                            }
                                            return [4 /*yield*/, response.json()];
                                        case 2:
                                            json_ = _a.sent();
                                            return [2 /*return*/, json_];
                                    }
                                });
                            }); }, function () { return true; }, 5)];
                    case 1:
                        json = _a.sent();
                        return [2 /*return*/, PublicKey.fromString(json.key.key)];
                }
            });
        });
    };
    AuthenticationHelper.prototype.signPayload = function (payload, privateKey) {
        var payloadBytes = new Uint8Array(Buffer.from(JSON.stringify(payload)));
        var signature = privateKey.sign(payloadBytes);
        return signature;
    };
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
    AuthenticationHelper.verifySignature = function (ledgerId, accountId, accountSignature, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var payloadBytes, accountPublicKey, accountSignatureIsValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payloadBytes = new Uint8Array(Buffer.from(JSON.stringify(payload)));
                        return [4 /*yield*/, this.getPublicKey(ledgerId, accountId)];
                    case 1:
                        accountPublicKey = _a.sent();
                        accountSignatureIsValid = accountPublicKey.verify(payloadBytes, accountSignature);
                        if (!accountSignatureIsValid) {
                            return [2 /*return*/, {
                                    isValid: false,
                                    error: "Account signature is invalid",
                                }];
                        }
                        return [2 /*return*/, { isValid: true }];
                }
            });
        });
    };
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
    AuthenticationHelper.verifyAuthenticationSignatures = function (ledgerId, accountId, accountSignature, serverSigningAccountId, serverSignature, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var accountSignatureIsValid, serverSignatureIsValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.verifySignature(ledgerId, accountId, accountSignature, payload)];
                    case 1:
                        accountSignatureIsValid = (_a.sent()).isValid;
                        return [4 /*yield*/, this.verifySignature(ledgerId, serverSigningAccountId, serverSignature, payload)];
                    case 2:
                        serverSignatureIsValid = (_a.sent()).isValid;
                        if (!accountSignatureIsValid && !serverSignatureIsValid) {
                            return [2 /*return*/, {
                                    isValid: false,
                                    error: "Account and server signatures are invalid",
                                }];
                        }
                        else if (!accountSignatureIsValid) {
                            return [2 /*return*/, {
                                    isValid: false,
                                    error: "Account signature is invalid",
                                }];
                        }
                        else if (!serverSignatureIsValid) {
                            return [2 /*return*/, {
                                    isValid: false,
                                    error: "Server signature is invalid",
                                }];
                        }
                        return [2 /*return*/, { isValid: true }];
                }
            });
        });
    };
    AuthenticationHelper.mirrorNodeBaseUrlMainnet = "https://mainnet-public.mirrornode.hedera.com";
    AuthenticationHelper.mirrorNodeBaseUrlTestnet = "https://testnet.mirrornode.hedera.com";
    AuthenticationHelper.mirrorNodeBaseUrlPreviewnet = "https://previewnet.mirrornode.hedera.com";
    AuthenticationHelper.mirrorNodeAuthTokenMainnet = "";
    AuthenticationHelper.mirrorNodeAuthTokenTestnet = "";
    AuthenticationHelper.mirrorNodeAuthTokenPreviewnet = "";
    return AuthenticationHelper;
}());
var SignClientHelper = /** @class */ (function () {
    function SignClientHelper() {
    }
    SignClientHelper.getSessionForAccount = function (signClient, ledgerId, accountId) {
        var session = signClient.session.getAll().find(function (session_) {
            var hasHederaNamespace = !!session_.namespaces.hedera;
            if (!hasHederaNamespace) {
                return false;
            }
            var chainId = ChainIdHelper.getChainIdFromSession(session_);
            var isCorrectLedgerId = chainId.includes(ledgerId.toString());
            if (!isCorrectLedgerId) {
                return false;
            }
            var account = "".concat(chainId, ":").concat(accountId);
            var hasAccountId = !!session_.namespaces.hedera.accounts.includes(account);
            if (!hasAccountId) {
                return false;
            }
            return true;
        });
        if (!session) {
            throw new Error("Signer could not find session on sign client");
        }
        return session;
    };
    SignClientHelper.getSessionForTopic = function (signClient, topic) {
        var session = signClient.session.getAll().find(function (session_) {
            return session_.topic === topic;
        });
        if (!session) {
            throw new Error("Signer could not find session on sign client");
        }
        return session;
    };
    SignClientHelper.sendAuthenticationRequest = function (signClient, ledgerId, serverSigningAccount, serverSignature, accountId, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var payload_, serverSignature_, session, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload_ = Buffer.from(JSON.stringify(payload)).toString("base64");
                        serverSignature_ = Buffer.from(serverSignature).toString("base64");
                        session = this.getSessionForAccount(signClient, ledgerId, accountId.toString());
                        return [4 /*yield*/, signClient.request({
                                topic: session.topic,
                                chainId: session.namespaces.hedera.chains[0],
                                request: {
                                    method: "hashpack_authenticate",
                                    params: {
                                        signerAccountId: accountId,
                                        serverSigningAccount: serverSigningAccount.toString(),
                                        serverSignature: serverSignature_,
                                        payload: payload_,
                                    },
                                },
                            })];
                    case 1:
                        response = (_a.sent());
                        if (typeof response === "string") {
                            throw new Error(response);
                        }
                        return [2 /*return*/, new Uint8Array(Buffer.from(response.signature, "base64"))];
                }
            });
        });
    };
    return SignClientHelper;
}());
export { SignClientHelper };
