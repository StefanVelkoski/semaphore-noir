import { expect } from "chai";
import hre from "hardhat";
import fs from "fs";

function getInputs() {
    const external_nullifier = "0x0000000000000000000000000000000000000000000000000000000000000001"
    const root = "0x15ff5170ad37dab9d375adbcc251fff24cb42b2aae3b8b0823c676ded722bb45"
    const nullifier_hash = "0x011642c4ee03316e9b1cdeb5c56eda62e66f69deb1343b258bfb60dbc8dbfe01"
    const signal_hash = "0x0000000000000000000000000000000000000000000000000000000000000001"

    return [external_nullifier, root, nullifier_hash, signal_hash]
}

describe("Onchain Proof generation", function () {
    it("should verify a vaild proof", async function () {
        const proof = fs.readFileSync('./proofs/circuits.proof')
        const verifier = await ethers.deployContract("UltraVerifier");
        const result = await verifier.verify(
            '0x' + proof.toString(),
            getInputs()
        );

        expect(result).to.equal(true);
    });

    it("should revert with invalid inputs", async function () {
        const proof = fs.readFileSync('./proofs/circuits.proof')
        const verifier = await ethers.deployContract("UltraVerifier");
        const [_, root, nullifier_hash, signal_hash] = getInputs();

        const invalid_nullifier = "0x000000000000000000000000000000000000000000000000000000000000dead";

        await expect(verifier.verify(
            '0x' + proof.toString(),
            [invalid_nullifier, root, nullifier_hash, signal_hash]
        )).to.be.revertedWithCustomError(verifier, "PROOF_FAILURE")

    });
});

