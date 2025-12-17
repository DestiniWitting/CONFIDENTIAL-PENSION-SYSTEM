// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Arithmetic Operations
/// @notice Demonstrates FHE.add, FHE.sub, FHE.mul, FHE.div operations
contract FHEArithmetic is ZamaEthereumConfig {
  euint32 private _value;

  /// @notice Performs addition on encrypted values
  /// @param inputValue The encrypted value to add
  /// @param inputProof The input proof for verification
  function add(externalEuint32 inputValue, bytes calldata inputProof) external {
    euint32 encrypted = FHE.fromExternal(inputValue, inputProof);
    _value = FHE.add(_value, encrypted);

    FHE.allowThis(_value);
    FHE.allow(_value, msg.sender);
  }

  /// @notice Performs subtraction on encrypted values
  /// @param inputValue The encrypted value to subtract
  /// @param inputProof The input proof for verification
  function subtract(externalEuint32 inputValue, bytes calldata inputProof) external {
    euint32 encrypted = FHE.fromExternal(inputValue, inputProof);
    _value = FHE.sub(_value, encrypted);

    FHE.allowThis(_value);
    FHE.allow(_value, msg.sender);
  }

  /// @notice Performs multiplication on encrypted values
  /// @param inputValue The encrypted multiplier
  /// @param inputProof The input proof for verification
  function multiply(externalEuint32 inputValue, bytes calldata inputProof) external {
    euint32 encrypted = FHE.fromExternal(inputValue, inputProof);
    _value = FHE.mul(_value, encrypted);

    FHE.allowThis(_value);
    FHE.allow(_value, msg.sender);
  }

  /// @notice Performs division on encrypted values
  /// @param inputValue The encrypted divisor
  /// @param inputProof The input proof for verification
  function divide(externalEuint32 inputValue, bytes calldata inputProof) external {
    euint32 encrypted = FHE.fromExternal(inputValue, inputProof);
    _value = FHE.div(_value, encrypted);

    FHE.allowThis(_value);
    FHE.allow(_value, msg.sender);
  }

  /// @notice Returns the current encrypted value
  function getValue() external view returns (euint32) {
    return _value;
  }
}
