const {
  initiateTransfer,
  depositMoney,
  withdrawMoney,
  getTransactionHistory,
} = require("../services/transactionService");

const {
  validateTransactionInput,
} = require("../validators/transactionValidator");

/**
 * 🔁 TRANSFER (ORCHESTRATOR BASED)
 */
async function transfer(req, res) {
  try {
    const { valid, errors } = validateTransactionInput(req.body);

    if (!valid) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const {
      from_account_number,
      to_account_number,
      amount,
      transaction_type,
    } = req.body;

    if (!from_account_number || !to_account_number) {
      return res.status(400).json({
        success: false,
        message: "Both sender and receiver account numbers are required.",
      });
    }

    if (!transaction_type) {
      return res.status(400).json({
        success: false,
        message: "transaction_type is required (internal/imps/neft/rtgs)",
      });
    }

    const txn = await initiateTransfer({
      from_account_number,
      to_account_number,
      amount: Number(amount),
      transaction_type,
    });

    return res.status(200).json({
      success: true,
      message: "Transfer successful",
      transaction: txn,
    });

  } catch (err) {
    console.error("TRANSFER ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: err.message || "Transfer failed",
    });
  }
}

/**
 * 💰 DEPOSIT
 */
async function deposit(req, res) {
  try {
    const { valid, errors } = validateTransactionInput(req.body);

    if (!valid) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const { account_number, amount } = req.body;

    if (!account_number) {
      return res.status(400).json({
        success: false,
        message: "Account number is required.",
      });
    }

    const txn = await depositMoney({
      account_number,
      amount: Number(amount),
    });

    return res.status(200).json({
      success: true,
      message: "Deposit successful",
      transaction: txn,
    });

  } catch (err) {
    console.error("DEPOSIT ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: err.message || "Deposit failed",
    });
  }
}

/**
 * 💸 WITHDRAW
 */
async function withdraw(req, res) {
  try {
    const { valid, errors } = validateTransactionInput(req.body);

    if (!valid) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const { account_number, amount } = req.body;

    if (!account_number) {
      return res.status(400).json({
        success: false,
        message: "Account number is required.",
      });
    }

    const txn = await withdrawMoney({
      account_number,
      amount: Number(amount),
    });

    return res.status(200).json({
      success: true,
      message: "Withdrawal successful",
      transaction: txn,
    });

  } catch (err) {
    console.error("WITHDRAW ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: err.message || "Withdrawal failed",
    });
  }
}

/**
 * 📊 TRANSACTION HISTORY
 */
async function getHistory(req, res) {
  try {
    const { account_id } = req.params;

    if (!account_id) {
      return res.status(400).json({
        success: false,
        message: "account_id is required",
      });
    }

    const data = await getTransactionHistory(account_id);

    return res.status(200).json({
      success: true,
      transactions: data,
    });

  } catch (err) {
    console.error("HISTORY ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch transaction history",
    });
  }
}

module.exports = {
  transfer,
  deposit,
  withdraw,
  getHistory, // ✅ added
};