package com.trading;

import com.trading.backtest.BacktestEngine;
import com.trading.journal.TradeJournal;
import com.trading.metrics.PerformanceMetrics;
import com.trading.model.Trade;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

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

        List<Trade> inSample = all.stream()
                .filter(t -> t.date().isBefore(splitDate))
                .collect(Collectors.toList());

        List<Trade> oos = all.stream()
                .filter(t -> !t.date().isBefore(splitDate))
                .collect(Collectors.toList());

        double endOfIsBalance = balance
                + inSample.stream().mapToDouble(Trade::pnlUsd).sum();

        // --- CSV trade logs ---
        TradeJournal.write(all,      RESULTS_DIR + "/orb_trades_full.csv");
        TradeJournal.write(inSample, RESULTS_DIR + "/orb_trades_insample.csv");
        TradeJournal.write(oos,      RESULTS_DIR + "/orb_trades_oos.csv");

        // --- JSON summaries (consumed by the frontend) ---
        PerformanceMetrics.exportSummaryJson(all,      balance,        "full",          RESULTS_DIR + "/summary.json");
        PerformanceMetrics.exportSummaryJson(inSample, balance,        "inSample",      RESULTS_DIR + "/summary_insample.json");
        PerformanceMetrics.exportSummaryJson(oos,      endOfIsBalance, "outOfSample",   RESULTS_DIR + "/summary_oos.json");

        // --- Console reports ---
        PerformanceMetrics.print(inSample, balance,        "IN-SAMPLE  (" + splitDate + ")");
        PerformanceMetrics.print(oos,      endOfIsBalance, "OUT-OF-SAMPLE  (unseen data)");
        PerformanceMetrics.print(all,      balance,        "FULL PERIOD");
    }
}
