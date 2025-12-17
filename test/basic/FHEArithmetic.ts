import { expect } from "chai";
import { ethers } from "hardhat";
import { awaitAllDecryptionResults, initGateway } from "@fhevm/hardhat-plugin";
import type { FHEArithmetic } from "../../types";
import { Signer } from "ethers";
import { FhevmInstance } from "@fhevm/hardhat-plugin/dist/types";

describe("FHEArithmetic", function () {
  let contract: FHEArithmetic;
  let owner: Signer;
  let fhevm: FhevmInstance;
  let contractAddress: string;

  before(async function () {
    await initGateway();
  });

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("FHEArithmetic");
    contract = await Factory.connect(owner).deploy();
    await contract.waitForDeployment();

    contractAddress = await contract.getAddress();
    fhevm = await ethers.getFhevmInstance(contractAddress);
  });

  describe("Addition", function () {
    it("should add two encrypted values", async function () {
      const input1 = await fhevm.createEncryptedInput(contractAddress, await owner.getAddress());
      input1.add32(10);
      const encrypted1 = await input1.encrypt();

      const tx1 = await contract.connect(owner).add(encrypted1.handles[0], encrypted1.inputProof);
      await tx1.wait();

      const input2 = await fhevm.createEncryptedInput(contractAddress, await owner.getAddress());
      input2.add32(5);
      const encrypted2 = await input2.encrypt();

      const tx2 = await contract.connect(owner).add(encrypted2.handles[0], encrypted2.inputProof);
      await tx2.wait();

      await awaitAllDecryptionResults();

      const value = await contract.getValue();
      expect(value).to.not.equal(0);
    });
  });

  describe("Subtraction", function () {
    it("should subtract two encrypted values", async function () {
      const input1 = await fhevm.createEncryptedInput(contractAddress, await owner.getAddress());
      input1.add32(10);
      const encrypted1 = await input1.encrypt();

      const tx1 = await contract.connect(owner).add(encrypted1.handles[0], encrypted1.inputProof);
      await tx1.wait();

      const input2 = await fhevm.createEncryptedInput(contractAddress, await owner.getAddress());
      input2.add32(3);
      const encrypted2 = await input2.encrypt();

      const tx2 = await contract.connect(owner).subtract(encrypted2.handles[0], encrypted2.inputProof);
      await tx2.wait();

      await awaitAllDecryptionResults();

      const value = await contract.getValue();
      expect(value).to.not.equal(0);
    });
  });

  describe("Multiplication", function () {
    it("should multiply two encrypted values", async function () {
      const input1 = await fhevm.createEncryptedInput(contractAddress, await owner.getAddress());
      input1.add32(5);
      const encrypted1 = await input1.encrypt();

      const tx1 = await contract.connect(owner).add(encrypted1.handles[0], encrypted1.inputProof);
      await tx1.wait();

      const input2 = await fhevm.createEncryptedInput(contractAddress, await owner.getAddress());
      input2.add32(2);
      const encrypted2 = await input2.encrypt();

      const tx2 = await contract.connect(owner).multiply(encrypted2.handles[0], encrypted2.inputProof);
      await tx2.wait();

      await awaitAllDecryptionResults();

      const value = await contract.getValue();
      expect(value).to.not.equal(0);
    });
  });

  describe("Division", function () {
    it("should divide two encrypted values", async function () {
      const input1 = await fhevm.createEncryptedInput(contractAddress, await owner.getAddress());
      input1.add32(10);
      const encrypted1 = await input1.encrypt();

      const tx1 = await contract.connect(owner).add(encrypted1.handles[0], encrypted1.inputProof);
      await tx1.wait();

      const input2 = await fhevm.createEncryptedInput(contractAddress, await owner.getAddress());
      input2.add32(2);
      const encrypted2 = await input2.encrypt();

      const tx2 = await contract.connect(owner).divide(encrypted2.handles[0], encrypted2.inputProof);
      await tx2.wait();

      await awaitAllDecryptionResults();

      const value = await contract.getValue();
      expect(value).to.not.equal(0);
    });
  });
});
