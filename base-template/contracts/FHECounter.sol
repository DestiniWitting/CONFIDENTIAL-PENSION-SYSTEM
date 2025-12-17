// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title A simple FHE counter contract
/// @notice This contract demonstrates basic FHE operations
contract FHECounter is ZamaEthereumConfig {
  euint32 private _count;

  /// @notice Returns the current count
  function getCount() external view returns (euint32) {
    return _count;
  }

  /// @notice Increments the counter by a specified encrypted value
  /// @param inputEuint32 The encrypted value to add
  /// @param inputProof The input proof for verification
  function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
    euint32 encryptedValue = FHE.fromExternal(inputEuint32, inputProof);
    _count = FHE.add(_count, encryptedValue);

    FHE.allowThis(_count);
    FHE.allow(_count, msg.sender);
  }

  /// @notice Decrements the counter by a specified encrypted value
  /// @param inputEuint32 The encrypted value to subtract
  /// @param inputProof The input proof for verification
  function decrement(externalEuint32 inputEuint32, bytes calldata inputProof) external {
    euint32 encryptedValue = FHE.fromExternal(inputEuint32, inputProof);
    _count = FHE.sub(_count, encryptedValue);

    FHE.allowThis(_count);
    FHE.allow(_count, msg.sender);
  }
}
