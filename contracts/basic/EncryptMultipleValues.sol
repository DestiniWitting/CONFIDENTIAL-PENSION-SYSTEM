// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, externalEuint32, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypt Multiple Values Example
/// @notice Demonstrates how to encrypt and manage multiple values
contract EncryptMultipleValues is ZamaEthereumConfig {
  euint32 private _balance;
  euint32 private _allowance;
  euint64 private _totalSupply;

  /// @notice Initialize multiple encrypted values
  function initialize(
    externalEuint32 initialBalance,
    bytes calldata balanceProof,
    externalEuint32 initialAllowance,
    bytes calldata allowanceProof
  ) external {
    _balance = FHE.fromExternal(initialBalance, balanceProof);
    _allowance = FHE.fromExternal(initialAllowance, allowanceProof);

    // ✅ CORRECT: Grant permissions for each encrypted value
    FHE.allowThis(_balance);
    FHE.allow(_balance, msg.sender);

    FHE.allowThis(_allowance);
    FHE.allow(_allowance, msg.sender);
  }

  /// @notice Get encrypted balance
  function getBalance() external view returns (euint32) {
    return _balance;
  }

  /// @notice Get encrypted allowance
  function getAllowance() external view returns (euint32) {
    return _allowance;
  }

  /// @notice Transfer encrypted amount
  function transfer(externalEuint32 amount, bytes calldata amountProof) external {
    euint32 encryptedAmount = FHE.fromExternal(amount, amountProof);
    _balance = FHE.sub(_balance, encryptedAmount);

    FHE.allowThis(_balance);
    FHE.allow(_balance, msg.sender);
  }

  /// @notice Approve encrypted amount
  function approve(externalEuint32 amount, bytes calldata amountProof) external {
    euint32 encryptedAmount = FHE.fromExternal(amount, amountProof);
    _allowance = FHE.add(_allowance, encryptedAmount);

    FHE.allowThis(_allowance);
    FHE.allow(_allowance, msg.sender);
  }
}
