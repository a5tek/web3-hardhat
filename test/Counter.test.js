const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Counter Contract", function () {
  let counter;

  beforeEach(async function () {
    const Counter = await ethers.getContractFactory("Counter");
    counter = await Counter.deploy();
  });

  it("Should initialize with a count of 0", async function () {
    expect(await counter.count()).to.equal(0);
  });

  it("Should increment the count", async function () {
    await counter.increment();
    expect(await counter.count()).to.equal(1);
  });

  it("Should decrement the count and revert on underflow", async function () {
    await expect(counter.decrement()).to.be.revertedWith("Counter: cannot decrement below zero");
    await counter.increment();
    await counter.decrement();
    expect(await counter.count()).to.equal(0);
  });
});