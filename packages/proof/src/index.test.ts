import { formatBytes32String } from "@ethersproject/strings"
import { expect } from "chai"
import { Group } from "@semaphore-protocol/group"
import { Identity } from "@semaphore-protocol/identity"

import calculateNullifierHash from "./calculateNullifierHash"
import generateProof from "./generateProof"
import verifyProof from "./verifyProof"
import hash from "./hash"
import { FullProof } from "./types"

describe("Proof", () => {
    const externalNullifier = formatBytes32String("Topic")
    const signal = formatBytes32String("Hello world")

    let fullProof: FullProof
    // let curve: any

    describe("# generateProof", () => {
        it('Should not generate Semaphore proofs if the identity is not part of the group', async () => {
          const group = new Group(1, 16);
          const identity = new Identity('message2');

          const fun = async () => generateProof(identity, group, externalNullifier, signal);

          try {
            await fun();
            throw new Error('Expected the promise to be rejected');
          } catch (error) {
            expect(error.message).toBe('The identity is not part of the group');
          }
        }, 200000);

        it("Should generate a Semaphore proof passing a group as parameter", async () => {
            const group = new Group(1, 16)
            const identity = new Identity("message2")

            group.addMember(identity.getCommitment())

            fullProof = await generateProof(identity, group, externalNullifier, signal)

            console.log('fullProof', fullProof)
            
        }, 200000)

        it("Should generate a Semaphore proof passing a Merkle proof as parameter", async () => {
            const group = new Group(1, 16)
            const identity = new Identity("message2")
            const identity2 = new Identity("message3")


            group.addMember(identity.getCommitment())
            group.addMember(identity2.getCommitment())

            const merkleProof = group.generateMerkleProof(group.indexOf(identity.getCommitment()))

            fullProof = await generateProof(identity, merkleProof, externalNullifier, signal)

        }, 400000)
    })

    describe("# verifyProof", () => {

        it('Should not verify a proof if the tree depth is wrong', async () => {
          const fun = () => verifyProof(fullProof, 3);

          try {
            await fun();
            throw new Error('Expected the promise to be rejected');
          } catch (error) {
            expect(error.message).toBe('The tree depth must be a number between 16 and 32');
          }
        }, 200000);

        it("Should verify a Semaphore proof", async () => {

            const response = await verifyProof(fullProof, 16)
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(response).to.be.true;
        }, 200000)
    })

    describe("# hash", () => {
        it("Should hash the signal value correctly", async () => {
            const signalHash = hash(signal)

            expect(signalHash.toString()).toBe(
                "8665846418922331996225934941481656421248110469944536651334918563951783029"
            )
        })

        it("Should hash the external nullifier value correctly", async () => {
            const externalNullifierHash = hash(externalNullifier)

            expect(externalNullifierHash.toString()).toBe(
                "244178201824278269437519042830883072613014992408751798420801126401127326826"
            )
        })

        it("Should hash a number", async () => {
            expect(hash(2).toString()).toBe(
                "113682330006535319932160121224458771213356533826860247409332700812532759386"
            )
        })

        it("Should hash a big number", async () => {
            expect(hash(BigInt(2)).toString()).toBe(
                "113682330006535319932160121224458771213356533826860247409332700812532759386"
            )
        })

        it("Should hash an hex number", async () => {
            expect(hash("0x2").toString()).toBe(
                "113682330006535319932160121224458771213356533826860247409332700812532759386"
            )
        })

        it("Should hash an string number", async () => {
            expect(hash("2").toString()).toBe(
                "113682330006535319932160121224458771213356533826860247409332700812532759386"
            )
        })

        it("Should hash an array", async () => {
            expect(hash([2]).toString()).toBe(
                "113682330006535319932160121224458771213356533826860247409332700812532759386"
            )
        })
    })



})
