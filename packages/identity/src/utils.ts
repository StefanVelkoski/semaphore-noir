// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { BarretenbergWasm, SinglePedersen } from '@noir-lang/barretenberg';
import { BigNumber } from "@ethersproject/bignumber"
import { randomBytes } from "@ethersproject/random"
import { serialise_public_inputs } from '@noir-lang/aztec_backend';


/**
 * Serialise inputs to hash function.
 * @param values Input values.
 * @returns Buffer.
 */
export function serialiseInputs(values: bigint[]) {
    return values.map(v => {
      const hex = v.toString(16);
      const paddedHex = hex.length % 2 === 0 ? '0x' + hex : '0x0' + hex;
      return Buffer.from(serialise_public_inputs([paddedHex]));
    });
}

/**
 * Generates a random big number.
 * @param numberOfBytes The number of bytes of the number.
 * @returns The generated random number.
 */
export function genRandomNumber(numberOfBytes = 31): bigint {
    return BigNumber.from(randomBytes(numberOfBytes)).toBigInt()
}

/**
 * Generates the identity commitment from trapdoor and nullifier.
 * @param nullifier The identity nullifier.
 * @param trapdoor The identity trapdoor.
 * @returns identity commitment
 */
export function generateCommitment(wasm: BarretenbergWasm, nullifier: bigint, trapdoor: bigint): bigint {
    const pedersen = new SinglePedersen(wasm)
    const secret = pedersen.compressInputs(serialiseInputs([nullifier, trapdoor]))
    return BigInt(`0x${pedersen.compressInputs([secret]).toString('hex')}`)
}

/**
 * Checks if a string is a JSON.
 * @param jsonString The JSON string.
 * @returns True or false.
 */
export function isJsonArray(jsonString: string) {
    try {
        return Array.isArray(JSON.parse(jsonString))
    } catch (error) {
        return false
    }
}
