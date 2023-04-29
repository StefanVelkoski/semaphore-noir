// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { BarretenbergWasm, SinglePedersen } from '@noir-lang/barretenberg';
import { serialise_public_inputs } from '@noir-lang/aztec_backend';

export function serialiseInput(message: string): Buffer[] {
    // the message string can have arbitrary length
    // but the circuit can only accept 32 Byte Fields encoded as 64 char hex strings
    // which is why we have to serialise the message like this
    const splitMessage = message.match(/.{1,32}/g)

    if (!splitMessage) return [];

    return splitMessage.map(m => {
      const hex = Buffer.from(m).toString('hex') 
      const paddedHex = hex.length % 2 === 0 ? '0x' + hex : '0x0' + hex;
      return Buffer.from(serialise_public_inputs([paddedHex]));
    });
}

/**
 * Creates a pedersen hash of a message.
 * @param message The message to be hashed.
 * @returns The message digest.
 */
export default function hash(wasm: BarretenbergWasm, message: string): bigint {
    const pedersen = new SinglePedersen(wasm)

    const hash = pedersen.compressInputs(serialiseInput(message))
    return BigInt(`0x${hash.toString('hex')}`)
}
