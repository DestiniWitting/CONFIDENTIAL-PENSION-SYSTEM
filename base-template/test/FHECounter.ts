import { expect } from "chai";
import { ethers } from "hardhat";
import { awaitAllDecryptionResults, initGateway } from "@fhevm/hardhat-plugin";
import type { FHECounter } from "../types";
import { Signer } from "ethers";
import { FhevmInstance } from "@fhevm/hardhat-plugin/dist/types";

describe("FHECounter", function () {
  let counter: FHECounter;
  let owner: Signer;
  let fhevm: FhevmInstance;
  let contractAddress: string;

  before(async function () {
    await initGateway();
  });

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const FHECounterFactory = await ethers.getContractFactory("FHECounter");
    counter = await FHECounterFactory.connect(owner).deploy();
    await counter.waitForDeployment();

    contractAddress = await counter.getAddress();
    fhevm = await ethers.getFhevmInstance(contractAddress);
  });

  it("should increment the counter", async function () {
    const input = await fhevm.createEncryptedInput(contractAddress, await owner.getAddress());
    input.add32(5);
    const encryptedValue = await input.encrypt();

    const tx = await counter.connect(owner).increment(encryptedValue.handles[0], encryptedValue.inputProof);
    await tx.wait();

    await awaitAllDecryptionResults();

    // Verify the counter was incremented
    const countHandle = await counter.getCount();
    expect(countHandle).to.not.equal(0);
  });

  it("should decrement the counter", async function () {
    // First increment
    const input1 = await fhevm.createEncryptedInput(contractAddress, await owner.getAddress());
    input1.add32(10);
    const encryptedValue1 = await input1.encrypt();

    await counter.connect(owner).increment(encryptedValue1.handles[0], encryptedValue1.inputProof);

    // Then decrement
    const input2 = await fhevm.createEncryptedInput(contractAddress, await owner.getAddress());
    input2.add32(3);
    const encryptedValue2 = await input2.encrypt();

    const tx = await counter.connect(owner).decrement(encryptedValue2.handles[0], encryptedValue2.inputProof);
    await tx.wait();

    await awaitAllDecryptionResults();

    // Verify the counter was decremented
    const countHandle = await counter.getCount();
    expect(countHandle).to.not.equal(0);
  });
});
