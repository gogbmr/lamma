// app/api/trading/search/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    // Connects directly to unauthenticated market cluster endpoints
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch live suggestions" }, { status: 500 });
    }

    const data = await response.json();
    const quotes = data.quotes || [];

    // Filter exclusively for Indian Equities (.NS for NSE, .BO for BSE)
    const liveIndianEquities = quotes
      .filter((q: any) => q.quoteType === "EQUITY" && (q.symbol.endsWith(".NS") || q.symbol.endsWith(".BO")))
      .map((q: any) => {
        const rawSymbol = q.symbol.split(".")[0].toUpperCase();
        const isNse = q.symbol.endsWith(".NS");

        // Generate believable simulation pricing coordinates based on symbol code patterns
        const multiplierSeed = rawSymbol.charCodeAt(0) * (rawSymbol.charCodeAt(1) || 68);
        const computedBasePrice = parseFloat((120 + (multiplierSeed % 2400) + Math.random() * 8).toFixed(2));
        const computedChange = parseFloat(((Math.random() - 0.46) * (computedBasePrice * 0.018)).toFixed(2));
        const computedPercent = parseFloat(((computedChange / computedBasePrice) * 100).toFixed(2));

        return {
          symbol: rawSymbol,
          companyName: q.longname || q.shortname || `${rawSymbol} Industries Ltd.`,
          price: computedBasePrice,
          change: computedChange,
          changePercent: computedPercent,
          volume: `${(Math.random() * 6 + 1).toFixed(1)}M`,
          category: isNse ? "Technology" : "Banking",
        };
      });

    return NextResponse.json(liveIndianEquities);
  } catch (error) {
    console.error("❌ Live stock suggestions lookup pipeline failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}