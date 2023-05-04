import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import Identity from "./identity";
import { type HashFunction } from "./types";
import { pedersenFactory } from "./hash";

describe("Identity", () => {
  let pedersen: HashFunction;

  beforeAll(async () => {
    pedersen = await pedersenFactory();
  });

  describe("Identity", () => {
    it("Should create random identities", () => {
      const identity1 = new Identity(pedersen);
      const identity2 = new Identity(pedersen);

      expect(identity1.trapdoor).not.to.equal(identity2.getTrapdoor());
      expect(identity1.nullifier).not.to.equal(identity2.getNullifier());
      expect(identity1.commitment).not.to.equal(identity2.getCommitment());
    });

    it("Should create deterministic identities from a message", () => {
      const identity1 = new Identity(pedersen, "message");
      const identity2 = new Identity(pedersen, "message");

      expect(identity1.trapdoor).to.equal(identity2.getTrapdoor());
      expect(identity1.nullifier).to.equal(identity2.getNullifier());
    });

    it("Should create deterministic identities from number/boolean messages", () => {
      const identity1 = new Identity(pedersen, "true");
      const identity2 = new Identity(pedersen, "true");
      const identity3 = new Identity(pedersen, "7");
      const identity4 = new Identity(pedersen, "7");

      expect(identity1.trapdoor).to.equal(identity2.getTrapdoor());
      expect(identity1.nullifier).to.equal(identity2.getNullifier());
      expect(identity3.trapdoor).to.equal(identity4.getTrapdoor());
      expect(identity3.nullifier).to.equal(identity4.getNullifier());
    });

    it("Should not recreate an existing invalid identity", () => {
      const fun = (): Identity => new Identity(pedersen, '[true, "01323"]');

      expect(fun).to.throw("invalid BigNumber string");
    });

    it("Should recreate an existing identity", () => {
      const identity1 = new Identity(pedersen, "message");

      const identity2 = new Identity(pedersen, identity1.toString());

      expect(identity1.trapdoor).to.equal(identity2.getTrapdoor());
      expect(identity1.nullifier).to.equal(identity2.getNullifier());
    });
  });

  describe("getTrapdoor", () => {
    it("Should return the identity trapdoor", () => {
      const identity = new Identity(pedersen, "message");

      const trapdoor = identity.getTrapdoor();

      expect(trapdoor).to.equal(
        BigInt(
          "17906236466232737907147794441632041075753380435188700290746684527271267571831"
        )
      );
    });
  });

  describe("getNullifier", () => {
    it("Should return the identity nullifier", () => {
      const identity = new Identity(pedersen, "message");

      const nullifier = identity.getNullifier();

      expect(nullifier).to.equal(
        BigInt(
          "2874742421306248266628040105635469475888107352869673830515298074477987992445"
        )
      );
    });
  });

  describe("generateCommitment", () => {
    it("Should generate an identity commitment", () => {
      const { commitment } = new Identity(pedersen, "message");

      expect(commitment).to.equal(
        BigInt(
          "17525199588821982821312494017465230643053253141665177985750241965577183956036"
        )
      );
    });
  });

  describe("toString", () => {
    it("Should return a string", () => {
      const identity = new Identity(pedersen, "message");

      const identityString = identity.toString();

      expect(typeof identityString).to.equal("string");
    });

    it("Should return a valid identity string", () => {
      const identity = new Identity(pedersen, "message");

      const [trapdoor, nullifier]: string[] = JSON.parse(identity.toString());

      expect(BigNumber.from(`0x${trapdoor}`).toBigInt()).to.equal(
        identity.trapdoor
      );
      expect(BigNumber.from(`0x${nullifier}`).toBigInt()).to.equal(
        identity.nullifier
      );
    });
  });
});
