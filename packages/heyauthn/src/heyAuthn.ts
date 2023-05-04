// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {
    generateAuthenticationOptions,
    generateRegistrationOptions,
    GenerateRegistrationOptionsOpts as RegistrationOptions,
    GenerateAuthenticationOptionsOpts as AuthenticationOptions
} from "@simplewebauthn/server"
import { startAuthentication, startRegistration } from "@simplewebauthn/browser"
import { Identity } from "@semaphore-protocol/identity"
import { pedersenFactory } from "./hash";
import { type HashFunction } from "./types";

export default class HeyAuthn {
    private _hash: HashFunction
    private _identity: Identity


    constructor(hash: HashFunction, identity: Identity) {
        this._hash = hash,
        this._identity = identity
    }


    /**
     * Registers a new WebAuthn credential and returns its HeyAuthn instance.
     *
     * @param {GenerateRegistrationOptionsOpts} options - WebAuthn options for registering a new credential.
     * @returns A HeyAuthn instance with the newly registered credential.
     */
    public static async fromRegister(options: RegistrationOptions, hash: HashFunction) {
        const registrationOptions = generateRegistrationOptions(options)
        const { id } = await startRegistration(registrationOptions)


        const identity = new Identity(hash, id)

        return new HeyAuthn(hash, identity)
    }

    /**
     * Authenticates an existing WebAuthn credential and returns its HeyAuthn instance.
     *
     * @param {GenerateAuthenticationOptionsOpts} options - WebAuthn options for authenticating an existing credential.
     * @returns A HeyAuthn instance with the existing credential.
     */
    public static async fromAuthenticate(options: AuthenticationOptions, hash: HashFunction) {
        const authenticationOptions = generateAuthenticationOptions(options)
        const { id } = await startAuthentication(authenticationOptions)

        const identity = new Identity(hash, id)

        return new HeyAuthn(hash, identity)
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
