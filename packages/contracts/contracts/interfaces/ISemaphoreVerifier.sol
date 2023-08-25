//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "../base/Pairing.sol";

/// @title SemaphoreVerifier contract interface.
interface ISemaphoreVerifier {
    struct VerificationKey {
        Pairing.G1Point alfa1;
        Pairing.G2Point beta2;
        Pairing.G2Point gamma2;
        Pairing.G2Point delta2;
        Pairing.G1Point[] IC;
    }

    struct Proof {
        Pairing.G1Point A;
        Pairing.G2Point B;
        Pairing.G1Point C;
    }

    /// @dev Verifies whether a Semaphore proof is valid.
    /// @param _proof: ZK proof
    /// @param _publicInputs: [...inputs]
    function verify(
        bytes calldata _proof,
        bytes32[] calldata _publicInputs
    ) external view returns (bool);
}
