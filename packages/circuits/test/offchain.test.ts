import {
  setup_generic_prover_and_verifier,
  create_proof,
  verify_proof,
} from "@noir-lang/barretenberg";
import { compile, acir_read_bytes } from "@noir-lang/noir_wasm";
import { serialise_public_inputs } from "@noir-lang/aztec_backend";
import path from "path";
import { describe, beforeAll, it, expect, test } from 'vitest'
import { promisify } from "node:util";
import { exec } from "child_process";
import json2toml from "json2toml";
import fs from "fs";

import { Group } from "@semaphore-protocol/group";
import { Identity } from "@semaphore-protocol/identity";

import { newBarretenbergApiSync, BarretenbergApiSync } from "@aztec/bb.js/dest/node";
import hash, { pedersenFactory } from "./hash.ts";
import { type HashFunction } from "./types.ts";
import { Fr } from "@aztec/bb.js/dest/node/types";


const promiseExec = promisify(exec);

// TODO: share serialisation functions accross files
// to specify the value of a single field we can set an array of len == 1 in the abi
function serialiseInputs(values: bigint[]): string[] {
  return values.map((v) => {
    return new Fr(v).toString();
  });
}

describe("Offchain Proof generation", function () {
  let pedersen: HashFunction;

  beforeAll(async () => {
    pedersen = await pedersenFactory();
  });

  it("Should verify proof using abi and acir from typescript", async function () {
    const identity = new Identity(pedersen, "message");
    const group = new Group(pedersen, 1, 16);

    group.addMember(identity.getCommitment());
    const merkleProof = group.generateMerkleProof(group.indexOf(identity.getCommitment()));
    // console.log({ merkleProof })

    const indices = BigInt(Number.parseInt(merkleProof.pathIndices.join(''), 2))

    const abi = {
      id_nullifier: serialiseInputs([identity.getNullifier()])[0],
      id_trapdoor: serialiseInputs([identity.getTrapdoor()])[0],
      // pub_commitment: serialiseInputs([identity.getCommitment()])[0],
      indices: serialiseInputs([indices])[0],
      siblings: serialiseInputs(merkleProof.siblings),
      external_nullifier: serialiseInputs([1n])[0],
      root: serialiseInputs([merkleProof.root])[0],
      nullifier_hash: serialiseInputs([pedersen([1n, identity.getNullifier()])])[0],
      signal_hash: serialiseInputs([1n])[0],
    };


    let s = pedersen([ identity.getNullifier(), identity.getTrapdoor() ])
    pedersen([ s ])
    console.log(identity.getNullifier())
    console.log(identity.getTrapdoor())
    console.log(identity.getCommitment())



    // let acc = merkleProof.leaf
    // for (let i = 0; i < abi.siblings.length; i++) {
    //     acc = pedersen([acc, BigInt(abi.siblings[i])])
    // }

    // console.log({ rootCheck: acc })
    console.log({ abi })

    fs.writeFileSync(`${__dirname}/../Prover.toml`, json2toml(abi));

    await promiseExec(`cd ${__dirname}/../ && nargo compile`)
    await promiseExec(`cd ${__dirname}/../ && nargo prove`)
    const { stderr } = await promiseExec(`cd ${__dirname}/../ && nargo verify`)
    expect(stderr).to.equal('');
  }, 100_000);
});
