const hre = require("hardhat");
const { ethers } = hre;
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying OverlyAttachedToken to Sepolia with account:", deployer.address);

  const Token = await ethers.getContractFactory("OverlyAttachedToken");
  const token = await Token.deploy();
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("==================================================");
  console.log("OverlyAttachedToken deployed to Sepolia at:", address);
  console.log("==================================================");
}
main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});