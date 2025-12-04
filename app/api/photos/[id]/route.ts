import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Photo } from "@/models/Photo";
import { Comment } from "@/models/Comment";
import { Rating } from "@/models/Rating";
import { User } from "@/models/User";

// UPDATED GET FULL PHOTO DETAILS
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const photoDoc = await Photo.findById(id).lean();
    if (!photoDoc)
      return NextResponse.json({ error: "Not Found" }, { status: 404 });

    const creator = await User.findById(photoDoc.creatorId).lean();

    const commentsDocs = await Comment.find({ photoId: id })
      .sort({ createdAt: -1 })
      .populate("userId", "email")
      .lean();

    const ratingsDocs = await Rating.find({ photoId: id })
      .populate("userId", "email")
      .lean();

    const avgRating =
      ratingsDocs.length > 0
        ? ratingsDocs.reduce((sum, r) => sum + r.value, 0) / ratingsDocs.length
        : null;

    // COMBINE COMMENT + RATING USER-WISE
    const comments = commentsDocs.map((c: any) => {
      const userRating = ratingsDocs.find(
        (r: any) => r.userId._id.toString() === c.userId._id.toString()
      );

      return {
        id: c._id.toString(),
        text: c.text,
        createdAt: c.createdAt,
        user: {
          id: c.userId._id.toString(),
          email: c.userId.email,
        },
        rating: userRating ? userRating.value : null,
      };
    });

    return NextResponse.json({
      id: photoDoc._id.toString(),
      title: photoDoc.title,
      caption: photoDoc.caption,
      location: photoDoc.location,
      people: photoDoc.people,
      imageUrl: photoDoc.imageUrl,
      mediaType: photoDoc.mediaType || 'image',
      thumbnailUrl: photoDoc.thumbnailUrl || '',

      creator: creator
        ? { id: creator._id.toString(), email: creator.email }
        : { id: "", email: "Unknown Creator" },

      comments,
      avgRating,
    });
  } catch (err) {
    console.log("PHOTO DETAIL ERROR", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
