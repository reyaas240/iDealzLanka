import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Try Vercel Blob first if configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(file.name, file, {
          access: "public",
        })
        return NextResponse.json({ url: blob.url })
      } catch (blobError) {
        console.error("Vercel Blob upload failed, trying local storage:", blobError)
        // Fall through to local storage
      }
    }
    
    // Fallback to local storage
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), "public", "uploads")
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }

      // Generate unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}-${file.name}`
      const filepath = join(uploadsDir, filename)

      // Write file
      await writeFile(filepath, buffer)

      // Return public URL
      const publicUrl = `/uploads/${filename}`
      return NextResponse.json({ url: publicUrl })
    } catch (localError) {
      console.error("Local storage upload failed:", localError)
      return NextResponse.json(
        { error: "Failed to upload file. Neither Vercel Blob nor local storage is available." },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
