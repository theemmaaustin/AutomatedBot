package com.trading.metrics;

import com.trading.model.Trade;

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

        // Max drawdown
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

        // Simplified Sharpe using daily P&L
        Map<LocalDate, Double> dailyPnl = trades.stream()
                .collect(Collectors.groupingBy(Trade::date, Collectors.summingDouble(Trade::pnlUsd)));
        double[] arr    = dailyPnl.values().stream().mapToDouble(Double::doubleValue).toArray();
        double   mean   = Arrays.stream(arr).average().orElse(0);
        double   var    = Arrays.stream(arr).map(v -> (v - mean) * (v - mean)).average().orElse(1);
        double   stddev = Math.sqrt(var);
        double   sharpe = stddev > 0 ? (mean / stddev) * Math.sqrt(252) : 0;

        // Session breakdown — win rate excludes scratches
        Map<String, Long> totalBySession = trades.stream()
                .collect(Collectors.groupingBy(Trade::session, Collectors.counting()));
        Map<String, Long> winsBySession = trades.stream()
                .filter(t -> "WIN".equals(t.result()))
                .collect(Collectors.groupingBy(Trade::session, Collectors.counting()));
        Map<String, Long> lossesBySession = trades.stream()
                .filter(t -> "LOSS".equals(t.result()))
                .collect(Collectors.groupingBy(Trade::session, Collectors.counting()));

        // Regime breakdown
        Map<String, Long> winsByRegime = trades.stream()
                .filter(t -> "WIN".equals(t.result()))
                .collect(Collectors.groupingBy(Trade::regime, Collectors.counting()));
        Map<String, Long> lossesByRegime = trades.stream()
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
}
