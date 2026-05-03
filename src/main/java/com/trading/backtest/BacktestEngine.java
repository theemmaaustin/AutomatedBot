package com.trading.backtest;

import com.trading.data.CsvLoader;
import com.trading.model.*;
import com.trading.regime.RegimeClassifier;
import com.trading.risk.RiskManager;
import com.trading.strategy.DailyBias;
import com.trading.strategy.OrbStrategy;
import com.trading.strategy.OrbStrategy.Session;

import java.io.IOException;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

public class BacktestEngine {

    private static final double PIP = 0.0001;

    // Variable R:R by regime — MODERATE market doesn't need a 2R move to be profitable;
    // TRENDING market has the momentum to carry to 2R.
    private static final double RR_MODERATE  = 1.0;
    private static final double RR_TRENDING  = 2.0;

    private final String dataDir;
    private final double startingBalance;

    public BacktestEngine(String dataDir, double startingBalance) {
        this.dataDir         = dataDir;
        this.startingBalance = startingBalance;
    }

    public List<Trade> run() throws IOException {
        System.out.println("Loading data...");
        List<Candle> fiveMin = CsvLoader.load(dataDir + "/EURUSD_5M.csv");
        List<Candle> oneHour = CsvLoader.load(dataDir + "/EURUSD_1H.csv");
        List<Candle> oneDay  = CsvLoader.load(dataDir + "/EURUSD_1D.csv");
        System.out.printf("  5M: %d candles | 1H: %d candles | 1D: %d candles%n",
                fiveMin.size(), oneHour.size(), oneDay.size());

        DailyBias        dailyBias = new DailyBias(oneDay);
        RegimeClassifier regimeCls = new RegimeClassifier(oneHour);
        OrbStrategy      strategy  = new OrbStrategy();
        RiskManager      rm        = new RiskManager(startingBalance);

        Map<LocalDate, List<Candle>> byDate = fiveMin.stream()
                .collect(Collectors.groupingBy(
                        c -> c.time().atZone(ZoneOffset.UTC).toLocalDate(),
                        TreeMap::new,
                        Collectors.toList()));

        List<Trade> trades = new ArrayList<>();
        int daysScanned = 0;

        for (Map.Entry<LocalDate, List<Candle>> entry : byDate.entrySet()) {
            LocalDate    date       = entry.getKey();
            List<Candle> dayCandles = entry.getValue();
            dayCandles.sort(Comparator.comparing(Candle::time));

            BiasState bias = dailyBias.getBias(date);
            rm.resetDay();
            daysScanned++;

            // NY only — consistently outperforms London on EUR/USD ORB
            for (Session session : new Session[]{Session.NY}) {
                if (!rm.canTrade()) break;

                Instant sessionOpen  = session.openInstant(date);
                Instant sessionClose = session.closeInstant(date);
                Regime  regime       = regimeCls.getRegime(sessionOpen);

                // Skip CHOPPY (no momentum) and TRENDING (ADX>25 means market already ran — bad for ORB)
                if (regime != Regime.MODERATE)   continue;
                if (bias   == BiasState.NEUTRAL) continue;

                double riskReward = RR_MODERATE;  // 1R — right-sized for calm/moderate markets

                List<Candle> sessionCandles = dayCandles.stream()
                        .filter(c -> !c.time().isBefore(sessionOpen) && c.time().isBefore(sessionClose))
                        .collect(Collectors.toList());

                if (sessionCandles.size() < 10) continue;

                Optional<TradeSetup> setup = strategy.findSetup(
                        sessionCandles, date, session, bias, riskReward);
                if (setup.isEmpty()) continue;

                Trade trade = simulate(setup.get(), sessionCandles, date, session, bias, regime, rm);
                if (trade != null) {
                    trades.add(trade);
                    rm.recordTrade(trade);
                }
            }
        }

        System.out.printf("Scan complete: %d days | %d trades%n", daysScanned, trades.size());
        return trades;
    }

    private Trade simulate(TradeSetup s, List<Candle> sessionCandles,
                           LocalDate date, Session session,
                           BiasState bias, Regime regime, RiskManager rm) {

        if (s.entryIndex() >= sessionCandles.size()) return null;

        double  lots      = rm.lots(s.stopPips(), regime);
        Instant entryTime = sessionCandles.get(s.entryIndex()).time();

        String  result    = "SCRATCH";
        double  exitPrice = s.entryPrice();
        Instant exitTime  = s.sessionClose();

        boolean isBull = s.direction() == BiasState.BULL;

        for (int i = s.entryIndex(); i < sessionCandles.size(); i++) {
            Candle c = sessionCandles.get(i);

            if (!c.time().isBefore(s.sessionClose())) {
                exitPrice = c.open();
                exitTime  = c.time();
                result    = "SCRATCH";
                break;
            }

            boolean hitSL = isBull ? c.low()  <= s.stopPrice() : c.high() >= s.stopPrice();
            boolean hitTP = isBull ? c.high() >= s.tpPrice()   : c.low()  <= s.tpPrice();

            if (hitSL && hitTP) {
                exitPrice = s.stopPrice();
                exitTime  = c.time();
                result    = "LOSS";
                break;
            } else if (hitSL) {
                exitPrice = s.stopPrice();
                exitTime  = c.time();
                result    = "LOSS";
                break;
            } else if (hitTP) {
                exitPrice = s.tpPrice();
                exitTime  = c.time();
                result    = "WIN";
                break;
            }
        }

        double pnlPips = isBull
                ? (exitPrice - s.entryPrice()) / PIP
                : (s.entryPrice() - exitPrice) / PIP;
        double pnlUsd = pnlPips * 10.0 * lots;

        return new Trade(
                date, session.name(), s.direction().name(), bias.name(), regime.name(),
                entryTime, s.entryPrice(), s.stopPrice(), s.tpPrice(),
                exitPrice, exitTime, result,
                s.stopPips(), pnlPips, pnlUsd,
                rm.getBalance() + pnlUsd,
                s.rangeHigh(), s.rangeLow()
        );
    }
}
