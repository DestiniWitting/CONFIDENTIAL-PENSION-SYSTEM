// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypt Single Value Example
/// @notice Demonstrates how to encrypt and store a single value
contract EncryptSingleValue is ZamaEthereumConfig {
  euint32 private _encryptedValue;

  /// @notice Sets an encrypted value
  /// @param inputValue The encrypted value
  /// @param inputProof The input proof for verification
  function setEncryptedValue(externalEuint32 inputValue, bytes calldata inputProof) external {
    _encryptedValue = FHE.fromExternal(inputValue, inputProof);

    // ✅ CORRECT: Always grant both permissions
    FHE.allowThis(_encryptedValue);
    FHE.allow(_encryptedValue, msg.sender);
  }

  /// @notice Gets the encrypted value (user can decrypt with their key)
  function getEncryptedValue() external view returns (euint32) {
    return _encryptedValue;
  }

  /// @notice Adds to the encrypted value
  /// @param inputValue The value to add
  /// @param inputProof The input proof for verification
  function addToEncryptedValue(externalEuint32 inputValue, bytes calldata inputProof) external {
    euint32 encrypted = FHE.fromExternal(inputValue, inputProof);
    _encryptedValue = FHE.add(_encryptedValue, encrypted);

    FHE.allowThis(_encryptedValue);
    FHE.allow(_encryptedValue, msg.sender);
  }
}
