import { expect } from "chai";
import { ethers } from "hardhat";
import { awaitAllDecryptionResults, initGateway } from "@fhevm/hardhat-plugin";
import type { PublicDecryptSingleValue } from "../../types";
import { Signer } from "ethers";
import { FhevmInstance } from "@fhevm/hardhat-plugin/dist/types";

describe("PublicDecryptSingleValue", function () {
  let contract: PublicDecryptSingleValue;
  let owner: Signer;
  let fhevm: FhevmInstance;
  let contractAddress: string;
  let ownerAddress: string;

  before(async function () {
    await initGateway();
  });

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();

    const Factory = await ethers.getContractFactory("PublicDecryptSingleValue");
    contract = await Factory.connect(owner).deploy();
    await contract.waitForDeployment();

    contractAddress = await contract.getAddress();
    fhevm = await ethers.getFhevmInstance(contractAddress);
  });

  describe("Public Decryption", function () {
    it("should publicly decrypt an encrypted value", async function () {
      const plainValue = 555;

      // Set encrypted value
      const input = await fhevm.createEncryptedInput(contractAddress, ownerAddress);
      input.add32(plainValue);
      const encrypted = await input.encrypt();

      const setTx = await contract.connect(owner).setEncryptedValue(encrypted.handles[0], encrypted.inputProof);
      await setTx.wait();

      // Public decryption (reveals value on-chain)
      const decryptTx = await contract.connect(owner).publicDecrypt();
      await decryptTx.wait();

      await awaitAllDecryptionResults();

      // Verify the decrypted value is now public
      const decryptedValue = await contract.getLastDecryptedValue();
      expect(decryptedValue).to.equal(plainValue);
    });

    it("should demonstrate public visibility of decrypted values", async function () {
      const plainValue = 777;

      const input = await fhevm.createEncryptedInput(contractAddress, ownerAddress);
      input.add32(plainValue);
      const encrypted = await input.encrypt();

      await contract.connect(owner).setEncryptedValue(encrypted.handles[0], encrypted.inputProof);
      await contract.connect(owner).publicDecrypt();

      await awaitAllDecryptionResults();

      // ⚠️ WARNING: After public decryption, value is visible to everyone
      const decryptedValue = await contract.getLastDecryptedValue();
      expect(decryptedValue).to.equal(plainValue);
    });
  });

  describe("Comparison with User Decryption", function () {
    it("should show difference between public and user decryption", async function () {
      const plainValue = 888;

      const input = await fhevm.createEncryptedInput(contractAddress, ownerAddress);
      input.add32(plainValue);
      const encrypted = await input.encrypt();

      await contract.connect(owner).setEncryptedValue(encrypted.handles[0], encrypted.inputProof);

      // ✅ With user decryption: value stays private
      const encryptedStored = await contract.getEncryptedValue();
      expect(encryptedStored).to.not.equal(plainValue); // Still encrypted

      // ❌ With public decryption: value is revealed
      await contract.connect(owner).publicDecrypt();
      await awaitAllDecryptionResults();

      const publicDecrypted = await contract.getLastDecryptedValue();
      expect(publicDecrypted).to.equal(plainValue); // Now visible
    });
  });
});
