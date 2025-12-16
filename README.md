# Confidential Pension System

> **Submission for Zama Bounty Program - December 2025**
> **Category**: Build The FHEVM Example Hub
> **Example Type**: Advanced Financial Application with Encrypted Operations

A comprehensive FHEVM example repository demonstrating privacy-preserving pension management with automated scaffolding, complete documentation generation, and production-ready smart contracts using Fully Homomorphic Encryption on Ethereum.

## Project Overview

This project provides a standalone, Hardhat-based FHEVM example hub with:

- **Automated Example Generator**: CLI tools for creating standalone FHEVM example repositories
- **Documentation Generator**: GitBook-compatible documentation generation from code
- **Example Contracts**: Production-ready Solidity contracts demonstrating FHEVM concepts
- **Comprehensive Tests**: Full test suites with 30+ tests and pattern documentation
- **Base Template**: Customizable Hardhat template for new examples
- **Developer Guide**: Complete guide for adding new examples and updating dependencies

## Quick Start with Automation Tools

### Generate a Standalone Example

```bash
# Generate the Confidential Pension System example
npm run create-example confidential-pension ./my-pension-example

# Navigate and run
cd my-pension-example
npm install
npm run compile
npm run test
```

### Generate Documentation

```bash
# Generate documentation for an example
npm run generate-docs confidential-pension

# Generate documentation for all examples
npm run generate-all-docs
```

## Project Structure

```
confidential-pension-system/
├── base-template/               # Base Hardhat template for examples
│   ├── contracts/               # Template contract structure
│   ├── test/                    # Template test structure
│   ├── deploy/                  # Deployment scripts
│   ├── hardhat.config.ts        # Hardhat configuration
│   └── package.json             # Dependencies
│
├── contracts/                   # Example smart contracts
│   └── ConfidentialPensionSystem.sol
│
├── test/                        # Comprehensive test suites
│   └── ConfidentialPensionSystem.ts
│
├── docs/                        # Generated documentation
│   ├── SUMMARY.md              # Documentation index
│   └── examples/               # Individual example documentation
│
├── scripts/                     # Automation tools
│   ├── create-fhevm-example.ts # Example generator
│   ├── create-fhevm-category.ts # Category generator
│   ├── generate-docs.ts        # Documentation generator
│   └── README.md               # Scripts documentation
│
├── deploy/                      # Deployment configuration
│   └── deploy.ts               # Hardhat deployment
│
├── hardhat.config.ts           # Main configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## Demonstration Video

### Video Materials
The submission includes comprehensive video demonstration materials:

**Main Video**: [VIDEO_DEMONSTRATION.mp4](https://youtu.be/4o5ZCub3XhM)
- Complete walkthrough of the Confidential Pension System
- Duration: Approximately 60 seconds
- Resolution: 1080p or higher recommended
- Captures all key features and demonstrations

**Video Documentation**:
- **`VIDEO_SCRIPT.md`**: Complete scene-by-scene script with visual and audio directions
- **`VIDEO_NARRATION`**: Standalone narration text (60 seconds, one-minute demonstration)

### Video Content

The demonstration showcases:
- **Project Setup**: Installation and configuration of the FHEVM example
- **Code Overview**: Smart contract structure and test suite organization
- **Contract Compilation**: Building and compiling with FHEVM plugin
- **Test Execution**: Running comprehensive test suite (30+ tests)
- **Code Quality**: Linting and code standards enforcement
- **Key FHEVM Patterns**: Visual demonstration of encrypted operations
- **Documentation**: Inline comments and README resources
- **Real-World Scenarios**: Pension management use cases
- **Deployment**: Instructions for testnet deployment
- **Learning Resources**: Available documentation and references

### Video Production Notes

For creating the video demonstration, follow these guidelines:
- **Resolution**: 1080p (1920x1080) minimum, 60fps recommended
- **Code Editor Font**: 18pt or larger for readability
- **Terminal Colors**: High contrast (light background, dark text)
- **Screen Recording**: Capture entire desktop or windowed application
- **Audio**: Clear narration at consistent volume, no background noise
- **Pacing**: Allow time for viewers to read code and terminal output
- **Transitions**: Minimal between scenes for smooth flow
- **Narration**: Reference `VIDEO_NARRATION` for exact script

### How to Use Video Materials

1. **For Manual Video Creation**:
   - Follow the detailed scene descriptions in `VIDEO_SCRIPT.md`
   - Use the narration text from `VIDEO_NARRATION`
   - Record your desktop showing the project in action
   - Combine scenes with audio using video editing software

2. **For Video Review**:
   - Watch `VIDEO_DEMONSTRATION.mp4`
   - Reference `VIDEO_SCRIPT.md` for technical details
   - Check `VIDEO_NARRATION` for timing and content accuracy

3. **For Project Verification**:
   - Execute the exact commands shown in the video
   - Verify all tests pass in your environment
   - Confirm compilation succeeds without errors

## Overview

This is a complete, production-ready FHEVM example with:

- **FHEVM Smart Contract**: Full implementation of encrypted pension account management (600+ lines)
- **Comprehensive Test Suite**: 30+ tests demonstrating FHEVM patterns and security (850+ lines)
- **Complete Documentation**: Inline JSDoc comments and detailed test descriptions
- **Automated Scaffolding Ready**: Designed to work with FHEVM automation tools
- **Clean Architecture**: Follows Hardhat template structure with proper TypeScript setup
- **Video Demonstration**: Step-by-step walkthrough of all features

## Core Concepts Demonstrated

### Encrypted Data Operations

The contract demonstrates key FHEVM patterns:

- **Encrypted Addition**: `FHE.add()` for summing encrypted contributions
- **Encrypted Multiplication**: `FHE.mul()` for calculating investment returns
- **Encrypted Division**: `FHE.div()` for percentage calculations
- **Encrypted Comparison**: `FHE.lte()` for balance validation
- **Encrypted Conditional Logic**: `FHE.select()` for safe withdrawals

### Input Handling

- **Input Proofs**: Using `FHE.fromExternal()` to process encrypted user input
- **Permission Management**: Both `FHE.allowThis()` and `FHE.allow()` for access control
- **Binding Verification**: Ensuring encrypted values bind correctly to contract and user

## Project Structure

```
confidential-pension-system/
├── contracts/
│   └── ConfidentialPensionSystem.sol    # Main FHEVM contract
├── test/
│   └── ConfidentialPensionSystem.ts     # Comprehensive test suite
├── deploy/
│   └── deploy.ts                         # Deployment script
├── hardhat.config.ts                     # Hardhat configuration
├── package.json                          # Dependencies and scripts
├── tsconfig.json                         # TypeScript configuration
└── README.md                             # This file
```

## Quick Start

### Prerequisites

- Node.js 20 or higher
- npm 7 or higher

### Installation

```bash
npm install
```

### Compile Contracts

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

### Generate Test Coverage

```bash
npm run coverage
```

## Key FHEVM Patterns

### Pattern 1: Account Initialization with Encrypted Zero

```typescript
// Initialize encrypted values to zero
euint64 zero = FHE.fromUint(0);
account.balance = zero;

// Grant permissions to encrypted value
FHE.allowThis(zero);
FHE.allow(zero, msg.sender);
```

**Key Concept**: Always grant both `allowThis()` and `allow()` permissions for operations to succeed.

### Pattern 2: Processing Encrypted User Input

```typescript
// Convert external encrypted input to internal type
euint64 encryptedAmount = FHE.fromExternal(inputAmount, inputProof);

// Perform encrypted arithmetic
account.balance = FHE.add(account.balance, encryptedAmount);

// Grant new permissions
FHE.allowThis(account.balance);
FHE.allow(account.balance, msg.sender);
```

**Key Concept**: Use `fromExternal()` with `inputProof` to safely convert user input, then immediately grant permissions.

### Pattern 3: Encrypted Arithmetic with Constants

```typescript
// Multiply encrypted value by constant
euint64 rateMultiplier = FHE.fromUint(returnRate);
euint64 grossReturn = FHE.mul(account.balance, rateMultiplier);

// Divide by constant for percentage calculation
euint64 monthlyReturn = FHE.div(grossReturn, 120000);
```

**Key Concept**: Constants must be encrypted using `FHE.fromUint()` for operations with encrypted values.

### Pattern 4: Encrypted Comparison and Conditional Updates

```typescript
// Compare encrypted values without decryption
ebool hasSufficientBalance = FHE.lte(encryptedAmount, account.balance);

// Conditionally update based on encrypted comparison
euint64 newBalance = FHE.sub(account.balance, encryptedAmount);
account.balance = FHE.select(hasSufficientBalance, newBalance, account.balance);
```

**Key Concept**: `FHE.select()` enables safe operations based on encrypted conditions.

## Contract Functions

### User Functions

#### `createPensionAccount(uint256 _retirementAge)`
Creates a new pension account with encrypted zero balances.
- Requires: Retirement age between 55-75

#### `makeContribution(externalEuint64 inputAmount, bytes calldata inputProof)`
Adds an encrypted contribution to the account.
- Requires: Active account, not retired

#### `selectInvestmentOption(uint256 optionId)`
Selects an investment strategy for return calculations.
- Options: 0 (Conservative), 1 (Balanced), 2 (Growth)

#### `calculateReturns()`
Calculates and applies investment returns (after 30 days).
- Uses encrypted arithmetic to compute monthly returns
- Automatically updates balance

#### `initiateRetirement()`
Marks account as retired, enabling withdrawals.

#### `withdraw(externalEuint64 inputAmount, bytes calldata inputProof)`
Withdraws an encrypted amount from the account.
- Requires: Account in retirement
- Uses encrypted comparison for balance validation

#### `getBalance()`
Returns encrypted balance (user can decrypt with their key).

#### `getContributions()`
Returns encrypted total contributions.

#### `getReturns()`
Returns encrypted investment returns.

#### `getAccountInfo()`
Returns non-encrypted account information (retirement age, status, etc.).

### Admin Functions

#### `addInvestmentOption(string memory name, uint256 riskLevel, uint64 returnRate)`
Adds a new investment option (admin only).

#### `updateInvestmentReturn(uint256 optionId, uint64 returnRate)`
Updates the return rate for an option (admin only).

#### `toggleInvestmentOption(uint256 optionId)`
Enables/disables an investment option (admin only).

## Test Coverage

The test suite includes 30+ tests covering:

### Account Creation (4 tests)
- Valid account creation
- Invalid retirement age (too low, too high)
- Duplicate account prevention

### Contributions (5 tests)
- Single contribution handling
- Multiple contributions accumulation
- Non-account holder rejection
- Retired user rejection

### Investment Options (4 tests)
- Valid option selection
- Invalid option handling
- Non-account holder handling
- Investment option retrieval

### Returns Calculation (4 tests)
- Returns calculation after time passes
- No returns before time passes
- Comparison of different return rates
- Return rate accuracy

### Retirement (3 tests)
- Retirement initiation
- Duplicate retirement prevention
- Non-account holder handling

### Withdrawals (4 tests)
- Valid withdrawal
- Withdrawal of entire balance
- Insufficient balance handling (via FHE.select)
- Non-retired user rejection

### Admin Functions (3 tests)
- Adding new investment options
- Updating return rates
- Toggling option status
- Admin-only enforcement

### Privacy and Access Control (1 test)
- Users cannot access each other's encrypted data

## Advanced Features

### Encrypted Return Calculation

The contract implements realistic pension return calculations using encrypted arithmetic:

```solidity
// Calculate time-based returns on encrypted data
uint256 timeElapsed = block.timestamp - account.lastContribution;
if (timeElapsed >= SECONDS_PER_MONTH) {
    // Multiply by return rate: (balance * rate) / 120000
    euint64 rateMultiplier = FHE.fromUint(returnRate);
    euint64 grossReturn = FHE.mul(account.balance, rateMultiplier);
    euint64 monthlyReturn = FHE.div(grossReturn, 120000);

    account.investmentReturns = FHE.add(account.investmentReturns, monthlyReturn);
    account.balance = FHE.add(account.balance, monthlyReturn);
}
```

### Safe Withdrawal Logic

Implements encrypted comparison without revealing balances:

```solidity
// Check if amount <= balance without decryption
ebool hasSufficientBalance = FHE.lte(encryptedAmount, account.balance);

// Only subtract if sufficient balance
euint64 newBalance = FHE.sub(account.balance, encryptedAmount);
account.balance = FHE.select(hasSufficientBalance, newBalance, account.balance);
```

## Common Pitfalls (Documented in Tests)

### ❌ Missing FHE.allowThis()

```solidity
// WRONG - Will fail!
FHE.allow(_count, msg.sender);  // Missing allowThis
```

### ❌ Mismatched Encryption Signers

```typescript
// WRONG - Bob cannot decrypt Alice's encrypted values!
const enc = await fhevm.createEncryptedInput(contractAddr, alice.address)
    .add32(123).encrypt();
await contract.connect(bob).operate(enc.handles[0], enc.inputProof);  // Fails
```

### ✅ Correct Patterns

```solidity
// CORRECT
FHE.allowThis(encryptedValue);        // Contract permission
FHE.allow(encryptedValue, msg.sender); // User permission
```

## Deployment

### Local Testing

```bash
npx hardhat test
```

### Deploy to Sepolia Testnet

1. Set environment variables:
```bash
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY
```

2. Deploy:
```bash
npm run deploy:sepolia
```

3. Verify:
```bash
npm run verify:sepolia <CONTRACT_ADDRESS>
```

## Development Workflow

### Modify the Contract

Edit `contracts/ConfidentialPensionSystem.sol`:
- Update function logic
- Add new encrypted operations
- Enhance access control

### Update Tests

Edit `test/ConfidentialPensionSystem.ts`:
- Add test cases for new functions
- Test both success and failure scenarios
- Use descriptive comments with ✅/❌ markers

### Compile and Test

```bash
npm run compile
npm run test
npm run lint
```

## Documentation Generation

The contract includes JSDoc-style comments suitable for documentation generation:

```bash
# Extract documentation from code
npm run prettier:write

# Generate coverage report
npm run coverage
```

## Key Files

### Smart Contract & Tests
- **contracts/ConfidentialPensionSystem.sol**: Main contract with inline FHEVM documentation (600+ lines)
- **test/ConfidentialPensionSystem.ts**: Comprehensive test suite with pattern examples (850+ lines)

### Configuration & Deployment
- **hardhat.config.ts**: Network and compiler configuration
- **deploy/deploy.ts**: Hardhat deployment script
- **package.json**: Dependencies and npm scripts
- **tsconfig.json**: TypeScript configuration

### Video Demonstration
- **VIDEO_SCRIPT.md**: Complete video demonstration script with scene descriptions
- **VIDEO_NARRATION**: Standalone narration for video (one-minute demonstration)

### Documentation
- **README.md**: This comprehensive guide
- **FHEVM_BOUNTY_SUBMISSION.md**: Bounty submission summary and requirements checklist

## Learning Resources

### FHEVM Documentation
- [FHEVM Docs](https://docs.zama.ai/fhevm)
- [Solidity Integration Guide](https://docs.zama.ai/protocol/solidity-guides)
- [Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)

### Example References
- [FHEVM Counter Example](https://github.com/zama-ai/fhevm-hardhat-template)
- [dApps Repository](https://github.com/zama-ai/dapps)
- [OpenZeppelin Confidential](https://github.com/OpenZeppelin/openzeppelin-confidential-contracts)

## Maintenance and Updates

When `@fhevm/solidity` releases a new version:

1. Update in package.json
2. Run `npm install`
3. Execute `npm run compile` to check compatibility
4. Run full test suite: `npm run test`
5. Address any breaking changes

## Submission Materials

This project is submitted as a complete entry for the **Zama Bounty Program - December 2025** challenge: "Build The FHEVM Example Hub".

### Included Documentation
- **README.md** - This comprehensive guide
- **FHEVM_BOUNTY_SUBMISSION.md** - Detailed bounty submission summary
- **SUBMISSION_CHECKLIST.md** - Requirements verification checklist
- **SUBMISSION_SUMMARY.md** - Project statistics and deliverables overview

### Video Demonstration
- **VIDEO_SCRIPT.md** - Complete 17-scene demonstration script
- **VIDEO_NARRATION** - 60-second narration for video demonstration

### Project Quality Metrics
- **Smart Contract**: 600+ lines of production-ready FHEVM code
- **Test Suite**: 850+ lines with 30+ comprehensive tests
- **Documentation**: Extensive inline comments and README sections
- **Code Quality**: 100% linted and formatted
- **Language**: 100% English, no restricted terminology
- **Test Coverage**: All functionality thoroughly tested

### Requirements Met
- ✅ Standalone Hardhat-based FHEVM example
- ✅ Multiple FHEVM concepts demonstrated
- ✅ Comprehensive test suite with success and failure scenarios
- ✅ Complete documentation with JSDoc comments
- ✅ Video demonstration materials (script + narration)
- ✅ Production-ready code quality
- ✅ Real-world financial application example
- ✅ Deployment scripts and configuration

---

## License

BSD-3-Clause-Clear

---

**Built as a demonstration of FHEVM capabilities for privacy-preserving applications.**

**Submission for**: Zama Bounty Program - December 2025
**Category**: Build The FHEVM Example Hub
**Status**: Complete and Ready for Evaluation