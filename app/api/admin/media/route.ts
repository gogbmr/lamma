// app/api/admin/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { uploadMedia, deleteMedia } from "@/lib/storage";

export async function GET() {
  try {
    const media = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(media);
  } catch (error: any) {
    // 🔥 THIS WILL NOW SHOW THE EXACT ERROR IN YOUR TERMINAL
    console.error("❌ GET Media Error:", error); 
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // We are no longer receiving FormData. We just receive JSON metadata!
    const body = await req.json();
    const { url, fileName, fileType, size } = body;
    
    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    // Save the metadata to the Finlamma database
    const asset = await prisma.mediaAsset.create({
      data: {
        url,
        fileName,
        fileType,
        size,
      },
    });

    return NextResponse.json(asset);
  } catch (error: any) {
    console.error("❌ POST Media Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "Asset ID required" }, { status: 400 });

    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

    await deleteMedia(asset.url);
    await prisma.mediaAsset.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ DELETE Media Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}