package com.trading.metrics;

import com.trading.model.Trade;

import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

public class PerformanceMetrics {

    public static void print(List<Trade> trades, double startingBalance, String title) {
        if (trades.isEmpty()) {
            System.out.printf("No trades in %s period.%n", title);
            return;
        }

        long wins      = trades.stream().filter(t -> "WIN".equals(t.result())).count();
        long losses    = trades.stream().filter(t -> "LOSS".equals(t.result())).count();
        long scratches = trades.stream().filter(t -> "SCRATCH".equals(t.result())).count();

        double winRate = (wins + losses) > 0 ? 100.0 * wins / (wins + losses) : 0;

        double grossWins = trades.stream()
                .filter(t -> "WIN".equals(t.result()))
                .mapToDouble(Trade::pnlUsd).sum();
        double grossLoss = Math.abs(trades.stream()
                .filter(t -> "LOSS".equals(t.result()))
                .mapToDouble(Trade::pnlUsd).sum());
        double profitFactor = grossLoss > 0 ? grossWins / grossLoss : Double.MAX_VALUE;

        double totalPnl    = trades.stream().mapToDouble(Trade::pnlUsd).sum();
        double finalBal    = startingBalance + totalPnl;
        double totalReturn = totalPnl / startingBalance * 100.0;

        double peak = startingBalance, maxDD = 0, equity = startingBalance;
        for (Trade t : trades) {
            equity += t.pnlUsd();
            if (equity > peak) peak = equity;
            double dd = (peak - equity) / peak * 100.0;
            if (dd > maxDD) maxDD = dd;
        }

        double avgWin  = wins  > 0 ? grossWins / wins   : 0;
        double avgLoss = losses > 0 ? grossLoss / losses : 0;

        LocalDate first = trades.get(0).date();
        LocalDate last  = trades.get(trades.size() - 1).date();
        long days = ChronoUnit.DAYS.between(first, last);
        double tpm = days > 0 ? trades.size() / (days / 30.44) : trades.size();

        Map<LocalDate, Double> dailyPnl = trades.stream()
                .collect(Collectors.groupingBy(Trade::date, Collectors.summingDouble(Trade::pnlUsd)));
        double[] arr    = dailyPnl.values().stream().mapToDouble(Double::doubleValue).toArray();
        double   mean   = Arrays.stream(arr).average().orElse(0);
        double   var    = Arrays.stream(arr).map(v -> (v - mean) * (v - mean)).average().orElse(1);
        double   stddev = Math.sqrt(var);
        double   sharpe = stddev > 0 ? (mean / stddev) * Math.sqrt(252) : 0;

        Map<String, Long> totalBySession  = trades.stream()
                .collect(Collectors.groupingBy(Trade::session, Collectors.counting()));
        Map<String, Long> winsBySession   = trades.stream()
                .filter(t -> "WIN".equals(t.result()))
                .collect(Collectors.groupingBy(Trade::session, Collectors.counting()));
        Map<String, Long> lossesBySession = trades.stream()
                .filter(t -> "LOSS".equals(t.result()))
                .collect(Collectors.groupingBy(Trade::session, Collectors.counting()));
        Map<String, Long> winsByRegime    = trades.stream()
                .filter(t -> "WIN".equals(t.result()))
                .collect(Collectors.groupingBy(Trade::regime, Collectors.counting()));
        Map<String, Long> lossesByRegime  = trades.stream()
                .filter(t -> "LOSS".equals(t.result()))
                .collect(Collectors.groupingBy(Trade::regime, Collectors.counting()));

        String header = String.format("  %-36s", title);
        System.out.println("\n+--------------------------------------+");
        System.out.printf( "|%s|%n", header);
        System.out.println("+--------------------------------------+");
        System.out.printf( "|  Period:  %s to %s     |%n", first, last);
        System.out.printf( "|  Trades:  %-4d  W:%-3d L:%-3d S:%-3d      |%n",
                trades.size(), wins, losses, scratches);
        System.out.printf( "|  Win Rate (excl scratch): %.1f%%      |%n", winRate);
        System.out.printf( "|  Profit Factor:  %.2f                |%n", profitFactor);
        System.out.printf( "|  Avg Win:  $%7.2f  Avg Loss: $%7.2f|%n", avgWin, avgLoss);
        System.out.printf( "|  Trades/Month:   %.1f               |%n", tpm);
        System.out.println("+--------------------------------------+");
        System.out.printf( "|  Start: $%9.2f                  |%n", startingBalance);
        System.out.printf( "|  End:   $%9.2f                  |%n", finalBal);
        System.out.printf( "|  Return:  %+.2f%%                    |%n", totalReturn);
        System.out.printf( "|  Max DD:  %.2f%%                     |%n", maxDD);
        System.out.printf( "|  Sharpe:  %.2f                      |%n", sharpe);
        System.out.println("+--------------------------------------+");
        System.out.println("|  Session   Total  Wins  Losses   WR |");
        System.out.println("|  --------  -----  ----  ------  --- |");
        for (String sess : new TreeSet<>(totalBySession.keySet())) {
            long tot = totalBySession.get(sess);
            long w   = winsBySession.getOrDefault(sess, 0L);
            long l   = lossesBySession.getOrDefault(sess, 0L);
            double wr = (w + l) > 0 ? 100.0 * w / (w + l) : 0;
            System.out.printf("|  %-8s  %5d  %4d  %6d  %3.0f%% |%n", sess, tot, w, l, wr);
        }
        System.out.println("+--------------------------------------+");
        System.out.println("|  Regime    Wins  Losses   WR        |");
        System.out.println("|  -------   ----  ------  ---        |");
        Set<String> regimes = new TreeSet<>();
        regimes.addAll(winsByRegime.keySet());
        regimes.addAll(lossesByRegime.keySet());
        for (String reg : regimes) {
            long w = winsByRegime.getOrDefault(reg, 0L);
            long l = lossesByRegime.getOrDefault(reg, 0L);
            double wr = (w + l) > 0 ? 100.0 * w / (w + l) : 0;
            System.out.printf("|  %-9s %4d  %6d  %3.0f%%        |%n", reg, w, l, wr);
        }
        System.out.println("+--------------------------------------+");
    }

    /**
     * Writes a summary.json file the frontend can consume directly.
     * Built manually — no external JSON library required.
     *
     * @param trades         trades for this period
     * @param startingBalance balance at the start of this period
     * @param periodLabel    "full" | "inSample" | "outOfSample"
     * @param outputPath     absolute path to write the JSON file
     */
    public static void exportSummaryJson(
            List<Trade> trades,
            double startingBalance,
            String periodLabel,
            String outputPath) throws IOException {

        if (trades.isEmpty()) return;

        long wins      = trades.stream().filter(t -> "WIN".equals(t.result())).count();
        long losses    = trades.stream().filter(t -> "LOSS".equals(t.result())).count();
        long scratches = trades.stream().filter(t -> "SCRATCH".equals(t.result())).count();

        double winRate = (wins + losses) > 0 ? 100.0 * wins / (wins + losses) : 0;

        double grossWins = trades.stream()
                .filter(t -> "WIN".equals(t.result()))
                .mapToDouble(Trade::pnlUsd).sum();
        double grossLoss = Math.abs(trades.stream()
                .filter(t -> "LOSS".equals(t.result()))
                .mapToDouble(Trade::pnlUsd).sum());
        double profitFactor = grossLoss > 0 ? grossWins / grossLoss : 0;

        double totalPnlUsd  = trades.stream().mapToDouble(Trade::pnlUsd).sum();
        double finalBalance = startingBalance + totalPnlUsd;
        double totalReturn  = totalPnlUsd / startingBalance * 100.0;

        double avgWin  = wins   > 0 ? grossWins  / wins   : 0;
        double avgLoss = losses > 0 ? grossLoss  / losses : 0;
        double avgRR   = avgLoss > 0 ? avgWin / avgLoss   : 0;

        // Max drawdown
        double peak = startingBalance, maxDrawdown = 0, equity = startingBalance;
        for (Trade t : trades) {
            equity += t.pnlUsd();
            if (equity > peak) peak = equity;
            double dd = (peak - equity) / peak * 100.0;
            if (dd > maxDrawdown) maxDrawdown = dd;
        }

        // Sharpe ratio (annualised, daily P&L series)
        Map<LocalDate, Double> dailyPnl = trades.stream()
                .collect(Collectors.groupingBy(Trade::date, Collectors.summingDouble(Trade::pnlUsd)));
        double[] arr    = dailyPnl.values().stream().mapToDouble(Double::doubleValue).toArray();
        double   mean   = Arrays.stream(arr).average().orElse(0);
        double   var    = Arrays.stream(arr).map(v -> (v - mean) * (v - mean)).average().orElse(1);
        double   stddev = Math.sqrt(var);
        double   sharpeRatio = stddev > 0 ? (mean / stddev) * Math.sqrt(252) : 0;

        // Session breakdown
        Map<String, long[]> sessionMap = new LinkedHashMap<>();
        for (Trade t : trades) {
            sessionMap.computeIfAbsent(t.session(), k -> new long[2]);
            if ("WIN".equals(t.result()))  sessionMap.get(t.session())[0]++;
            if ("LOSS".equals(t.result())) sessionMap.get(t.session())[1]++;
        }

        // Regime breakdown
        Map<String, long[]> regimeMap = new LinkedHashMap<>();
        for (Trade t : trades) {
            regimeMap.computeIfAbsent(t.regime(), k -> new long[2]);
            if ("WIN".equals(t.result()))  regimeMap.get(t.regime())[0]++;
            if ("LOSS".equals(t.result())) regimeMap.get(t.regime())[1]++;
        }

        // Equity curve — one point per trade (date + running balance)
        List<String> curvePoints = new ArrayList<>();
        double running = startingBalance;
        for (Trade t : trades) {
            running += t.pnlUsd();
            curvePoints.add(String.format(
                    "    {\"date\":\"%s\",\"balance\":%.2f,\"result\":\"%s\"}",
                    t.date(), running, t.result()));
        }

        // Build session breakdown JSON
        List<String> sessionEntries = new ArrayList<>();
        for (Map.Entry<String, long[]> e : sessionMap.entrySet()) {
            long w = e.getValue()[0], l = e.getValue()[1];
            double wr = (w + l) > 0 ? 100.0 * w / (w + l) : 0;
            sessionEntries.add(String.format(
                    "    \"%s\":{\"wins\":%d,\"losses\":%d,\"winRate\":%.2f}",
                    e.getKey(), w, l, wr));
        }

        // Build regime breakdown JSON
        List<String> regimeEntries = new ArrayList<>();
        for (Map.Entry<String, long[]> e : regimeMap.entrySet()) {
            long w = e.getValue()[0], l = e.getValue()[1];
            double wr = (w + l) > 0 ? 100.0 * w / (w + l) : 0;
            regimeEntries.add(String.format(
                    "    \"%s\":{\"wins\":%d,\"losses\":%d,\"winRate\":%.2f}",
                    e.getKey(), w, l, wr));
        }

        // Assemble final JSON string
        String json = "{\n"
            + String.format("  \"period\":\"%s\",\n", periodLabel)
            + String.format("  \"totalTrades\":%d,\n", trades.size())
            + String.format("  \"wins\":%d,\n", wins)
            + String.format("  \"losses\":%d,\n", losses)
            + String.format("  \"scratches\":%d,\n", scratches)
            + String.format("  \"winRate\":%.2f,\n", winRate)
            + String.format("  \"totalPnlUsd\":%.2f,\n", totalPnlUsd)
            + String.format("  \"totalReturn\":%.2f,\n", totalReturn)
            + String.format("  \"startingBalance\":%.2f,\n", startingBalance)
            + String.format("  \"finalBalance\":%.2f,\n", finalBalance)
            + String.format("  \"avgRR\":%.2f,\n", avgRR)
            + String.format("  \"profitFactor\":%.2f,\n", profitFactor)
            + String.format("  \"maxDrawdown\":%.2f,\n", maxDrawdown)
            + String.format("  \"sharpeRatio\":%.2f,\n", sharpeRatio)
            + "  \"sessionBreakdown\":{\n"
            + String.join(",\n", sessionEntries) + "\n  },\n"
            + "  \"regimeBreakdown\":{\n"
            + String.join(",\n", regimeEntries) + "\n  },\n"
            + "  \"equityCurve\":[\n"
            + String.join(",\n", curvePoints) + "\n  ]\n"
            + "}";

        try (FileWriter fw = new FileWriter(outputPath)) {
            fw.write(json);
        }

        System.out.printf("JSON summary written to: %s%n", outputPath);
    }
}
