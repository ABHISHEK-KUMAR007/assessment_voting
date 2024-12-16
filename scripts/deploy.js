const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Voting = await ethers.getContractFactory("Voting");

  const candidates = ["Alice", "Bob", "Charlie"];
  const durationInMinutes = 60; 

  const votingInstance = await Voting.deploy(candidates, durationInMinutes);
  const VotingInstance = await votingInstance.deployTransaction.wait();

  console.log("Voting contract deployed to:", VotingInstance.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
