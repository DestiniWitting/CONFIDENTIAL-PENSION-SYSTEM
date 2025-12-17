# FHEVM Example Template

Base template for creating standalone FHEVM example repositories.

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

### Deploy

```bash
# Local
npx hardhat deploy --network localhost

# Sepolia
npx hardhat deploy --network sepolia
```

## Project Structure

```
base-template/
├── contracts/           # Smart contracts
├── test/                # Test suites
├── deploy/              # Deployment scripts
├── tasks/               # Hardhat tasks
├── hardhat.config.ts    # Hardhat configuration
├── package.json         # Dependencies
└── README.md            # This file
```

## Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/)

## License

BSD-3-Clause-Clear
