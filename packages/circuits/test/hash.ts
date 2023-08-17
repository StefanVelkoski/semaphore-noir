// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { BarretenbergWasm, SinglePedersen } from "@noir-lang/barretenberg";
import { serialise_public_inputs } from "@noir-lang/aztec_backend";
import { type HashFunction, type Node } from "./types.ts";
import { newBarretenbergApiSync, BarretenbergApiSync } from "@aztec/bb.js/dest/node";
import { Fr } from "@aztec/bb.js/dest/node/types";

/**
 * Serialises an array of bigints to be hashed with pedersen
 * @param message The values to be hashed.
 * @returns The serialised values.
 */
export function serialiseInputs(values: bigint[]): Fr[] {
  return values.map((v) => {
    return new Fr(v)
  });
}

/**
 * Creates a pedersen hash of a message.
 * @param message The message to be hashed.
 * @returns The message digest.
 */
export default function hash(
  wasm: BarretenbergApiSync,
  preimage: bigint[]
): bigint {

  const hash = wasm.pedersenPlookupCompress(serialiseInputs(preimage));

  console.log({ input: serialiseInputs(preimage) });
  console.log({ pedersenHashMultiple: wasm.pedersenHashMultiple(serialiseInputs(preimage)) });
  console.log({ pedersenCompress: wasm.pedersenCompress(serialiseInputs(preimage)) });
  console.log({ pedersenPlookupCompress: wasm.pedersenPlookupCompress(serialiseInputs(preimage)) });
  console.log({ pedersenCommit: wasm.pedersenCommit(serialiseInputs(preimage)) });
  console.log({ pedersenPlookupCommit: wasm.pedersenPlookupCommit(serialiseInputs(preimage)) });


  return BigInt(`${hash.toString("hex")}`);
}

/**
 * Returns a wrapped pedersen hash function to match HashFunction signature
 * @returns pedersen hash function
 */
export async function pedersenFactory(): Promise<HashFunction> {
  const wasm = await newBarretenbergApiSync(4);
  return (preimage: Node[]): Node => hash(wasm, preimage);
}
