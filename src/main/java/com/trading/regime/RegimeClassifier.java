package com.trading.regime;

import com.trading.indicator.ADX;
import com.trading.model.Candle;
import com.trading.model.Regime;

import java.time.Instant;
import java.util.List;

/**
 * Classifies market regime using ADX on 1H candles.
 *
 * ADX >= 25  → TRENDING  (full risk: 1%)
 * ADX 15-25  → MODERATE  (reduced risk: 0.75%)
 * ADX < 15   → CHOPPY    (skip trade)
 */
public class RegimeClassifier {

    private static final int ADX_PERIOD = 14;
    private static final double TRENDING_THRESHOLD = 25.0;
    private static final double MODERATE_THRESHOLD = 15.0;

    private final List<Candle> hourlyCandles;
    private final double[]     adxValues;

    public RegimeClassifier(List<Candle> hourlyCandles) {
        this.hourlyCandles = hourlyCandles;
        this.adxValues     = ADX.compute(hourlyCandles, ADX_PERIOD);
    }

    public Regime getRegime(Instant sessionTime) {
        int idx = floorIndex(sessionTime);
        if (idx < 0 || adxValues[idx] == 0) return Regime.MODERATE;
        double adx = adxValues[idx];
        if (adx >= TRENDING_THRESHOLD) return Regime.TRENDING;
        if (adx >= MODERATE_THRESHOLD) return Regime.MODERATE;
        return Regime.CHOPPY;
    }

    private int floorIndex(Instant time) {
        int lo = 0, hi = hourlyCandles.size() - 1, result = -1;
        while (lo <= hi) {
            int mid = (lo + hi) >>> 1;
            if (!hourlyCandles.get(mid).time().isAfter(time)) {
                result = mid;
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return result;
    }
}
