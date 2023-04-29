// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { BarretenbergWasm } from '@noir-lang/barretenberg';
import { IncrementalMerkleTree, MerkleProof } from "@zk-kit/incremental-merkle-tree"
import hash from "./hash"
import { BigNumberish, Node, HashFunction } from "./types/index"



export default class Group {
    private _id: BigNumberish
    private _wasm: BarretenbergWasm

    merkleTree: IncrementalMerkleTree

    /**
     * Initializes the group with the group id and the tree depth.
     * @param id Group identifier.
     * @param treeDepth Tree depth.
     */
    constructor(wasm: BarretenbergWasm, id: BigNumberish, treeDepth = 20) {
        if (treeDepth < 16 || treeDepth > 32) {
            throw new Error("The tree depth must be between 16 and 32")
        }

        this._wasm = wasm
        this._id = id

        const pedersen = this.pedersenFactory()
        this.merkleTree = new IncrementalMerkleTree(pedersen, treeDepth, hash(this._wasm, id.toString()), 2)
    }

    
    private pedersenFactory(): HashFunction {
      return (preimage: Node[]): Node => hash(this._wasm, preimage.toString())
    }

    /**
     * Returns the id of the group.
     * @returns Group id.
     */
    get id(): BigNumberish {
        return this._id
    }

    /**
     * Returns the root hash of the tree.
     * @returns Root hash.
     */
    get root(): BigNumberish {
        return this.merkleTree.root
    }

    /**am   t   
     * Returns the depth of the tree.
     * @returns Tree depth.
     */
    get depth(): number {
        return this.merkleTree.depth
    }

    /**
     * Returns the zero value of the tree.
     * @returns Tree zero value.
     */
    get zeroValue(): BigNumberish {
        return this.merkleTree.zeroes[0]
    }

    /**
     * Returns the members (i.e. identity commitments) of the group.
     * @returns List of members.
     */
    get members(): BigNumberish[] {
        return this.merkleTree.leaves
    }

    /**
     * Returns the index of a member. If the member does not exist it returns -1.
     * @param member Group member.
     * @returns Index of the member.
     */
    indexOf(member: BigNumberish): number {
        return this.merkleTree.indexOf(member)
    }

    /**
     * Adds a new member to the group.
     * @param member New member.
     */
    addMember(member: BigNumberish) {
        this.merkleTree.insert(BigInt(member))
    }

    /**
     * Adds new members to the group.
     * @param members New members.
     */
    addMembers(members: BigNumberish[]) {
        for (const member of members) {
            this.addMember(member)
        }
    }

    /**
     * Updates a member in the group.
     * @param index Index of the member to be updated.
     * @param member New member value.
     */
    updateMember(index: number, member: BigNumberish) {
        this.merkleTree.update(index, member)
    }

    /**
     * Removes a member from the group.
     * @param index Index of the member to be removed.
     */
    removeMember(index: number) {
        this.merkleTree.delete(index)
    }

    /**
     * Creates a proof of membership.
     * @param index Index of the proof's member.
     * @returns Proof object.
     */
    generateMerkleProof(index: number): MerkleProof {
        const merkleProof = this.merkleTree.createProof(index)

        merkleProof.siblings = merkleProof.siblings.map((s) => s[0])

        return merkleProof
    }
}