export type BigNumberish = string | number | bigint;

export type Node = bigint;

export type HashFunction = (values: Node[]) => Node;

export interface MerkleProof {
  root: bigint;
  leaf: bigint;
  siblings: bigint[];
  pathIndices: number[];
}
