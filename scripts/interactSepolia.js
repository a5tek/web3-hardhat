const hre = require("hardhat");
const { ethers } = hre;
require("dotenv").config();

async function main() {
  const contractAddress = process.env.DEPLOYED_CONTRACT_ADDRESS;
  if (!contractAddress) throw new Error("Please set DEPLOYED_CONTRACT_ADDRESS in .env");
  const [signer] = await ethers.getSigners();
  console.log("Interacting on Sepolia via Laptop Terminal");
  console.log("Wallet:", signer.address);
  const token = await ethers.getContractAt("OverlyAttachedToken", contractAddress, signer);
  const name = await token.name();
  const symbol = await token.symbol();
  let balance = await token.balanceOf(signer.address);
  console.log(`\nConnected to: ${name} (${symbol})`);
  console.log(`Current Balance: ${ethers.formatUnits(balance, 18)} ${symbol}\n`);
  console.log("Minting 50 new CLING tokens...");
  const mintTx = await token.mint(signer.address, ethers.parseUnits("50", 18));
  console.log("Waiting for mint confirmation... TxHash:", mintTx.hash);
  await mintTx.wait(1);
  console.log("Mint confirmed!");
  balance = await token.balanceOf(signer.address);
  console.log(`Updated Balance after Mint: ${ethers.formatUnits(balance, 18)} ${symbol}`);
  const recipient = "0x1111111111111111111111111111111111111111";
  const transferAmt = balance / 10n;
  const goodbyeNote = "I promise it is not you, it is the blockchain gas fees!";
  console.log(`\nAttempting transferWithApology of ${ethers.formatUnits(transferAmt, 18)} ${symbol} to ${recipient}...`);
  try {
    await token.transferWithApology.staticCall(recipient, transferAmt, goodbyeNote);
    console.log("Static call simulation succeeded! Broadcasting transaction...");
  } catch (simError) {
    console.error("Simulation failed! Revert reason:", simError.message);
    return;
  }

  const transferTx = await token.transferWithApology(recipient, transferAmt, goodbyeNote);
  console.log("Waiting for block confirmation... TxHash:", transferTx.hash);
  const receipt = await transferTx.wait(1);

  let boomeranged = false;
  for (const log of receipt.logs) {
    try {
      const parsed = token.interface.parseLog(log);
      if (parsed && parsed.name === "ClingyIncident") {
        boomeranged = true;
        console.log(`\n💔 DRAMA ON SEPOLIA: ${parsed.args.drama}`);
        console.log(`Boomeranged Amount: ${ethers.formatUnits(parsed.args.boomerangAmount, 18)} ${symbol}`);
      }
    } catch (e) {}
  }

  if (!boomeranged) {
    console.log("\nTransfer cleared without incident!");
  }

  const finalBal = await token.balanceOf(signer.address);
  console.log(`\nFinal On-Chain Balance: ${ethers.formatUnits(finalBal, 18)} ${symbol}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});