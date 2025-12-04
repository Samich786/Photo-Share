import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Comment } from "@/models/Comment";
import { getUserFromRequest } from "@/lib/session";

// PUT /api/comments/[commentId] → edit a comment (only owner can edit)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    await connectDB();

    const { commentId } = await params;
    const session = getUserFromRequest(req);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Check if user owns this comment
    if (comment.userId.toString() !== session.userId) {
      return NextResponse.json(
        { error: "You can only edit your own comments" },
        { status: 403 }
      );
    }

    const { text } = await req.json();
    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Comment text is required" },
        { status: 400 }
      );
    }

    comment.text = text.trim();
    await comment.save();

    return NextResponse.json({
      message: "Comment updated",
      comment: {
        _id: comment._id,
        text: comment.text,
        updatedAt: comment.updatedAt,
      },
    });
  } catch (err) {
    console.error("Edit comment error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/comments/[commentId] → delete a comment (only owner can delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    await connectDB();

    const { commentId } = await params;
    const session = getUserFromRequest(req);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Check if user owns this comment
    if (comment.userId.toString() !== session.userId) {
      return NextResponse.json(
        { error: "You can only delete your own comments" },
        { status: 403 }
      );
    }

    await Comment.findByIdAndDelete(commentId);

    return NextResponse.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("Delete comment error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

