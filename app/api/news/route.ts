// app/api/news/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Fetch Published Custom News / Articles from Prisma
    const customNews = await prisma.newsFeed.findMany({
      where: { 
        status: "PUBLISHED" 
      },
      orderBy: [
        { isPinned: "desc" },
        { publishedAt: "desc" }
      ],
      include: {
        author: {
          select: {
            user: {
              select: {
                name: true,
              }
            }
          }
        }
      }
    });

    // 2. Format custom news for Platform News (Sidebar updates)
    const platformNews = customNews.map((item: any) => ({
      id: item.id,
      title: item.title,
      summary: item.summary || item.description || "",
      category: item.category || "GENERAL",
      publishedAt: item.publishedAt || item.createdAt,
      author: {
        user: {
          name: item.author?.user?.name || item.authorName || "Admin Desk"
        }
      }
    }));

    // 3. Transform custom admin articles into Live Market Article format
    // This allows admin articles to render in the main news feed with custom cover images!
    const customMarketArticles = customNews.map((item: any) => ({
      source: { 
        id: item.id, 
        name: item.sourceName || "Finlamma Official" 
      },
      author: item.author?.user?.name || item.authorName || "Editorial Desk",
      title: item.title,
      description: item.summary || item.description || "",
      url: item.url || item.sourceUrl || "#",
      urlToImage: item.imageUrl || item.coverImage || item.image || item.urlToImage || null,
      publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString() : new Date().toISOString(),
      content: item.content || item.summary || ""
    }));

    // 4. Fetch External Live Market News securely with fallback handling
    let externalArticles: any[] = [];
    try {
      const marketNewsResponse = await fetch(
        "https://saurav.tech/NewsAPI/top-headlines/category/business/in.json",
        { next: { revalidate: 300 } } // Cache for 5 minutes
      );

      if (marketNewsResponse.ok) {
        const marketData = await marketNewsResponse.json();
        externalArticles = (marketData.articles || []).filter(
          (art: any) => art.title && art.description
        );
      }
    } catch (apiError) {
      console.warn("⚠️ External news fetch failed, using custom news only:", apiError);
    }

    // 5. Merge custom admin news at the TOP of the main market feed
    const combinedMarketNews = [...customMarketArticles, ...externalArticles];

    return NextResponse.json({
      platformNews,
      marketNews: combinedMarketNews,
    });

  } catch (error) {
    console.error("❌ GET /api/news failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error fetching news feeds" }, 
      { status: 500 }
    );
  }
}