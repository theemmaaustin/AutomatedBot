package com.trading.indicator;

import com.trading.model.Candle;

import java.util.List;

public class EMA {

    public static double[] compute(List<Candle> candles, int period) {
        int n = candles.size();
        double[] ema = new double[n];
        if (n < period) return ema;

        double sum = 0;
        for (int i = 0; i < period; i++) sum += candles.get(i).close();
        ema[period - 1] = sum / period;

        double k = 2.0 / (period + 1);
        for (int i = period; i < n; i++) {
            ema[i] = candles.get(i).close() * k + ema[i - 1] * (1 - k);
        }
        return ema;
    }
}
