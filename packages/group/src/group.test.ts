// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { BarretenbergWasm } from '@noir-lang/barretenberg';
import Group from "./group"
import hash from "./hash"
import { expect } from "chai";

describe("Group", () => {
    let wasm: BarretenbergWasm

    before(async () => {
      wasm = await BarretenbergWasm.new()
      await wasm.init()
    });
    describe("# Group", () => {
        it("Should create a group", () => {
            const group = new Group(wasm, 1)
    
            expect(group.id).to.equal(1)
            expect(group.root.toString()).to.contain("246106")
            expect(group.depth).to.equal(20)
            expect(group.zeroValue).to.equal(hash(wasm, '1'))
            expect(group.members.length).to.equal(0)
        })

        it("Should not create a group with a wrong tree depth", () => {
            const fun = () => new Group(wasm, 1, 33)

            expect(fun).to.throw("The tree depth must be between 16 and 32")
        })

        it("Should create a group with different parameters", () => {
            const group = new Group(wasm, 2, 32)

            expect(group.root.toString()).to.contain("1558831")
            expect(group.depth).to.equal(32)
            expect(group.zeroValue).to.equal(hash(wasm, '2'))
            expect(group.members.length).to.equal(0)
        })
    })

    describe("# addMember", () => {
        it("Should add a member to a group", () => {
            const group = new Group(wasm, 1)

            group.addMember(BigInt(3))

            expect(group.members.length).to.equal(1)
        })
    })

    describe("# addMembers", () => {
        it("Should add many members to a group", () => {
            const group = new Group(wasm, 1)

            group.addMembers([BigInt(1), BigInt(3)])

            expect(group.members.length).to.equal(2)
        })
    })

    describe("# indexOf", () => {
        it("Should return the index of a member in a group", () => {
            const group = new Group(wasm, 1)
            group.addMembers([BigInt(1), BigInt(3)])

            const index = group.indexOf(BigInt(3))

            expect(index).to.equal(1)
        })
    })

    describe("# updateMember", () => {
        it("Should update a member in a group", () => {
            const group = new Group(wasm, 1)
            group.addMembers([BigInt(1), BigInt(3)])

            group.updateMember(0, BigInt(1))

            expect(group.members.length).to.equal(2)
            expect(group.members[0]).to.equal(BigInt(1))
        })
    })

    describe("# removeMember", () => {
        it("Should remove a member from a group", () => {
            const group = new Group(wasm, 1)
            group.addMembers([BigInt(1), BigInt(3)])

            group.removeMember(0)

            expect(group.members.length).to.equal(2)
            expect(group.members[0]).to.equal(group.zeroValue)
        })
    })

    describe("# generateMerkleProof", () => {
        it("Should create deterministic root", () => {
            const groupA = new Group(wasm, 1)
            const groupB = new Group(wasm, 1)

            groupA.addMembers([BigInt(1), BigInt(3)])
            groupB.addMembers([BigInt(1), BigInt(3)])

            expect(groupA.members.length).to.equal(2)
            expect(groupB.members.length).to.equal(2)

            expect(groupA.root).to.equal(groupB.root)
        })

        it("Should generate a proof of membership", () => {
            const group = new Group(wasm, 1)
            group.addMembers([BigInt(1), BigInt(3)])

            const proof = group.generateMerkleProof(0)

            expect(proof.leaf).to.equal(BigInt(1))
        })
    })
})
