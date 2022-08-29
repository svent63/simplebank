const { verifyMessage } = require("ethers/lib/utils")
const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    const simpleBank = await deploy("SimpleBank", {
        from: deployer,
        args: [],
        log: true,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(simpleBank.address, [])
    }

    log("-------------------------------------------")
}

module.exports.tags = ["all", "simpleBank"]
