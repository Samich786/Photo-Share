import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getUserFromRequest } from "@/lib/session";

// Allowed file types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB for videos
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = getUserFromRequest(req);
    if (!session || session.role !== "CREATOR") {
      return NextResponse.json(
        { error: "Only creators can upload media" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Determine media type
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);

    if (!isVideo && !isImage) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPG, PNG, GIF, WEBP, MP4, WEBM, MOV, AVI" },
        { status: 400 }
      );
    }

    // Check file size
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size: ${isVideo ? "100MB" : "10MB"}` },
        { status: 400 }
      );
    }

    // Convert File to Buffer for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to base64 string for Cloudinary upload
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder: "media_share_app",
          resource_type: isVideo ? "video" : "image",
          // Generate thumbnail for videos
          ...(isVideo && { eager: [{ format: "jpg", transformation: [{ width: 400, height: 400, crop: "fill" }] }] }),
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    const uploadResult = result as {
      secure_url: string;
      public_id: string;
      eager?: Array<{ secure_url: string }>;
    };

    return NextResponse.json({
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      mediaType: isVideo ? "video" : "image",
      thumbnailUrl: uploadResult.eager?.[0]?.secure_url || "",
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload media" },
      { status: 500 }
    );
  }
}

