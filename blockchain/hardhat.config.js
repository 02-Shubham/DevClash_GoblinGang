

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 1337,
      type: "edr-simulated"
    }
  }
};
