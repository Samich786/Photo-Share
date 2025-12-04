import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Photo } from "@/models/Photo";
import { Comment } from "@/models/Comment";
import { Rating } from "@/models/Rating";
import { User } from "@/models/User";
import { getUserFromRequest } from "@/lib/session";

// Helper: Detect media type from URL
function detectMediaTypeFromUrl(url: string): 'image' | 'video' {
  if (url.includes('/video/upload/')) return 'video';
  if (/\.(mp4|webm|mov|avi|mkv)$/i.test(url)) return 'video';
  return 'image';
}

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

    // Auto-detect media type from URL for reliability
    const detectedType = detectMediaTypeFromUrl(photoDoc.imageUrl);
    const isVideo = detectedType === 'video';
    
    return NextResponse.json({
      id: photoDoc._id.toString(),
      title: photoDoc.title,
      caption: photoDoc.caption,
      location: photoDoc.location,
      people: photoDoc.people,
      // Separate keys for image and video
      imageUrl: isVideo ? '' : photoDoc.imageUrl,
      videoUrl: isVideo ? photoDoc.imageUrl : '',
      mediaType: detectedType,
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

// PUT - Update photo/video details
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = getUserFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const photo = await Photo.findById(id);

    if (!photo) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Only creator can edit their post
    if (photo.creatorId.toString() !== session.userId) {
      return NextResponse.json({ error: "You can only edit your own posts" }, { status: 403 });
    }

    const { title, caption, location, people } = await req.json();

    // Update fields
    if (title !== undefined) photo.title = title;
    if (caption !== undefined) photo.caption = caption;
    if (location !== undefined) photo.location = location;
    if (people !== undefined) photo.people = people;

    await photo.save();

    return NextResponse.json({
      message: "Post updated",
      photo: {
        id: photo._id.toString(),
        title: photo.title,
        caption: photo.caption,
        location: photo.location,
        people: photo.people,
      },
    });
  } catch (err) {
    console.error("Update photo error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// DELETE - Delete photo/video and related comments/ratings
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = getUserFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const photo = await Photo.findById(id);

    if (!photo) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Only creator can delete their post
    if (photo.creatorId.toString() !== session.userId) {
      return NextResponse.json({ error: "You can only delete your own posts" }, { status: 403 });
    }

    // Delete related comments and ratings
    await Promise.all([
      Comment.deleteMany({ photoId: id }),
      Rating.deleteMany({ photoId: id }),
      Photo.findByIdAndDelete(id),
    ]);

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete photo error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
