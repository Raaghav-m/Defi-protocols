const networkConfig = {
    31337: {
        name: "localhost",
        iWethTokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        daiTokenAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
        iPoolAdressProviderContractAddress: "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e",
        aggregatorV3Interface: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
    },
}
const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}
