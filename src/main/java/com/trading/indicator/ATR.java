package com.trading.indicator;

import com.trading.model.Candle;

import java.util.List;

public class ATR {

    public static double[] compute(List<Candle> candles, int period) {
        int n = candles.size();
        double[] atr = new double[n];
        if (n <= period) return atr;

        double sum = 0;
        for (int i = 1; i <= period; i++) {
            sum += tr(candles.get(i), candles.get(i - 1));
        }
        atr[period] = sum / period;

        for (int i = period + 1; i < n; i++) {
            atr[i] = (atr[i - 1] * (period - 1) + tr(candles.get(i), candles.get(i - 1))) / period;
        }
        return atr;
    }

    public static double tr(Candle c, Candle prev) {
        return Math.max(c.high() - c.low(),
               Math.max(Math.abs(c.high() - prev.close()),
                        Math.abs(c.low()  - prev.close())));
    }
}
