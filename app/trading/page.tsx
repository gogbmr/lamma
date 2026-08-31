// app/trading/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/navigation/navbar";
import { useThemeStore } from "@/store/useThemeStore";
import { toast } from "sonner";
import { createChart, ColorType, CandlestickSeries, LineSeries, Time } from "lightweight-charts"; // 🔥 IMPORTED Time
import { 
  Wallet, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Plus, 
  Minus,
  CandlestickChart,
  Eye,
  Check,
  Loader2
} from "lucide-react";

interface StockTicker {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  category: "Indices" | "Banking" | "Technology" | "Energy" | "Automobile" | "Conglomerate";
}

interface OpenPosition {
  symbol: string;
  avgPrice: number;
  quantity: number;
  currentPrice: number;
}

const stockRegistry: StockTicker[] = [
  { symbol: "NIFTY50", companyName: "Nifty 50 Index", price: 23450.15, change: 195.40, changePercent: 0.84, volume: "N/A", category: "Indices" },
  { symbol: "SENSEX", companyName: "BSE Sensex Index", price: 77120.40, change: 543.10, changePercent: 0.71, volume: "N/A", category: "Indices" },
  { symbol: "RELIANCE", companyName: "Reliance Industries Ltd.", price: 2456.80, change: 34.20, changePercent: 1.41, volume: "4.2M", category: "Conglomerate" },
  { symbol: "TCS", companyName: "Tata Consultancy Services", price: 3890.15, change: -45.60, changePercent: -1.16, volume: "1.8M", category: "Technology" },
  { symbol: "HDFCBANK", companyName: "HDFC Bank Limited", price: 1642.30, change: 12.85, changePercent: 0.79, volume: "5.1M", category: "Banking" },
  { symbol: "INFY", companyName: "Infosys Limited", price: 1475.00, change: 5.40, changePercent: 0.37, volume: "2.9M", category: "Technology" },
  { symbol: "ICICIBANK", companyName: "ICICI Bank Limited", price: 1084.50, change: -8.20, changePercent: -0.75, volume: "3.4M", category: "Banking" },
  { symbol: "SBIN", companyName: "State Bank of India", price: 784.20, change: 14.60, changePercent: 1.90, volume: "6.8M", category: "Banking" },
  { symbol: "TATAMOTORS", companyName: "Tata Motors Limited", price: 965.40, change: -11.20, changePercent: -1.15, volume: "3.9M", category: "Automobile" },
  { symbol: "BHARTIARTL", companyName: "Bharti Airtel Limited", price: 1342.10, change: 22.40, changePercent: 1.70, volume: "2.1M", category: "Technology" },
  { symbol: "ITC", companyName: "ITC Limited", price: 432.50, change: 1.80, changePercent: 0.42, volume: "8.4M", category: "Conglomerate" },
  { symbol: "LT", companyName: "Larsen & Toubro Limited", price: 3540.00, change: 68.30, changePercent: 1.97, volume: "1.2M", category: "Energy" },
];

const mockPositions: OpenPosition[] = [
  { symbol: "RELIANCE", avgPrice: 2420.00, quantity: 15, currentPrice: 2456.80 },
  { symbol: "TCS", avgPrice: 3910.00, quantity: 5, currentPrice: 3890.15 },
];

type Timeframe = "1m" | "5m" | "15m" | "1h" | "1D" | "1W" | "1M";

function calculateSMA(candleData: any[], period: number) {
  const smaData = [];
  for (let i = 0; i < candleData.length; i++) {
    if (i < period - 1) continue;
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += candleData[i - j].close;
    }
    smaData.push({
      time: candleData[i].time as Time, // 🔥 FIX: Cast to Time
      value: parseFloat((sum / period).toFixed(2)),
    });
  }
  return smaData;
}

interface ChartEngineProps {
  symbol: string;
  basePrice: number;
  timeframe: Timeframe;
  showSMA: boolean;
}

function FinancialMarketChart({ symbol, basePrice, timeframe, showSMA }: ChartEngineProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  const generateDeepChartData = (base: number, tf: Timeframe) => {
    const points = [];
    let walkingPrice = base * 0.92;
    const totalBars = ["1m", "5m", "15m"].includes(tf) ? 600 : tf === "1h" ? 400 : 800;
    
    let stepInSeconds = 86400;
    if (tf === "1m") stepInSeconds = 60;
    else if (tf === "5m") stepInSeconds = 300;
    else if (tf === "15m") stepInSeconds = 900;
    else if (tf === "1h") stepInSeconds = 3600;
    else if (tf === "1W") stepInSeconds = 604800;
    else if (tf === "1M") stepInSeconds = 2592000;

    const baseTimestamp = Math.floor(Date.now() / 1000) - (totalBars * stepInSeconds);

    for (let i = 0; i < totalBars; i++) {
      const currentTimestamp = baseTimestamp + (i * stepInSeconds);
      const volatility = ["1m", "5m"].includes(tf) ? 0.003 : 0.015;
      const open = walkingPrice + (Math.random() - 0.5) * (base * volatility);
      const close = open + (Math.random() - 0.485) * (base * volatility * 1.2); 
      const high = Math.max(open, close) + Math.random() * (base * volatility * 0.5);
      const low = Math.min(open, close) - Math.random() * (base * volatility * 0.5);
      
      points.push({
        time: currentTimestamp as Time, // 🔥 FIX: Cast to Time
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
      });
      walkingPrice = close;
    }
    return points;
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;
    chartContainerRef.current.innerHTML = "";

    const chartInstance = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDark ? "#17171a" : "#ffffff" },
        textColor: isDark ? "#a1a1aa" : "#4b5563",
        fontFamily: "var(--font-poppins), sans-serif",
      },
      grid: {
        vertLines: { color: isDark ? "rgba(63, 63, 70, 0.12)" : "rgba(228, 228, 231, 0.4)" },
        horzLines: { color: isDark ? "rgba(63, 63, 70, 0.12)" : "rgba(228, 228, 231, 0.4)" },
      },
      timeScale: {
        timeVisible: ["1m", "5m", "15m", "1h"].includes(timeframe),
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 420,
    });

    const candleSeries = chartInstance.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    const standardCandles = generateDeepChartData(basePrice, timeframe);
    candleSeries.setData(standardCandles);

    if (showSMA) {
      const smaSeries = chartInstance.addSeries(LineSeries, {
        color: "#6d28d9",
        lineWidth: 2,
        title: "SMA (20)",
        priceLineVisible: false,
      });
      smaSeries.setData(calculateSMA(standardCandles, 20));
    }

    chartInstance.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chartInstance.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance.remove();
    };
  }, [symbol, isDark, basePrice, timeframe, showSMA]);

  return <div ref={chartContainerRef} className="w-full" />;
}

export default function TradingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockTicker>(stockRegistry[2]);
  const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState<number>(1);
  const [virtualBalance, setVirtualBalance] = useState<number>(500000); 

  // ENHANCEMENT: Added state trackers for live ticker stream coordinates
  const [isSearching, setIsSearching] = useState(false);
  const [liveSuggestions, setLiveSuggestions] = useState<StockTicker[]>([]);

  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const [showSMA, setShowSMA] = useState<boolean>(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ENHANCEMENT: Automated debounced pipeline hook pulling live rows from api endpoint
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setLiveSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/trading/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const liveData = await res.json();
          setLiveSuggestions(liveData || []);
        }
      } catch (err) {
        console.error("Live lookup fetch exception:", err);
        setLiveSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const estimatedCost = selectedStock.price * quantity;

  const handleExecuteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    if (orderType === "BUY" && estimatedCost > virtualBalance) {
      toast.error("Insufficient paper trading funds available.");
      return;
    }

    if (orderType === "BUY") {
      setVirtualBalance((prev) => prev - estimatedCost);
      toast.success(`Bought ${quantity} shares of ${selectedStock.symbol}!`);
    } else {
      setVirtualBalance((prev) => prev + estimatedCost);
      toast.success(`Sold ${quantity} shares of ${selectedStock.symbol}!`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20 md:pb-0 transition-colors duration-300 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* COLUMN 1-4 COMPREHENSIVE CONTROL GRID */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* SEARCH COMPONENT FEATURING AUTO-SUGGESTIONS DROPDOWN */}
          <div ref={searchContainerRef} className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search any Indian stock or index (e.g., NIFTY50, TCS, SBIN)..."
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                className="w-full pl-10 pr-10 h-11 text-xs bg-card border border-border rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
              
              {/* ENHANCEMENT: Loading spinner inside search field */}
              {isSearching && (
                <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
              )}
            </div>

            {/* Float suggestion card board panel Overlay */}
              {showSuggestions && liveSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-12 mt-1 bg-card border border-border rounded-xl shadow-xl max-h-64 overflow-y-auto z-50 divide-y divide-border/60">
                  
                  {/* FIXED: Added 'index' as the second argument to the map function */}
                  {liveSuggestions.map((stock, index) => {
                    const isSelected = selectedStock.symbol === stock.symbol;
                    return (
                      <div
                        /* FIXED: Combined symbol with index to ensure a completely unique React render key */
                        key={`${stock.symbol}-${index}`}
                        onClick={() => {
                          setSelectedStock(stock);
                          setShowSuggestions(false);
                          setSearchQuery("");
                        }}
                        className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <div className="min-w-0 flex items-center gap-2.5">
                          <div className="bg-primary/5 text-primary text-[10px] px-2 py-0.5 rounded border border-primary/10 font-bold shrink-0">
                            {stock.category}
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-black tracking-tight block">{stock.symbol}</span>
                            <span className="text-[11px] text-muted-foreground font-medium block truncate">{stock.companyName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-right">
                          <div>
                            <span className="text-xs font-extrabold tracking-tight block">₹{stock.price.toLocaleString("en-IN")}</span>
                            <span className={`text-[10px] font-bold block ${stock.change >= 0 ? "text-success" : "text-destructive"}`}>
                              {stock.change >= 0 ? "+" : ""}{stock.changePercent}%
                            </span>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>

        </div>

        {/* MAIN RENDERING INTERACTIVE VIEW GUILDS */}
        <div className="lg:col-span-3 space-y-6">
          
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/10 font-bold uppercase tracking-wider">Active Workspace View</span>
              <h1 className="text-xl font-black tracking-tight mt-1">{selectedStock.symbol}</h1>
              <p className="text-xs text-muted-foreground font-medium">{selectedStock.companyName}</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-2xl font-black tracking-tight block text-primary">
                ₹{selectedStock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
              <span className={`text-xs font-bold tracking-tight ${selectedStock.change >= 0 ? "text-success" : "text-destructive"}`}>
                {selectedStock.change >= 0 ? "+" : ""}{selectedStock.change.toFixed(2)} ({selectedStock.changePercent}%) Today
              </span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
              <h3 className="text-xs font-black tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                <CandlestickChart className="h-4 w-4 text-primary" />
                Simulated Canvas Chart
              </h3>

              <div className="flex items-center gap-4">
                <div className="flex items-center bg-background border border-border p-0.5 rounded-xl text-[11px] font-bold">
                  {(["1m", "5m", "15m", "1h", "1D", "1W", "1M"] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-2 py-1.5 rounded-lg transition-all cursor-pointer ${
                        timeframe === tf ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowSMA(!showSMA)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    showSMA 
                      ? "bg-primary/10 border-primary text-primary" 
                      : "bg-background border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Indicators (SMA)</span>
                </button>
              </div>
            </div>

            <FinancialMarketChart 
              symbol={selectedStock.symbol} 
              basePrice={selectedStock.price} 
              timeframe={timeframe}
              showSMA={showSMA}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-3 bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="grid grid-cols-2 gap-2 bg-background p-1 rounded-xl border border-border/80">
                  <button
                    type="button"
                    onClick={() => setOrderType("BUY")}
                    className={`py-2 rounded-lg text-xs font-bold tracking-tight cursor-pointer transition-all ${
                      orderType === "BUY" ? "bg-success text-success-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Buy (Long)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType("SELL")}
                    className={`py-2 rounded-lg text-xs font-bold tracking-tight cursor-pointer transition-all ${
                      orderType === "SELL" ? "bg-destructive text-destructive-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sell (Short)
                  </button>
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-xs font-bold text-muted-foreground">Quantity (Shares)</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="h-10 w-10 border border-border bg-background rounded-xl flex items-center justify-center hover:bg-muted cursor-pointer"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 h-10 border border-border bg-background rounded-xl text-center text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="h-10 w-10 border border-border bg-background rounded-xl flex items-center justify-center hover:bg-muted cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-dashed border-border/80 mt-4">
                <div className="space-y-1.5 text-xs font-semibold">
                  <div className="flex justify-between border-t border-border/40 pt-1.5 font-bold">
                    <span>Estimated Payload Value</span>
                    <span className="text-primary text-sm font-black">
                      ₹{estimatedCost.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleExecuteOrder}
                  className={`w-full h-11 text-xs font-black tracking-wider uppercase text-white rounded-xl shadow-md cursor-pointer hover:opacity-90 transition-opacity ${
                    orderType === "BUY" ? "bg-success" : "bg-destructive"
                  }`}
                >
                  Execute Simulated {orderType}
                </button>
              </div>
            </div>

            <div className="md:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-sm font-black tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-warning" />
                  Liquid Balance
                </h3>
                <div className="space-y-0.5">
                  <span className="text-2xl font-black tracking-tight block text-warning">
                    ₹{virtualBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Available Margin</span>
                </div>
              </div>

              <div className="bg-background border border-border p-4 rounded-xl text-[11px] font-medium mt-4 text-muted-foreground leading-relaxed">
                📈 <span className="font-bold text-foreground">Scannable Depth:</span> The canvas compiles hundreds of vector candles sequentially. Click through intraday scales to inspect shorter interval increments seamlessly.
              </div>
            </div>
          </div>

        </div>

        {/* COLUMN 4: OPEN RUNNING ACCOUNT TRADES */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-black tracking-wider uppercase text-muted-foreground">
            Open Portfolio ({mockPositions.length})
          </h3>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border/60">
            {mockPositions.map((position) => {
              const investment = position.avgPrice * position.quantity;
              const currentVal = position.currentPrice * position.quantity;
              const pnl = currentVal - investment;
              const isProfit = pnl >= 0;

              return (
                <div key={position.symbol} className="p-4 space-y-3 hover:bg-muted/10 transition-colors">
                  <div className="min-w-0">
                    <span className="text-sm font-black tracking-tight block">{position.symbol}</span>
                    <span className="text-[11px] text-muted-foreground font-semibold block">
                      {position.quantity} Shares @ Avg ₹{position.avgPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-semibold">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground block">Value</span>
                      <span className="font-bold block">₹{currentVal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground block">P&L Returns</span>
                      <span className={`font-black block ${isProfit ? "text-success" : "text-destructive"}`}>
                        {isProfit ? "+" : ""}₹{pnl.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}