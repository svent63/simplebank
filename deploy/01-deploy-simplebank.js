const { network, ethers } = require("hardhat")
// const { developmentChains, networkConfig } = require("../helper-hardhat-config")
//const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const simpleBank = await deploy("SimpleBank", {
        from: deployer,
        args: [],
        log: true,
    })

    log("-------------------------------------------")
}

module.exports.tags = ["all", "simpleBank"]
