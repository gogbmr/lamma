"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navigation/navbar";
import { 
  Newspaper, 
  Search, 
  Clock, 
  ExternalLink, 
  Bell, 
  User, 
  Calendar, 
  Loader2, 
  AlertCircle,
  TrendingUp,
  Globe
} from "lucide-react";

// Structure matches the free native mirror API response schemas
interface LiveMarketArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

// Curated internal notifications schema for Section 1
interface AuthorNotification {
  id: string;
  authorName: string;
  role: string;
  message: string;
  timestamp: string;
  type: "ALERT" | "UPDATE" | "TIP";
}

const mockNotifications: AuthorNotification[] = [
  {
    id: "notif-1",
    authorName: "Finlamma Research Desk",
    role: "Lead Analyst",
    message: "New interactive module 'Understanding Option Greeks' goes live tomorrow morning at 09:00 AM IST. Prepare your streak credits!",
    timestamp: "10 mins ago",
    type: "UPDATE"
  },
  {
    id: "notif-2",
    authorName: "Admin Notification",
    role: "System Gatekeeper",
    message: "High volatility warnings triggered on Indian banking indices (NIFTY BANK) ahead of mid-week option settlements. Practice tight trailing margins.",
    timestamp: "2 hours ago",
    type: "ALERT"
  },
  {
    id: "notif-3",
    authorName: "Coach Lamma",
    role: "Trading Mascot Tutor",
    message: "💡 Pro Tip: Never risk more than 2% of your virtual paper wallet equity payload inside a single speculative long position.",
    timestamp: "5 hours ago",
    type: "TIP"
  }
];

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [liveArticles, setLiveArticles] = useState<LiveMarketArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // 1. Fetch live unauthenticated Indian Business Headlines from free GitHub mirror pipeline
  useEffect(() => {
    const fetchLiveIndianMarketNews = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("https://saurav.tech/NewsAPI/top-headlines/category/business/in.json");
        
        if (!res.ok) throw new Error("API server responded with error status");
        
        const data = await res.json();
        // Keep unique articles that possess actual descriptive parameters
        const validArticles = (data.articles || []).filter((art: LiveMarketArticle) => art.title && art.description);
        setLiveArticles(validArticles);
      } catch (err) {
        console.error("Failed to gather free mirror market updates:", err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveIndianMarketNews();
  }, []);

  // Filter live elements based on user search parameters
  const filteredMarketArticles = liveArticles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (article.description && article.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (article.author && article.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Helper utility to parse complex raw timestamp strings into legible Indian Standard formatting
  const formatPublishedDate = (rawDateString: string) => {
    try {
      const dateObj = new Date(rawDateString);
      return {
        date: dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        time: dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
      };
    } catch {
      return { date: "Recent Date", time: "Live Tracker" };
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20 md:pb-0 transition-colors duration-300 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ==========================================
            SECTION 1: AUTHOR NOTIFICATIONS & NEWS ALERTS (1 Col)
           ========================================== */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 pb-1">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-black tracking-wider uppercase text-muted-foreground">
              Author Desk & Updates
            </h2>
          </div>

          <div className="space-y-4">
            {mockNotifications.map((notif) => {
              const typeBadgeStyle = {
                ALERT: "bg-destructive/10 text-destructive border-destructive/20",
                UPDATE: "bg-primary/10 text-primary border-primary/20",
                TIP: "bg-success/10 text-success border-success/20",
              }[notif.type];

              return (
                <div 
                  key={notif.id} 
                  className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3 relative overflow-hidden transition-all hover:border-border/80"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black tracking-tight text-foreground">{notif.authorName}</h4>
                      <span className="text-[10px] font-semibold text-muted-foreground">{notif.role}</span>
                    </div>
                    <span className={`text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded border ${typeBadgeStyle}`}>
                      {notif.type}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold pt-1.5 border-t border-border/40">
                    <Clock className="h-3 w-3" />
                    <span>{notif.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==========================================
            SECTION 2: LIVE INDIAN MARKET TRACKER FEED (2 Cols)
           ========================================== */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-success" />
              <h2 className="text-sm font-black tracking-wider uppercase text-muted-foreground">
                Indian Market Live Feed
              </h2>
            </div>

            {/* Filter Search String Box */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search live streams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* ASYNCHRONOUS API CONDITIONALS FEED HANDLING */}
          {isLoading ? (
            <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center gap-2.5 shadow-sm">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <p className="text-xs font-bold text-muted-foreground animate-pulse">Streaming live exchange bulletins...</p>
            </div>
          ) : hasError ? (
            <div className="bg-card border border-destructive/20 rounded-2xl p-8 text-center space-y-2 shadow-sm">
              <AlertCircle className="h-6 w-6 text-destructive mx-auto" />
              <p className="text-xs font-bold text-destructive">Failed to pool dynamic stream records.</p>
              <p className="text-[11px] text-muted-foreground">Verify internal networking parameters or attempt a browser workspace redraw.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredMarketArticles.map((article, index) => {
                const parsedTime = formatPublishedDate(article.publishedAt);
                // Unified standard card validation fallbacks if source data drops elements
                const displayAuthor = article.author ? article.author.trim() : "Market Bureau Correspondent";
                const displayImage = article.urlToImage || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600&auto=format&fit=crop";

                return (
                  <article 
                    key={`${article.publishedAt}-${index}`}
                    className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row hover:border-border/80 transition-all group"
                  >
                    {/* Image Block Shell Container */}
                    <div className="w-full sm:w-44 h-40 sm:h-auto relative bg-muted shrink-0 overflow-hidden">
                      <img 
                        src={displayImage} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        onError={(e) => {
                          // Standard fallback template image layer adjustments
                          (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600&auto=format&fit=crop";
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-success text-success-foreground text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded uppercase shadow-sm">
                        {article.source.name || "Live"}
                      </div>
                    </div>

                    {/* Content Data Body Sheet details */}
                    <div className="flex-1 p-5 flex flex-col justify-between space-y-3.5">
                      <div className="space-y-1.5">
                        
                        {/* Meta Ribbon String Details */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-muted-foreground">
                          <div className="flex items-center gap-1 text-foreground/80 font-black">
                            <User className="h-3 w-3 text-primary" />
                            <span className="truncate max-w-[140px]">{displayAuthor}</span>
                          </div>
                          <div className="flex items-center gap-1 border-l border-border pl-3">
                            <Calendar className="h-3 w-3" />
                            <span>{parsedTime.date}</span>
                          </div>
                          <div className="flex items-center gap-1 border-l border-border pl-3">
                            <Clock className="h-3 w-3" />
                            <span>{parsedTime.time}</span>
                          </div>
                        </div>

                        {/* Title Headers */}
                        <h3 className="text-sm font-black tracking-tight leading-snug group-hover:text-primary transition-colors">
                          <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-1">
                            {article.title}
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 text-primary shrink-0 mt-0.5 transition-opacity" />
                          </a>
                        </h3>

                        {/* Description Summary */}
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2">
                          {article.description}
                        </p>
                      </div>

                      {/* Explicit Interactive Jump Utilities Footer */}
                      <div className="pt-2 border-t border-dashed border-border/60 flex items-center justify-between text-[10px] font-black">
                        <span className="text-success inline-flex items-center gap-0.5 uppercase tracking-wide">
                          <TrendingUp className="h-3 w-3" />
                          Business / Equities Impact
                        </span>
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary underline hover:opacity-80 transition-opacity"
                        >
                          Read Coverage Source
                        </a>
                      </div>

                    </div>
                  </article>
                );
              })}

              {filteredMarketArticles.length === 0 && (
                <div className="bg-card border border-border rounded-2xl p-8 text-center text-xs text-muted-foreground font-medium shadow-sm">
                  No online market articles matched your search filter parameters.
                </div>
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}