package com.trading.model;

import java.time.Instant;
import java.time.LocalDate;

public record Trade(
    LocalDate date,
    String session,
    String direction,
    String bias,
    String regime,
    Instant entryTime,
    double entryPrice,
    double stopPrice,
    double tpPrice,
    double exitPrice,
    Instant exitTime,
    String result,
    double stopPips,
    double pnlPips,
    double pnlUsd,
    double balanceAfter,
    double rangeHigh,
    double rangeLow
) {}
