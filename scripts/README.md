# Automation Scripts

This directory contains TypeScript-based CLI tools for generating FHEVM example repositories, managing categories, and generating documentation.

## Available Scripts

### 1. create-fhevm-example.ts

Generates a standalone FHEVM example repository from a template.

**Usage:**

```bash
ts-node scripts/create-fhevm-example.ts <example-name> [output-dir]

# Example
npm run create-example confidential-pension ./my-pension-example
```

**Features:**
- Clones and customizes the base Hardhat template
- Copies the specified contract into the new repository
- Copies matching test suite
- Automatically updates deployment scripts
- Generates a customized README.md
- Updates package.json with appropriate metadata

**Available Examples:**
- `confidential-pension` - Privacy-preserving pension management system

### 2. create-fhevm-category.ts

Generates a category project containing multiple FHEVM examples.

**Usage:**

```bash
ts-node scripts/create-fhevm-category.ts <category-name> [output-dir]

# Example
npm run create-category advanced ./my-advanced-examples
```

**Features:**
- Creates a monorepo structure with multiple examples
- Groups examples by category
- Includes shared documentation
- Generates category-specific configurations

### 3. generate-docs.ts

Generates GitBook-compatible documentation from contracts and tests.

**Usage:**

```bash
# Generate documentation for a single example
ts-node scripts/generate-docs.ts confidential-pension

# Generate documentation for all examples
ts-node scripts/generate-docs.ts --all

# Using npm scripts
npm run generate-docs confidential-pension
npm run generate-all-docs
```

**Features:**
- Extracts NatSpec comments from contracts
- Extracts test patterns and coverage information
- Generates markdown documentation
- Creates GitBook SUMMARY.md for navigation
- Supports multiple examples and categories

## NPM Scripts

Configure these in your `package.json`:

```json
{
  "scripts": {
    "create-example": "npx ts-node scripts/create-fhevm-example.ts",
    "create-category": "npx ts-node scripts/create-fhevm-category.ts",
    "generate-docs": "npx ts-node scripts/generate-docs.ts",
    "generate-all-docs": "npx ts-node scripts/generate-docs.ts --all",
    "help:create": "npx ts-node scripts/create-fhevm-example.ts --help",
    "help:category": "npx ts-node scripts/create-fhevm-category.ts --help",
    "help:docs": "npx ts-node scripts/generate-docs.ts --help"
  }
}
```

## Adding a New Example

1. Create your contract in `contracts/`
2. Create corresponding tests in `test/`
3. Register the example in the `EXAMPLES_MAP` in `create-fhevm-example.ts`:

```typescript
const EXAMPLES_MAP: Record<string, ExampleConfig> = {
  'your-example': {
    contract: 'contracts/YourContract.sol',
    test: 'test/YourContract.ts',
    description: 'Your example description',
  },
};
```

4. Register the example in `generate-docs.ts`:

```typescript
const EXAMPLES: Record<string, DocsConfig> = {
  'your-example': {
    title: 'Your Example Title',
    description: 'Your description',
    contract: 'contracts/YourContract.sol',
    test: 'test/YourContract.ts',
    output: 'docs/examples/your-example.md',
    category: 'Category Name',
  },
};
```

5. Generate documentation:

```bash
npm run generate-docs your-example
```

## Configuration

All scripts are self-contained and read from:
- `contracts/` - Smart contract source files
- `test/` - Test files
- `base-template/` - Template for scaffolding new examples

## Output Directories

- `docs/examples/` - Generated documentation files
- `docs/SUMMARY.md` - GitBook navigation index
- `output/` - Generated standalone examples (default location)

## Development

### Prerequisites

- Node.js 20+
- npm 7+
- TypeScript 5+
- ts-node

### Testing a Script

```bash
# Make script executable (Unix-like systems)
chmod +x scripts/create-fhevm-example.ts

# Run directly
./scripts/create-fhevm-example.ts --help

# Or using ts-node
npx ts-node scripts/create-fhevm-example.ts --help
```

## Error Handling

All scripts provide clear error messages with helpful context:
- Missing files are reported with exact paths
- Configuration issues are explained
- Help text is available with `--help` flag

## Best Practices

1. **Keep contracts focused** - One clear concept per example
2. **Write comprehensive tests** - Document both success and failure cases
3. **Add JSDoc comments** - Use NatSpec for contract documentation
4. **Test generation** - Verify generated repositories work correctly
5. **Update SUMMARY.md** - Keep GitBook navigation in sync

## Troubleshooting

### Script not found error
Ensure you're running from the project root directory where scripts are located.

### Template path errors
Check that `base-template/` exists with the expected structure.

### Test failures in generated examples
Verify the contract and test paths are correct in the EXAMPLES_MAP.

### Documentation generation issues
Ensure contracts have proper NatSpec comments starting with `/**`

## License

BSD-3-Clause-Clear
