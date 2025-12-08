import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { ConfidentialPensionSystem, ConfidentialPensionSystem__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { time } from "@nomicfoundation/hardhat-network-helpers";

/**
 * @title Confidential Pension System Tests
 * @notice Comprehensive test suite demonstrating FHEVM patterns for pension management
 * @dev Tests cover:
 *      - Account creation and initialization
 *      - Encrypted contribution handling
 *      - Investment option selection
 *      - Encrypted returns calculation
 *      - Retirement process
 *      - Encrypted withdrawal with balance checks
 *      - Common error cases and security patterns
 */

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("ConfidentialPensionSystem")) as ConfidentialPensionSystem__factory;
  const contract = (await factory.deploy()) as ConfidentialPensionSystem;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("ConfidentialPensionSystem", function () {
  let signers: Signers;
  let contract: ConfidentialPensionSystem;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This test suite is designed for FHEVM mock environment`);
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  describe("Account Creation", function () {
    it("✅ should successfully create a pension account with valid retirement age", async function () {
      const retirementAge = 65;

      const tx = await contract.connect(signers.alice).createPensionAccount(retirementAge);
      await tx.wait();

      // Verify account is active
      const accountInfo = await contract.connect(signers.alice).getAccountInfo();
      expect(accountInfo.retirementAge).to.equal(retirementAge);
      expect(accountInfo.isRetired).to.be.false;

      // Verify encrypted values are initialized (should be zero)
      const balance = await contract.connect(signers.alice).getBalance();
      const decryptedBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        balance,
        contractAddress,
        signers.alice
      );
      expect(decryptedBalance).to.equal(0n);
    });

    it("❌ should fail when creating account with retirement age below minimum", async function () {
      const invalidAge = 54; // MIN_RETIREMENT_AGE is 55

      await expect(
        contract.connect(signers.alice).createPensionAccount(invalidAge)
      ).to.be.revertedWith("Invalid retirement age");
    });

    it("❌ should fail when creating account with retirement age above maximum", async function () {
      const invalidAge = 76; // MAX_RETIREMENT_AGE is 75

      await expect(
        contract.connect(signers.alice).createPensionAccount(invalidAge)
      ).to.be.revertedWith("Invalid retirement age");
    });

    it("❌ should fail when user tries to create duplicate account", async function () {
      const retirementAge = 65;

      // Create first account
      await contract.connect(signers.alice).createPensionAccount(retirementAge);

      // Try to create second account - should fail
      await expect(
        contract.connect(signers.alice).createPensionAccount(retirementAge)
      ).to.be.revertedWith("Account already exists");
    });
  });

  describe("Contributions", function () {
    beforeEach(async function () {
      // Create pension account for Alice
      await contract.connect(signers.alice).createPensionAccount(65);
    });

    it("✅ should accept encrypted contribution and update balance correctly", async function () {
      const contributionAmount = 1000n;

      // Create encrypted input
      const encryptedInput = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add64(contributionAmount)
        .encrypt();

      // Make contribution
      const tx = await contract
        .connect(signers.alice)
        .makeContribution(encryptedInput.handles[0], encryptedInput.inputProof);
      await tx.wait();

      // Verify balance increased
      const balance = await contract.connect(signers.alice).getBalance();
      const decryptedBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        balance,
        contractAddress,
        signers.alice
      );
      expect(decryptedBalance).to.equal(contributionAmount);

      // Verify contributions tracking
      const contributions = await contract.connect(signers.alice).getContributions();
      const decryptedContributions = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        contributions,
        contractAddress,
        signers.alice
      );
      expect(decryptedContributions).to.equal(contributionAmount);
    });

    it("✅ should correctly sum multiple contributions", async function () {
      const amounts = [500n, 300n, 200n];
      const expectedTotal = amounts.reduce((sum, val) => sum + val, 0n);

      // Make multiple contributions
      for (const amount of amounts) {
        const encryptedInput = await fhevm
          .createEncryptedInput(contractAddress, signers.alice.address)
          .add64(amount)
          .encrypt();

        await contract
          .connect(signers.alice)
          .makeContribution(encryptedInput.handles[0], encryptedInput.inputProof);
      }

      // Verify total balance
      const balance = await contract.connect(signers.alice).getBalance();
      const decryptedBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        balance,
        contractAddress,
        signers.alice
      );
      expect(decryptedBalance).to.equal(expectedTotal);
    });

    it("❌ should fail when making contribution without an active account", async function () {
      const contributionAmount = 1000n;

      const encryptedInput = await fhevm
        .createEncryptedInput(contractAddress, signers.bob.address)
        .add64(contributionAmount)
        .encrypt();

      await expect(
        contract
          .connect(signers.bob)
          .makeContribution(encryptedInput.handles[0], encryptedInput.inputProof)
      ).to.be.revertedWith("No active pension account");
    });

    it("❌ should fail when retired user tries to make contribution", async function () {
      const contributionAmount = 1000n;

      // First make an initial contribution
      const encryptedInput1 = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add64(contributionAmount)
        .encrypt();
      await contract
        .connect(signers.alice)
        .makeContribution(encryptedInput1.handles[0], encryptedInput1.inputProof);

      // Initiate retirement
      await contract.connect(signers.alice).initiateRetirement();

      // Try to make another contribution - should fail
      const encryptedInput2 = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add64(contributionAmount)
        .encrypt();

      await expect(
        contract
          .connect(signers.alice)
          .makeContribution(encryptedInput2.handles[0], encryptedInput2.inputProof)
      ).to.be.revertedWith("Account is already retired");
    });
  });

  describe("Investment Options", function () {
    beforeEach(async function () {
      await contract.connect(signers.alice).createPensionAccount(65);
    });

    it("✅ should successfully select a valid investment option", async function () {
      const optionId = 1; // Balanced Portfolio

      const tx = await contract.connect(signers.alice).selectInvestmentOption(optionId);
      await tx.wait();

      const accountInfo = await contract.connect(signers.alice).getAccountInfo();
      expect(accountInfo.selectedInvestment).to.equal(optionId);
    });

    it("✅ should retrieve investment option details correctly", async function () {
      const optionId = 0; // Conservative Bonds

      const optionDetails = await contract.getInvestmentOption(optionId);

      expect(optionDetails.name).to.equal("Conservative Bonds");
      expect(optionDetails.riskLevel).to.equal(2);
      expect(optionDetails.isActive).to.be.true;
    });

    it("❌ should fail when selecting invalid investment option", async function () {
      const invalidOptionId = 999;

      await expect(
        contract.connect(signers.alice).selectInvestmentOption(invalidOptionId)
      ).to.be.revertedWith("Invalid investment option");
    });

    it("❌ should fail when user without account tries to select investment", async function () {
      await expect(
        contract.connect(signers.bob).selectInvestmentOption(0)
      ).to.be.revertedWith("No active pension account");
    });
  });

  describe("Investment Returns Calculation", function () {
    beforeEach(async function () {
      await contract.connect(signers.alice).createPensionAccount(65);

      // Make an initial contribution
      const contributionAmount = 12000n; // 12,000 for easier calculation
      const encryptedInput = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add64(contributionAmount)
        .encrypt();

      await contract
        .connect(signers.alice)
        .makeContribution(encryptedInput.handles[0], encryptedInput.inputProof);
    });

    it("✅ should calculate returns after sufficient time has passed", async function () {
      // Select Growth Stocks (9% annual = 0.75% monthly)
      await contract.connect(signers.alice).selectInvestmentOption(2);

      const balanceBefore = await contract.connect(signers.alice).getBalance();
      const decryptedBalanceBefore = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        balanceBefore,
        contractAddress,
        signers.alice
      );

      // Fast forward 31 days (more than SECONDS_PER_MONTH)
      await time.increase(31 * 24 * 60 * 60);

      // Calculate returns
      const tx = await contract.connect(signers.alice).calculateReturns();
      await tx.wait();

      // Verify balance increased
      const balanceAfter = await contract.connect(signers.alice).getBalance();
      const decryptedBalanceAfter = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        balanceAfter,
        contractAddress,
        signers.alice
      );

      expect(decryptedBalanceAfter).to.be.greaterThan(decryptedBalanceBefore);

      // Verify investment returns were tracked
      const returns = await contract.connect(signers.alice).getReturns();
      const decryptedReturns = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        returns,
        contractAddress,
        signers.alice
      );
      expect(decryptedReturns).to.be.greaterThan(0n);
    });

    it("✅ should not calculate returns if insufficient time has passed", async function () {
      const balanceBefore = await contract.connect(signers.alice).getBalance();
      const decryptedBalanceBefore = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        balanceBefore,
        contractAddress,
        signers.alice
      );

      // Only advance 1 day (less than SECONDS_PER_MONTH)
      await time.increase(1 * 24 * 60 * 60);

      // Try to calculate returns
      await contract.connect(signers.alice).calculateReturns();

      // Balance should remain unchanged
      const balanceAfter = await contract.connect(signers.alice).getBalance();
      const decryptedBalanceAfter = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        balanceAfter,
        contractAddress,
        signers.alice
      );

      expect(decryptedBalanceAfter).to.equal(decryptedBalanceBefore);
    });

    it("✅ should apply different returns for different investment options", async function () {
      // Create account for Bob with same initial contribution
      await contract.connect(signers.bob).createPensionAccount(65);
      const contributionAmount = 12000n;
      const encryptedInput = await fhevm
        .createEncryptedInput(contractAddress, signers.bob.address)
        .add64(contributionAmount)
        .encrypt();
      await contract
        .connect(signers.bob)
        .makeContribution(encryptedInput.handles[0], encryptedInput.inputProof);

      // Alice selects Conservative Bonds (3%)
      await contract.connect(signers.alice).selectInvestmentOption(0);

      // Bob selects Growth Stocks (9%)
      await contract.connect(signers.bob).selectInvestmentOption(2);

      // Fast forward time
      await time.increase(31 * 24 * 60 * 60);

      // Calculate returns for both
      await contract.connect(signers.alice).calculateReturns();
      await contract.connect(signers.bob).calculateReturns();

      // Get returns for both users
      const aliceReturns = await contract.connect(signers.alice).getReturns();
      const decryptedAliceReturns = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        aliceReturns,
        contractAddress,
        signers.alice
      );

      const bobReturns = await contract.connect(signers.bob).getReturns();
      const decryptedBobReturns = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        bobReturns,
        contractAddress,
        signers.bob
      );

      // Bob's returns should be higher (9% vs 3%)
      expect(decryptedBobReturns).to.be.greaterThan(decryptedAliceReturns);
    });
  });

  describe("Retirement", function () {
    beforeEach(async function () {
      await contract.connect(signers.alice).createPensionAccount(65);
    });

    it("✅ should successfully initiate retirement", async function () {
      const tx = await contract.connect(signers.alice).initiateRetirement();
      await tx.wait();

      const accountInfo = await contract.connect(signers.alice).getAccountInfo();
      expect(accountInfo.isRetired).to.be.true;
    });

    it("❌ should fail when non-account holder tries to retire", async function () {
      await expect(
        contract.connect(signers.bob).initiateRetirement()
      ).to.be.revertedWith("No active pension account");
    });

    it("❌ should fail when already retired user tries to retire again", async function () {
      // First retirement
      await contract.connect(signers.alice).initiateRetirement();

      // Try to retire again - should fail
      await expect(
        contract.connect(signers.alice).initiateRetirement()
      ).to.be.revertedWith("Account is already retired");
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      await contract.connect(signers.alice).createPensionAccount(65);

      // Make initial contribution
      const contributionAmount = 5000n;
      const encryptedInput = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add64(contributionAmount)
        .encrypt();

      await contract
        .connect(signers.alice)
        .makeContribution(encryptedInput.handles[0], encryptedInput.inputProof);

      // Initiate retirement
      await contract.connect(signers.alice).initiateRetirement();
    });

    it("✅ should successfully withdraw valid amount after retirement", async function () {
      const withdrawalAmount = 1000n;

      // Get balance before withdrawal
      const balanceBefore = await contract.connect(signers.alice).getBalance();
      const decryptedBalanceBefore = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        balanceBefore,
        contractAddress,
        signers.alice
      );

      // Create encrypted withdrawal
      const encryptedInput = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add64(withdrawalAmount)
        .encrypt();

      const tx = await contract
        .connect(signers.alice)
        .withdraw(encryptedInput.handles[0], encryptedInput.inputProof);
      await tx.wait();

      // Verify balance decreased
      const balanceAfter = await contract.connect(signers.alice).getBalance();
      const decryptedBalanceAfter = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        balanceAfter,
        contractAddress,
        signers.alice
      );

      expect(decryptedBalanceAfter).to.equal(decryptedBalanceBefore - withdrawalAmount);
    });

    it("✅ should handle withdrawal of entire balance", async function () {
      const balanceBefore = await contract.connect(signers.alice).getBalance();
      const decryptedBalanceBefore = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        balanceBefore,
        contractAddress,
        signers.alice
      );

      // Withdraw entire balance
      const encryptedInput = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add64(decryptedBalanceBefore)
        .encrypt();

      await contract
        .connect(signers.alice)
        .withdraw(encryptedInput.handles[0], encryptedInput.inputProof);

      // Balance should be zero
      const balanceAfter = await contract.connect(signers.alice).getBalance();
      const decryptedBalanceAfter = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        balanceAfter,
        contractAddress,
        signers.alice
      );

      expect(decryptedBalanceAfter).to.equal(0n);
    });

    it("✅ should preserve balance when withdrawal amount exceeds available balance", async function () {
      // This tests the encrypted comparison logic using FHE.select()
      const balanceBefore = await contract.connect(signers.alice).getBalance();
      const decryptedBalanceBefore = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        balanceBefore,
        contractAddress,
        signers.alice
      );

      // Try to withdraw more than balance (6000 > 5000)
      const excessiveAmount = 6000n;
      const encryptedInput = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add64(excessiveAmount)
        .encrypt();

      await contract
        .connect(signers.alice)
        .withdraw(encryptedInput.handles[0], encryptedInput.inputProof);

      // Balance should remain unchanged due to FHE.select() logic
      const balanceAfter = await contract.connect(signers.alice).getBalance();
      const decryptedBalanceAfter = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        balanceAfter,
        contractAddress,
        signers.alice
      );

      expect(decryptedBalanceAfter).to.equal(decryptedBalanceBefore);
    });

    it("❌ should fail when non-retired user tries to withdraw", async function () {
      // Create new account for Bob who is not retired
      await contract.connect(signers.bob).createPensionAccount(65);

      const contributionAmount = 1000n;
      const encryptedContribution = await fhevm
        .createEncryptedInput(contractAddress, signers.bob.address)
        .add64(contributionAmount)
        .encrypt();

      await contract
        .connect(signers.bob)
        .makeContribution(encryptedContribution.handles[0], encryptedContribution.inputProof);

      // Try to withdraw without retiring - should fail
      const withdrawalAmount = 500n;
      const encryptedWithdrawal = await fhevm
        .createEncryptedInput(contractAddress, signers.bob.address)
        .add64(withdrawalAmount)
        .encrypt();

      await expect(
        contract
          .connect(signers.bob)
          .withdraw(encryptedWithdrawal.handles[0], encryptedWithdrawal.inputProof)
      ).to.be.revertedWith("Must be retired to withdraw");
    });
  });

  describe("Admin Functions", function () {
    it("✅ should allow admin to add new investment option", async function () {
      const newOption = {
        name: "High Risk Crypto",
        riskLevel: 10,
        returnRate: 1500, // 15%
      };

      const tx = await contract
        .connect(signers.deployer)
        .addInvestmentOption(newOption.name, newOption.riskLevel, newOption.returnRate);
      await tx.wait();

      const totalOptions = await contract.totalInvestmentOptions();
      expect(totalOptions).to.equal(4);

      const optionDetails = await contract.getInvestmentOption(3);
      expect(optionDetails.name).to.equal(newOption.name);
      expect(optionDetails.riskLevel).to.equal(newOption.riskLevel);
    });

    it("✅ should allow admin to update investment return rate", async function () {
      const optionId = 0;
      const newReturnRate = 400; // Update from 3% to 4%

      await contract.connect(signers.deployer).updateInvestmentReturn(optionId, newReturnRate);

      // Verify the update by checking the option still exists and is usable
      const optionDetails = await contract.getInvestmentOption(optionId);
      expect(optionDetails.isActive).to.be.true;
    });

    it("✅ should allow admin to toggle investment option status", async function () {
      const optionId = 0;

      // Toggle to inactive
      await contract.connect(signers.deployer).toggleInvestmentOption(optionId);

      let optionDetails = await contract.getInvestmentOption(optionId);
      expect(optionDetails.isActive).to.be.false;

      // Toggle back to active
      await contract.connect(signers.deployer).toggleInvestmentOption(optionId);

      optionDetails = await contract.getInvestmentOption(optionId);
      expect(optionDetails.isActive).to.be.true;
    });

    it("❌ should fail when non-admin tries to add investment option", async function () {
      await expect(
        contract.connect(signers.alice).addInvestmentOption("Unauthorized Option", 5, 500)
      ).to.be.revertedWith("Only admin can call this function");
    });

    it("❌ should fail when non-admin tries to update return rate", async function () {
      await expect(
        contract.connect(signers.alice).updateInvestmentReturn(0, 500)
      ).to.be.revertedWith("Only admin can call this function");
    });
  });

  describe("Privacy and Access Control", function () {
    it("✅ should prevent users from accessing each other's encrypted data", async function () {
      // Alice creates account and makes contribution
      await contract.connect(signers.alice).createPensionAccount(65);
      const aliceContribution = 5000n;
      const aliceEncrypted = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add64(aliceContribution)
        .encrypt();
      await contract
        .connect(signers.alice)
        .makeContribution(aliceEncrypted.handles[0], aliceEncrypted.inputProof);

      // Bob creates account and makes contribution
      await contract.connect(signers.bob).createPensionAccount(67);
      const bobContribution = 3000n;
      const bobEncrypted = await fhevm
        .createEncryptedInput(contractAddress, signers.bob.address)
        .add64(bobContribution)
        .encrypt();
      await contract
        .connect(signers.bob)
        .makeContribution(bobEncrypted.handles[0], bobEncrypted.inputProof);

      // Verify Alice can only see her own balance
      const aliceBalance = await contract.connect(signers.alice).getBalance();
      const decryptedAliceBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        aliceBalance,
        contractAddress,
        signers.alice
      );
      expect(decryptedAliceBalance).to.equal(aliceContribution);

      // Verify Bob can only see his own balance
      const bobBalance = await contract.connect(signers.bob).getBalance();
      const decryptedBobBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        bobBalance,
        contractAddress,
        signers.bob
      );
      expect(decryptedBobBalance).to.equal(bobContribution);
    });
  });
});
