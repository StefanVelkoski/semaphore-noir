import { expect } from "chai";
import hre from "hardhat";
import fs from "fs";

describe("Offchain Proof generation", function () {
    it("should verify a vaild proof", async function () {
        const proof = fs.readFileSync('./proofs/Semaphore.proof')

        const external_nullifier = "0x0000000000000000000000000000000000000000000000000000000000000001"
        const root = "0x0c05082ad2d2909e3ed93657640b6e2f28dd284d5872c167cbe72258d5e4bed4"
        const nullifier_hash = "0x1fdd4bafa61f05bd48d77bd6b7ea24249e9cf2f2c9d13b074319b376f8581f2e"
        const signal_hash = "0x0000000000000000000000000000000000000000000000000000000000000001"

        const verifier = await ethers.deployContract("UltraVerifier");
        const result = await verifier.verify(
            '0x' + proof.toString(),
            [external_nullifier, root, nullifier_hash, signal_hash]
        );

        expect(result).to.equal(true);
    });

    it("should revert with invalid inputs", async function () {
        const proof = fs.readFileSync('./proofs/Semaphore.proof')

        const external_nullifier = "0x0000000000000000000000000000000000000000000000000000000000000009"
        const root = "0x0c05082ad2d2909e3ed93657640b6e2f28dd284d5872c167cbe72258d5e4bed4"
        const nullifier_hash = "0x1fdd4bafa61f05bd48d77bd6b7ea24249e9cf2f2c9d13b074319b376f8581f2e"
        const signal_hash = "0x0000000000000000000000000000000000000000000000000000000000000001"

        const verifier = await ethers.deployContract("UltraVerifier");
        await expect(verifier.verify(
            '0x' + proof.toString(),
            [external_nullifier, root, nullifier_hash, signal_hash]
        )).to.be.revertedWithCustomError(verifier, "PROOF_FAILURE")

    });
});

