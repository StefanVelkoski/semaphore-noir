// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { BarretenbergWasm, SinglePedersen } from "@noir-lang/barretenberg";
import { serialise_public_inputs } from "@noir-lang/aztec_backend";
import { type HashFunction, type Node } from "./types.ts";

/**
 * Takes a message string and encodes it as an array of bigints.
 * @param message The message to be hashed.
 * @returns The message encoded as array of bigints.
 */
export function stringToFields(message: string): bigint[] {
  // the message string can have arbitrary length
  // but the circuit can only accept 32 Byte Fields encoded as 64 char hex strings
  // which is why we have to serialise the message like this
  const splitMessage = message.match(/.{1,32}/g);
  if (splitMessage == null) return [];

  return splitMessage.map((m) => {
    const hex = Buffer.from(m).toString("hex");
    return BigInt(`0x${hex}`);
  });
}

/**
 * Serialises an array of bigints to be hashed with pedersen
 * @param message The values to be hashed.
 * @returns The serialised values.
 */
export function serialiseInputs(values: bigint[]): Buffer[] {
  return values.map((v) => {
    const hex = v.toString(16);
    const paddedHex = hex.length % 2 === 0 ? "0x" + hex : "0x0" + hex;
    return Buffer.from(serialise_public_inputs([paddedHex]));
  });
}

/**
 * Creates a pedersen hash of a message.
 * @param message The message to be hashed.
 * @returns The message digest.
 */
export default function hash(
  wasm: BarretenbergWasm,
  preimage: bigint[]
): bigint {
  const pedersen = new SinglePedersen(wasm);

  const hash: Buffer = pedersen.compressInputs(serialiseInputs(preimage));
  return BigInt(`0x${hash.toString("hex")}`);
}

/**
 * Returns a wrapped pedersen hash function to match HashFunction signature
 * @returns pedersen hash function
 */
export async function pedersenFactory(): Promise<HashFunction> {
  const wasm = new BarretenbergWasm();
  await wasm.init();
  return (preimage: Node[]): Node => hash(wasm, preimage);
}
