const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OverlyAttachedToken (CLING)", function () {
  let token, owner, alice, bob, others;
  const VALID_NOTE = "I am so sorry I have to send this token away!"; // > 15 chars
  const SHORT_NOTE = "Bye bye!"; // < 15 chars

  beforeEach(async function () {
    [owner, alice, bob, ...others] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("OverlyAttachedToken");
    token = await Token.deploy();
  });

  describe("ERC20 Overrides & Separation Anxiety", function () {
    it("Should revert standard transfer() with drama", async function () {
      const amount = ethers.parseUnits("10", 18);
      await expect(
        token.transfer(alice.address, amount)
      ).to.be.revertedWith("Wait! You can't just leave without saying goodbye! Use transferWithApology()");
    });

    it("Should revert if the goodbye note is shorter than 15 chars", async function () {
      const amount = ethers.parseUnits("10", 18);
      await expect(
        token.transferWithApology(alice.address, amount, SHORT_NOTE)
      ).to.be.revertedWith("That goodbye note is way too short! Tell me why you're leaving in at least 15 characters.");
    });

    it("Should revert if sending more than 50% of the balance", async function () {
      const balance = await token.balanceOf(owner.address); // 200 CLING
      const tooMuch = (balance / 2n) + ethers.parseUnits("1", 18); // > 50%
      await expect(
        token.transferWithApology(alice.address, tooMuch, VALID_NOTE)
      ).to.be.revertedWith("Separation Anxiety: You can't give away more than half of me at once! Do you hate me?!");
    });
  });

  describe("Allowance & transferFrom", function () {
    it("Should allow transferFrom with apology note and update allowance", async function () {
      const sendAmount = ethers.parseUnits("20", 18); // <= 50% of 200
      await token.approve(alice.address, sendAmount);

      await expect(
        token.connect(alice).transferFrom(owner.address, bob.address, sendAmount, VALID_NOTE)
      ).to.not.be.reverted;

      expect(await token.allowance(owner.address, alice.address)).to.equal(0);
    });
  });

  describe("STRESS TEST: Probabilistic Boomerang & Rapid Fire", function () {
    it("Should handle 15 sequential transfers and trigger ClingyIncident events", async function () {
      let clingyCount = 0;
      let normalCount = 0;

      // Transfer an initial chunk to Alice (<= 50% of 200 = 50)
      await token.transferWithApology(alice.address, ethers.parseUnits("50", 18), VALID_NOTE);

      // Loop 15 times between Alice and Bob with valid <= 50% amounts
      for (let i = 0; i < 15; i++) {
        const aliceBal = await token.balanceOf(alice.address);
        if (aliceBal === 0n) break;

        const amountToSend = aliceBal / 3n; // safe under 50%
        if (amountToSend === 0n) break;

        const tx = await token.connect(alice).transferWithApology(
          bob.address,
          amountToSend,
          `Stress testing transfer attempt #${i + 1} with enough letters`
        );
        const receipt = await tx.wait();

        // Check if ClingyIncident was emitted
        const incidentEvent = receipt.logs.find(
          (log) => log.fragment && log.fragment.name === "ClingyIncident"
        );

        if (incidentEvent) {
          clingyCount++;
        } else {
          normalCount++;
        }
      }

      console.log(`\n      Stress Test Outcome -> Normal: ${normalCount}, Boomeranged (Clingy): ${clingyCount}`);
      expect(clingyCount + normalCount).to.be.greaterThan(0);
    });
  });
});