package com.trading.risk;

import com.trading.model.Regime;
import com.trading.model.Trade;

public class RiskManager {

    private static final double DAILY_LOSS_LIMIT  = 0.03;  // 3% of day-start balance
    private static final int    MAX_TRADES_PER_DAY = 2;
    private static final double PIP_VALUE_USD      = 10.0; // USD per pip per standard lot

    private double balance;
    private double dayStartBalance;
    private int    tradesToday;

    public RiskManager(double initialBalance) {
        this.balance         = initialBalance;
        this.dayStartBalance = initialBalance;
    }

    public void resetDay() {
        dayStartBalance = balance;
        tradesToday     = 0;
    }

    public boolean canTrade() {
        double lossToday = (dayStartBalance - balance) / dayStartBalance;
        return lossToday < DAILY_LOSS_LIMIT && tradesToday < MAX_TRADES_PER_DAY;
    }

    /** Returns position size in standard lots. */
    public double lots(double stopPips, Regime regime) {
        double riskPct = switch (regime) {
            case TRENDING -> 0.0100;
            case MODERATE -> 0.0075;
            case CHOPPY   -> 0.0050;
        };
        double riskAmount = balance * riskPct;
        return riskAmount / (stopPips * PIP_VALUE_USD);
    }

    public void recordTrade(Trade trade) {
        balance += trade.pnlUsd();
        tradesToday++;
    }

    public double getBalance() { return balance; }
}
