package com.trading.journal;

import com.trading.model.Trade;

import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class TradeJournal {

    private static final String HEADER =
            "date,session,direction,bias,regime,entryTime,entryPrice,stopPrice,tpPrice," +
            "exitPrice,exitTime,result,stopPips,pnlPips,pnlUsd,balanceAfter,rangeHigh,rangeLow";

    public static void write(List<Trade> trades, String outputPath) throws IOException {
        try (BufferedWriter bw = Files.newBufferedWriter(Path.of(outputPath))) {
            bw.write(HEADER);
            bw.newLine();
            for (Trade t : trades) {
                bw.write(String.format(
                    "%s,%s,%s,%s,%s,%s,%.5f,%.5f,%.5f,%.5f,%s,%s,%.2f,%.2f,%.2f,%.2f,%.5f,%.5f",
                    t.date(), t.session(), t.direction(), t.bias(), t.regime(),
                    t.entryTime(), t.entryPrice(), t.stopPrice(), t.tpPrice(),
                    t.exitPrice(), t.exitTime(), t.result(),
                    t.stopPips(), t.pnlPips(), t.pnlUsd(), t.balanceAfter(),
                    t.rangeHigh(), t.rangeLow()
                ));
                bw.newLine();
            }
        }
    }
}
