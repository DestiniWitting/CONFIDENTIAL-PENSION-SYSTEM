import { expect } from "chai";
import { ethers } from "hardhat";
import { awaitAllDecryptionResults, initGateway } from "@fhevm/hardhat-plugin";
import type { EncryptSingleValue } from "../../types";
import { Signer } from "ethers";
import { FhevmInstance } from "@fhevm/hardhat-plugin/dist/types";

describe("EncryptSingleValue", function () {
  let contract: EncryptSingleValue;
  let owner: Signer;
  let fhevm: FhevmInstance;
  let contractAddress: string;

  before(async function () {
    await initGateway();
  });

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("EncryptSingleValue");
    contract = await Factory.connect(owner).deploy();
    await contract.waitForDeployment();

    contractAddress = await contract.getAddress();
    fhevm = await ethers.getFhevmInstance(contractAddress);
  });

  describe("setEncryptedValue", function () {
    it("should encrypt and store a value", async function () {
      // ✅ CORRECT: Create encrypted input with the contract address and message sender
      const input = await fhevm.createEncryptedInput(contractAddress, await owner.getAddress());
      input.add32(42);
      const encrypted = await input.encrypt();

      // ✅ CORRECT: Use the same signer for transaction
      const tx = await contract.connect(owner).setEncryptedValue(encrypted.handles[0], encrypted.inputProof);
      await tx.wait();

      // Verify the value was stored
      const stored = await contract.getEncryptedValue();
      expect(stored).to.not.equal(0);
    });
  });

  describe("addToEncryptedValue", function () {
    it("should add to encrypted value", async function () {
      // Set initial value
      const input1 = await fhevm.createEncryptedInput(contractAddress, await owner.getAddress());
      input1.add32(10);
      const encrypted1 = await input1.encrypt();

      const tx1 = await contract.connect(owner).setEncryptedValue(encrypted1.handles[0], encrypted1.inputProof);
      await tx1.wait();

      // Add to the value
      const input2 = await fhevm.createEncryptedInput(contractAddress, await owner.getAddress());
      input2.add32(5);
      const encrypted2 = await input2.encrypt();

      const tx2 = await contract.connect(owner).addToEncryptedValue(encrypted2.handles[0], encrypted2.inputProof);
      await tx2.wait();

      await awaitAllDecryptionResults();

      const value = await contract.getEncryptedValue();
      expect(value).to.not.equal(0);
    });
  });

  describe("Common Pitfalls", function () {
    it("❌ shows importance of input proof verification", async function () {
      // This test demonstrates why input proofs are essential
      const input = await fhevm.createEncryptedInput(contractAddress, await owner.getAddress());
      input.add32(100);
      const encrypted = await input.encrypt();

      // Input proofs validate that the encrypted value was created by the correct signer
      expect(encrypted.inputProof).to.not.be.empty;
      expect(encrypted.handles[0]).to.not.be.empty;
    });
  });
});
