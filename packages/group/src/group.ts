import {
  IncrementalMerkleTree,
  type MerkleProof,
} from "@zk-kit/incremental-merkle-tree";

import { type BigNumberish, type HashFunction } from "./types/index.ts";

export default class Group {
  private readonly _id: BigNumberish;
  merkleTree: IncrementalMerkleTree;

  /**
   * Initializes the group with the group id and the tree depth.
   * @param id Group identifier.
   * @param treeDepth Tree depth.
   */
  constructor(hash: HashFunction, id: BigNumberish, treeDepth = 20) {
    if (treeDepth < 16 || treeDepth > 32) {
      throw new Error("The tree depth must be between 16 and 32");
    }

    this._id = id;

    this.merkleTree = new IncrementalMerkleTree(
      hash,
      treeDepth,
      hash([BigInt(id)]),
      2
    );
  }

  /**
   * Returns the id of the group.
   * @returns Group id.
   */
  get id(): BigNumberish {
    return this._id;
  }

  /**
   * Returns the root hash of the tree.
   * @returns Root hash.
   */
  get root(): BigNumberish {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.merkleTree.root;
  }

  /**
   * Returns the depth of the tree.
   * @returns Tree depth.
   */
  get depth(): number {
    return this.merkleTree.depth;
  }

  /**
   * Returns the zero value of the tree.
   * @returns Tree zero value.
   */
  get zeroValue(): BigNumberish {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.merkleTree.zeroes[0];
  }

  /**
   * Returns the members (i.e. identity commitments) of the group.
   * @returns List of members.
   */
  get members(): BigNumberish[] {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.merkleTree.leaves;
  }

  /**
   * Returns the index of a member. If the member does not exist it returns -1.
   * @param member Group member.
   * @returns Index of the member.
   */
  indexOf(member: BigNumberish): number {
    return this.merkleTree.indexOf(member);
  }

  /**
   * Adds a new member to the group.
   * @param member New member.
   */
  addMember(member: BigNumberish): void {
    this.merkleTree.insert(BigInt(member));
  }

  /**
   * Adds new members to the group.
   * @param members New members.
   */
  addMembers(members: BigNumberish[]): void {
    for (const member of members) {
      this.addMember(member);
    }
  }

  /**
   * Updates a member in the group.
   * @param index Index of the member to be updated.
   * @param member New member value.
   */
  updateMember(index: number, member: BigNumberish): void {
    this.merkleTree.update(index, member);
  }

  /**
   * Removes a member from the group.
   * @param index Index of the member to be removed.
   */
  removeMember(index: number): void {
    this.merkleTree.delete(index);
  }

  /**
   * Creates a proof of membership.
   * @param index Index of the proof's member.
   * @returns Proof object.
   */
  generateMerkleProof(index: number): MerkleProof {
    const merkleProof = this.merkleTree.createProof(index);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    merkleProof.siblings = merkleProof.siblings.map((s) => s[0]);

    return merkleProof;
  }
}
