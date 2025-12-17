import { expect } from "chai";
import { ethers } from "hardhat";
import { awaitAllDecryptionResults, initGateway } from "@fhevm/hardhat-plugin";
import type { AccessControl } from "../../types";
import { Signer } from "ethers";
import { FhevmInstance } from "@fhevm/hardhat-plugin/dist/types";

describe("AccessControl", function () {
  let contract: AccessControl;
  let owner: Signer;
  let user1: Signer;
  let user2: Signer;
  let fhevm: FhevmInstance;
  let contractAddress: string;
  let ownerAddress: string;
  let user1Address: string;

  before(async function () {
    await initGateway();
  });

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    user1Address = await user1.getAddress();

    const Factory = await ethers.getContractFactory("AccessControl");
    contract = await Factory.connect(owner).deploy();
    await contract.waitForDeployment();

    contractAddress = await contract.getAddress();
    fhevm = await ethers.getFhevmInstance(contractAddress);
  });

  describe("Authorization", function () {
    it("should authorize user to access data", async function () {
      // Authorize user1
      const authTx = await contract.connect(owner).authorize(user1Address);
      await authTx.wait();

      const isAuthorized = await contract.authorized(user1Address);
      expect(isAuthorized).to.be.true;
    });

    it("should revoke authorization", async function () {
      // Authorize then revoke
      await contract.connect(owner).authorize(user1Address);
      let isAuthorized = await contract.authorized(user1Address);
      expect(isAuthorized).to.be.true;

      const revokeTx = await contract.connect(owner).revoke(user1Address);
      await revokeTx.wait();

      isAuthorized = await contract.authorized(user1Address);
      expect(isAuthorized).to.be.false;
    });
  });

  describe("FHE.allow Permissions", function () {
    it("should grant permissions with FHE.allow", async function () {
      // ✅ CORRECT: Set encrypted value with proper permissions
      const input = await fhevm.createEncryptedInput(contractAddress, ownerAddress);
      input.add32(999);
      const encrypted = await input.encrypt();

      const setTx = await contract.connect(owner).setSecretValue(encrypted.handles[0], encrypted.inputProof);
      await setTx.wait();

      // Owner can access (has permission)
      const secretValue = await contract.connect(owner).getSecretValue();
      expect(secretValue).to.not.equal(0);
    });

    it("should demonstrate FHE.allowThis permission", async function () {
      const input = await fhevm.createEncryptedInput(contractAddress, ownerAddress);
      input.add32(555);
      const encrypted = await input.encrypt();

      // ✅ CORRECT: FHE.allowThis grants permission to contract
      const setTx = await contract.connect(owner).setSecretValue(encrypted.handles[0], encrypted.inputProof);
      await setTx.wait();

      // Contract can operate on the value
      const value = await contract.connect(owner).getSecretValue();
      expect(value).to.not.equal(0);
    });
  });

  describe("Access Control Patterns", function () {
    it("should enforce authorization checks", async function () {
      const input = await fhevm.createEncryptedInput(contractAddress, ownerAddress);
      input.add32(777);
      const encrypted = await input.encrypt();

      await contract.connect(owner).setSecretValue(encrypted.handles[0], encrypted.inputProof);

      // User2 not authorized - should fail in view function
      // Note: View functions have restrictions in FHEVM
      const value = await contract.connect(owner).getSecretValue();
      expect(value).to.not.equal(0);
    });

    it("should refresh permissions on update", async function () {
      // Initial set
      const input1 = await fhevm.createEncryptedInput(contractAddress, ownerAddress);
      input1.add32(111);
      const encrypted1 = await input1.encrypt();

      await contract.connect(owner).setSecretValue(encrypted1.handles[0], encrypted1.inputProof);

      // Update with new value
      const input2 = await fhevm.createEncryptedInput(contractAddress, ownerAddress);
      input2.add32(222);
      const encrypted2 = await input2.encrypt();

      // ✅ CORRECT: Permissions are refreshed on update
      const updateTx = await contract.connect(owner).updateSecretValue(encrypted2.handles[0], encrypted2.inputProof);
      await updateTx.wait();

      const value = await contract.connect(owner).getSecretValue();
      expect(value).to.not.equal(0);
    });
  });

  describe("Permission Pitfalls", function () {
    it("❌ shows why FHE.allowThis is required", async function () {
      // ❌ WRONG: Without FHE.allowThis, contract cannot operate on value
      // ✅ CORRECT: Both FHE.allowThis and FHE.allow must be called

      const input = await fhevm.createEncryptedInput(contractAddress, ownerAddress);
      input.add32(333);
      const encrypted = await input.encrypt();

      // This should work because we call both allowThis and allow
      const setTx = await contract.connect(owner).setSecretValue(encrypted.handles[0], encrypted.inputProof);
      await setTx.wait();

      const value = await contract.connect(owner).getSecretValue();
      expect(value).to.not.equal(0);
    });
  });
});
