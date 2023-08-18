import "@nomicfoundation/hardhat-toolbox";

const config = {
    solidity: {
        version: "0.8.19",
        settings: {
            optimizer: {
                enabled: true,
                runs: 100_000,
            },
            // viaIR: true,
        },
    },
    paths: {
        tests: './test',
        sources: './contract/Semaphore/'
    }
};

export default config;
