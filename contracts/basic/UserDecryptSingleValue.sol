// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title User Decrypt Single Value Example
/// @notice Demonstrates user decryption of a single encrypted value
contract UserDecryptSingleValue is ZamaEthereumConfig {
  euint32 private _encryptedValue;
  mapping(address => uint32) public decryptedValues;

  /// @notice Sets an encrypted value
  function setEncryptedValue(externalEuint32 inputValue, bytes calldata inputProof) external {
    _encryptedValue = FHE.fromExternal(inputValue, inputProof);

    // ✅ CORRECT: Grant permissions for user decryption
    FHE.allowThis(_encryptedValue);
    FHE.allow(_encryptedValue, msg.sender);
  }

  /// @notice Gets encrypted value (user can decrypt with their key)
  function getEncryptedValue() external view returns (euint32) {
    return _encryptedValue;
  }

  /// @notice Store user's decrypted value (user responsible for decryption)
  function storeDecryptedValue(uint32 decryptedValue) external {
    // ✅ CORRECT: User decrypts the value off-chain and submits plaintext
    decryptedValues[msg.sender] = decryptedValue;
  }

  /// @notice Get stored decrypted value
  function getDecryptedValue(address user) external view returns (uint32) {
    return decryptedValues[user];
  }
}
