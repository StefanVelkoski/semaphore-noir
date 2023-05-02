// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { BarretenbergWasm } from '@noir-lang/barretenberg';
import { BigNumber } from "@ethersproject/bignumber"
import { expect } from "chai";
import Identity from './identity';

describe("Identity", () => {
    let wasm: BarretenbergWasm

    beforeAll(async () => {
      wasm = await BarretenbergWasm.new()
      await wasm.init()
    });

    describe("# Identity", () => {
        it("Should not create a identity if the parameter is not valid", () => {
            const fun1 = () => new Identity(wasm, 13 as any)
            const fun2 = () => new Identity(wasm, true as any)
            const fun3 = () => new Identity(wasm, (() => true) as any)

            expect(fun1).to.throw("Parameter 'identityOrMessage' is not a string")
            expect(fun2).to.throw("Parameter 'identityOrMessage' is not a string")
            expect(fun3).to.throw("Parameter 'identityOrMessage' is not a string")
        })

        it("Should create random identities", () => {
            const identity1 = new Identity(wasm)
            const identity2 = new Identity(wasm)

            expect(identity1.trapdoor).not.to.equal(identity2.getTrapdoor())
            expect(identity1.nullifier).not.to.equal(identity2.getNullifier())
            expect(identity1.commitment).not.to.equal(identity2.getCommitment())
        })

        it("Should create deterministic identities from a message", () => {
            const identity1 = new Identity(wasm, "message")
            const identity2 = new Identity(wasm, "message")

            expect(identity1.trapdoor).to.equal(identity2.getTrapdoor())
            expect(identity1.nullifier).to.equal(identity2.getNullifier())
        })

        it("Should create deterministic identities from number/boolean messages", () => {
            const identity1 = new Identity(wasm, "true")
            const identity2 = new Identity(wasm, "true")
            const identity3 = new Identity(wasm, "7")
            const identity4 = new Identity(wasm, "7")

            expect(identity1.trapdoor).to.equal(identity2.getTrapdoor())
            expect(identity1.nullifier).to.equal(identity2.getNullifier())
            expect(identity3.trapdoor).to.equal(identity4.getTrapdoor())
            expect(identity3.nullifier).to.equal(identity4.getNullifier())
        })

        it("Should not recreate an existing invalid identity", () => {
            const fun = () => new Identity(wasm, '[true, "01323"]')

            expect(fun).to.throw("invalid BigNumber string")
        })

        it("Should recreate an existing identity", () => {
            const identity1 = new Identity(wasm, "message")

            const identity2 = new Identity(wasm, identity1.toString())

            expect(identity1.trapdoor).to.equal(identity2.getTrapdoor())
            expect(identity1.nullifier).to.equal(identity2.getNullifier())
        })
    })

    describe("# getTrapdoor", () => {
        it("Should return the identity trapdoor", () => {
            const identity = new Identity(wasm, "message")

            const trapdoor = identity.getTrapdoor()

            expect(trapdoor).to.equal(BigInt("17906236466232737907147794441632041075753380435188700290746684527271267571831"))
        })
    })

    describe("# getNullifier", () => {
        it("Should return the identity nullifier", () => {
            const identity = new Identity(wasm, "message")

            const nullifier = identity.getNullifier()

            expect(nullifier).to.equal(BigInt("2874742421306248266628040105635469475888107352869673830515298074477987992445"))
        })
    })

    describe("# generateCommitment", () => {
        it("Should generate an identity commitment", () => {
            const { commitment } = new Identity(wasm, "message")

            expect(commitment).to.equal(
                BigInt("17525199588821982821312494017465230643053253141665177985750241965577183956036")
            )
        })
    })

    describe("# toString", () => {
        it("Should return a string", () => {
            const identity = new Identity(wasm, "message")

            const identityString = identity.toString()

            expect(typeof identityString).to.equal("string")
        })

        it("Should return a valid identity string", () => {
            const identity = new Identity(wasm, "message")

            const [trapdoor, nullifier] = JSON.parse(identity.toString())

            expect(BigNumber.from(`0x${trapdoor}`).toBigInt()).to.equal(identity.trapdoor)
            expect(BigNumber.from(`0x${nullifier}`).toBigInt()).to.equal(identity.nullifier)
        })
    })
})
