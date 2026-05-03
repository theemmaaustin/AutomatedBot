package com.trading.backtest;

import com.trading.model.BiasState;

import java.time.Instant;

public record TradeSetup(
    BiasState direction,
    double    rangeHigh,
    double    rangeLow,
    double    entryPrice,
    double    stopPrice,
    double    tpPrice,
    double    stopPips,
    int       entryIndex,    // index of entry candle within the session candle list
    Instant   sessionClose
) {}
