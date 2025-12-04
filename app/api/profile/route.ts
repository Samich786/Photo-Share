import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Photo } from "@/models/Photo";
import { getUserFromRequest } from "@/lib/session";

// GET /api/profile → get current user's profile
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = getUserFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findById(session.userId).select("-passwordHash");
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get user's post count
    const postCount = await Photo.countDocuments({ creatorId: session.userId });

    return NextResponse.json({
      profile: {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username || "",
        displayName: user.displayName || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
        website: user.website || "",
        postCount,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Get profile error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/profile → update current user's profile
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const session = getUserFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { username, displayName, bio, avatarUrl, website } = await req.json();

    // Validate username if provided
    if (username) {
      // Username must be alphanumeric with underscores, 3-30 chars
      const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
      if (!usernameRegex.test(username)) {
        return NextResponse.json(
          { error: "Username must be 3-30 characters, alphanumeric and underscores only" },
          { status: 400 }
        );
      }

      // Check if username is taken by another user
      const existingUser = await User.findOne({ 
        username: username.toLowerCase(),
        _id: { $ne: session.userId }
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 400 }
        );
      }
    }

    // Validate bio length
    if (bio && bio.length > 150) {
      return NextResponse.json(
        { error: "Bio must be 150 characters or less" },
        { status: 400 }
      );
    }

    const updateData: Record<string, string> = {};
    if (username !== undefined) updateData.username = username.toLowerCase();
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (website !== undefined) updateData.website = website;

    const user = await User.findByIdAndUpdate(
      session.userId,
      { $set: updateData },
      { new: true }
    ).select("-passwordHash");

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Profile updated",
      profile: {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username || "",
        displayName: user.displayName || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
        website: user.website || "",
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

