import { BarretenbergBackend } from '@signorecello/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import { CompiledCircuit, ProofData } from "@noir-lang/types"
import { FullProof } from "./types"
import { Barretenberg, Fr } from '@aztec/bb.js';

// eslint-disable-next-line import/no-relative-packages
import circuit from '../target/circuits.json'

/**
 * Verifies a Semaphore proof.
 * @param fullProof The SnarkJS Semaphore proof.
 * @param treeDepth The Merkle tree depth.
 * @returns True if the proof is valid, false otherwise.
 */
export default async function verifyProof(
    { merkleTreeRoot, nullifierHash, externalNullifier, signal, proof }: FullProof,
    treeDepth: number
): Promise<boolean> {

    const backend = new BarretenbergBackend(circuit as unknown as CompiledCircuit);
    const noir = new Noir(circuit as unknown as CompiledCircuit, backend);

    
    if (treeDepth < 16 || treeDepth > 32) {
        throw new TypeError("The tree depth must be a number between 16 and 32")
    }

    const verified = await noir.verifyFinalProof(proof);

    // expect to be true
    return verified;

}
