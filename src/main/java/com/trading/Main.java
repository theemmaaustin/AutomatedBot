package com.trading;

import com.trading.backtest.BacktestEngine;
import com.trading.journal.TradeJournal;
import com.trading.metrics.PerformanceMetrics;
import com.trading.model.Trade;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Entry point.
 *
 * Usage:
 *   java -cp out com.trading.Main [dataDir] [startBalance] [splitDate]
 *
 * Defaults:
 *   dataDir     = ../quant/data
 *   startBalance = 10000
 *   splitDate   = 2025-06-01  (roughly 14 months in-sample, 9 months OOS)
 *
 * The split date separates:
 *   IN-SAMPLE  — period used to discover strategy parameters (not truly "clean")
 *   OOS        — period the optimizer never saw; this is the real validity test
 *
 * Note: EMA and ADX indicators are backward-looking, so there is no actual data
 * leakage in signal generation — the OOS signals only use data available at the
 * time each trade was taken.
 */
public class Main {

    private static final String DEFAULT_DATA_DIR   = "../quant/data";
    private static final double DEFAULT_BALANCE    = 10_000.0;
    private static final String DEFAULT_SPLIT_DATE = "2025-06-01";
    private static final String RESULTS_DIR        = "../javastrategy/results";

    public static void main(String[] args) throws Exception {
        String    dataDir   = args.length > 0 ? args[0] : DEFAULT_DATA_DIR;
        double    balance   = args.length > 1 ? Double.parseDouble(args[1]) : DEFAULT_BALANCE;
        LocalDate splitDate = LocalDate.parse(args.length > 2 ? args[2] : DEFAULT_SPLIT_DATE);

        System.out.println("=== EUR/USD Opening Range Breakout Backtester ===");
        System.out.printf("Split date: %s  (in-sample | out-of-sample)%n%n", splitDate);

        BacktestEngine engine = new BacktestEngine(dataDir, balance);
        List<Trade>    all    = engine.run();

        if (all.isEmpty()) {
            System.out.println("No trades generated.");
            return;
        }

        // Partition into in-sample and out-of-sample
        List<Trade> inSample = all.stream()
                .filter(t -> t.date().isBefore(splitDate))
                .collect(Collectors.toList());

        List<Trade> oos = all.stream()
                .filter(t -> !t.date().isBefore(splitDate))
                .collect(Collectors.toList());

        // Balance at the end of the in-sample period becomes OOS starting balance
        double endOfIsBalance = balance
                + inSample.stream().mapToDouble(Trade::pnlUsd).sum();

        // Write trade logs
        TradeJournal.write(all,      RESULTS_DIR + "/orb_trades_full.csv");
        TradeJournal.write(inSample, RESULTS_DIR + "/orb_trades_insample.csv");
        TradeJournal.write(oos,      RESULTS_DIR + "/orb_trades_oos.csv");
        System.out.println("Logs written to results/");

        // Print all three reports
        PerformanceMetrics.print(inSample, balance,         "IN-SAMPLE  (" + splitDate + ")");
        PerformanceMetrics.print(oos,      endOfIsBalance,  "OUT-OF-SAMPLE  (unseen data)");
        PerformanceMetrics.print(all,      balance,         "FULL PERIOD");
    }
}
