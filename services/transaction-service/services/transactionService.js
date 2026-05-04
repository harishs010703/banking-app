const { sequelize } = require("../../../shared/config/db");
const Account = require("../../account-service/models/account.model");
const Transaction = require("../models/transaction.model");
const { Op } = require("sequelize");

/**
 * 🔥 ORCHESTRATOR
 */
async function initiateTransfer(data) {
  switch (data.transaction_type) {
    case "internal":
      return processInternalTransfer(data);

    case "imps":
      return processIMPS(data);

    case "neft":
      return processNEFT(data);

    case "rtgs":
      return processRTGS(data);

    default:
      throw new Error("Invalid transaction type");
  }
}

/**
 * ✅ INTERNAL TRANSFER
 */
async function processInternalTransfer({ from_account_number, to_account_number, amount }) {
  const t = await sequelize.transaction();

  try {
    const sender = await Account.findOne({
      where: { account_number: from_account_number },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    const receiver = await Account.findOne({
      where: { account_number: to_account_number },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!sender || !receiver) {
      throw new Error("Invalid account(s).");
    }

    if (Number(sender.available_balance) < Number(amount)) {
      throw new Error("Insufficient balance.");
    }

    sender.balance = Number(sender.balance) - Number(amount);
    sender.available_balance = Number(sender.available_balance) - Number(amount);

    receiver.balance = Number(receiver.balance) + Number(amount);
    receiver.available_balance = Number(receiver.available_balance) + Number(amount);

    await sender.save({ transaction: t });
    await receiver.save({ transaction: t });

    const txn = await Transaction.create(
      {
        from_account_id: sender.account_id,
        to_account_id: receiver.account_id,
        amount,
        transaction_type: "internal",
        status: "success",
        reference_id: `TXN-${Date.now()}`
      },
      { transaction: t }
    );

    await t.commit();
    return txn;

  } catch (err) {
    await t.rollback();
    throw err;
  }
}

/**
 * ⚡ IMPS
 */
async function processIMPS(data) {
  console.log("IMPS transfer");

  const txn = await processInternalTransfer(data);
  txn.transaction_type = "imps";
  await txn.save();

  return txn;
}

/**
 * 🕒 NEFT
 */
async function processNEFT(data) {
  console.log("NEFT transfer (delayed)");

  await new Promise(resolve => setTimeout(resolve, 2000));

  const txn = await processInternalTransfer(data);
  txn.transaction_type = "neft";
  await txn.save();

  return txn;
}

/**
 * 💰 RTGS
 */
async function processRTGS(data) {
  console.log("RTGS transfer");

  if (data.amount < 200000) {
    throw new Error("RTGS requires minimum ₹2,00,000");
  }

  const txn = await processInternalTransfer(data);
  txn.transaction_type = "rtgs";
  await txn.save();

  return txn;
}

/**
 * 💰 DEPOSIT
 */
async function depositMoney({ account_number, amount }) {
  const t = await sequelize.transaction();

  try {
    const account = await Account.findOne({
      where: { account_number },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!account) throw new Error("Account not found.");

    account.balance = Number(account.balance) + Number(amount);
    account.available_balance = Number(account.available_balance) + Number(amount);

    await account.save({ transaction: t });

    const txn = await Transaction.create(
      {
        to_account_id: account.account_id,
        amount,
        transaction_type: "deposit",
        status: "success",
        reference_id: `TXN-${Date.now()}`
      },
      { transaction: t }
    );

    await t.commit();
    return txn;

  } catch (err) {
    await t.rollback();
    throw err;
  }
}

/**
 * 💸 WITHDRAW
 */
async function withdrawMoney({ account_number, amount }) {
  const t = await sequelize.transaction();

  try {
    const account = await Account.findOne({
      where: { account_number },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!account) throw new Error("Account not found.");

    if (Number(account.available_balance) < Number(amount)) {
      throw new Error("Insufficient balance.");
    }

    account.balance = Number(account.balance) - Number(amount);
    account.available_balance = Number(account.available_balance) - Number(amount);

    await account.save({ transaction: t });

    const txn = await Transaction.create(
      {
        from_account_id: account.account_id,
        amount,
        transaction_type: "withdraw",
        status: "success",
        reference_id: `TXN-${Date.now()}`
      },
      { transaction: t }
    );

    await t.commit();
    return txn;

  } catch (err) {
    await t.rollback();
    throw err;
  }
}

/**
 * 📊 HISTORY
 */
async function getTransactionHistory(account_id) {
  return await Transaction.findAll({
    where: {
      [Op.or]: [
        { from_account_id: account_id },
        { to_account_id: account_id }
      ]
    },
    order: [["created_at", "DESC"]],
  });
}

/**
 * 🔚 EXPORTS
 */
module.exports = {
  initiateTransfer,
  processInternalTransfer,
  processIMPS,
  processNEFT,
  processRTGS,
  depositMoney,
  withdrawMoney,
  getTransactionHistory
};