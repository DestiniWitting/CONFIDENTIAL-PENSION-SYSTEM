#!/usr/bin/env ts-node

/**
 * generate-docs - Generates GitBook-formatted documentation from contracts and tests
 *
 * Usage: ts-node scripts/generate-docs.ts <example-name> [options]
 *
 * Example: ts-node scripts/generate-docs.ts confidential-pension --output docs/
 */

import * as fs from 'fs';
import * as path from 'path';

// Color codes for terminal output
enum Color {
  Reset = '\x1b[0m',
  Green = '\x1b[32m',
  Blue = '\x1b[34m',
  Yellow = '\x1b[33m',
  Red = '\x1b[31m',
  Cyan = '\x1b[36m',
}

function log(message: string, color: Color = Color.Reset): void {
  console.log(`${color}${message}${Color.Reset}`);
}

function success(message: string): void {
  log(`✅ ${message}`, Color.Green);
}

function info(message: string): void {
  log(`ℹ️  ${message}`, Color.Blue);
}

function error(message: string): never {
  log(`❌ Error: ${message}`, Color.Red);
  process.exit(1);
}

// Documentation configuration interface
interface DocsConfig {
  title: string;
  description: string;
  contract: string;
  test: string;
  output: string;
  category: string;
}

// Example configurations
const EXAMPLES: Record<string, DocsConfig> = {
  'confidential-pension': {
    title: 'Confidential Pension System',
    description: 'Advanced pension management with encrypted financial operations',
    contract: 'contracts/ConfidentialPensionSystem.sol',
    test: 'test/ConfidentialPensionSystem.ts',
    output: 'docs/examples/confidential-pension.md',
    category: 'Advanced Examples',
  },
  'fhe-arithmetic': {
    title: 'FHE Arithmetic Operations',
    description: 'Demonstrates FHE arithmetic: add, subtract, multiply, and divide',
    contract: 'contracts/basic/FHEArithmetic.sol',
    test: 'test/basic/FHEArithmetic.ts',
    output: 'docs/examples/fhe-arithmetic.md',
    category: 'Basic Examples',
  },
  'encrypt-single-value': {
    title: 'Encrypt Single Value',
    description: 'How to encrypt and store a single value',
    contract: 'contracts/basic/EncryptSingleValue.sol',
    test: 'test/basic/EncryptSingleValue.ts',
    output: 'docs/examples/encrypt-single-value.md',
    category: 'Basic Examples',
  },
  'encrypt-multiple-values': {
    title: 'Encrypt Multiple Values',
    description: 'Handling multiple encrypted values',
    contract: 'contracts/basic/EncryptMultipleValues.sol',
    test: 'test/basic/EncryptMultipleValues.ts',
    output: 'docs/examples/encrypt-multiple-values.md',
    category: 'Basic Examples',
  },
  'user-decrypt-single-value': {
    title: 'User Decrypt Single Value',
    description: 'User decryption pattern for off-chain decryption',
    contract: 'contracts/basic/UserDecryptSingleValue.sol',
    test: 'test/basic/UserDecryptSingleValue.ts',
    output: 'docs/examples/user-decrypt-single-value.md',
    category: 'Decryption Examples',
  },
  'public-decrypt-single-value': {
    title: 'Public Decrypt Single Value',
    description: 'Public decryption revealing values on-chain',
    contract: 'contracts/basic/PublicDecryptSingleValue.sol',
    test: 'test/basic/PublicDecryptSingleValue.ts',
    output: 'docs/examples/public-decrypt-single-value.md',
    category: 'Decryption Examples',
  },
  'access-control': {
    title: 'Access Control',
    description: 'Permission management with FHE.allow and FHE.allowThis',
    contract: 'contracts/basic/AccessControl.sol',
    test: 'test/basic/AccessControl.ts',
    output: 'docs/examples/access-control.md',
    category: 'Access Control Examples',
  },
};

function extractContractDoc(contractPath: string): string {
  if (!fs.existsSync(contractPath)) {
    return '';
  }

  const content = fs.readFileSync(contractPath, 'utf-8');
  let doc = '';

  // Extract natspec comments
  const natspecRegex = /\/\*\*\s*([\s\S]*?)\*\//g;
  let match;

  while ((match = natspecRegex.exec(content)) !== null) {
    const comment = match[1]
      .split('\n')
      .map(line => line.replace(/^\s*\*\s?/, '').trim())
      .filter(line => line.length > 0)
      .join('\n');
    doc += comment + '\n\n';
  }

  return doc;
}

function extractCodeSnippets(contractPath: string): string[] {
  if (!fs.existsSync(contractPath)) {
    return [];
  }

  const content = fs.readFileSync(contractPath, 'utf-8');
  const snippets: string[] = [];

  // Extract important function definitions
  const functionRegex = /function\s+(\w+)\s*\([^)]*\)[^{]*\{[\s\S]*?\n\s*\}/g;
  let match;

  let count = 0;
  while ((match = functionRegex.exec(content)) !== null && count < 5) {
    snippets.push(match[0]);
    count++;
  }

  return snippets;
}

function extractTestPatterns(testPath: string): string {
  if (!fs.existsSync(testPath)) {
    return '';
  }

  const content = fs.readFileSync(testPath, 'utf-8');
  let patterns = '';

  // Extract test descriptions and key comments
  const describeRegex = /describe\(["'](.*?)["']/g;
  const itRegex = /it\(["'](.*?)["']/g;

  const describes = Array.from(content.matchAll(describeRegex)).map(m => m[1]);
  const its = Array.from(content.matchAll(itRegex)).map(m => m[1]);

  if (describes.length > 0) {
    patterns += '## Test Coverage\n\n';
    describes.forEach((desc, idx) => {
      patterns += `### ${desc}\n\n`;
      const relatedTests = its.slice(idx * 3, (idx + 1) * 3);
      relatedTests.forEach(test => {
        patterns += `- ${test}\n`;
      });
      patterns += '\n';
    });
  }

  return patterns;
}

function generateDocumentation(exampleName: string): void {
  const example = EXAMPLES[exampleName];
  if (!example) {
    error(`Unknown example: ${exampleName}`);
  }

  info(`Generating documentation for: ${exampleName}`);

  const rootDir = path.resolve(__dirname, '..');
  const contractPath = path.join(rootDir, example.contract);
  const testPath = path.join(rootDir, example.test);
  const outputPath = path.join(rootDir, example.output);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate documentation
  let doc = `# ${example.title}\n\n`;
  doc += `${example.description}\n\n`;
  doc += `## Overview\n\n`;
  doc += `This example demonstrates how to build a privacy-preserving ${example.title.toLowerCase()} using FHEVM.\n\n`;

  // Add contract documentation
  const contractDoc = extractContractDoc(contractPath);
  if (contractDoc) {
    doc += `## Smart Contract\n\n`;
    doc += contractDoc;
  }

  // Add code snippets
  const snippets = extractCodeSnippets(contractPath);
  if (snippets.length > 0) {
    doc += `## Key Implementation Patterns\n\n`;
    snippets.forEach((snippet, idx) => {
      doc += `### Pattern ${idx + 1}\n\n`;
      doc += `\`\`\`solidity\n${snippet}\n\`\`\`\n\n`;
    });
  }

  // Add test patterns
  const testPatterns = extractTestPatterns(testPath);
  if (testPatterns) {
    doc += testPatterns;
  }

  // Add usage section
  doc += `## Usage\n\n`;
  doc += `### Compile the Contract\n\n`;
  doc += `\`\`\`bash\nnpm run compile\n\`\`\`\n\n`;
  doc += `### Run Tests\n\n`;
  doc += `\`\`\`bash\nnpm run test\n\`\`\`\n\n`;
  doc += `### Deploy\n\n`;
  doc += `\`\`\`bash\nnpm run deploy:sepolia\n\`\`\`\n\n`;

  // Add resources
  doc += `## Resources\n\n`;
  doc += `- [FHEVM Documentation](https://docs.zama.ai/fhevm)\n`;
  doc += `- [FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)\n`;
  doc += `- [Zama Community Forum](https://community.zama.ai)\n\n`;

  // Write documentation
  fs.writeFileSync(outputPath, doc);
  success(`Documentation generated: ${example.output}`);
}

function generateAllDocs(): void {
  info('Generating documentation for all examples...\n');

  const exampleNames = Object.keys(EXAMPLES);
  exampleNames.forEach(name => {
    generateDocumentation(name);
  });

  // Generate SUMMARY.md for GitBook
  generateSummary(exampleNames);

  success('\nAll documentation generated successfully!');
}

function generateSummary(exampleNames: string[]): void {
  const rootDir = path.resolve(__dirname, '..');
  const summaryPath = path.join(rootDir, 'docs', 'SUMMARY.md');

  let summary = `# Summary\n\n`;
  summary += `## Introduction\n\n`;
  summary += `* [Getting Started](README.md)\n\n`;

  // Group by category
  const categories: Record<string, string[]> = {};
  exampleNames.forEach(name => {
    const category = EXAMPLES[name].category;
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(name);
  });

  // Write categorized summary
  Object.entries(categories).forEach(([category, examples]) => {
    summary += `## ${category}\n\n`;
    examples.forEach(name => {
      const example = EXAMPLES[name];
      const relativePath = example.output.replace('docs/', '');
      summary += `* [${example.title}](${relativePath})\n`;
    });
    summary += `\n`;
  });

  // Ensure docs directory exists
  const docsDir = path.dirname(summaryPath);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  fs.writeFileSync(summaryPath, summary);
  success('SUMMARY.md generated for GitBook');
}

// Main execution
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    log('FHEVM Documentation Generator', Color.Cyan);
    log('\nUsage: ts-node scripts/generate-docs.ts <example-name> | --all\n');
    log('Available examples:', Color.Yellow);
    Object.entries(EXAMPLES).forEach(([name, info]) => {
      log(`  ${name}`, Color.Green);
      log(`    ${info.description}`, Color.Reset);
    });
    log('\nOptions:', Color.Yellow);
    log('  --all    Generate documentation for all examples');
    log('\nExample:', Color.Yellow);
    log('  ts-node scripts/generate-docs.ts confidential-pension');
    log('  ts-node scripts/generate-docs.ts --all\n');
    process.exit(0);
  }

  if (args[0] === '--all') {
    generateAllDocs();
  } else {
    generateDocumentation(args[0]);
  }
}

main();
