import {
  setup_generic_prover_and_verifier,
  create_proof,
  verify_proof,
} from "@noir-lang/barretenberg";
import { compile, acir_read_bytes } from "@noir-lang/noir_wasm";
import { serialise_public_inputs } from "@noir-lang/aztec_backend";
import path from "path";
import { expect } from "chai";
import { promisify } from "node:util";
import { exec } from "child_process";
import json2toml from "json2toml";
import fs from "fs";

import { Group } from "@semaphore-protocol/group";
import { Identity } from "@semaphore-protocol/identity";

import hash, { pedersenFactory } from "./hash.ts";
import { type HashFunction } from "./types.ts";


const promiseExec = promisify(exec);

// TODO: share serialisation functions accross files
// to specify the value of a single field we can set an array of len == 1 in the abi
function serialiseInputs(values: bigint[]): string[] {
  return values.map((v) => {
    const hex = v.toString(16);
    const paddedHex = hex.length % 2 === 0 ? "0x" + hex : "0x0" + hex;
    return (
      "0x" + Buffer.from(serialise_public_inputs([paddedHex])).toString("hex")
    );
  });
}

describe("Offchain Proof generation", function () {
  let pedersen: HashFunction;

  beforeAll(async () => {
    pedersen = await pedersenFactory();
  });

  
    it("Should not prove and verify proof using abi and nargo compile, prove and verify commands", async function () {
    const identity = new Identity(pedersen, "message");
    const identity2 = new Identity(pedersen, "message2");
    const identity3 = new Identity(pedersen, "message3");
    const identity4 = new Identity(pedersen, "message4");
    const identity5 = new Identity(pedersen, "message5");
      
    const group = new Group(pedersen, 1, 20);

      group.addMember(identity.getCommitment());
      group.addMember(identity2.getCommitment())
      group.addMember(identity3.getCommitment())
      group.addMember(identity4.getCommitment())
      group.addMember(identity5.getCommitment())

    const merkleProof = group.generateMerkleProof(group.indexOf(identity.getCommitment()));

    const indices = BigInt(Number.parseInt(merkleProof.pathIndices.join(''), 2))

    // using wrong id_trapdoor
    const abi = {
      id_nullifier: serialiseInputs([identity.getNullifier()])[0],
      id_trapdoor: serialiseInputs([identity.getNullifier()])[0],
      indices: serialiseInputs([indices])[0],
      siblings: serialiseInputs(merkleProof.siblings),
      external_nullifier: serialiseInputs([1n])[0],
      root: serialiseInputs([merkleProof.root])[0],
      nullifier_hash: serialiseInputs([pedersen([1n, identity.getNullifier()])])[0],
      signal_hash: serialiseInputs([1n])[0],
    };

    fs.writeFileSync(`${__dirname}/../Prover.toml`, json2toml(abi));

    // it will compile
    await promiseExec(`cd ${__dirname}/../ && nargo compile main`)

    let stderr;
      try {
      // failing to prove
      await promiseExec(`cd ${__dirname}/../ && nargo prove p`)
      await promiseExec(`cd ${__dirname}/../ && nargo verify p`)

    } catch (error) {
      stderr = error
    }
      
    expect(stderr).to.not.equal('');
  });


  
  it("Should prove and verify proof using abi and nargo compile, prove and verify commands", async function () {
    const identity = new Identity(pedersen, "message");
    const group = new Group(pedersen, 1, 16);

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
      nullifier_hash: serialiseInputs([pedersen([1n, identity.getNullifier()])])[0],
      signal_hash: serialiseInputs([1n])[0],
    };

    // the following lines should be changed as soon as noir is updated by changing nargo cli to ts
    fs.writeFileSync(`${__dirname}/../Prover.toml`, json2toml(abi));

    await promiseExec(`cd ${__dirname}/../ && nargo compile main`)
    await promiseExec(`cd ${__dirname}/../ && nargo prove p`)


    const { stderr } = await promiseExec(`cd ${__dirname}/../ && nargo verify p`)

    expect(stderr).to.equal('');
  });

  



});
