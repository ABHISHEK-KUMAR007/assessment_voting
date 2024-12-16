const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
  let Voting;
  let votingContract;
  let owner;
  let voter1;
  let voter2;
  let candidateNames;
  let durationInMinutes;

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();
    candidateNames = ["abhi", "kumar", "avi"];
    durationInMinutes = 60; 
    Voting = await ethers.getContractFactory("Voting");
    votingContract = await Voting.deploy(candidateNames, durationInMinutes);
    await votingContract.deployed();
  });

  it("Should deploy the Voting contract", async function () {
    expect(votingContract.address).to.properAddress;
  });

  it("Should allow the owner to add a candidate", async function () {
    const newCandidateName = "Abhi";
    await votingContract.connect(owner).addCandidate(newCandidateName);

    const candidates = await votingContract.getAllVotesOfCandiates();
    expect(candidates.length).to.equal(4); 
    expect(candidates[3].name).to.equal(newCandidateName);
  });

  it("Should prevent non-owners from adding candidates", async function () {
    await expect(
      votingContract.connect(voter1).addCandidate("Abhi")
    ).to.be.revertedWith("Only the owner can execute this.");
  });

  it("Should allow a voter to vote once after registration", async function () {
    await votingContract.connect(voter1).vote(0); 
    const candidates = await votingContract.getAllVotesOfCandiates();
    expect(candidates[0].voteCount).to.equal(1);

    await expect(
      votingContract.connect(voter1).vote(1) 
    ).to.be.revertedWith("You have already voted.");
  });

  it("Should prevent non-registered voters from voting", async function () {
    await expect(votingContract.connect(voter2).vote(0)).to.be.revertedWith(
      "You must be registered to vote."
    );
  });

  it("Should correctly track remaining time for voting", async function () {
    const remainingTime = await votingContract.getRemainingTime();
    expect(remainingTime).to.be.gt(0);
    expect(remainingTime).to.be.lte(durationInMinutes * 60);
  });

  it("Should prevent voting after the time has elapsed", async function () {
    await ethers.provider.send("evm_increaseTime", [durationInMinutes * 60 + 1]);
    await ethers.provider.send("evm_mine", []);

    await expect(votingContract.connect(voter1).vote(0)).to.be.revertedWith(
      "Voting has ended."
    );
  });

  it("Should declare the winner correctly", async function () {
    await votingContract.connect(voter1).vote(0); 
    await votingContract.connect(voter2).vote(0); 

    // Simulate time elapse to end voting
    await ethers.provider.send("evm_increaseTime", [durationInMinutes * 60 + 1]);
    await ethers.provider.send("evm_mine", []);

    const winner = await votingContract.winner();
    expect(winner).to.equal("abhi");
  });

  it("Should handle ties correctly in winner function", async function () {
    await votingContract.connect(voter1).vote(0); 
    await votingContract.connect(voter2).vote(1); 

    // Simulate time elapse to end voting
    await ethers.provider.send("evm_increaseTime", [durationInMinutes * 60 + 1]);
    await ethers.provider.send("evm_mine", []);

    const winners = await votingContract.winner();
    expect(winners).to.include("abhi");
    expect(winners).to.include("kumar");
  });

  it("Should correctly return all candidates and votes", async function () {
    const candidates = await votingContract.getAllVotesOfCandiates();
    expect(candidates.length).to.equal(3); 
    expect(candidates[0].name).to.equal("abhi");
    expect(candidates[1].name).to.equal("kumar");
    expect(candidates[2].name).to.equal("avi");
  });
});
