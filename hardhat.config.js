require("@nomicfoundation/hardhat-toolbox");

/** 
 *  @type import('hardhat/config').HardhatUserConfig */
const ALCHEMY_API_KEY="QL6r7XfsYo71QUuGP61lDSSTtFyjNvUp";
const SEPOLIA_PRIVATE_KEY="d0f3e92018e6f872389858f892d725b9bf9c7e3aef9399f7893e365fabef5280"
module.exports = {
  solidity: "0.8.28",

  networks:{
    sepolia:{
      url:`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts:[`${SEPOLIA_PRIVATE_KEY}`],
    }
  }
};
