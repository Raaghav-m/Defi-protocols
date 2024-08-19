const { ethers, getNamedAccounts } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")
const { getWeth, AMOUNT } = require("../scripts/getWeth")

async function main() {
    await getWeth()
    let { deployer } = await getNamedAccounts()
    let signer = await ethers.provider.getSigner(deployer)
    let lendingPoolAddresses = await getLendingPoolAddress(signer)
    //weth tooken address,lendingpooladdress,amount,signer
    await approveSpender(
        networkConfig[network.config.chainId].iWethTokenAddress,
        lendingPoolAddresses,
        signer,
        AMOUNT,
    )
    let lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddresses, signer)
    await lendingPool.supply(
        networkConfig[network.config.chainId].iWethTokenAddress,
        AMOUNT,
        signer,
        0,
    )
    const { totalCollateralBase, totalDebtBase } = await getUserdata(signer, lendingPool)

    let daiPrice = await getDaiPrice()
    const amountDaiToBorrow = totalCollateralBase.toString() * 0.8 * (1 / daiPrice.toString())
    const amountDaiToBorrowWei = ethers.parseEther(amountDaiToBorrow.toString())
    console.log(`You can borrow ${amountDaiToBorrow.toString()} DAI`)
    //borrowing 95% of collateralised asset
    await borrowDai(lendingPool, deployer, amountDaiToBorrowWei)
    await getUserdata(signer, lendingPool)

    await repay(lendingPool, signer, amountDaiToBorrowWei, lendingPoolAddresses)
    await getUserdata(signer, lendingPool)
}

async function borrowDai(lendingPoolContract, borrowerAddress, amountDaiToBorrowWei) {
    let tx = await lendingPoolContract.borrow(
        networkConfig[network.config.chainId].daiTokenAddress,
        amountDaiToBorrowWei,
        2,
        0,
        borrowerAddress,
    )
    await tx.wait(1)
    console.log("Congrats,you have successfully borrowed ")
}

async function repay(lendingPool, signer, amount, lendingPoolAddress) {
    await approveSpender(
        networkConfig[network.config.chainId].daiTokenAddress,
        lendingPoolAddress,
        signer,
        amount,
    )
    let tx = await lendingPool.repay(
        networkConfig[network.config.chainId].daiTokenAddress,
        amount,
        2,
        signer,
    )
    await tx.wait(1)
    console.log("successfully repaid")
}
async function getLendingPoolAddress(signer) {
    let lendingPool = await ethers.getContractAt(
        "IPoolAddressesProvider",
        networkConfig[network.config.chainId].iPoolAdressProviderContractAddress,
        signer,
    )
    let lendingPoolAddresses = await lendingPool.getPool()

    return lendingPoolAddresses
}
async function approveSpender(tokenAddress, spenderAddress, signer, amount) {
    let erc20 = await ethers.getContractAt("IERC20", tokenAddress, signer)
    let tx = await erc20.approve(spenderAddress, amount)
    await tx.wait(1)
    console.log("successfully approved")
}
async function getDaiPrice() {
    let tx = await ethers.getContractAt(
        "AggregatorV3Interface",
        networkConfig[network.config.chainId].aggregatorV3Interface,
    )
    let daiPrice = (await tx.latestRoundData())[1]
    console.log(`The price of DAI is ${daiPrice.toString()}`)
    return daiPrice
}
async function getUserdata(signer, lendingPool) {
    const { totalCollateralBase, totalDebtBase } = await lendingPool.getUserAccountData(signer)
    printUserData(totalCollateralBase, totalDebtBase)
    return { totalCollateralBase, totalDebtBase }
}
function printUserData(totalCollateralBase, totalDebtBase) {
    console.log(`Your collateral is ${totalCollateralBase}`)
    console.log(`Your debt  is ${totalDebtBase}`)
}

main()
    .then(() => process.exit(0))
    .catch((err) => console.log(err))

//i need the address of the lending pool,how do i get it?lendinpool address provider,it has a function to return the address
//how do i access that,have the name,address,and deployer
