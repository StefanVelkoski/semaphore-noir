import { BigNumber } from "@ethersproject/bignumber"
import { BytesLike, Hexable } from "@ethersproject/bytes"
import { Group } from "@semaphore-protocol/group"
import type { Identity } from "@semaphore-protocol/identity"
import { MerkleProof } from "@zk-kit/incremental-merkle-tree"
import packProof from "./packProof"
import { FullProof, SnarkArtifacts } from "./types"
import {
  setup_generic_prover_and_verifier,
  create_proof,
} from "@noir-lang/barretenberg";

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
    hash: HashFunction,
    noirArtifacts: any
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

    const [prover] = await setup_generic_prover_and_verifier(noirArtifacts.circuit)

    const abi = {
        identityTrapdoor: trapdoor,
        identityNullifier: nullifier,
        treePathIndices: merkleProof.pathIndices,
        treeSiblings: merkleProof.siblings,
        externalNullifier: hash(externalNullifier),
        signalHash: hash(signal)
    }

    console.log({ abi })

    const proof = await create_proof(prover, noirArtifacts.acir, abi);

    return {
        merkleTreeRoot: 0,
        nullifierHash: 0,
        signal: BigNumber.from(signal).toString(),
        externalNullifier: BigNumber.from(externalNullifier).toString(),
        proof: packProof(proof)
    }
}
