# Developer Guide

For the complete developer guide, please see [DEVELOPER_GUIDE.md](../DEVELOPER_GUIDE.md) in the project root.

## Quick Links

- [Adding New Examples](../DEVELOPER_GUIDE.md#adding-new-examples)
- [Updating Dependencies](../DEVELOPER_GUIDE.md#updating-dependencies)
- [Maintaining Examples](../DEVELOPER_GUIDE.md#maintaining-examples)
- [Documentation Generation](../DEVELOPER_GUIDE.md#documentation-generation)
- [Testing Your Examples](../DEVELOPER_GUIDE.md#testing-your-examples)
- [Common Issues and Solutions](../DEVELOPER_GUIDE.md#common-issues-and-solutions)

## Overview

The developer guide covers:

1. **Project Overview** - Understanding the project structure
2. **Adding New Examples** - Step-by-step guide with code examples
3. **Updating Dependencies** - How to handle version updates
4. **Maintaining Examples** - Code quality and maintenance tasks
5. **Documentation Generation** - Auto-generating GitBook docs
6. **Testing Your Examples** - Best practices for testing
7. **Common Issues and Solutions** - Troubleshooting guide

## Getting Started

To add a new FHEVM example:

1. Create your contract in `contracts/`
2. Create comprehensive tests in `test/`
3. Register the example in `scripts/create-fhevm-example.ts`
4. Register documentation config in `scripts/generate-docs.ts`
5. Generate documentation: `npm run generate-docs your-example`
6. Create standalone repo: `npm run create-example your-example ./output`

## Automation Tools

Use these NPM scripts for automation:

```bash
# Generate a standalone example
npm run create-example confidential-pension ./my-example

# Generate category project
npm run create-category advanced ./my-category

# Generate documentation
npm run generate-docs confidential-pension
npm run generate-all-docs

# Get help
npm run help:create
npm run help:category
npm run help:docs
```

## Resources

- [Full Developer Guide](../DEVELOPER_GUIDE.md)
- [Scripts Documentation](../scripts/README.md)
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Submission Requirements](../SUBMISSION_REQUIREMENTS.md)

---

**For detailed information, see the complete [DEVELOPER_GUIDE.md](../DEVELOPER_GUIDE.md)**
