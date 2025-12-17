import { expect } from "chai";
import { ethers } from "hardhat";
import { awaitAllDecryptionResults, initGateway } from "@fhevm/hardhat-plugin";
import type { EncryptMultipleValues } from "../../types";
import { Signer } from "ethers";
import { FhevmInstance } from "@fhevm/hardhat-plugin/dist/types";

describe("EncryptMultipleValues", function () {
  let contract: EncryptMultipleValues;
  let owner: Signer;
  let fhevm: FhevmInstance;
  let contractAddress: string;

  before(async function () {
    await initGateway();
  });

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("EncryptMultipleValues");
    contract = await Factory.connect(owner).deploy();
    await contract.waitForDeployment();

    contractAddress = await contract.getAddress();
    fhevm = await ethers.getFhevmInstance(contractAddress);
  });

  describe("initialize", function () {
    it("should initialize multiple encrypted values", async function () {
      const ownerAddress = await owner.getAddress();

      // ✅ CORRECT: Create separate encrypted inputs for each value
      const balanceInput = await fhevm.createEncryptedInput(contractAddress, ownerAddress);
      balanceInput.add32(1000);
      const balanceEncrypted = await balanceInput.encrypt();

      const allowanceInput = await fhevm.createEncryptedInput(contractAddress, ownerAddress);
      allowanceInput.add32(500);
      const allowanceEncrypted = await allowanceInput.encrypt();

      const tx = await contract.connect(owner).initialize(
        balanceEncrypted.handles[0],
        balanceEncrypted.inputProof,
        allowanceEncrypted.handles[0],
        allowanceEncrypted.inputProof
      );
      await tx.wait();

      // Verify values were stored
      const balance = await contract.getBalance();
      const allowance = await contract.getAllowance();

      expect(balance).to.not.equal(0);
      expect(allowance).to.not.equal(0);
    });
  });

  describe("transfer", function () {
    it("should transfer encrypted amount", async function () {
      const ownerAddress = await owner.getAddress();

      // Initialize
      const balanceInput = await fhevm.createEncryptedInput(contractAddress, ownerAddress);
      balanceInput.add32(1000);
      const balanceEncrypted = await balanceInput.encrypt();

      const allowanceInput = await fhevm.createEncryptedInput(contractAddress, ownerAddress);
      allowanceInput.add32(0);
      const allowanceEncrypted = await allowanceInput.encrypt();

      await contract.connect(owner).initialize(
        balanceEncrypted.handles[0],
        balanceEncrypted.inputProof,
        allowanceEncrypted.handles[0],
        allowanceEncrypted.inputProof
      );

      // Transfer
      const transferInput = await fhevm.createEncryptedInput(contractAddress, ownerAddress);
      transferInput.add32(100);
      const transferEncrypted = await transferInput.encrypt();

      const tx = await contract.connect(owner).transfer(transferEncrypted.handles[0], transferEncrypted.inputProof);
      await tx.wait();

      await awaitAllDecryptionResults();

      const balance = await contract.getBalance();
      expect(balance).to.not.equal(0);
    });
  });

  describe("approve", function () {
    it("should approve encrypted amount", async function () {
      const ownerAddress = await owner.getAddress();

      // Initialize
      const balanceInput = await fhevm.createEncryptedInput(contractAddress, ownerAddress);
      balanceInput.add32(1000);
      const balanceEncrypted = await balanceInput.encrypt();

      const allowanceInput = await fhevm.createEncryptedInput(contractAddress, ownerAddress);
      allowanceInput.add32(0);
      const allowanceEncrypted = await allowanceInput.encrypt();

      await contract.connect(owner).initialize(
        balanceEncrypted.handles[0],
        balanceEncrypted.inputProof,
        allowanceEncrypted.handles[0],
        allowanceEncrypted.inputProof
      );

      // Approve
      const approveInput = await fhevm.createEncryptedInput(contractAddress, ownerAddress);
      approveInput.add32(250);
      const approveEncrypted = await approveInput.encrypt();

      const tx = await contract.connect(owner).approve(approveEncrypted.handles[0], approveEncrypted.inputProof);
      await tx.wait();

      await awaitAllDecryptionResults();

      const allowance = await contract.getAllowance();
      expect(allowance).to.not.equal(0);
    });
  });
});
