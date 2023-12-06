/* eslint-disable import/no-relative-packages */
import { BigNumber } from "@ethersproject/bignumber"
import { BytesLike, Hexable } from "@ethersproject/bytes"
import { MerkleProof } from "@zk-kit/incremental-merkle-tree"
import { FullProof, SnarkArtifacts } from "./types"
import { poseidon2 } from 'poseidon-lite'
import { Barretenberg, Fr } from '@aztec/bb.js';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir }  from '@noir-lang/noir_js';
import { CompiledCircuit, ProofData } from "@noir-lang/types"
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"

import circuit from '../target/circuits.json'


function serialiseInputs(values: bigint[]): string[] {
  return values.map((v) => new Fr(v).toString());
}

function hash2(inputs: bigint[]): bigint {
    return poseidon2(inputs);
}

/**
 * Generates a Semaphore proof.
 * @param identity The Semaphore identity.
 * @param groupOrMerkleProof The Semaphore group or its Merkle proof.
 * @param externalNullifier The external nullifier.
 * @param signal The Semaphore signal.
 * @param snarkArtifacts The SNARK artifacts.
 * @returns The Semaphore proof ready to be verified.
 */
export default async function generateProof(
    { trapdoor, nullifier, commitment }: Identity,
    groupOrMerkleProof: Group | MerkleProof,
    externalNullifier: BytesLike | Hexable | number | bigint,
    signal: BytesLike | Hexable | number | bigint,
): Promise<FullProof> {
    let merkleProof: MerkleProof
  
    const backend = new BarretenbergBackend(circuit as unknown as CompiledCircuit, { threads: 8 });
    const noir = new Noir(circuit as unknown as CompiledCircuit, backend);

 
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
      external_nullifier: serialiseInputs([1n])[0],
      root: serialiseInputs([merkleProof.root])[0],
      nullifier_hash: serialiseInputs([hash2([1n, nullifier])])[0],
      signal_hash: serialiseInputs([1n])[0],
    };

    const proof = await noir.generateFinalProof(abi)
    const verified = await noir.verifyFinalProof(proof);

    //should return true
    console.log('verified', verified)

    return {
        merkleTreeRoot: merkleProof.root,
        nullifierHash: nullifier,
        signal: BigNumber.from(signal).toString(),
        externalNullifier: BigNumber.from(externalNullifier).toString(),
        proof
    }
    
}
