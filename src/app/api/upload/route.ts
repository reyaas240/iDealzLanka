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

    console.log("Upload attempt - File:", file.name, "Size:", file.size, "Type:", file.type)
    console.log("BLOB_READ_WRITE_TOKEN configured:", !!process.env.BLOB_READ_WRITE_TOKEN)
    console.log("NODE_ENV:", process.env.NODE_ENV)

    // Try Vercel Blob first if configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        console.log("Attempting Vercel Blob upload...")
        const blob = await put(file.name, file, {
          access: "public",
        })
        console.log("Vercel Blob upload successful:", blob.url)
        return NextResponse.json({ url: blob.url })
      } catch (blobError: any) {
        console.error("Vercel Blob upload failed:", blobError?.message || blobError)
        console.error("Blob error details:", JSON.stringify(blobError, null, 2))
        // Fall through to local storage
      }
    } else {
      console.log("BLOB_READ_WRITE_TOKEN not configured, skipping Vercel Blob")
    }
    
    // Fallback to local storage
    try {
      console.log("Attempting local storage fallback...")
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), "public", "uploads")
      console.log("Uploads directory:", uploadsDir)
      
      if (!existsSync(uploadsDir)) {
        console.log("Creating uploads directory...")
        await mkdir(uploadsDir, { recursive: true })
      }

      // Generate unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}-${file.name}`
      const filepath = join(uploadsDir, filename)

      // Write file
      await writeFile(filepath, buffer)
      console.log("Local storage upload successful:", filename)

      // Return public URL
      const publicUrl = `/uploads/${filename}`
      return NextResponse.json({ url: publicUrl })
    } catch (localError: any) {
      console.error("Local storage upload failed:", localError?.message || localError)
      console.error("Local error details:", JSON.stringify(localError, null, 2))
      return NextResponse.json(
        { error: "Failed to upload file. Neither Vercel Blob nor local storage is available." },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Upload error:", error?.message || error)
    console.error("Error details:", JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
