import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Photo } from "@/models/Photo";
import { Comment } from "@/models/Comment";
import { Rating } from "@/models/Rating";
import { getUserFromRequest } from "@/lib/session";

// =========================
// GET /api/photos  (PUBLIC FEED)
// =========================
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const page  = parseInt(searchParams.get("page")  || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;
    const query = search
      ? {
          $or: [
            { title:    { $regex: search, $options: "i" } },
            { caption:  { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [photos, total] = await Promise.all([
      Photo.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Photo.countDocuments(query),
    ]);

    const withCounts = await Promise.all(
      photos.map(async (p) => {
        const [commentsCount, ratingsCount] = await Promise.all([
          Comment.countDocuments({ photoId: p._id }),
          Rating.countDocuments({ photoId: p._id }),
        ]);

        return {
          id:       p._id.toString(),
          title:    p.title,
          imageUrl: p.imageUrl,
          mediaType: p.mediaType || 'image',
          thumbnailUrl: p.thumbnailUrl || '',
          creator:  { id: p.creatorId?.toString() },
          _count:   { comments: commentsCount, ratings: ratingsCount },
        };
      })
    );

    return NextResponse.json({ photos: withCounts });
  } catch (err) {
    console.error("Get photos error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// =========================
// POST /api/photos  (CREATOR)
// =========================
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const session = getUserFromRequest(req);
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ error: "Only creators can upload" }, { status: 403 });
    }

    const { title, caption, location, people, imageUrl, mediaType, thumbnailUrl } = await req.json();
    if (!title || !imageUrl) {
      return NextResponse.json({ error: "Title + Media required" }, { status: 400 });
    }

    const photo = await Photo.create({
      creatorId: session.userId,
      title,
      caption: caption || "",
      location: location || "",
      people: people || [],
      imageUrl,
      mediaType: mediaType || "image",
      thumbnailUrl: thumbnailUrl || "",
    });

    return NextResponse.json({ id: photo._id.toString(), title, imageUrl, mediaType }, { status: 201 });
  } catch (err) {
    console.error("Upload photo error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
