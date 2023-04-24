const hre = require("hardhat")

async function main() {
    const TokAddress = "0x03D51fe9443888f51C6639D30AFE11e96D1E0Cc5";
    const RewardPackages = await hre.ethers.getContractFactory("RewardPackages")
    const rewardPackages = await RewardPackages.deploy(TokAddress)
    await rewardPackages.deployed()
    console.log("RewardPackages deployed to:", rewardPackages.address)
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })