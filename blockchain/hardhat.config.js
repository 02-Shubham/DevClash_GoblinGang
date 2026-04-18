

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      type: "edr-simulated",
      chainId: 1337
    }
  }
};
