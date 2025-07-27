const hre = require("hardhat");

async function main() {
  const LostFound = await hre.ethers.getContractFactory("LostFound");
  const lostFound = await LostFound.deploy();

  // Ethers v6: use waitForDeployment() instead of deployed()
  await lostFound.waitForDeployment();

  console.log(`✅ LostFound deployed to: ${lostFound.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
