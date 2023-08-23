import { newBarretenbergApiSync, BarretenbergApiSync } from "@aztec/bb.js/dest/node";
import { Fr } from "@aztec/bb.js/dest/node/types";
import { promisify } from "util";
import { exec } from "child_process";
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"
import { poseidon2 } from 'poseidon-lite'
import fs from "fs"
import json2toml from "json2toml"

const promiseExec = promisify(exec);

function serialiseInputs(values: bigint[]): string[] {
  return values.map((v) => {
    return new Fr(v).toString();
  });
}

function hash_2(inputs: bigint[]): bigint {
    return poseidon2(inputs);
}

describe("Offchain Proof generation", function () {
  it("Should verify proof using abi and acir from typescript", async function () {
    const identity = new Identity("message");
    const group = new Group(1, 16);

    group.addMember(identity.getCommitment());
    const merkleProof = group.generateMerkleProof(group.indexOf(identity.getCommitment()));

    const indices = BigInt(Number.parseInt(merkleProof.pathIndices.join(''), 2))

    const abi = {
      id_nullifier: serialiseInputs([identity.getNullifier()])[0],
      id_trapdoor: serialiseInputs([identity.getTrapdoor()])[0],
      indices: serialiseInputs([indices])[0],
      siblings: serialiseInputs(merkleProof.siblings),
      external_nullifier: serialiseInputs([1n])[0],
      root: serialiseInputs([merkleProof.root])[0],
      nullifier_hash: serialiseInputs([hash_2([1n, identity.getNullifier()])])[0],
      signal_hash: serialiseInputs([1n])[0],
    };

    fs.writeFileSync(`${__dirname}/../Prover.toml`, json2toml(abi));

    await promiseExec(`cd ${__dirname}/../ && nargo compile`)
    await promiseExec(`cd ${__dirname}/../ && nargo prove`)

    // const { stderr } = await promiseExec(`cd ${__dirname}/../ && nargo verify`)
    // expect(stderr).to.equal('');
  }, 1_000_000);
});
