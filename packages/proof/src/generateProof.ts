import { BigNumber } from "@ethersproject/bignumber"
import { BytesLike, Hexable } from "@ethersproject/bytes"
import { Group } from "@semaphore-protocol/group"
import type { Identity } from "@semaphore-protocol/identity"
import { MerkleProof } from "@zk-kit/incremental-merkle-tree"
import hash from "./hash"
import packProof from "./packProof"
import { FullProof, SnarkArtifacts } from "./types"
import { newBarretenbergApiSync, Crs} from '@aztec/bb.js'
import { readFileSync } from 'fs';

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

    if ("depth" in groupOrMerkleProof) {
        const index = groupOrMerkleProof.indexOf(commitment)

        if (index === -1) {
            throw new Error("The identity is not part of the group")
        }

        merkleProof = groupOrMerkleProof.generateMerkleProof(index)
    } else {
        merkleProof = groupOrMerkleProof
    }

    // const api = await newBarretenbergApiSync();
    // const acirComposer = await api.acirNewAcirComposer(0);

    // const target = JSON.parse(readFileSync('./target/circuits.json'))

    // console.log({ b: target.bytecode })
    // console.log({ w: target.witness })

    return {
        merkleTreeRoot: BigInt(0),
        nullifierHash: BigInt(0),
        signal: BigInt(0),
        externalNullifier: BigInt(0),
        proof: undefined
    }


    // return {
    //     merkleTreeRoot: publicSignals[0],
    //     nullifierHash: publicSignals[1],
    //     signal: BigNumber.from(signal).toString(),
    //     externalNullifier: BigNumber.from(externalNullifier).toString(),
    //     proof: packProof(proof)
    // }
}
