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

    const body = await req.json();
    console.log("Profile update request body:", JSON.stringify(body, null, 2));
    
    const { username, displayName, bio, avatarUrl, website } = body;

    // Validate username if provided and not empty
    if (username && username.trim()) {
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

    // Build update object - only include fields that are provided
    const updateData: Record<string, any> = {};
    
    if (username !== undefined && username !== null) {
      // Use undefined for empty username to work with sparse index
      updateData.username = username.trim() ? username.toLowerCase() : undefined;
    }
    if (displayName !== undefined && displayName !== null) {
      updateData.displayName = displayName;
    }
    if (bio !== undefined && bio !== null) {
      updateData.bio = bio;
    }
    if (avatarUrl !== undefined && avatarUrl !== null) {
      updateData.avatarUrl = avatarUrl;
    }
    if (website !== undefined && website !== null) {
      updateData.website = website;
    }

    console.log("Update data:", JSON.stringify(updateData, null, 2));

    // Only update if there's something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Use updateOne for more reliable database update
    const updateResult = await User.updateOne(
      { _id: session.userId },
      { $set: updateData }
    );

    console.log("Update result:", updateResult);

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch the updated user
    const user = await User.findById(session.userId).select("-passwordHash");
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found after update" },
        { status: 404 }
      );
    }
    
    console.log("Updated user avatarUrl:", user.avatarUrl);

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

