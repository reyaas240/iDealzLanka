import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import AdminHeader from "@/components/AdminHeader"
import OrderDetailClient from "./OrderDetailClient"

async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      product: true,
      bankTransfer: true,
      coupons: true,
    }
  })
  return order
}

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/")
  }

  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  // Convert Decimal to number for client component
  const serializedOrder = {
    ...order,
    total: Number(order.total),
    product: {
      ...order.product,
      price: Number(order.product.price)
    },
    // Format dates on server to avoid hydration mismatch
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    bankTransfer: order.bankTransfer ? {
      ...order.bankTransfer,
      createdAt: order.bankTransfer.createdAt.toISOString(),
      updatedAt: order.bankTransfer.updatedAt.toISOString(),
      reviewedAt: order.bankTransfer.reviewedAt ? order.bankTransfer.reviewedAt.toISOString() : null
    } : null
  }

  return <OrderDetailClient order={serializedOrder} session={session} />
}
