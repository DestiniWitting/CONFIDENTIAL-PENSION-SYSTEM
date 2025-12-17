# FHEVM Anti-Patterns and Common Mistakes

This document highlights common mistakes when developing with FHEVM and shows the correct patterns to use instead.

## Table of Contents

1. [Missing Permission Grants](#missing-permission-grants)
2. [View Functions with Encrypted Values](#view-functions-with-encrypted-values)
3. [Incorrect Input Signer](#incorrect-input-signer)
4. [Missing Input Proofs](#missing-input-proofs)
5. [Forgetting to Refresh Permissions](#forgetting-to-refresh-permissions)
6. [Public Decryption Misuse](#public-decryption-misuse)
7. [Handle Lifecycle Issues](#handle-lifecycle-issues)

---

## 1. Missing Permission Grants

### ❌ WRONG: Missing FHE.allowThis()

```solidity
function setBadValue(externalEuint32 inputValue, bytes calldata inputProof) external {
    euint32 encrypted = FHE.fromExternal(inputValue, inputProof);
    _value = encrypted;

    // ❌ WRONG: Only granting user permission, missing contract permission
    FHE.allow(_value, msg.sender);
}
```

**Problem**: Contract cannot operate on the encrypted value in future functions.

### ✅ CORRECT: Grant Both Permissions

```solidity
function setGoodValue(externalEuint32 inputValue, bytes calldata inputProof) external {
    euint32 encrypted = FHE.fromExternal(inputValue, inputProof);
    _value = encrypted;

    // ✅ CORRECT: Grant both permissions
    FHE.allowThis(_value);        // Contract permission
    FHE.allow(_value, msg.sender); // User permission
}
```

**Why**: You must grant both `allowThis` and `allow` for the contract and user to operate on the encrypted value.

---

## 2. View Functions with Encrypted Values

### ❌ WRONG: Returning Plaintext from Encrypted

```solidity
// ❌ WRONG: Trying to decrypt in a view function
function getBalancePlaintext() external view returns (uint32) {
    return FHE.decrypt(_balance); // This won't work as expected
}
```

**Problem**: View functions cannot trigger decryption operations properly.

### ✅ CORRECT: Return Encrypted Handle

```solidity
// ✅ CORRECT: Return the encrypted handle
function getBalance() external view returns (euint32) {
    return _balance; // User decrypts off-chain with their key
}
```

**Why**: Users should decrypt encrypted values off-chain using their private key. For public decryption, use a state-modifying function.

---

## 3. Incorrect Input Signer

### ❌ WRONG: Mismatched Signer

```typescript
// ❌ WRONG: Alice creates input but Bob sends transaction
const input = await fhevm.createEncryptedInput(contractAddr, alice.address);
input.add32(100);
const encrypted = await input.encrypt();

// Bob cannot use Alice's encrypted input!
await contract.connect(bob).setValue(encrypted.handles[0], encrypted.inputProof);
```

**Problem**: Input proof verification fails because the signer doesn't match.

### ✅ CORRECT: Matching Signer

```typescript
// ✅ CORRECT: Same signer for input and transaction
const input = await fhevm.createEncryptedInput(contractAddr, alice.address);
input.add32(100);
const encrypted = await input.encrypt();

// Alice sends transaction with her encrypted input
await contract.connect(alice).setValue(encrypted.handles[0], encrypted.inputProof);
```

**Why**: Input proofs bind the encrypted value to a specific signer. The transaction sender must match.

---

## 4. Missing Input Proofs

### ❌ WRONG: Skipping Input Proof

```solidity
// ❌ WRONG: Not validating input proof
function setBadValue(externalEuint32 inputValue) external {
    _value = FHE.fromExternal(inputValue, bytes("")); // Empty proof!
}
```

**Problem**: No validation that the encrypted value was created by authorized user.

### ✅ CORRECT: Always Verify Proofs

```solidity
// ✅ CORRECT: Validate input proof
function setGoodValue(externalEuint32 inputValue, bytes calldata inputProof) external {
    _value = FHE.fromExternal(inputValue, inputProof);
    // Proof is verified automatically
}
```

**Why**: Input proofs prevent unauthorized users from submitting arbitrary encrypted values.

---

## 5. Forgetting to Refresh Permissions

### ❌ WRONG: Not Refreshing After Operations

```solidity
function addBadValue(externalEuint32 inputValue, bytes calldata inputProof) external {
    euint32 encrypted = FHE.fromExternal(inputValue, inputProof);
    _value = FHE.add(_value, encrypted);

    // ❌ WRONG: Forgetting to refresh permissions for new value
}
```

**Problem**: New encrypted value doesn't have proper permissions.

### ✅ CORRECT: Always Refresh Permissions

```solidity
function addGoodValue(externalEuint32 inputValue, bytes calldata inputProof) external {
    euint32 encrypted = FHE.fromExternal(inputValue, inputProof);
    _value = FHE.add(_value, encrypted);

    // ✅ CORRECT: Refresh permissions after every operation
    FHE.allowThis(_value);
    FHE.allow(_value, msg.sender);
}
```

**Why**: Every FHE operation creates a new encrypted handle that needs permissions.

---

## 6. Public Decryption Misuse

### ❌ WRONG: Unnecessary Public Decryption

```solidity
// ❌ WRONG: Public decryption reveals sensitive data
function processPayment(externalEuint32 amount, bytes calldata proof) external {
    euint32 encryptedAmount = FHE.fromExternal(amount, proof);
    uint32 plainAmount = FHE.decrypt(encryptedAmount); // Reveals amount!

    // Now everyone can see the payment amount
    totalRevenue += plainAmount;
}
```

**Problem**: Payment amounts are now visible to everyone on-chain.

### ✅ CORRECT: Keep Data Encrypted

```solidity
// ✅ CORRECT: Keep sensitive data encrypted
function processPayment(externalEuint32 amount, bytes calldata proof) external {
    euint32 encryptedAmount = FHE.fromExternal(amount, proof);

    // Perform operations on encrypted data
    _totalRevenue = FHE.add(_totalRevenue, encryptedAmount);

    FHE.allowThis(_totalRevenue);
    FHE.allow(_totalRevenue, msg.sender);
}
```

**Why**: Keep data encrypted whenever possible. Only decrypt when absolutely necessary.

---

## 7. Handle Lifecycle Issues

### ❌ WRONG: Reusing Handles Incorrectly

```solidity
euint32 private _temp;

function badOperation1(externalEuint32 input, bytes calldata proof) external {
    _temp = FHE.fromExternal(input, proof);
    // Use _temp...
}

function badOperation2() external {
    // ❌ WRONG: _temp might not have proper permissions for this operation
    _value = FHE.add(_value, _temp);
}
```

**Problem**: Handles may lose permissions across transactions.

### ✅ CORRECT: Manage Handles Properly

```solidity
function goodOperation(externalEuint32 input, bytes calldata proof) external {
    euint32 temp = FHE.fromExternal(input, proof);

    // ✅ CORRECT: Use handle immediately and grant permissions
    _value = FHE.add(_value, temp);

    FHE.allowThis(_value);
    FHE.allow(_value, msg.sender);
}
```

**Why**: Encrypted handles should be used within the same transaction and have permissions refreshed.

---

## 8. Constants in Encrypted Operations

### ❌ WRONG: Using Plaintext Constants Directly

```solidity
// ❌ WRONG: Cannot mix plaintext and encrypted directly
function badMultiply() external {
    _value = _value * 100; // Compilation error!
}
```

**Problem**: Cannot perform operations between encrypted and plaintext values directly.

### ✅ CORRECT: Encrypt Constants

```solidity
// ✅ CORRECT: Encrypt constants for operations
function goodMultiply() external {
    euint32 multiplier = FHE.fromUint(100);
    _value = FHE.mul(_value, multiplier);

    FHE.allowThis(_value);
    FHE.allow(_value, msg.sender);
}
```

**Why**: All operands in FHE operations must be encrypted.

---

## 9. Comparison Operations

### ❌ WRONG: Using Standard Comparison

```solidity
// ❌ WRONG: Cannot use standard comparison on encrypted values
function badCheck(externalEuint32 input, bytes calldata proof) external {
    euint32 encrypted = FHE.fromExternal(input, proof);

    if (_value > encrypted) { // Won't work!
        // Do something
    }
}
```

**Problem**: Standard comparison operators don't work with encrypted values.

### ✅ CORRECT: Use FHE Comparison

```solidity
// ✅ CORRECT: Use FHE comparison functions
function goodCheck(externalEuint32 input, bytes calldata proof) external {
    euint32 encrypted = FHE.fromExternal(input, proof);

    // Use FHE.gt() for greater-than comparison
    ebool isGreater = FHE.gt(_value, encrypted);

    // Use FHE.select for conditional logic
    _value = FHE.select(isGreater, _value, encrypted);

    FHE.allowThis(_value);
    FHE.allow(_value, msg.sender);
}
```

**Why**: FHE provides special comparison functions that work on encrypted data.

---

## 10. Storage Patterns

### ❌ WRONG: Storing Decrypted Values

```solidity
mapping(address => uint32) public balances; // ❌ WRONG: Plaintext storage

function badSetBalance(externalEuint32 input, bytes calldata proof) external {
    euint32 encrypted = FHE.fromExternal(input, proof);
    balances[msg.sender] = FHE.decrypt(encrypted); // Defeats privacy!
}
```

**Problem**: Storing decrypted values defeats the purpose of FHE.

### ✅ CORRECT: Store Encrypted Values

```solidity
mapping(address => euint32) private balances; // ✅ CORRECT: Encrypted storage

function goodSetBalance(externalEuint32 input, bytes calldata proof) external {
    balances[msg.sender] = FHE.fromExternal(input, proof);

    FHE.allowThis(balances[msg.sender]);
    FHE.allow(balances[msg.sender], msg.sender);
}
```

**Why**: Keep values encrypted in storage to maintain privacy.

---

## Summary of Best Practices

1. ✅ **Always** call both `FHE.allowThis()` and `FHE.allow()`
2. ✅ **Always** verify input proofs with `FHE.fromExternal()`
3. ✅ **Always** refresh permissions after FHE operations
4. ✅ **Always** use matching signer for input and transaction
5. ✅ **Never** try to decrypt in view functions
6. ✅ **Never** use public decryption unless absolutely necessary
7. ✅ **Never** mix encrypted and plaintext in operations
8. ✅ **Never** use standard operators on encrypted values
9. ✅ **Never** store sensitive data in plaintext
10. ✅ **Always** use FHE comparison functions for logic

---

## Testing Anti-Patterns

When writing tests, intentionally test these anti-patterns to ensure your contract handles them correctly:

```typescript
describe("Anti-Pattern Tests", function () {
  it("should fail when missing FHE.allowThis", async function () {
    // Test that operations fail without proper permissions
  });

  it("should fail with mismatched input signer", async function () {
    // Test that input proof validation works
  });

  it("should maintain privacy without public decryption", async function () {
    // Verify encrypted values remain private
  });
});
```

---

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Best Practices](https://docs.zama.ai/protocol/solidity-guides)
- [Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)

---

**Remember**: When in doubt, check the FHEVM documentation and test both success and failure scenarios!
