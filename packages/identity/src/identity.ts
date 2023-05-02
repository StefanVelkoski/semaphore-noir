// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { BarretenbergWasm } from '@noir-lang/barretenberg';
import { BigNumber } from "@ethersproject/bignumber"
import checkParameter from "./checkParameter"
import hash from "./hash"
import { generateCommitment, genRandomNumber, isJsonArray } from "./utils"

export default class Identity {
    private _trapdoor: bigint
    private _nullifier: bigint
    private _secret: bigint
    private _commitment: bigint
    private _wasm: BarretenbergWasm

    /**
     * Initializes the class attributes based on the strategy passed as parameter.
     * @param identityOrMessage Additional data needed to create identity for given strategy.
     */
    constructor(wasm: BarretenbergWasm, identityOrMessage?: string) {
        this._wasm = wasm

        if (identityOrMessage === undefined) {
            this._trapdoor = genRandomNumber()
            this._nullifier = genRandomNumber()
            this._commitment = generateCommitment(this._wasm, this._nullifier, this._trapdoor)

            return
        }

        checkParameter(identityOrMessage, "identityOrMessage", "string")

        if (!isJsonArray(identityOrMessage)) {
            const messageHash = hash(this._wasm, identityOrMessage)

            this._trapdoor = hash(this._wasm, `${messageHash}identity_trapdoor`)
            this._nullifier = hash(this._wasm, `${messageHash}identity_nullifier`)
            this._commitment = generateCommitment(this._wasm, this._nullifier, this._trapdoor)

            return
        }

        const [trapdoor, nullifier] = JSON.parse(identityOrMessage)

        this._trapdoor = BigNumber.from(`0x${trapdoor}`).toBigInt()
        this._nullifier = BigNumber.from(`0x${nullifier}`).toBigInt()
        this._commitment = generateCommitment(this._wasm, this._nullifier, this._trapdoor)
    }

    /**
     * Returns the identity trapdoor.
     * @returns The identity trapdoor.
     */
    public get trapdoor(): bigint {
        return this._trapdoor
    }

    /**
     * Returns the identity trapdoor.
     * @returns The identity trapdoor.
     */
    public getTrapdoor(): bigint {
        return this._trapdoor
    }

    /**
     * Returns the identity nullifier.
     * @returns The identity nullifier.
     */
    public get nullifier(): bigint {
        return this._nullifier
    }

    /**
     * Returns the identity nullifier.
     * @returns The identity nullifier.
     */
    public getNullifier(): bigint {
        return this._nullifier
    }

    /**
     * Returns the identity secret.
     * @returns The identity secret.
     */
    public get secret(): bigint {
        return this._secret
    }

    /**
     * Returns the identity secret.
     * @returns The identity secret.
     */
    public getSecret(): bigint {
        return this._secret
    }

    /**
     * Returns the identity commitment.
     * @returns The identity commitment.
     */
    public get commitment(): bigint {
        return this._commitment
    }

    /**
     * Returns the identity commitment.
     * @returns The identity commitment.
     */
    public getCommitment(): bigint {
        return this._commitment
    }

    /**
     * Returns a JSON string with trapdoor and nullifier. It can be used
     * to export the identity and reuse it later.
     * @returns The string representation of the identity.
     */
    public toString(): string {
        return JSON.stringify([this._trapdoor.toString(16), this._nullifier.toString(16)])
    }
}
