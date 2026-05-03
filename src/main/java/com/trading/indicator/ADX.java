package com.trading.indicator;

import com.trading.model.Candle;

import java.util.List;

public class ADX {

    public static double[] compute(List<Candle> candles, int period) {
        int n = candles.size();
        double[] adx = new double[n];
        if (n < 2 * period + 2) return adx;

        double[] rawTR  = new double[n];
        double[] rawPDM = new double[n];
        double[] rawNDM = new double[n];

        for (int i = 1; i < n; i++) {
            Candle c = candles.get(i), p = candles.get(i - 1);
            rawTR[i]  = ATR.tr(c, p);
            double up = c.high() - p.high();
            double dn = p.low()  - c.low();
            rawPDM[i] = (up > dn && up > 0) ? up : 0;
            rawNDM[i] = (dn > up && dn > 0) ? dn : 0;
        }

        // First smoothed sums (Wilder: first sum = simple average * period)
        double smTR = 0, smPDM = 0, smNDM = 0;
        for (int i = 1; i <= period; i++) {
            smTR  += rawTR[i];
            smPDM += rawPDM[i];
            smNDM += rawNDM[i];
        }

        double[] dx = new double[n];
        for (int i = period + 1; i < n; i++) {
            smTR  = smTR  - smTR  / period + rawTR[i];
            smPDM = smPDM - smPDM / period + rawPDM[i];
            smNDM = smNDM - smNDM / period + rawNDM[i];
            double pdi   = smTR > 0 ? 100.0 * smPDM / smTR : 0;
            double ndi   = smTR > 0 ? 100.0 * smNDM / smTR : 0;
            double diSum = pdi + ndi;
            dx[i] = diSum > 0 ? 100.0 * Math.abs(pdi - ndi) / diSum : 0;
        }

        // Smooth DX into ADX over another `period` bars
        int adxStart = 2 * period;
        double dxSum = 0;
        for (int i = period + 1; i <= adxStart && i < n; i++) dxSum += dx[i];
        if (adxStart < n) adx[adxStart] = dxSum / period;
        for (int i = adxStart + 1; i < n; i++) {
            adx[i] = (adx[i - 1] * (period - 1) + dx[i]) / period;
        }

        return adx;
    }
}
