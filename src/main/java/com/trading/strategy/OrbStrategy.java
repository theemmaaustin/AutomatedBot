package com.trading.strategy;

import com.trading.backtest.TradeSetup;
import com.trading.model.BiasState;
import com.trading.model.Candle;

import java.time.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Opening Range Breakout (ORB) strategy.
 *
 * 1. Build the opening range from the first RANGE_MINUTES of each session.
 * 2. Wait for a candle close that breaks the range in the direction of daily bias
 *    by at least MIN_BREAKOUT_PIPS (filters fake/marginal breakouts).
 * 3. Entry is only taken if there are at least MIN_TRADE_MINUTES left in the session.
 * 4. Enter at the next candle's open; stop on the far side of the range.
 * 5. Target is regime-variable: MODERATE regime uses 1R (easier to hit in calm markets),
 *    TRENDING regime uses 2R (the trend has energy to carry farther).
 *
 * NY session extended to 20:30 UTC (3:30 PM ET) — covers the US afternoon session
 * where EUR/USD trends often continue before the forex day closes at 21:00 UTC.
 */
public class OrbStrategy {

    private static final double PIP               = 0.0001;
    private static final double STOP_BUFFER_PIPS  = 3.0;
    private static final int    RANGE_MINUTES     = 30;
    private static final double MIN_RANGE_PIPS    = 5.0;
    private static final double MAX_STOP_PIPS     = 30.0;
    private static final double MIN_BREAKOUT_PIPS = 2.0;
    private static final int    MIN_TRADE_MINUTES = 60;   // reduced from 90 — 1R hits faster

    public enum Session {
        LONDON(8,  0, 12,  0),
        NY    (13, 30, 20, 30);  // extended to 20:30 UTC (3:30 PM ET)

        private final int openHour, openMin, closeHour, closeMin;

        Session(int oh, int om, int ch, int cm) {
            openHour = oh; openMin = om; closeHour = ch; closeMin = cm;
        }

        public Instant openInstant(LocalDate d) {
            return ZonedDateTime.of(d, LocalTime.of(openHour, openMin), ZoneOffset.UTC).toInstant();
        }
        public Instant rangeEndInstant(LocalDate d) {
            return ZonedDateTime.of(d, LocalTime.of(openHour, openMin).plusMinutes(RANGE_MINUTES), ZoneOffset.UTC).toInstant();
        }
        public Instant closeInstant(LocalDate d) {
            return ZonedDateTime.of(d, LocalTime.of(closeHour, closeMin), ZoneOffset.UTC).toInstant();
        }
    }

    /**
     * @param sessionCandles All 5M candles within [session.open, session.close) sorted ascending.
     * @param riskReward     Target R multiple — caller passes 1.0 for MODERATE, 2.0 for TRENDING.
     */
    public Optional<TradeSetup> findSetup(
            List<Candle> sessionCandles,
            LocalDate    date,
            Session      session,
            BiasState    bias,
            double       riskReward) {

        if (bias == BiasState.NEUTRAL) return Optional.empty();

        Instant rangeEnd     = session.rangeEndInstant(date);
        Instant sessionClose = session.closeInstant(date);
        Instant latestEntry  = sessionClose.minus(Duration.ofMinutes(MIN_TRADE_MINUTES));

        List<Candle> rangeCandles     = new ArrayList<>();
        List<Candle> postRangeCandles = new ArrayList<>();

        for (Candle c : sessionCandles) {
            if (c.time().isBefore(rangeEnd)) rangeCandles.add(c);
            else                              postRangeCandles.add(c);
        }

        if (rangeCandles.size() < 3 || postRangeCandles.size() < 2) return Optional.empty();

        double rangeHigh = rangeCandles.stream().mapToDouble(Candle::high).max().getAsDouble();
        double rangeLow  = rangeCandles.stream().mapToDouble(Candle::low).min().getAsDouble();

        if ((rangeHigh - rangeLow) / PIP < MIN_RANGE_PIPS) return Optional.empty();

        int postRangeOffset = rangeCandles.size();

        for (int i = 0; i < postRangeCandles.size() - 1; i++) {
            Candle breakout = postRangeCandles.get(i);
            Candle next     = postRangeCandles.get(i + 1);

            if (!next.time().isBefore(latestEntry)) break;

            boolean bull = bias == BiasState.BULL
                    && (breakout.close() - rangeHigh) / PIP >= MIN_BREAKOUT_PIPS;
            boolean bear = bias == BiasState.BEAR
                    && (rangeLow - breakout.close()) / PIP >= MIN_BREAKOUT_PIPS;

            if (!bull && !bear) continue;

            double entry = next.open();
            double stop, tp, stopPips;

            if (bull) {
                stop     = rangeLow - STOP_BUFFER_PIPS * PIP;
                stopPips = (entry - stop) / PIP;
                tp       = entry + stopPips * riskReward * PIP;
            } else {
                stop     = rangeHigh + STOP_BUFFER_PIPS * PIP;
                stopPips = (stop - entry) / PIP;
                tp       = entry - stopPips * riskReward * PIP;
            }

            if (stopPips < 1 || stopPips > MAX_STOP_PIPS) continue;

            int       entryIndex = postRangeOffset + i + 1;
            BiasState direction  = bull ? BiasState.BULL : BiasState.BEAR;
            return Optional.of(new TradeSetup(direction, rangeHigh, rangeLow,
                    entry, stop, tp, stopPips, entryIndex, sessionClose));
        }

        return Optional.empty();
    }
}
