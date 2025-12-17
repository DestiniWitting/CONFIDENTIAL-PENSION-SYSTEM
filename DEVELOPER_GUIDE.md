# Developer Guide

Comprehensive guide for developers working with the FHEVM Example Hub, including how to add new examples, update dependencies, and maintain the project.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Adding New Examples](#adding-new-examples)
3. [Updating Dependencies](#updating-dependencies)
4. [Maintaining Examples](#maintaining-examples)
5. [Documentation Generation](#documentation-generation)
6. [Testing Your Examples](#testing-your-examples)
7. [Common Issues and Solutions](#common-issues-and-solutions)

## Project Overview

The FHEVM Example Hub is structured to make it easy to:
- Create standalone, self-contained FHEVM examples
- Generate documentation automatically
- Scaffold new examples from a base template
- Maintain consistency across examples

### Project Structure

```
confidential-pension-system/
├── base-template/          # Base template for all examples
├── contracts/              # Example contracts
├── test/                   # Example test suites
├── scripts/                # Automation tools
│   ├── create-fhevm-example.ts
│   ├── create-fhevm-category.ts
│   └── generate-docs.ts
├── docs/                   # Generated documentation
│   ├── SUMMARY.md
│   └── examples/
└── DEVELOPER_GUIDE.md      # This file
```

## Adding New Examples

### Step 1: Create Your Contract

Create a new Solidity contract in the `contracts/` directory demonstrating a specific FHEVM concept.

**Best Practices:**
- One clear concept per example
- Include NatSpec comments (`/** ... */`) for documentation generation
- Keep contracts focused and readable (under 500 lines recommended)
- Use meaningful variable and function names

**Example:**

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Your Example Title
/// @notice Your example description
contract YourExample is ZamaEthereumConfig {
  euint32 private _value;

  /// @notice Your function description
  /// @param inputValue The input parameter
  /// @param inputProof The ZK proof for input validation
  function yourFunction(externalEuint32 inputValue, bytes calldata inputProof) external {
    euint32 encrypted = FHE.fromExternal(inputValue, inputProof);
    _value = FHE.add(_value, encrypted);

    FHE.allowThis(_value);
    FHE.allow(_value, msg.sender);
  }
}
```

### Step 2: Create Comprehensive Tests

Create a matching test file in `test/` following the naming convention.

**Test Structure:**

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { awaitAllDecryptionResults, initGateway } from "@fhevm/hardhat-plugin";
import type { YourExample } from "../types";
import { FhevmInstance } from "@fhevm/hardhat-plugin/dist/types";

describe("YourExample", function () {
  let contract: YourExample;
  let owner: Signer;
  let fhevm: FhevmInstance;
  let contractAddress: string;

  before(async function () {
    await initGateway();
  });

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("YourExample");
    contract = await Factory.connect(owner).deploy();
    await contract.waitForDeployment();

    contractAddress = await contract.getAddress();
    fhevm = await ethers.getFhevmInstance(contractAddress);
  });

  // Write comprehensive tests
  describe("functionality", function () {
    it("should perform expected behavior", async function () {
      // Your test implementation
    });
  });
});
```

**Testing Best Practices:**
- Test success cases
- Test failure cases and error handling
- Test edge cases
- Include descriptive comments
- Use clear assertion messages

### Step 3: Register the Example

Add your example to the examples map in `scripts/create-fhevm-example.ts`:

```typescript
const EXAMPLES_MAP: Record<string, ExampleConfig> = {
  // ... existing examples ...
  'your-example-name': {
    contract: 'contracts/YourContract.sol',
    test: 'test/YourContract.ts',
    description: 'Brief description of what this example demonstrates',
  },
};
```

**Naming Convention:**
- Use kebab-case (lowercase with hyphens)
- Be descriptive but concise
- Example: `access-control`, `user-decryption`, `blind-auction`

### Step 4: Register Documentation Config

Add documentation configuration to `scripts/generate-docs.ts`:

```typescript
const EXAMPLES: Record<string, DocsConfig> = {
  // ... existing examples ...
  'your-example-name': {
    title: 'Your Example Title',
    description: 'Detailed description of what this example demonstrates',
    contract: 'contracts/YourContract.sol',
    test: 'test/YourContract.ts',
    output: 'docs/examples/your-example-name.md',
    category: 'Category Name',
  },
};
```

**Categories:**
- Basic Examples: Simple FHE operations
- Advanced Examples: Complex financial/auction scenarios
- OpenZeppelin Examples: Standards and token implementations
- Game Examples: Interactive use cases

### Step 5: Generate Documentation

```bash
npm run generate-docs your-example-name
```

This will:
- Extract NatSpec comments from your contract
- Extract test patterns and descriptions
- Generate a markdown file with examples and usage

### Step 6: Create Standalone Example Repository

```bash
npm run create-example your-example-name ./my-example-output
```

This generates a complete, standalone repository that can be:
- Shared independently
- Used as a learning resource
- Deployed as a separate project

### Step 7: Verify Everything Works

```bash
cd ./my-example-output
npm install
npm run compile
npm run test
```

## Updating Dependencies

When FHEVM or related dependencies release new versions:

### 1. Update Base Template

Edit `base-template/package.json` and root `package.json`:

```json
{
  "dependencies": {
    "@fhevm/solidity": "^0.10.0"  // Update version
  },
  "devDependencies": {
    "@fhevm/hardhat-plugin": "^0.4.0"  // Update version
  }
}
```

### 2. Verify Compatibility

```bash
# Update dependencies
npm install

# Compile all contracts
npm run compile

# Run full test suite
npm run test

# Check for any breaking changes
npm run lint
```

### 3. Update Examples if Needed

If there are breaking changes:

1. Update example contracts with new syntax
2. Update test files with new API patterns
3. Update documentation to reflect changes
4. Verify generated examples work correctly

### 4. Test Generated Repositories

```bash
# Generate a test example
npm run create-example confidential-pension ./test-output

# Verify it works with new dependencies
cd ./test-output
npm install
npm run test
```

### 5. Update DEVELOPER_GUIDE.md

Document any breaking changes or new patterns developers should know about.

## Maintaining Examples

### Code Quality Standards

- **Solidity Style**: Follow OpenZeppelin standards
- **TypeScript**: Use strict typing, ESLint configuration enforced
- **Comments**: Document all non-obvious logic
- **Gas Efficiency**: Reasonable for example code (not production-optimized)
- **Security**: No vulnerabilities in examples (use safe patterns)

### Regular Maintenance Tasks

#### Monthly
- Check for security updates in dependencies
- Review issue reports and community feedback
- Update documentation as needed

#### Quarterly
- Run full test suite on all examples
- Check FHEVM release notes for new patterns
- Update examples with improved patterns
- Verify GitHub workflows are passing

#### Before Major Releases
- Test all examples with new versions
- Document migration guide for breaking changes
- Update templates and scaffolding tools
- Verify documentation generation

### Fixing Broken Examples

When an example stops working:

1. **Identify the Issue**
   ```bash
   npm run compile
   npm run test
   # Look at error messages
   ```

2. **Update the Contract**
   - Fix Solidity code issues
   - Update imports if necessary
   - Ensure NatSpec comments are valid

3. **Update Tests**
   - Fix TypeScript/test code
   - Update FHEVM API calls if changed
   - Add new test cases if needed

4. **Verify the Fix**
   ```bash
   npm run compile
   npm run test
   npm run lint
   ```

5. **Regenerate Everything**
   ```bash
   npm run generate-docs
   npm run create-example
   ```

## Documentation Generation

### Automatic Documentation

Documentation is generated from:

1. **NatSpec Comments** in Solidity
   ```solidity
   /// @title Contract title
   /// @notice Human-readable notice
   /// @dev Technical details
   /// @param paramName Parameter description
   /// @return returnValue Return value description
   ```

2. **Test Descriptions** in TypeScript
   ```typescript
   describe("Feature Name", function () {
     it("should do something specific", async function () {
       // Test implementation
     });
   });
   ```

### Manual Documentation

For complex examples, you can create additional documentation:

1. Add explanation to the generated markdown
2. Include code snippets with explanations
3. Document common patterns and pitfalls

### GitBook Integration

Documentation is automatically formatted for GitBook:

- `docs/SUMMARY.md` - Table of contents
- `docs/examples/*.md` - Individual example pages
- Automatically generated navigation

To use with GitBook:

```bash
# In your docs directory
npm install -g gitbook-cli

# Build
gitbook build

# Serve locally
gitbook serve
```

## Testing Your Examples

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npx hardhat test test/YourContract.ts

# Run tests with gas reporting
REPORT_GAS=true npm run test

# Run coverage report
npm run coverage
```

### Test Best Practices

1. **Organize Tests**
   - Group related tests in `describe` blocks
   - Use clear, descriptive test names
   - Keep test files focused

2. **Test Both Paths**
   - Happy path (success cases)
   - Sad paths (error cases)
   - Edge cases and boundaries

3. **Use Fixtures**
   - Create reusable test setups
   - Reduce code duplication
   - Improve readability

4. **Mock and Verify**
   - Mock external dependencies
   - Verify contract state changes
   - Check event emissions

### Example Test Pattern

```typescript
describe("Feature", function () {
  let contract: MyContract;
  let owner: Signer;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    contract = await deploy(owner);
  });

  describe("success case", function () {
    it("should successfully perform action", async function () {
      // Setup
      const input = await fhevm.createEncryptedInput(...);

      // Execute
      const tx = await contract.method(input.handles[0], input.inputProof);
      const receipt = await tx.wait();

      // Verify
      expect(receipt?.status).to.equal(1);
    });
  });

  describe("error case", function () {
    it("should revert with appropriate error", async function () {
      const invalidInput = await fhevm.createEncryptedInput(...);

      await expect(
        contract.method(invalidInput.handles[0], invalidInput.inputProof)
      ).to.be.revertedWith("Expected error message");
    });
  });
});
```

## Common Issues and Solutions

### Issue: "Cannot find module '@fhevm/solidity'"

**Solution:**
```bash
npm install @fhevm/solidity
npm run compile
```

### Issue: "Test fails with 'FHE.allowThis is not defined'"

**Solution:** Ensure you're calling `FHE.allowThis()` after every encrypted operation:

```solidity
euint32 result = FHE.add(a, b);
FHE.allowThis(result);        // Always add this
FHE.allow(result, msg.sender); // And this
```

### Issue: "Compilation fails with version errors"

**Solution:** Check hardhat.config.ts for correct solidity version:

```typescript
solidity: {
  version: "0.8.27",  // Match your contracts
}
```

### Issue: "Generated example doesn't work"

**Solution:**
1. Verify base-template exists and is up to date
2. Check example is registered in create-fhevm-example.ts
3. Ensure contract and test files exist at specified paths
4. Run generate command again with verbose output

### Issue: "Documentation generation creates empty files"

**Solution:**
1. Ensure contracts have NatSpec comments (start with `/**`)
2. Verify test files have `describe` and `it` blocks
3. Check file paths are correct in generate-docs.ts
4. Run with error output to see specific issues

### Issue: "Port already in use when running tests"

**Solution:**
```bash
# Kill existing processes
npx hardhat node --network hardhat --no-deploy
# Or use different port
```

## Best Practices Summary

### For Example Creators

- ✅ Keep examples focused on one concept
- ✅ Write comprehensive, well-commented tests
- ✅ Include detailed NatSpec comments
- ✅ Document common pitfalls
- ✅ Test edge cases
- ❌ Don't mix multiple concepts in one example
- ❌ Don't skip error handling
- ❌ Don't assume reader knowledge

### For Maintainers

- ✅ Test examples after dependency updates
- ✅ Keep documentation synchronized
- ✅ Monitor issue reports
- ✅ Update base template regularly
- ✅ Verify generated examples work
- ❌ Don't skip breaking change notifications
- ❌ Don't let examples rot
- ❌ Don't make undocumented changes

## Support and Resources

- **FHEVM Documentation**: https://docs.zama.ai/fhevm
- **Community Forum**: https://community.zama.ai
- **GitHub Issues**: Report bugs and suggest improvements
- **Zama Discord**: Join the community

## License

All examples are licensed under BSD-3-Clause-Clear.

---

**Questions?** Check the FHEVM documentation or reach out to the Zama community!
