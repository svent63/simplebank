const { getNamedAccounts, deployments, ethers } = require("hardhat")
const { assert, expect } = require("chai")
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs")

describe("SimpleBank", () => {
    let deployer
    let simpleBank

    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        simpleBank = await ethers.getContract("SimpleBank", deployer)
    })

    it("shows the bank owner", async () => {
        const owner = await simpleBank.owner()
        assert.equal(owner, deployer)
    })

    describe("getBalance", () => {
        it("reverts if caller is not a client", async () => {
            await expect(simpleBank.getBalance()).to.be.revertedWithCustomError(simpleBank, "SimpleBank__NotAClient")
        })
        it("returns the account balance", async () => {
            await simpleBank.enroll()
            const bal = await simpleBank.getBalance()
            assert.equal(bal.toString(), "0")
        })
    })

    describe("enroll", () => {
        it("does not allow duplicate enrollments", async () => {
            await simpleBank.enroll()
            await expect(simpleBank.enroll()).to.be.revertedWithCustomError(simpleBank, "SimpleBank__AlreadyEnrolled")
        })

        it("return the enrollment status", async () => {
            const status = await simpleBank.enroll()
            assert(status)
        })

        it("emits an event on enrollment", async () => {
            await expect(simpleBank.enroll()).to.be.emit(simpleBank, "LogEnrolled").withArgs(deployer)
        })
    })

    describe("deposit", () => {
        let connectedContract
        let caller

        beforeEach(async () => {
            const accounts = await ethers.getSigners()
            caller = accounts[1].address
            connectedContract = await simpleBank.connect(accounts[1])
        })

        it("reverts if not enrolled", async () => {
            await expect(connectedContract.deposit()).to.be.revertedWithCustomError(
                connectedContract,
                "SimpleBank__NotAClient"
            )
        })

        it("allows deposits into the account", async () => {
            await connectedContract.enroll()
            const balance = await connectedContract.deposit({ value: ethers.utils.parseEther("0.01") })
            assert.equal(balance.value.toString(), ethers.utils.parseEther("0.01").toString())
        })

        it("emits an event after deposit made", async () => {
            await connectedContract.enroll()
            await expect(connectedContract.deposit({ value: ethers.utils.parseEther("0.01") }))
                .to.emit(simpleBank, "LogDepositMade")
                .withArgs(caller, ethers.utils.parseEther("0.01"))
        })

        it("return the new account balance", async () => {
            await connectedContract.enroll()
            const newBalance = await connectedContract.deposit({ value: ethers.utils.parseEther("0.01") })
            assert.equal(newBalance.value.toString(), ethers.utils.parseEther("0.01").toString())
        })
    })

    describe("withdraw", () => {
        let accounts
        let connectedContract

        beforeEach(async () => {
            accounts = await ethers.getSigners()
            connectedContract = await simpleBank.connect(accounts[1])
            await connectedContract.enroll()
            const transactionResponse = await connectedContract.deposit({ value: ethers.utils.parseEther("0.01") })
            console.log(transactionResponse)
        })

        it("reverts with not enough funds available", async () => {
            await expect(connectedContract.withdraw(ethers.utils.parseEther("0.02"))).to.be.revertedWithCustomError(
                connectedContract,
                "SimpleBank__NoEnoughFundsAvailable"
            )
        })

        it("emits an event on withdrawal", async () => {
            await expect(connectedContract.withdraw(ethers.utils.parseEther("0.005")))
                .to.emit(connectedContract, "LogWithdrawal")
                .withArgs(accounts[1].address, ethers.utils.parseEther("0.005"), ethers.utils.parseEther("0.005"))
        })

        it("return the new available balance", async () => {
            const newBalance = await connectedContract.withdraw(ethers.utils.parseEther("0.005"))
            // I'm ignoring all other costs for now, just want a failure with something other than 0
            assert.equal(
                newBalance.value.toString(),
                (ethers.utils.parseEther("0.01") - ethers.utils.parseEther("0.005")).toString()
            )
        })
    })
})
