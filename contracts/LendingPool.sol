// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Hedera Lending Pool
/// @notice Minimal lending pool to showcase Hedera HTS + KYC workflows.
contract LendingPool {
    struct Position {
        uint256 supplied;
        uint256 borrowed;
        uint256 lastInterestIndex;
        uint256 lastUpdated;
    }

    mapping(address => Position) public positions;
    uint256 public collateralFactor = 6000; // 60%, expressed in basis points
    uint256 public liquidationThreshold = 8000; // 80%
    uint256 public reserveFactor = 1000; // 10%

    constructor() payable {}

    event Supplied(address indexed account, uint256 amount, uint256 totalSupplied);
    event Borrowed(address indexed account, uint256 amount, uint256 totalBorrowed, uint256 healthFactor);
    event Repaid(address indexed account, uint256 amount, uint256 remainingDebt);
    event Liquidated(address indexed account, uint256 repaidDebt, uint256 collateralSlashed);

    function setRiskParams(
        uint256 _collateralFactor,
        uint256 _liquidationThreshold,
        uint256 _reserveFactor
    ) external {
        require(_collateralFactor <= 9000, "collateralFactor too high");
        require(_liquidationThreshold > _collateralFactor, "liq threshold must exceed collateral");
        collateralFactor = _collateralFactor;
        liquidationThreshold = _liquidationThreshold;
        reserveFactor = _reserveFactor;
    }

    function supply(uint256 amount) external {
        require(amount > 0, "amount=0");
        Position storage position = positions[msg.sender];
        position.supplied += amount;
        position.lastUpdated = block.timestamp;
        emit Supplied(msg.sender, amount, position.supplied);
    }

    function borrow(uint256 amount) external {
        require(amount > 0, "amount=0");
        Position storage position = positions[msg.sender];
        uint256 maxBorrowable = (position.supplied * collateralFactor) / 10_000;
        require(position.borrowed + amount <= maxBorrowable, "exceeds limit");
        position.borrowed += amount;
        position.lastUpdated = block.timestamp;
        emit Borrowed(msg.sender, amount, position.borrowed, healthFactor(msg.sender));
    }

    function repay(uint256 amount) external {
        require(amount > 0, "amount=0");
        Position storage position = positions[msg.sender];
        require(position.borrowed > 0, "nothing to repay");
        if (amount >= position.borrowed) {
            amount = position.borrowed;
        }
        position.borrowed -= amount;
        position.lastUpdated = block.timestamp;
        emit Repaid(msg.sender, amount, position.borrowed);
    }

    function liquidate(address account, uint256 repayAmount) external {
        Position storage position = positions[account];
        require(position.borrowed > 0, "nothing to liquidate");
        require(healthFactor(account) < 1e18, "position healthy");
        uint256 repay = repayAmount > position.borrowed ? position.borrowed : repayAmount;
        position.borrowed -= repay;
        uint256 collateralSlashed = (repay * 12_000) / 10_000; // 20% liquidation bonus for simplicity
        position.supplied = position.supplied > collateralSlashed ? position.supplied - collateralSlashed : 0;
        position.lastUpdated = block.timestamp;
        emit Liquidated(account, repay, collateralSlashed);
    }

    function getPosition(address account) external view returns (Position memory) {
        return positions[account];
    }

    function healthFactor(address account) public view returns (uint256) {
        Position storage position = positions[account];
        if (position.borrowed == 0) {
            return type(uint256).max;
        }
        uint256 maxDebt = (position.supplied * liquidationThreshold) / 10_000;
        return (maxDebt * 1e18) / position.borrowed;
    }
}
