import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import ProductDetailClient from "./ProductDetailClient"

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id }
  })
  return product
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  const availableItems = product.totalItems - product.soldItems
  const isSoldOut = availableItems <= 0

  // Convert Decimal to number for client component
  const serializedProduct = {
    ...product,
    price: Number(product.price)
  }

  return <ProductDetailClient product={serializedProduct} availableItems={availableItems} isSoldOut={isSoldOut} />
}
