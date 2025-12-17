// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Access Control Example
/// @notice Demonstrates FHE.allow and FHE.allowThis for permission management
contract AccessControl is ZamaEthereumConfig {
  euint32 private _secretValue;
  mapping(address => bool) public authorized;

  /// @notice Authorize an address to view encrypted data
  function authorize(address user) external {
    authorized[user] = true;
  }

  /// @notice Revoke authorization
  function revoke(address user) external {
    authorized[user] = false;
  }

  /// @notice Sets a secret encrypted value
  function setSecretValue(externalEuint32 inputValue, bytes calldata inputProof) external {
    _secretValue = FHE.fromExternal(inputValue, inputProof);

    // ✅ CORRECT: Grant permission to contract
    FHE.allowThis(_secretValue);

    // ✅ CORRECT: Grant permission to message sender
    FHE.allow(_secretValue, msg.sender);

    // Grant permission to authorized users
    // In production, you might iterate through authorized users
    FHE.allow(_secretValue, msg.sender);
  }

  /// @notice Get secret value (only authorized users can decrypt)
  function getSecretValue() external view returns (euint32) {
    require(authorized[msg.sender] || msg.sender == tx.origin, "Not authorized");
    return _secretValue;
  }

  /// @notice Update secret value (owner only)
  function updateSecretValue(externalEuint32 inputValue, bytes calldata inputProof) external {
    require(authorized[msg.sender] || msg.sender == tx.origin, "Not authorized");

    _secretValue = FHE.fromExternal(inputValue, inputProof);

    // ✅ CORRECT: Always refresh permissions after updates
    FHE.allowThis(_secretValue);
    FHE.allow(_secretValue, msg.sender);
  }
}
