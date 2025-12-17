#!/usr/bin/env ts-node

/**
 * create-fhevm-category - CLI tool to generate category-based FHEVM example repositories
 *
 * Usage: ts-node scripts/create-fhevm-category.ts <category-name> [output-dir]
 *
 * Example: ts-node scripts/create-fhevm-category.ts advanced ./my-advanced-examples
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

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

function error(message: string): never {
  log(`❌ Error: ${message}`, Color.Red);
  process.exit(1);
}

function success(message: string): void {
  log(`✅ ${message}`, Color.Green);
}

function info(message: string): void {
  log(`ℹ️  ${message}`, Color.Blue);
}

// Category configuration interface
interface CategoryConfig {
  name: string;
  description: string;
  examples: string[];
}

// Categories and their examples
const CATEGORIES: Record<string, CategoryConfig> = {
  'basic': {
    name: 'Basic Examples',
    description: 'Fundamental FHEVM concepts including arithmetic, encryption, decryption, and access control',
    examples: [
      'fhe-arithmetic',
      'encrypt-single-value',
      'encrypt-multiple-values',
      'user-decrypt-single-value',
      'public-decrypt-single-value',
      'access-control',
    ],
  },
  'advanced': {
    name: 'Advanced Examples',
    description: 'Advanced FHEVM examples including financial applications and complex patterns',
    examples: ['confidential-pension'],
  },
};

function copyDirectoryRecursive(source: string, destination: string): void {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const items = fs.readdirSync(source);

  items.forEach(item => {
    const sourcePath = path.join(source, item);
    const destPath = path.join(destination, item);
    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      // Skip node_modules, artifacts, cache, etc.
      if (['node_modules', 'artifacts', 'cache', 'coverage', 'types', 'dist'].includes(item)) {
        return;
      }
      copyDirectoryRecursive(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}

function generateCategoryReadme(category: CategoryConfig, examples: string[]): string {
  return `# ${category.name}

${category.description}

## Examples in this Category

${examples.map(ex => `- **${ex}**: Privacy-preserving implementation example`).join('\n')}

## Project Structure

\`\`\`
${category.name.toLowerCase().replace(/\s+/g, '-')}/
├── ${examples.map(ex => `${ex}/`).join('\n│   ├── ')}
└── README.md
\`\`\`

## Getting Started

Each example is a standalone FHEVM project. Navigate to an example directory:

\`\`\`bash
cd ${examples[0]}
npm install
npm run compile
npm run test
\`\`\`

## Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Examples Hub](https://docs.zama.org/protocol/examples)

## License

BSD-3-Clause-Clear

---

**Built with FHEVM by Zama**
`;
}

function createCategory(categoryName: string, outputDir: string): void {
  const category = CATEGORIES[categoryName];

  if (!category) {
    error(`Unknown category: ${categoryName}\n\nAvailable categories:\n${Object.keys(CATEGORIES).map(k => `  - ${k}`).join('\n')}`);
  }

  info(`Creating FHEVM category: ${category.name}`);
  info(`Output directory: ${outputDir}`);
  info(`Examples: ${category.examples.join(', ')}`);

  // Check if output directory exists
  if (fs.existsSync(outputDir)) {
    error(`Output directory already exists: ${outputDir}`);
  }

  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });

  // Generate each example in the category
  log('\n📦 Generating examples...', Color.Cyan);

  category.examples.forEach((exampleName, index) => {
    log(`\n[${index + 1}/${category.examples.length}] Generating ${exampleName}...`, Color.Yellow);

    const exampleDir = path.join(outputDir, exampleName);
    const rootDir = path.resolve(__dirname, '..');
    const scriptPath = path.join(rootDir, 'scripts', 'create-fhevm-example.ts');

    try {
      // Execute create-fhevm-example.ts for each example
      execSync(`npx ts-node "${scriptPath}" ${exampleName} "${exampleDir}"`, {
        stdio: 'inherit',
        cwd: rootDir,
      });
      success(`Generated ${exampleName}`);
    } catch (err) {
      error(`Failed to generate ${exampleName}: ${err}`);
    }
  });

  // Generate category README
  log('\n📝 Generating category README...', Color.Cyan);
  const readme = generateCategoryReadme(category, category.examples);
  fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
  success('Category README.md generated');

  // Final summary
  log('\n' + '='.repeat(60), Color.Green);
  success(`FHEVM category "${category.name}" created successfully!`);
  log('='.repeat(60), Color.Green);

  log('\n📦 Next steps:', Color.Yellow);
  log(`  cd ${path.relative(process.cwd(), outputDir)}`);
  log(`  # Navigate to any example:`);
  log(`  cd ${category.examples[0]}`);
  log('  npm install');
  log('  npm run compile');
  log('  npm run test');

  log('\n🎉 Happy coding with FHEVM!', Color.Cyan);
}

// Main execution
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    log('FHEVM Category Generator', Color.Cyan);
    log('\nUsage: ts-node scripts/create-fhevm-category.ts <category-name> [output-dir]\n');
    log('Available categories:', Color.Yellow);
    Object.entries(CATEGORIES).forEach(([name, info]) => {
      log(`  ${name}`, Color.Green);
      log(`    ${info.description}`, Color.Reset);
      log(`    Examples: ${info.examples.join(', ')}`, Color.Reset);
    });
    log('\nExample:', Color.Yellow);
    log('  ts-node scripts/create-fhevm-category.ts advanced ./my-advanced-examples\n');
    process.exit(0);
  }

  const categoryName = args[0];
  const outputDir = args[1] || path.join(process.cwd(), 'output', `fhevm-category-${categoryName}`);

  createCategory(categoryName, outputDir);
}

main();
