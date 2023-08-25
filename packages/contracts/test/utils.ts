import { Identity } from "@semaphore-protocol/identity"
import { poseidon2 } from 'poseidon-lite'
import { promisify } from "util";
import { exec } from "child_process";
import json2toml from "json2toml"
import fs from "fs"

const promiseExec = promisify(exec);

// eslint-disable-next-line import/prefer-default-export
export function createIdentityCommitments(n: number): bigint[] {
    const identityCommitments: bigint[] = []

    for (let i = 0; i < n; i += 1) {
        const { commitment } = new Identity(i.toString())

        identityCommitments.push(commitment)
    }

    return identityCommitments
}

export function hash_2(inputs: bigint[]): bigint {
    return poseidon2(inputs);
}

export function serialiseInputs(values: bigint[]): string[] {
  return values.map((v) => {
    const hex = v.toString(16);
    return hex.length % 2 === 0 ? "0x" + hex : "0x0" + hex;
  });
}

// TODO: this is a placeholder until proof package is implemented
export async function generateProof(
    { trapdoor, nullifier, commitment }: Identity,
    groupOrMerkleProof: Group | MerkleProof,
    externalNullifier: BytesLike | Hexable | number | bigint,
    signal: BytesLike | Hexable | number | bigint,
): Promise<FullProof> {
    let merkleProof: MerkleProof

    if ("depth" in groupOrMerkleProof) {
        const index = groupOrMerkleProof.indexOf(commitment)

        if (index === -1) {
            throw new Error("The identity is not part of the group")
        }

        merkleProof = groupOrMerkleProof.generateMerkleProof(index)
    } else {
        merkleProof = groupOrMerkleProof
    }

    const indices = BigInt(Number.parseInt(merkleProof.pathIndices.join(''), 2))

    const abi = {
      id_nullifier: serialiseInputs([nullifier])[0],
      id_trapdoor: serialiseInputs([trapdoor])[0],
      indices: serialiseInputs([indices])[0],
      siblings: serialiseInputs(merkleProof.siblings),
      external_nullifier: serialiseInputs([externalNullifier])[0],
      root: serialiseInputs([merkleProof.root])[0],
      nullifier_hash: serialiseInputs([hash_2([externalNullifier, nullifier])])[0],
      signal_hash: serialiseInputs([signal])[0],
    };

    fs.writeFileSync(`${__dirname}/../../circuits/Prover.toml`, json2toml(abi));

    console.log("\t--> nargo compile")
    await promiseExec(`cd ${__dirname}/../../circuits && nargo compile`)
    console.log("\t--> nargo prove")
    await promiseExec(`cd ${__dirname}/../../circuits && nargo prove`)
    console.log("\t--> created proof")

    const proofBytes = fs.readFileSync(`${__dirname}/../../circuits/proofs/circuits.proof`)

    const fullProof: FullProof = {
        merkleTreeRoot: abi.root,
        signal: abi.signal_hash,
        nullifierHash: abi.nullifier_hash,
        externalNullifier: abi.external_nullifier,
        proof: '0x' + proofBytes.toString()
    }

    return Promise.resolve(fullProof)

}
