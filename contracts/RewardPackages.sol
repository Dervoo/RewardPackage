// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardPackages is Ownable {
    using SafeMath for uint256;
    IERC20 private token;

    struct Package {
        string name;
        bool active;
        uint256 lockTime;
        uint256 rewardFrequency;
        uint256 rewardPercentage;
        uint256 minDeposit;
        uint256 maxDeposit;
        address ownerAddress;
    }

    struct UserInfo {
        uint256 depositAmount;
        uint256 lastClaimTime;
        uint256 rewardAmount;
        uint256 packageId;
    }

    mapping(uint256 => Package) public packages;
    mapping(uint256 => mapping(address => uint256)) public deposits;
    mapping(uint256 => mapping(address => uint256)) public rewards;
    mapping(address => mapping(uint256 => UserInfo)) public users;

    uint256 public nextPackageId = 0;

    event PackageCreated(uint256 packageId);
    event PackageDisabled(uint256 packageId);
    event PackageDisabledByOwner(uint256 packageId);
    event TokensDeposited(
        uint256 packageId,
        address indexed user,
        uint256 amount
    );
    event TokensWithdrawn(
        uint256 packageId,
        address indexed user,
        uint256 amount
    );

    constructor(address tokenAddress) {
        token = IERC20(tokenAddress);
    }

    function createPackage(
        string memory name,
        bool active,
        uint256 lockTime,
        uint256 rewardFrequency,
        uint256 rewardPercentage,
        uint256 minDeposit,
        uint256 maxDeposit,
        address ownerAddress
    ) external onlyOwner {
        packages[nextPackageId] = Package({
            name: name,
            active: active,
            lockTime: lockTime,
            rewardFrequency: rewardFrequency,
            rewardPercentage: rewardPercentage,
            minDeposit: minDeposit,
            maxDeposit: maxDeposit,
            ownerAddress: ownerAddress
        });
        emit PackageCreated(nextPackageId);
        nextPackageId++;
        token.approve(address(this), maxDeposit);
    }

    function disablePackage(uint256 packageId) public {
        require(
            msg.sender == packages[packageId].ownerAddress,
            "You do not have permission to disable this package"
        );
        require(
            packages[packageId].active == true,
            "Package is already disabled or non active"
        );
        packages[packageId].active = false;
        emit PackageDisabled(packageId);
    }

    function disablePackageByOwner(uint256 packageId) external onlyOwner {
        require(
            packages[packageId].active == true,
            "Package is already disabled or non active"
        );
        packages[packageId].active = false;
        emit PackageDisabledByOwner(packageId);
    }

    function depositTokens(uint256 packageId, uint256 amount) external {
        require(packages[packageId].active == true, "Package is not active");
        require(amount > 0, "Amount must be greater than zero");
        require(
            amount >= packages[packageId].minDeposit,
            "Deposit amount is too small"
        );
        require(
            amount <= packages[packageId].maxDeposit,
            "Deposit amount is too big"
        );
        uint256 allowance = token.allowance(msg.sender, address(this));
        require(allowance >= amount, "Insufficient token allowance");
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        Package storage package = packages[packageId];
        UserInfo storage user = users[msg.sender][packageId];
        uint256 rewardAmount = amount.mul(package.rewardPercentage).div(100);
        require(
            token.transferFrom(address(this), address(this), rewardAmount),
            "Transfer failed"
        );
        user.depositAmount = user.depositAmount.add(amount);
        user.rewardAmount = user.rewardAmount.add(rewardAmount);
        user.lastClaimTime = block.timestamp;
        emit TokensDeposited(packageId, msg.sender, amount);
    }

    function withdrawTokens(uint256 packageId) external {
        require(packages[packageId].active == false, "Package is still active");
        require(
            packages[packageId].ownerAddress == msg.sender,
            "You are not an owner of the Package"
        );
        require(
            block.timestamp >= packages[packageId].lockTime,
            "Lock time not reached yet"
        );
        UserInfo storage user = users[msg.sender][packageId];
        uint256 depositAmount = user.depositAmount;
        require(depositAmount > 0, "No tokens to withdraw");
        uint256 rewardAmount = calculateReward(user);
        uint256 withdrawAmount = depositAmount.add(rewardAmount);
        user.depositAmount = 0;
        user.lastClaimTime = block.timestamp;
        user.rewardAmount = 0;
        require(token.transfer(msg.sender, withdrawAmount), "Transfer failed");
        emit TokensWithdrawn(packageId, msg.sender, withdrawAmount);
    }

    function getUserInfo(
        uint256 packageId
    ) public view returns (uint256, uint256, uint256) {
        UserInfo storage user = users[msg.sender][packageId];
        uint256 reward = calculateReward(user);
        return (user.depositAmount, reward, user.lastClaimTime);
    }

    function calculateReward(
        UserInfo storage user
    ) private view returns (uint256) {
        Package storage package = packages[user.packageId];
        uint256 elapsedTime = block.timestamp - user.lastClaimTime;
        uint256 reward = user
            .depositAmount
            .mul(package.rewardPercentage)
            .div(100)
            .mul(elapsedTime)
            .div(package.rewardFrequency);
        return reward;
    }
}
