const { ethers, getNamedAccounts, network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")

const AMOUNT = ethers.parseEther("0.1")

async function getWeth() {
    const { deployer } = await getNamedAccounts()
    const signer = await ethers.provider.getSigner(deployer)
    const iWeth = await ethers.getContractAt(
        "IWeth",
        networkConfig[network.config.chainId].iWethTokenAddress,
        signer,
    )
    const txResponse = await iWeth.deposit({
        value: AMOUNT,
    })
    await txResponse.wait(1)
    const wethBalance = await iWeth.balanceOf(signer)
    console.log(`Got ${wethBalance.toString()} WETH`)
}

module.exports = { getWeth, AMOUNT }
