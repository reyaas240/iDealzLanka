import QRCode from "qrcode"
import { put } from "@vercel/blob"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { prisma } from "./db"

export async function generateCouponCode(itemPrefix: string, mobile: string): Promise<string> {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
  const mobileLast4 = mobile.slice(-4)
  return `${itemPrefix}-${randomPart}-${mobileLast4}`
}

export async function generateQRCode(couponCode: string): Promise<string> {
  // Try to use Vercel Blob if configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(couponCode)
      const base64Data = qrCodeDataUrl.split(',')[1]
      const buffer = Buffer.from(base64Data, 'base64')
      
      const blob = await put(`qrcodes/${couponCode}.png`, buffer, {
        access: 'public',
      })
      
      return blob.url
    } catch (error) {
      console.error("Vercel Blob upload failed, falling back to local storage:", error)
    }
  }

  // Fallback to local storage
  try {
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'qrcodes')
    await mkdir(uploadsDir, { recursive: true })
    
    const filePath = join(uploadsDir, `${couponCode}.png`)
    await QRCode.toFile(filePath, couponCode)
    
    return `/uploads/qrcodes/${couponCode}.png`
  } catch (error) {
    console.error("Local QR code generation failed:", error)
    throw new Error("Failed to generate QR code")
  }
}

export async function generateCouponsForOrder(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true, product: true }
  })

  if (!order) {
    throw new Error("Order not found")
  }

  const mobile = order.user.mobile || "0000"
  
  for (let i = 0; i < order.quantity; i++) {
    const couponCode = await generateCouponCode(order.product.itemPrefix, mobile)
    const qrCodeUrl = await generateQRCode(couponCode)
    
    await prisma.coupon.create({
      data: {
        orderId: order.id,
        productId: order.product.id,
        couponCode,
        qrCodeUrl,
      }
    })
  }

  // Update product sold items count
  await prisma.product.update({
    where: { id: order.product.id },
    data: {
      soldItems: {
        increment: order.quantity
      }
    }
  })
}
