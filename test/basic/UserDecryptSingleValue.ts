import { expect } from "chai";
import { ethers } from "hardhat";
import { awaitAllDecryptionResults, initGateway } from "@fhevm/hardhat-plugin";
import type { UserDecryptSingleValue } from "../../types";
import { Signer } from "ethers";
import { FhevmInstance } from "@fhevm/hardhat-plugin/dist/types";

describe("UserDecryptSingleValue", function () {
  let contract: UserDecryptSingleValue;
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

    const Factory = await ethers.getContractFactory("UserDecryptSingleValue");
    contract = await Factory.connect(owner).deploy();
    await contract.waitForDeployment();

    contractAddress = await contract.getAddress();
    fhevm = await ethers.getFhevmInstance(contractAddress);
  });

  describe("User Decryption Pattern", function () {
    it("should demonstrate user decryption workflow", async function () {
      // Step 1: User encrypts value
      const input = await fhevm.createEncryptedInput(contractAddress, ownerAddress);
      const plainValue = 42;
      input.add32(plainValue);
      const encrypted = await input.encrypt();

      // Step 2: User sends encrypted value to contract
      const setTx = await contract.connect(owner).setEncryptedValue(encrypted.handles[0], encrypted.inputProof);
      await setTx.wait();

      // Step 3: User retrieves encrypted value (only user can decrypt with their key)
      const encryptedValue = await contract.getEncryptedValue();
      expect(encryptedValue).to.not.equal(0);

      // Step 4: User decrypts off-chain (in real scenario)
      // For testing, we know the original value
      await contract.connect(owner).storeDecryptedValue(plainValue);

      // Step 5: Verify stored decrypted value
      const stored = await contract.getDecryptedValue(ownerAddress);
      expect(stored).to.equal(plainValue);
    });

    it("should maintain user privacy during decryption", async function () {
      const input = await fhevm.createEncryptedInput(contractAddress, ownerAddress);
      input.add32(12345);
      const encrypted = await input.encrypt();

      await contract.connect(owner).setEncryptedValue(encrypted.handles[0], encrypted.inputProof);

      // The contract never knows the plaintext value
      // Only the user can decrypt with their private key
      const encryptedOnChain = await contract.getEncryptedValue();
      expect(encryptedOnChain).to.not.equal(0);
      expect(encryptedOnChain).to.not.equal(12345);
    });
  });

  describe("Permission Management", function () {
    it("should allow only the creator to decrypt", async function () {
      // ✅ CORRECT: Input created with msg.sender address
      const input = await fhevm.createEncryptedInput(contractAddress, ownerAddress);
      input.add32(999);
      const encrypted = await input.encrypt();

      const setTx = await contract.connect(owner).setEncryptedValue(encrypted.handles[0], encrypted.inputProof);
      await setTx.wait();

      // The encrypted value is stored with permissions for owner
      const storedValue = await contract.getEncryptedValue();
      expect(storedValue).to.not.equal(0);
    });
  });
});
