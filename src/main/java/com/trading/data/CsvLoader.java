package com.trading.data;

import com.trading.model.Candle;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

public class CsvLoader {

    public static List<Candle> load(String path) throws IOException {
        List<Candle> candles = new ArrayList<>();
        try (BufferedReader br = Files.newBufferedReader(Path.of(path))) {
            br.readLine(); // skip header: time,open,high,low,close,volume
            String line;
            while ((line = br.readLine()) != null) {
                if (line.isBlank()) continue;
                String[] p = line.split(",");
                if (p.length < 6) continue;
                // "2024-03-15 00:50:00+00:00" -> ISO-8601 by replacing space with T
                var time = OffsetDateTime.parse(p[0].trim().replace(" ", "T")).toInstant();
                double open  = Double.parseDouble(p[1].trim());
                double high  = Double.parseDouble(p[2].trim());
                double low   = Double.parseDouble(p[3].trim());
                double close = Double.parseDouble(p[4].trim());
                long   vol   = Long.parseLong(p[5].trim());
                candles.add(new Candle(time, open, high, low, close, vol));
            }
        }
        return candles;
    }
}
