package com.trading.strategy;

import com.trading.indicator.EMA;
import com.trading.model.BiasState;
import com.trading.model.Candle;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;

/**
 * Computes daily bias using two confluent filters:
 *   1. Previous completed daily candle closed in the bias direction
 *   2. Close is on the correct side of the 10-day EMA
 *
 * Both must agree — this cuts noise vs single-candle direction alone while
 * preserving enough signals for a meaningful sample size.
 *
 * OANDA daily bars open at 21:00 UTC — a bar at "2024-03-14 21:00 UTC" represents
 * the trading day for 2024-03-15.
 */
public class DailyBias {

    private static final int EMA_PERIOD = 10;

    private final TreeMap<LocalDate, Candle> barsByDate = new TreeMap<>();
    private final TreeMap<LocalDate, Double> emaByDate  = new TreeMap<>();

    public DailyBias(List<Candle> dailyCandles) {
        List<Candle> sorted = new ArrayList<>(dailyCandles);
        sorted.sort(Comparator.comparing(Candle::time));

        List<LocalDate> tradeDates = new ArrayList<>();
        for (Candle c : sorted) {
            LocalDateTime utc = c.time().atZone(ZoneOffset.UTC).toLocalDateTime();
            LocalDate tradeDate = utc.getHour() >= 21
                    ? utc.toLocalDate().plusDays(1)
                    : utc.toLocalDate();
            barsByDate.put(tradeDate, c);
            tradeDates.add(tradeDate);
        }

        double[] ema = EMA.compute(sorted, EMA_PERIOD);
        for (int i = 0; i < sorted.size(); i++) {
            if (ema[i] > 0) emaByDate.put(tradeDates.get(i), ema[i]);
        }
    }

    public BiasState getBias(LocalDate tradeDate) {
        LocalDate prevDate = barsByDate.lowerKey(tradeDate);
        if (prevDate == null) return BiasState.NEUTRAL;

        Candle bar = barsByDate.get(prevDate);
        Double ema = emaByDate.get(prevDate);
        if (ema == null || ema == 0) return BiasState.NEUTRAL;

        boolean candleBull = bar.close() > bar.open();
        boolean aboveEMA   = bar.close() > ema;
        boolean candleBear = bar.close() < bar.open();
        boolean belowEMA   = bar.close() < ema;

        if (candleBull && aboveEMA) return BiasState.BULL;
        if (candleBear && belowEMA) return BiasState.BEAR;
        return BiasState.NEUTRAL;
    }
}
