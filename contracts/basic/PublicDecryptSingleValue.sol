// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, uint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Public Decrypt Single Value Example
/// @notice Demonstrates public decryption of a single encrypted value
contract PublicDecryptSingleValue is ZamaEthereumConfig {
  euint32 private _encryptedValue;
  uint32 public lastDecryptedValue;

  /// @notice Sets an encrypted value
  function setEncryptedValue(externalEuint32 inputValue, bytes calldata inputProof) external {
    _encryptedValue = FHE.fromExternal(inputValue, inputProof);

    FHE.allowThis(_encryptedValue);
    FHE.allow(_encryptedValue, msg.sender);
  }

  /// @notice Gets encrypted value
  function getEncryptedValue() external view returns (euint32) {
    return _encryptedValue;
  }

  /// @notice Publicly decrypts the value (reveals it on-chain)
  /// @dev This reveals the value to everyone - use carefully!
  function publicDecrypt() external {
    // ✅ CORRECT: Using FHE.decrypt for public decryption
    lastDecryptedValue = FHE.decrypt(_encryptedValue);
  }

  /// @notice Gets the last publicly decrypted value
  function getLastDecryptedValue() external view returns (uint32) {
    return lastDecryptedValue;
  }
}
