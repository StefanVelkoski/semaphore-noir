// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { BarretenbergWasm } from '@noir-lang/barretenberg';
import {
    generateAuthenticationOptions,
    generateRegistrationOptions,
    GenerateRegistrationOptionsOpts as RegistrationOptions,
    GenerateAuthenticationOptionsOpts as AuthenticationOptions
} from "@simplewebauthn/server"
import { startAuthentication, startRegistration } from "@simplewebauthn/browser"
import { Identity } from "@semaphore-protocol/identity"

export default class HeyAuthn {
    private _wasm: BarretenbergWasm
    private _identity: Identity


    constructor(wasm: BarretenbergWasm, identity: Identity) {
        this._wasm = wasm,
        this._identity = identity
    }


    /**
     * Registers a new WebAuthn credential and returns its HeyAuthn instance.
     *
     * @param {GenerateRegistrationOptionsOpts} options - WebAuthn options for registering a new credential.
     * @returns A HeyAuthn instance with the newly registered credential.
     */
    public static async fromRegister(options: RegistrationOptions) {
        let wasm: BarretenbergWasm

        wasm = await BarretenbergWasm.new()
        await wasm.init()

        const registrationOptions = generateRegistrationOptions(options)
        const { id } = await startRegistration(registrationOptions)


        const identity = new Identity(wasm, id)

        return new HeyAuthn(wasm, identity)
    }

    /**
     * Authenticates an existing WebAuthn credential and returns its HeyAuthn instance.
     *
     * @param {GenerateAuthenticationOptionsOpts} options - WebAuthn options for authenticating an existing credential.
     * @returns A HeyAuthn instance with the existing credential.
     */
    public static async fromAuthenticate(options: AuthenticationOptions) {
        let wasm: BarretenbergWasm

        wasm = await BarretenbergWasm.new()
        await wasm.init()
        const authenticationOptions = generateAuthenticationOptions(options)
        const { id } = await startAuthentication(authenticationOptions)

        const identity = new Identity(wasm, id)

        return new HeyAuthn(wasm, identity)
    }

    /**
     * Returns the Semaphore identity instance.
     * @returns The Semaphore identity.
     */
    public get identity(): Identity {
        return this._identity
    }

    /**
     * Returns the Semaphore identity instance.
     * @returns The Semaphore identity.
     */
    public getIdentity(): Identity {
        return this._identity
    }
}