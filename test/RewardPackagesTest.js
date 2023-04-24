const { expect, chai } = require("chai")
const { ethers } = require("hardhat")

async function getCurrentTimestamp() {
    const block = await ethers.provider.getBlock("latest")
    return block.timestamp
}

describe("RewardPackages", function () {
    let owner, user0, user1, user2
    let token, rewardPackages

    before(async () => {
        ;[owner, user0, user1, user2] = await ethers.getSigners()

        const Token = await ethers.getContractFactory("Token")
        token = await Token.deploy()

        const RewardPackages = await ethers.getContractFactory("RewardPackages")
        rewardPackages = await RewardPackages.deploy(token.address)

        await token.transfer(owner.address, ethers.utils.parseEther("1000"))
        await token.transfer(user1.address, ethers.utils.parseEther("1000"))
        await token.transfer(user2.address, ethers.utils.parseEther("1000"))
    })

    describe("createPackage", function () {
        it("should create a new package", async function () {
            await rewardPackages.connect(owner).createPackage(
                "Package 1",
                true,
                86400, // 1 day
                604800, // 1 week
                10, // 10%
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("1000"),
                user0.address
            )

            const package = await rewardPackages.packages(0)
            expect(package.name).to.equal("Package 1")
            expect(package.active).to.equal(true)
            expect(package.lockTime).to.equal(86400)
            expect(package.rewardFrequency).to.equal(604800)
            expect(package.rewardPercentage).to.equal(10)
            expect(package.minDeposit).to.equal(ethers.utils.parseEther("100"))
            expect(package.maxDeposit).to.equal(ethers.utils.parseEther("1000"))
            expect(package.ownerAddress).to.equal(user0.address)
        })

        it("should emit a PackageCreated event", async function () {
            const tx = await rewardPackages.connect(owner).createPackage(
                "Package 2",
                true,
                86400, // 1 day
                604800, // 1 week
                10, // 10%
                ethers.utils.parseEther("100"),
                ethers.utils.parseEther("1000"),
                user0.address
            )

            const receipt = await tx.wait()
            const event = receipt.events.find(
                (e) => e.event === "PackageCreated"
            )
            expect(event.args[0]).to.equal(1)
        })

        it("should increment nextPackageId", async function () {
            const packageId = await rewardPackages.nextPackageId()
            expect(packageId).to.equal(2)
        })
        it("should not pass if caller is not the Owner", async function () {
            await expect(
                rewardPackages.connect(user0).createPackage(
                    "Package 2",
                    true,
                    86400, // 1 day
                    604800, // 1 week
                    10, // 10%
                    ethers.utils.parseEther("100"),
                    ethers.utils.parseEther("1000"),
                    user0.address
                )
            ).to.be.revertedWith("Ownable: caller is not the owner")
        })
    })
    describe("disablePackage", function () {
        it("should disable existing Package", async function () {
            let packageId = 0
            await rewardPackages.connect(user0).disablePackage(packageId)
            const package = await rewardPackages.packages(packageId)
            expect(package.active).to.equal(false)
        })
        it("should not disable nonexisting Package", async function () {
            let packageId = 100
            await expect(
                rewardPackages.connect(user0).disablePackage(packageId)
            ).to.be.revertedWith(
                "You do not have permission to disable this package"
            )
        })
        it("should emit a DisablePackage event", async function () {
            let packageId = 1
            const tx = await rewardPackages
                .connect(user0)
                .disablePackage(packageId)

            const receipt = await tx.wait()
            const event = receipt.events.find(
                (e) => e.event === "PackageDisabled"
            )
            expect(event.args[0]).to.equal(packageId)
        })
        it("should change previously existing Package state to false", async function () {
            const tx = await rewardPackages.connect(owner).createPackage(
                "Package 3",
                true,
                86400, // 1 day
                604800, // 1 week
                10, // 10%
                ethers.utils.parseEther("1"),
                ethers.utils.parseEther("1000"),
                user0.address
            )

            let packageId = 2
            await rewardPackages.connect(user0).disablePackage(packageId)
            const package = await rewardPackages.packages(packageId)
            expect(package.active).to.equal(false)
        })
    })
    describe("disablePackageByOwner", function () {
        it("should disable existing Package", async function () {
            await rewardPackages.connect(owner).createPackage(
                "Package 3",
                true,
                86400, // 1 day
                604800, // 1 week
                10, // 10%
                ethers.utils.parseEther("1"),
                ethers.utils.parseEther("1000"),
                user0.address
            )
            let packageId = 3
            await rewardPackages.connect(owner).disablePackageByOwner(packageId)
            const package = await rewardPackages.packages(packageId)
            expect(package.active).to.equal(false)
        })
        it("should emit a DisablePackageByOwner event", async function () {
            await rewardPackages.connect(owner).createPackage(
                "Package 4",
                true,
                86400, // 1 day
                604800, // 1 week
                10, // 10%
                ethers.utils.parseEther("1"),
                ethers.utils.parseEther("1000"),
                user0.address
            )
            let packageId = 4
            const tx = await rewardPackages
                .connect(owner)
                .disablePackageByOwner(packageId)

            const receipt = await tx.wait()
            const event = receipt.events.find(
                (e) => e.event === "PackageDisabledByOwner"
            )
            expect(event.args[0]).to.equal(packageId)
        })
        it("should not disable nonexisting Package", async function () {
            let packageId = 200
            await expect(
                rewardPackages.connect(owner).disablePackageByOwner(packageId)
            ).to.be.revertedWith("Package is already disabled or non active")
        })
        it("should not disable existing Package by other address than owner", async function () {
            let packageId = 5
            await expect(
                rewardPackages.connect(user0).disablePackageByOwner(packageId)
            ).to.be.revertedWith("Ownable: caller is not the owner")
        })
        it("should change previously existing Package state to false", async function () {
            await rewardPackages.connect(owner).createPackage(
                "Package 5",
                true,
                86400, // 1 day
                604800, // 1 week
                10, // 10%
                ethers.utils.parseEther("1"),
                ethers.utils.parseEther("1000"),
                user0.address
            )

            let packageId = 5
            await rewardPackages.connect(owner).disablePackageByOwner(packageId)
            const package = await rewardPackages.packages(packageId)
            expect(package.active).to.equal(false)
        })
    })
    describe("DepositTokens", function () {
        it("should deposit tokens", async function () {
            let packageId = 6
            let amount = ethers.utils.parseEther("20")
            await rewardPackages.connect(owner).createPackage(
                "Package 6",
                true,
                86400, // 1 day
                604800, // 1 week
                10, // 10%
                ethers.utils.parseEther("1"),
                ethers.utils.parseEther("1000000000000"),
                user0.address
            )
            await token.connect(owner).mint(user0.address, amount)

            await token.connect(user0).approve(rewardPackages.address, amount)
            await rewardPackages.connect(user0).depositTokens(packageId, amount)
            const userInfo = await rewardPackages.users(
                user0.address,
                packageId
            )
            expect(userInfo.depositAmount).to.equal(amount)
        })

        it("should not deposit tokens if package is not active only by owner", async function () {
            const depositAmount = ethers.utils.parseEther("50")
            const packageId = 7
            await rewardPackages.connect(owner).createPackage(
                "Package 7",
                true,
                86400, // 1 day
                604800, // 1 week
                10, // 10%
                ethers.utils.parseEther("1"),
                ethers.utils.parseEther("1000"),
                user0.address
            )

            await token
                .connect(owner)
                .approve(rewardPackages.address, depositAmount)
            await rewardPackages.connect(owner).disablePackageByOwner(packageId)

            await expect(
                rewardPackages
                    .connect(owner)
                    .depositTokens(packageId, depositAmount)
            ).to.be.revertedWith("Package is not active")
        })
        it("should not deposit tokens if you try to disable package with wrong user", async function () {
            const depositAmount = ethers.utils.parseEther("50")
            const packageId = 8
            await rewardPackages.connect(owner).createPackage(
                "Package 8",
                true,
                86400, // 1 day
                604800, // 1 week
                10, // 10%
                ethers.utils.parseEther("1"),
                ethers.utils.parseEther("1000"),
                user0.address
            )

            await token
                .connect(owner)
                .approve(rewardPackages.address, depositAmount)
            await expect(
                rewardPackages.connect(owner).disablePackage(packageId)
            ).to.be.revertedWith(
                "You do not have permission to disable this package"
            )
        })
        it("should not deposit tokens if deposit amount is too small", async function () {
            const depositAmount = ethers.utils.parseEther("5")
            const packageId = 9
            await rewardPackages.connect(owner).createPackage(
                "Package 9",
                true,
                86400, // 1 day
                604800, // 1 week
                10, // 10%
                ethers.utils.parseEther("10"),
                ethers.utils.parseEther("1000"),
                user0.address
            )

            await token.approve(rewardPackages.address, depositAmount)

            await expect(
                rewardPackages.depositTokens(packageId, depositAmount)
            ).to.be.revertedWith("Deposit amount is too small")
        })
        it("should not deposit tokens if deposit amount is too big", async function () {
            const depositAmount = ethers.utils.parseEther("200")
            const packageId = 10
            await rewardPackages.connect(owner).createPackage(
                "Package 10",
                true,
                86400, // 1 day
                604800, // 1 week
                10, // 10%
                ethers.utils.parseEther("1"),
                ethers.utils.parseEther("150"),
                user0.address
            )

            await token.approve(rewardPackages.address, depositAmount)
            await token.mint(rewardPackages.address, depositAmount)

            await expect(
                rewardPackages.depositTokens(packageId, depositAmount)
            ).to.be.revertedWith("Deposit amount is too big")
        })
    })

    describe("WithdrawTokens", function () {
        it("should withdraw tokens", async function () {
            const packageId = 10
            await rewardPackages.connect(owner).createPackage(
                "Package 10",
                true,
                86400, // 1 day
                604800, // 1 week
                10, // 10%
                ethers.utils.parseEther("1"),
                ethers.utils.parseEther("1500"),
                user0.address
            )

            let amount = ethers.BigNumber.from(ethers.utils.parseEther("2"))

            const Packages = await rewardPackages.packages(packageId)

            const rewardFrequency = Packages.rewardFrequency
            const rewardPercentage = Packages.rewardPercentage

            await token.connect(user0).approve(rewardPackages.address, amount)
            await token.connect(owner).mint(user0.address, amount)
            await rewardPackages.connect(user0).depositTokens(packageId, amount)
            await rewardPackages.connect(owner).disablePackageByOwner(packageId)
            const tokenBalanceBeforeWithdraw = await token.balanceOf(
                user0.address
            )

            const userInfo = await rewardPackages.users(
                user0.address,
                packageId
            )
            const balance = userInfo.depositAmount

            await rewardPackages.connect(user0).withdrawTokens(packageId)

            await network.provider.send("evm_mine")
            await network.provider.send("evm_mine")
            const currentTimestamp = await getCurrentTimestamp()

            const tokenBalanceAfterWithdraw = await token.balanceOf(
                user0.address
            )

            const userInfoAfter = await rewardPackages.users(
                user0.address,
                packageId
            )
            const lastClaimTime = userInfoAfter.lastClaimTime

            const elapsedTime = currentTimestamp - lastClaimTime

            const expectedBalance = balance
                .mul(rewardPercentage)
                .div(100)
                .mul(elapsedTime)
                .div(rewardFrequency)
            const finalBalance = balance.add(expectedBalance)

            expect(tokenBalanceAfterWithdraw).to.equal(finalBalance)
        })
        it("should not withdraw tokens when the lock time is reached and there are tokens to withdraw", async function () {
            const packageId = 11
            await rewardPackages.connect(owner).createPackage(
                "Package 10",
                true,
                Date.now() + 40000000000,
                604800, // 1 week
                10, // 10%
                ethers.utils.parseEther("1"),
                ethers.utils.parseEther("1500"),
                user0.address
            )

            let amount = ethers.BigNumber.from(ethers.utils.parseEther("2"))

            const Packages = await rewardPackages.packages(packageId)

            await token.connect(user0).approve(rewardPackages.address, amount)
            await token.connect(owner).mint(user0.address, amount)
            await expect(
                rewardPackages.connect(user0).depositTokens(packageId, 0)
            ).to.be.revertedWith("Amount must be greater than zero")
            await rewardPackages.connect(owner).disablePackageByOwner(packageId)

            await expect(
                rewardPackages.connect(user0).withdrawTokens(packageId)
            ).to.be.revertedWith("No tokens to withdraw")
        })

        it("should not withdraw tokens when the lock time is not reached ", async function () {
            const packageId = 12
            await rewardPackages.connect(owner).createPackage(
                "Package 10",
                true,
                86400, // 1 day
                604800, // 1 week
                10, // 10%
                ethers.utils.parseEther("1"),
                ethers.utils.parseEther("1500"),
                user0.address
            )

            let amount = ethers.BigNumber.from(ethers.utils.parseEther("2"))

            const Packages = await rewardPackages.packages(packageId)

            await token.connect(user0).approve(rewardPackages.address, amount)
            await token.connect(owner).mint(user0.address, amount)
            await rewardPackages.connect(user0).depositTokens(packageId, amount)
            await rewardPackages.connect(owner).disablePackageByOwner(packageId)

            const userInfo = await rewardPackages.users(
                user0.address,
                packageId
            )

            await expect(
                rewardPackages.connect(user0).withdrawTokens(packageId)
            ).to.be.revertedWith("Lock time not reached yet")
        })

        it("should revert if package is still active", async function () {
            const packageId = 13
            await rewardPackages.connect(owner).createPackage(
                "Package 10",
                true,
                86400, // 1 day
                604800, // 1 week
                10, // 10%
                ethers.utils.parseEther("1"),
                ethers.utils.parseEther("1500"),
                user0.address
            )

            let amount = ethers.BigNumber.from(ethers.utils.parseEther("2"))

            const Packages = await rewardPackages.packages(packageId)

            await token.connect(user0).approve(rewardPackages.address, amount)
            await token.connect(owner).mint(user0.address, amount)
            await rewardPackages.connect(user0).depositTokens(packageId, amount)

            const userInfo = await rewardPackages.users(
                user0.address,
                packageId
            )

            await expect(
                rewardPackages.withdrawTokens(packageId)
            ).to.be.revertedWith("Package is still active")
        })

        it("should reset the user's deposit amount, last claim time, and reward amount", async function () {
            const packageId = 14
            await rewardPackages.connect(owner).createPackage(
                "Package 10",
                true,
                86400, // 1 day
                604800, // 1 week
                10, // 10%
                ethers.utils.parseEther("1"),
                ethers.utils.parseEther("1500"),
                user0.address
            )

            let amount = ethers.BigNumber.from(ethers.utils.parseEther("2"))

            const Packages = await rewardPackages.packages(packageId)

            const rewardFrequency = Packages.rewardFrequency
            const rewardPercentage = Packages.rewardPercentage

            await token.connect(user0).approve(rewardPackages.address, amount)
            await token.connect(owner).mint(user0.address, amount)
            await rewardPackages.connect(user0).depositTokens(packageId, amount)
            await rewardPackages.connect(owner).disablePackageByOwner(packageId)

            const userInfo = await rewardPackages.users(
                user0.address,
                packageId
            )
            const balance = userInfo.depositAmount

            await rewardPackages.connect(user0).withdrawTokens(packageId)

            const currentTimestamp = await getCurrentTimestamp()

            const userInfoAfter = await rewardPackages.users(
                user0.address,
                packageId
            )
            const lastClaimTime = userInfoAfter.lastClaimTime

            const elapsedTime = currentTimestamp - lastClaimTime

            const expectedBalance = balance
                .mul(rewardPercentage)
                .div(100)
                .mul(elapsedTime)
                .div(rewardFrequency)

            expect(userInfoAfter.depositAmount).to.equal(0)
            expect(userInfoAfter.lastClaimTime).to.equal(
                currentTimestamp + elapsedTime
            )
            expect(userInfoAfter.rewardAmount).to.equal(expectedBalance)
            expect(userInfoAfter.packageId).to.equal(0)
        })

        it("should return the correct user info", async function () {
            const provider = new ethers.providers.JsonRpcProvider()

            const packageId = 8
            await rewardPackages.connect(owner).createPackage(
                "Package 8",
                true,
                86400, // 1 day
                604800, // 1 week
                10, // 10%
                ethers.utils.parseEther("1"),
                ethers.utils.parseEther("150"),
                user0.address
            )

            let amount = ethers.BigNumber.from(ethers.utils.parseEther("2"))
            let amountPercent = amount.div(10)

            await token.connect(user0).approve(rewardPackages.address, amount)
            await token.connect(owner).mint(user0.address, amount)
            await rewardPackages.connect(user0).depositTokens(packageId, amount)

            await new Promise((resolve) => setTimeout(resolve, 1000))
            await rewardPackages.connect(owner).disablePackageByOwner(packageId)

            const userInfo = await rewardPackages.users(
                user0.address,
                packageId
            )

            expect(userInfo.depositAmount).to.equal(amount)
            expect(userInfo.lastClaimTime).to.not.equal("0")
            expect(userInfo.rewardAmount).to.equal(amountPercent)
            expect(userInfo.packageId).to.equal(0)
        })
    })
})
