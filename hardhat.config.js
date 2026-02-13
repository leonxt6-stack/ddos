module.exports = {
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
    },
  },
  paths: {
    sources: './blockchain/contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};
