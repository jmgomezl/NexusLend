import { appConfig } from '../config/environment.js';
import { KycService } from './kycService.js';

export class LendingService {
  constructor({ kycService = new KycService(), collateralFactor = 0.6, poolContract = null } = {}) {
    this.kycService = kycService;
    this.collateralFactor = collateralFactor;
    this.reserveTokenId = appConfig.reserveTokenId;
    this.positions = new Map();
    this.poolContract = poolContract;
  }

  bindContract(poolContract) {
    this.poolContract = poolContract;
  }

  async getPosition(accountId) {
    if (this.poolContract) {
      return this.poolContract.getPosition(accountId);
    }

    if (!this.positions.has(accountId)) {
      this.positions.set(accountId, { supplied: 0, borrowed: 0 });
    }
    return this.positions.get(accountId);
  }

  async supply({ accountId, amount }) {
    this.#validateAmount(amount);

    if (this.poolContract) {
      const tx = await this.poolContract.supply(amount);
      await tx.wait();
      return this.poolContract.getPosition(accountId);
    }

    const position = await this.getPosition(accountId);
    position.supplied += amount;
    return { ...position };
  }

  async borrow({ accountId, amount }) {
    this.#validateAmount(amount);
    await this.kycService.ensure(accountId);

    if (this.poolContract) {
      const tx = await this.poolContract.borrow(amount);
      await tx.wait();
      const position = await this.poolContract.getPosition(accountId);
      const healthFactor = await this.poolContract.healthFactor(accountId);
      return { ...position, healthFactor: Number(healthFactor) / 1e18 };
    }

    const position = await this.getPosition(accountId);
    const maxBorrowable = position.supplied * this.collateralFactor;
    if (maxBorrowable < position.borrowed + amount) {
      throw new Error(
        `Borrow denied. Requested ${amount} exceeds limit ${maxBorrowable.toFixed(2)} based on collateral.`
      );
    }
    position.borrowed += amount;
    const healthFactor = await this.getHealthFactor(accountId);
    return { ...position, healthFactor };
  }

  async repay({ accountId, amount }) {
    this.#validateAmount(amount);

    if (this.poolContract) {
      const tx = await this.poolContract.repay(amount);
      await tx.wait();
      const position = await this.poolContract.getPosition(accountId);
      const healthFactor = await this.poolContract.healthFactor(accountId);
      return { ...position, healthFactor: Number(healthFactor) / 1e18 };
    }

    const position = await this.getPosition(accountId);
    position.borrowed = Math.max(position.borrowed - amount, 0);
    const healthFactor = await this.getHealthFactor(accountId);
    return { ...position, healthFactor };
  }

  async liquidate({ accountId, repayAmount }) {
    this.#validateAmount(repayAmount);

    if (this.poolContract) {
      const tx = await this.poolContract.liquidate(accountId, repayAmount);
      await tx.wait();
      return this.poolContract.getPosition(accountId);
    }

    const position = await this.getPosition(accountId);
    const repay = Math.min(repayAmount, position.borrowed);
    position.borrowed -= repay;
    position.supplied = Math.max(position.supplied - repay * 1.2, 0); // 20% penalty
    const healthFactor = await this.getHealthFactor(accountId);
    return { ...position, healthFactor };
  }

  async getHealthFactor(accountId) {
    if (this.poolContract) {
      const factor = await this.poolContract.healthFactor(accountId);
      return Number(factor) / 1e18;
    }

    const { supplied, borrowed } = this.positions.get(accountId) || { supplied: 0, borrowed: 0 };
    if (borrowed === 0) {
      return Infinity;
    }
    return (supplied * this.collateralFactor) / borrowed;
  }

  #validateAmount(amount) {
    if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }
  }
}
