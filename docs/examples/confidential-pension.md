# Confidential Pension System

A comprehensive FHEVM example demonstrating privacy-preserving pension management with encrypted financial operations.

## Overview

The Confidential Pension System showcases how to build a privacy-preserving financial application using Fully Homomorphic Encryption (FHE) on Ethereum. This example demonstrates secure pension account management where all sensitive data remains encrypted on-chain.

## Key Features

- **Encrypted Contributions**: Users can make contributions with amounts that remain encrypted
- **Private Balance Management**: Account balances are never revealed on-chain
- **Encrypted Returns Calculation**: Investment returns are calculated on encrypted data
- **Secure Withdrawals**: Withdrawal amounts and validation happen on encrypted values
- **Access Control**: Proper FHE permission management for multi-user scenarios

## Core FHEVM Patterns

### 1. Encrypted Value Initialization

```solidity
// Initialize encrypted values to zero
euint64 zero = FHE.fromUint(0);
account.balance = zero;

// Grant permissions
FHE.allowThis(zero);
FHE.allow(zero, msg.sender);
```

**Key Concept**: Always grant both `allowThis()` and `allow()` permissions when initializing encrypted values.

### 2. Processing Encrypted User Input

```solidity
// Convert external encrypted input to internal type
euint64 encryptedAmount = FHE.fromExternal(inputAmount, inputProof);

// Perform encrypted arithmetic
account.balance = FHE.add(account.balance, encryptedAmount);

// Grant permissions to new value
FHE.allowThis(account.balance);
FHE.allow(account.balance, msg.sender);
```

**Key Concept**: Use `fromExternal()` with `inputProof` to safely convert and verify user input.

### 3. Encrypted Arithmetic with Constants

```solidity
// Multiply encrypted value by constant
euint64 rateMultiplier = FHE.fromUint(returnRate);
euint64 grossReturn = FHE.mul(account.balance, rateMultiplier);

// Divide for percentage calculation
euint64 monthlyReturn = FHE.div(grossReturn, 120000);
```

**Key Concept**: Constants must be encrypted using `FHE.fromUint()` for operations with encrypted values.

### 4. Encrypted Conditional Logic

```solidity
// Compare encrypted values
ebool hasSufficientBalance = FHE.lte(encryptedAmount, account.balance);

// Conditional update based on encrypted comparison
euint64 newBalance = FHE.sub(account.balance, encryptedAmount);
account.balance = FHE.select(hasSufficientBalance, newBalance, account.balance);
```

**Key Concept**: `FHE.select()` enables safe conditional operations without decryption.

## Smart Contract Functions

### User Functions

#### `createPensionAccount(uint256 _retirementAge)`
Creates a new pension account with encrypted zero balances.

**Parameters:**
- `_retirementAge`: Retirement age (must be between 55-75)

**Key Operations:**
- Initializes encrypted balance, contributions, and returns to zero
- Grants proper permissions for the account holder

#### `makeContribution(externalEuint64 inputAmount, bytes calldata inputProof)`
Adds an encrypted contribution to the account.

**Parameters:**
- `inputAmount`: Encrypted contribution amount
- `inputProof`: ZK proof for input validation

**Requirements:**
- Account must exist
- User must not be retired

#### `selectInvestmentOption(uint256 optionId)`
Selects an investment strategy for return calculations.

**Available Options:**
- 0: Conservative (low risk, low return)
- 1: Balanced (moderate risk, moderate return)
- 2: Growth (higher risk, higher return)

#### `calculateReturns()`
Calculates and applies investment returns based on elapsed time and selected strategy.

**Features:**
- Time-based calculation (monthly returns)
- Encrypted multiplication and division
- Automatic balance updates

#### `initiateRetirement()`
Marks the account as retired, enabling withdrawals.

**Requirements:**
- Account must exist
- Cannot be already retired

#### `withdraw(externalEuint64 inputAmount, bytes calldata inputProof)`
Withdraws an encrypted amount from the account.

**Parameters:**
- `inputAmount`: Encrypted withdrawal amount
- `inputProof`: ZK proof for input validation

**Requirements:**
- Account must be in retirement
- Uses encrypted comparison for balance validation

#### `getBalance()`
Returns the encrypted balance handle (user can decrypt with their key).

#### `getContributions()`
Returns the encrypted total contributions.

#### `getReturns()`
Returns the encrypted investment returns.

#### `getAccountInfo()`
Returns non-encrypted account information (retirement age, status, timestamps, etc.).

### Admin Functions

#### `addInvestmentOption(string memory name, uint256 riskLevel, uint64 returnRate)`
Adds a new investment option.

**Parameters:**
- `name`: Investment option name
- `riskLevel`: Risk level (1-5)
- `returnRate`: Annual return rate (basis points)

**Access**: Admin only

#### `updateInvestmentReturn(uint256 optionId, uint64 returnRate)`
Updates the return rate for an existing option.

**Access**: Admin only

#### `toggleInvestmentOption(uint256 optionId)`
Enables or disables an investment option.

**Access**: Admin only

## Test Coverage

The comprehensive test suite includes 30+ tests covering:

### Account Management (4 tests)
- Valid account creation
- Invalid retirement age validation
- Duplicate account prevention

### Contributions (5 tests)
- Single and multiple contributions
- Permission validation
- Retired user restrictions

### Investment Options (4 tests)
- Valid option selection
- Invalid option handling
- Option retrieval

### Returns Calculation (4 tests)
- Time-based return calculation
- Rate comparison across different strategies
- Accuracy verification

### Retirement & Withdrawals (7 tests)
- Retirement initiation
- Withdrawal validation
- Balance sufficiency checks using encrypted comparison
- Non-retired user restrictions

### Admin Functions (3 tests)
- Adding new investment options
- Updating return rates
- Admin-only access enforcement

### Privacy & Access Control (1 test)
- Cross-user data isolation

## Usage

### Compile the Contract

```bash
npm run compile
```

### Run Tests

```bash
npm run test
```

### Run Tests with Gas Reporting

```bash
REPORT_GAS=true npm run test
```

### Generate Coverage Report

```bash
npm run coverage
```

### Deploy to Sepolia

```bash
npm run deploy:sepolia
```

### Verify Contract

```bash
npm run verify:sepolia <CONTRACT_ADDRESS>
```

## Common Pitfalls

### ❌ Missing FHE.allowThis()

```solidity
// WRONG - Will fail!
FHE.allow(_count, msg.sender);  // Missing allowThis
```

### ❌ Incorrect Input Signer

```typescript
// WRONG - Bob cannot use Alice's encrypted input!
const enc = await fhevm.createEncryptedInput(contractAddr, alice.address)
    .add64(123).encrypt();
await contract.connect(bob).makeContribution(enc.handles[0], enc.inputProof);
```

### ✅ Correct Pattern

```solidity
// CORRECT - Always grant both permissions
FHE.allowThis(encryptedValue);
FHE.allow(encryptedValue, msg.sender);
```

```typescript
// CORRECT - Use the same signer for input creation and transaction
const enc = await fhevm.createEncryptedInput(contractAddr, alice.address)
    .add64(123).encrypt();
await contract.connect(alice).makeContribution(enc.handles[0], enc.inputProof);
```

## Advanced Concepts

### Time-Based Encrypted Calculations

The contract demonstrates how to perform time-based calculations on encrypted data:

```solidity
// Calculate monthly returns on encrypted balance
uint256 timeElapsed = block.timestamp - account.lastContribution;
if (timeElapsed >= SECONDS_PER_MONTH) {
    euint64 rateMultiplier = FHE.fromUint(returnRate);
    euint64 grossReturn = FHE.mul(account.balance, rateMultiplier);
    euint64 monthlyReturn = FHE.div(grossReturn, 120000);

    account.balance = FHE.add(account.balance, monthlyReturn);
}
```

### Encrypted Balance Validation

Safe withdrawal validation without revealing balances:

```solidity
// Check sufficient balance without decryption
ebool hasSufficientBalance = FHE.lte(encryptedAmount, account.balance);

// Only subtract if sufficient
euint64 newBalance = FHE.sub(account.balance, encryptedAmount);
account.balance = FHE.select(hasSufficientBalance, newBalance, account.balance);
```

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)
- [Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)
- [Zama Community Forum](https://community.zama.ai)

## License

BSD-3-Clause-Clear

---

**Built with FHEVM by Zama**
