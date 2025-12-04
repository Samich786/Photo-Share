import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Photo } from "@/models/Photo";
import { Comment } from "@/models/Comment";
import { Rating } from "@/models/Rating";
import { getUserFromRequest } from "@/lib/session";

// Helper: Detect media type from URL
function detectMediaTypeFromUrl(url: string): 'image' | 'video' {
  if (url.includes('/video/upload/')) return 'video';
  if (/\.(mp4|webm|mov|avi|mkv)$/i.test(url)) return 'video';
  return 'image';
}

// GET /api/creator/photos → list current creator's photos with comment/rating counts
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = getUserFromRequest(req);
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const page  = parseInt(searchParams.get("page")  || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip  = (page - 1) * limit;

    const [photos, total] = await Promise.all([
      Photo.find({ creatorId: session.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Photo.countDocuments({ creatorId: session.userId }),
    ]);

    const withCounts = await Promise.all(
      photos.map(async (p) => {
        const [commentsCount, ratingsCount] = await Promise.all([
          Comment.countDocuments({ photoId: p._id }),
          Rating.countDocuments({ photoId: p._id }),
        ]);

        // Auto-detect media type from URL for reliability
        const detectedType = detectMediaTypeFromUrl(p.imageUrl);
        const isVideo = detectedType === 'video';
        
        return {
          id: p._id.toString(),
          title: p.title,
          imageUrl: isVideo ? '' : p.imageUrl,
          videoUrl: isVideo ? p.imageUrl : '',
          mediaType: detectedType,
          thumbnailUrl: p.thumbnailUrl || '',
          createdAt: p.createdAt,
          _count: { comments: commentsCount, ratings: ratingsCount },
        };
      })
    );

    return NextResponse.json({
      photos: withCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get creator photos error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
