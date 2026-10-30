const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer, alice, bob, charlie] = await ethers.getSigners();
  console.log("=================================================");
  console.log("  OverlyAttachedToken (CLING) Local Simulation  ");
  console.log("=================================================");
  const Token = await ethers.getContractFactory("OverlyAttachedToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const address = await token.getAddress();
  console.log(`[DEPLOY] CLING deployed at: ${address}`);
  console.log(`[INFO] Initial Deployer Balance: ${ethers.formatUnits(await token.balanceOf(deployer.address), 18)} CLING\n`);

  console.log("--- Test: Default transfer() Reversion ---");
  try {
    await token.transfer(alice.address, ethers.parseUnits("10", 18));
  } catch (err) {
    console.log("Expected Revert Caught:", err.message.split("'")[1] || "Transfer blocked!");
  }
  console.log("\n--- Test: Separation Anxiety (>50%) Reversion ---");
  try {
    await token.transferWithApology(
      alice.address, 
      ethers.parseUnits("150", 18), 
      "I am leaving you forever please do not be mad!"
    );
  } catch (err) {
    console.log("Expected Revert Caught:", err.message.split("'")[1] || "More than 50% blocked!");
  }
  console.log("\n--- Executing Valid transferWithApology ---");
  const note1 = "I really have to pay Alice for lunch today!";
  const tx1 = await token.transferWithApology(alice.address, ethers.parseUnits("60", 18), note1);
  const rec1 = await tx1.wait();
  console.log(`Sent 60 CLING to Alice | TxHash: ${rec1.hash}`);
  console.log(`Alice Balance: ${ethers.formatUnits(await token.balanceOf(alice.address), 18)} CLING`);

  console.log("\n--- STRESS TESTING: 8 Burst Transfers (Hunting Boomerang Events) ---");
  for (let i = 1; i <= 8; i++) {
    const currentAliceBal = await token.balanceOf(alice.address);
    const sendAmt = currentAliceBal / 3n;

    if (sendAmt === 0n) break;

    const burstTx = await token.connect(alice).transferWithApology(
      bob.address,
      sendAmt,
      `Burst transaction #${i} farewell message here!`
    );
    const receipt = await burstTx.wait();

    let boomeranged = false;
    for (const log of receipt.logs) {
      try {
        const parsed = token.interface.parseLog(log);
        if (parsed.name === "ClingyIncident") {
          boomeranged = true;
          console.log(`[Burst #${i}] 💔 CLINGY BOOMERANG! Block: ${receipt.blockNumber} | Note: "${parsed.args.drama}"`);
        }
      } catch (e) {}
    }

    if (!boomeranged) {
      console.log(`[Burst #${i}] Normal Transfer | Sent: ${ethers.formatUnits(sendAmt, 18)} CLING | Block: ${receipt.blockNumber}`);
    }
  }

  console.log("\n================ Final Balances ================");
  console.log("Deployer:", ethers.formatUnits(await token.balanceOf(deployer.address), 18), "CLING");
  console.log("Alice:   ", ethers.formatUnits(await token.balanceOf(alice.address), 18), "CLING");
  console.log("Bob:     ", ethers.formatUnits(await token.balanceOf(bob.address), 18), "CLING");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});