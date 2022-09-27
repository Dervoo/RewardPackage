const hre = require("hardhat")

async function main() {
    const TheTok20 = await hre.ethers.getContractFactory("TheTok20")
    const theTok20 = await TheTok20.deploy()
    await theTok20.deployed()
    console.log("TheTok deployed to:", theTok20.address)
    const balanceOf = await theTok20.balanceOf("0x9F7297DecFb0dF169924c960325A1272da3B8629")
    console.log("Balance before mint: ", balanceOf.toString())
    const mint = await theTok20.mint("0x9F7297DecFb0dF169924c960325A1272da3B8629", 5000)
    console.log("Mint: ", mint)
    const balanceAfter = await theTok20.balanceOf("0x9F7297DecFb0dF169924c960325A1272da3B8629")
    console.log("Balance after mint: ", balanceAfter.toString())
    await theTok20.pause()
    const paused = await theTok20.paused()
    console.log("Is Paused?: ", paused)
    await theTok20.unpause()
    const unpaused = await theTok20.paused()
    console.log("Is Paused? ", unpaused)

    
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })