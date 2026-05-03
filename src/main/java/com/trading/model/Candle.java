package com.trading.model;

import java.time.Instant;

public record Candle(Instant time, double open, double high, double low, double close, long volume) {
    public boolean isBullish() { return close > open; }
    public double mid()        { return (high + low) / 2.0; }
    public double range()      { return high - low; }
}
