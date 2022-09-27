const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test TheTok20", function () {
    let variables;
    let owner;
    let addr1;
    let addr2;
    let addrs;
    let contractTok;
    let randomAddress;

    beforeEach(async () => {
        const provider = ethers.getDefaultProvider();
        const TheTokFactory = await ethers.getContractFactory("TheTok20");
        contractTok = await TheTokFactory.deploy();
        await contractTok.deployed();
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        // randomAddress = randomAddress.connect(provider);
    });

    describe("mint() pause() unpause()", async () => {
        it("PASS", async () => {
            await contractTok.connect(owner).mint(addr1.address, 500);
            expect(await contractTok.balanceOf(addr1.address)).to.be.equal(500);
        })
        it("PASS - contract unpaused - can mint", async() => {
            await contractTok.connect(owner).pause();
            await expect (contractTok.connect(owner).mint(addr1.address, 500)).to.be.reverted;
            await contractTok.connect(owner).unpause();
            await contractTok.connect(owner).mint(addr1.address, 500);
            expect(await contractTok.balanceOf(addr1.address)).to.be.equal(500);

        })
        it("FAIL - caller is not an owner", async () => {
            await expect (contractTok.connect(addr1).mint(addr1.address, 500)).to.be.reverted;
        })
        it("FAIL - contract paused - cannot mint", async () => {
            await contractTok.connect(owner).pause();
            await expect (contractTok.connect(owner).mint(addr1.address, 500)).to.be.reverted;
        })
    })
})