import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/authOptions";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getUserFromSession() {
  try {
    const session = await getServerSession(authOptions);
    if (session && session.user && session.user.id) {
      return session.user;
    }
    return null;
  } catch (error) {
    console.error("Error getting user session:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { publicId } = body;

    if (!publicId) {
      return NextResponse.json(
        { error: "Public ID is required" },
        { status: 400 }
      );
    }

    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return NextResponse.json({ success: true });
    } else {
      console.error("Cloudinary deletion failed:", result);
      return NextResponse.json(
        { error: "Failed to delete image", details: result },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error deleting Cloudinary image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
